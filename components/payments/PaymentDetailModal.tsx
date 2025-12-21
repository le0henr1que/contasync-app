'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
} from 'lucide-react';
import { Payment, PaymentStatus, PaymentMethod } from './PaymentCard';

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

export function PaymentDetailModal({
  isOpen,
  onClose,
  payment,
  onEdit,
  onDelete,
  showClientInfo = true,
}: PaymentDetailModalProps) {
  if (!payment) return null;

  const statusInfo = statusConfig[payment.status];
  const paymentMethodInfo = payment.paymentMethod
    ? paymentMethodConfig[payment.paymentMethod]
    : null;

  const clientName = payment?.client?.companyName || payment?.client?.user?.name;

  const handleDownloadReceipt = () => {
    if (!payment.receiptPath) return;

    // Create a download link
    const link = document.createElement('a');
    link.href = `http://localhost:3000/${payment.receiptPath}`;
    link.download = payment.fileName || 'recibo';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isImage = payment.mimeType?.startsWith('image/');
  const isPdf = payment.mimeType === 'application/pdf';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Pagamento</DialogTitle>
          <DialogDescription>
            Informações completas sobre o pagamento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client Info (accountant view only) */}
          {showClientInfo && (
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Building2 className="h-4 w-4" />
                <span>Cliente</span>
              </div>
              <p className="text-lg font-semibold">{clientName}</p>
              <p className="text-sm text-muted-foreground">{payment.client.user.email}</p>
            </div>
          )}

          {/* Amount */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Valor</p>
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(payment.amount)}
            </p>
          </div>

          {/* Status */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Status</p>
            <Badge variant={statusInfo.variant} className="text-sm">
              {statusInfo.label}
            </Badge>
          </div>

          <Separator />

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Calendar className="h-4 w-4" />
                <span>Data de Vencimento</span>
              </div>
              <p className="text-base font-medium">
                {format(new Date(payment.dueDate), "dd 'de' MMMM 'de' yyyy", {
                  locale: ptBR,
                })}
              </p>
            </div>

            {payment.paymentDate && (
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Data do Pagamento</span>
                </div>
                <p className="text-base font-medium">
                  {format(new Date(payment.paymentDate), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Payment Method */}
          {paymentMethodInfo && (
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <paymentMethodInfo.icon className="h-4 w-4" />
                <span>Forma de Pagamento</span>
              </div>
              <p className="text-base font-medium">{paymentMethodInfo.label}</p>
            </div>
          )}

          {/* Reference */}
          {payment.reference && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Referência</p>
              <p className="text-base">{payment.reference}</p>
            </div>
          )}

          {/* Notes */}
          {payment.notes && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Observações</p>
              <p className="text-base whitespace-pre-wrap">{payment.notes}</p>
            </div>
          )}

          {/* Receipt Preview */}
          {payment.receiptPath && (
            <>
              <Separator />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {isImage ? (
                      <ImageIcon className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    <span>Comprovante</span>
                  </div>
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

                {/* Preview */}
                <div className="border rounded-lg overflow-hidden bg-muted/30">
                  {isImage && (
                    <img
                      src={`http://localhost:3000/${payment.receiptPath}`}
                      alt="Comprovante de pagamento"
                      className="w-full h-auto"
                    />
                  )}
                  {isPdf && (
                    <div className="aspect-[4/5]">
                      <iframe
                        src={`http://localhost:3000/${payment.receiptPath}`}
                        className="w-full h-full"
                        title="Preview do comprovante PDF"
                      />
                    </div>
                  )}
                </div>

                {payment.fileName && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Arquivo: {payment.fileName}
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex-1 flex gap-2">
            {onEdit && (
              <Button
                variant="outline"
                onClick={() => {
                  onEdit(payment);
                  onClose();
                }}
                className="gap-2 flex-1 sm:flex-initial"
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
                className="gap-2 flex-1 sm:flex-initial"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            )}
          </div>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
