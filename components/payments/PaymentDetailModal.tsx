'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Calendar,
  CreditCard,
  Wallet,
  Banknote,
  Receipt,
  CheckCircle2,
  Edit,
  Trash2,
  Download,
  FileText,
  Image as ImageIcon,
  File,
  Eye,
  Loader2,
} from 'lucide-react';
import { Payment, PaymentStatus, PaymentMethod } from './PaymentCard';
import { toast } from 'sonner';

interface PaymentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  onEdit?: (payment: Payment) => void;
  onDelete?: (payment: Payment) => void;
  showClientInfo?: boolean; // true for accountant, false for client
}

const statusConfig: Record<
  PaymentStatus,
  { variant: 'default' | 'success' | 'warning' | 'destructive' | 'info'; label: string }
> = {
  PENDING: { variant: 'warning', label: 'Pendente' },
  AWAITING_INVOICE: { variant: 'info', label: 'Aguardando NF' },
  READY_TO_PAY: { variant: 'default', label: 'Pronto para Pagar' },
  AWAITING_VALIDATION: { variant: 'warning', label: 'Aguardando Validação' },
  PAID: { variant: 'success', label: 'Pago' },
  OVERDUE: { variant: 'destructive', label: 'Atrasado' },
  CANCELED: { variant: 'info', label: 'Cancelado' },
};

const paymentMethodConfig: Record<
  PaymentMethod,
  { icon: typeof CreditCard; label: string }
> = {
  CASH: { icon: Wallet, label: 'Dinheiro' },
  PIX: { icon: Receipt, label: 'PIX' },
  BANK_TRANSFER: { icon: Banknote, label: 'Transferência Bancária' },
  CREDIT_CARD: { icon: CreditCard, label: 'Cartão de Crédito' },
  DEBIT_CARD: { icon: CreditCard, label: 'Cartão de Débito' },
  BOLETO: { icon: Receipt, label: 'Boleto' },
};

function formatCurrency(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
}

interface Document {
  id: string;
  clientId: string;
  client: {
    user: {
      name: string;
      email: string;
    };
  };
  type: string;
  title: string;
  description?: string;
  filePath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
}

export function PaymentDetailModal({
  isOpen,
  onClose,
  payment,
  onEdit,
  onDelete,
  showClientInfo = true,
}: PaymentDetailModalProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  // Fetch documents related to this payment
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!payment?.id || !isOpen) return;

      try {
        setIsLoadingDocs(true);
        console.log('[PaymentDetailModal] Fetching documents for payment:', payment.id);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/payments/${payment.id}/documents`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        );

        console.log('[PaymentDetailModal] Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('[PaymentDetailModal] Documents received:', data);
          setDocuments(Array.isArray(data) ? data : []);
        } else {
          const errorText = await response.text();
          console.error('[PaymentDetailModal] Error response:', errorText);
        }
      } catch (error) {
        console.error('[PaymentDetailModal] Error fetching documents:', error);
      } finally {
        setIsLoadingDocs(false);
      }
    };

    fetchDocuments();
  }, [payment?.id, isOpen]);

  // Early return DEPOIS de todos os hooks
  if (!payment) return null;

  const statusInfo = statusConfig[payment.status];
  const paymentMethodInfo = payment.paymentMethod
    ? paymentMethodConfig[payment.paymentMethod]
    : null;

  const clientName = payment?.client?.companyName || payment?.client?.user?.name;

  const handleDownloadReceipt = () => {
    if (!payment.receiptPath) return;

    const link = document.createElement('a');
    link.href = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${payment.receiptPath}`;
    link.download = payment.fileName || 'recibo';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadDocument = (doc: Document) => {
    const link = document.createElement('a');
    link.href = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${doc.filePath}`;
    link.download = doc.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const isImage = payment.mimeType?.startsWith('image/');
  const isPdf = payment.mimeType === 'application/pdf';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col gap-0 p-0">
        {/* Header Fixo */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            {payment.title || 'Detalhes do Pagamento'}
          </DialogTitle>
        </DialogHeader>

        {/* Conteúdo com Scroll */}
        <div className="overflow-y-auto px-6 py-6 space-y-6">
          {/* Client Info (accountant view only) */}
          {showClientInfo && payment.client && (
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <Building2 className="h-4 w-4" />
                Cliente
              </div>
              <p className="text-lg font-semibold">{clientName}</p>
              <p className="text-sm text-muted-foreground">{payment.client.user.email}</p>
            </div>
          )}

          {/* Amount e Status */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Valor</label>
              <p className="text-3xl font-bold text-primary mt-1">
                {formatCurrency(payment.amount)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <Badge variant={statusInfo.variant} className="text-sm">
                  {statusInfo.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Informações do Pagamento - Grid 2 Colunas */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Data de Vencimento */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Data de Vencimento
              </label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-base">
                  {format(new Date(payment.dueDate), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </p>
              </div>
            </div>

            {/* Data do Pagamento */}
            {payment.paymentDate && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Data do Pagamento
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <p className="text-base">
                    {format(new Date(payment.paymentDate), "dd 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Forma de Pagamento */}
            {paymentMethodInfo && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Forma de Pagamento
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <paymentMethodInfo.icon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-base">{paymentMethodInfo.label}</p>
                </div>
              </div>
            )}

            {/* Referência */}
            {payment.reference && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Referência</label>
                <p className="mt-1">{payment.reference}</p>
              </div>
            )}
          </div>

          {/* Descrição */}
          {payment.description && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Descrição</label>
              <p className="mt-1 whitespace-pre-wrap">{payment.description}</p>
            </div>
          )}

          {/* Notes */}
          {payment.notes && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Observações</label>
              <p className="mt-1 whitespace-pre-wrap">{payment.notes}</p>
            </div>
          )}

          {/* Comprovante de Pagamento */}
          {payment.receiptPath && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  {isImage ? (
                    <ImageIcon className="h-4 w-4" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  Comprovante de Pagamento
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadReceipt}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden bg-muted/10">
                {isImage && (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${payment.receiptPath}`}
                    alt="Comprovante de pagamento"
                    className="w-full h-auto max-h-[500px] object-contain"
                  />
                )}
                {isPdf && (
                  <iframe
                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${payment.receiptPath}`}
                    className="w-full h-[500px]"
                    title="Preview do comprovante PDF"
                  />
                )}
                {!isImage && !isPdf && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Preview não disponível para este tipo de arquivo
                    </p>
                  </div>
                )}
              </div>

              {payment.fileName && (
                <p className="text-xs text-muted-foreground mt-2">
                  Arquivo: {payment.fileName}
                </p>
              )}
            </div>
          )}

          {/* Documentos Atrelados */}
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-3">
              <File className="h-4 w-4" />
              Documentos Atrelados ao Pagamento
              {isLoadingDocs && <Loader2 className="h-3 w-3 animate-spin" />}
            </label>

            {isLoadingDocs ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground border rounded-lg bg-muted/10">
                Nenhum documento atrelado a este pagamento
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => {
                  const isDocImage = doc.mimeType?.startsWith('image/');
                  const isDocPdf = doc.mimeType === 'application/pdf';

                  return (
                    <div
                      key={doc.id}
                      className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="mt-0.5">
                            {isDocImage ? (
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <FileText className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{doc.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {doc.fileName} • {formatFileSize(doc.fileSize)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewDoc(doc)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadDocument(doc)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Preview inline se selecionado */}
                      {previewDoc?.id === doc.id && (
                        <div className="mt-4 border-t pt-4">
                          <div className="border rounded-lg overflow-hidden bg-muted/10">
                            {isDocImage && (
                              <img
                                src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${doc.filePath}`}
                                alt={doc.title}
                                className="w-full h-auto max-h-[400px] object-contain"
                              />
                            )}
                            {isDocPdf && (
                              <iframe
                                src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${doc.filePath}`}
                                className="w-full h-[400px]"
                                title={`Preview de ${doc.title}`}
                              />
                            )}
                            {!isDocImage && !isDocPdf && (
                              <div className="flex flex-col items-center justify-center py-12 text-center">
                                <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">
                                  Preview não disponível para este tipo de arquivo
                                </p>
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewDoc(null)}
                            className="mt-2 w-full"
                          >
                            Fechar Preview
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Fixo */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-muted/5">
          {onEdit && (
            <Button
              variant="outline"
              onClick={() => {
                onEdit(payment);
                onClose();
              }}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(payment);
                onClose();
              }}
              className="gap-2 text-white"
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </Button>
          )}
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>

      {/* Modal de Preview de Documento em Tamanho Grande */}
      {previewDoc && (
        <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
          <DialogContent className="max-w-5xl max-h-[95vh] flex flex-col gap-0 p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b">
              <DialogTitle className="flex items-center gap-2">
                <File className="h-5 w-5" />
                {previewDoc.title}
              </DialogTitle>
            </DialogHeader>

            <div className="overflow-y-auto px-6 py-6">
              <div className="border rounded-lg overflow-hidden bg-muted/10">
                {previewDoc.mimeType?.startsWith('image/') && (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${previewDoc.filePath}`}
                    alt={previewDoc.title}
                    className="w-full h-auto"
                  />
                )}
                {previewDoc.mimeType === 'application/pdf' && (
                  <iframe
                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${previewDoc.filePath}`}
                    className="w-full h-[70vh]"
                    title={`Preview de ${previewDoc.title}`}
                  />
                )}
                {!previewDoc.mimeType?.startsWith('image/') &&
                  previewDoc.mimeType !== 'application/pdf' && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Preview não disponível para este tipo de arquivo
                      </p>
                    </div>
                  )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-muted/5">
              <Button
                variant="outline"
                onClick={() => handleDownloadDocument(previewDoc)}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button onClick={() => setPreviewDoc(null)}>Fechar</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}
