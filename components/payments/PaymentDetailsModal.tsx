'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  DollarSign,
  FileText,
  Download,
  Paperclip,
  Building2,
  User,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Payment, PaymentStatus } from '@/hooks/usePayments';
import { cn } from '@/lib/utils';

interface PaymentDetailsModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusConfig: Record<
  PaymentStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: React.ReactNode;
  }
> = {
  PENDING: {
    label: 'Pendente',
    variant: 'secondary',
    icon: <Clock className="h-4 w-4" />,
  },
  AWAITING_INVOICE: {
    label: 'Aguardando NF',
    variant: 'outline',
    icon: <AlertCircle className="h-4 w-4" />,
  },
  READY_TO_PAY: {
    label: 'Pronto para Pagar',
    variant: 'default',
    icon: <CheckCircle className="h-4 w-4" />,
  },
  AWAITING_VALIDATION: {
    label: 'Aguardando Validação',
    variant: 'secondary',
    icon: <Clock className="h-4 w-4" />,
  },
  PAID: {
    label: 'Pago',
    variant: 'default',
    icon: <CheckCircle className="h-4 w-4" />,
  },
  OVERDUE: {
    label: 'Vencido',
    variant: 'destructive',
    icon: <AlertCircle className="h-4 w-4" />,
  },
  CANCELED: {
    label: 'Cancelado',
    variant: 'outline',
    icon: <XCircle className="h-4 w-4" />,
  },
};

export function PaymentDetailsModal({
  payment,
  isOpen,
  onClose,
}: PaymentDetailsModalProps) {
  if (!payment) return null;

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numAmount);
  };

  const isOverdue = () => {
    if (payment.status === 'PAID' || payment.status === 'CANCELED') {
      return false;
    }
    const dueDate = new Date(payment.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const status = statusConfig[payment.status];
  const overdue = isOverdue();
  const hasDocuments =
    payment.attachedDocuments && payment.attachedDocuments.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalhes do Pagamento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Type */}
          <div className="flex items-center justify-between">
            <Badge
              variant={overdue ? 'destructive' : status.variant}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm"
            >
              {overdue ? (
                <>
                  <AlertCircle className="h-4 w-4" />
                  Vencido
                </>
              ) : (
                <>
                  {status.icon}
                  {status.label}
                </>
              )}
            </Badge>

            <Badge
              variant={payment.paymentType === 'OFFICE' ? 'secondary' : 'outline'}
              className="flex items-center gap-1.5 px-3 py-1.5"
            >
              {payment.paymentType === 'OFFICE' ? (
                <>
                  <Building2 className="h-3.5 w-3.5" />
                  Escritório
                </>
              ) : (
                <>
                  <User className="h-3.5 w-3.5" />
                  Cliente
                </>
              )}
            </Badge>
          </div>

          {/* Title and Reference */}
          <div>
            <h3 className="text-2xl font-semibold mb-2">{payment.title}</h3>
            {payment.reference && (
              <p className="text-sm text-muted-foreground">
                Referência: {payment.reference}
              </p>
            )}
            {payment.isRecurring && (
              <Badge variant="outline" className="mt-2 flex items-center gap-1 w-fit">
                <RefreshCw className="h-3 w-3" />
                Recorrente
                {payment.recurringFrequency && (
                  <span className="ml-1">
                    ({payment.recurringFrequency === 'MONTHLY'
                      ? 'Mensal'
                      : payment.recurringFrequency === 'QUARTERLY'
                      ? 'Trimestral'
                      : payment.recurringFrequency === 'SEMI_ANNUALLY'
                      ? 'Semestral'
                      : 'Anual'}
                    )
                  </span>
                )}
              </Badge>
            )}
          </div>

          <Separator />

          {/* Payment Information */}
          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor</p>
                <p className="text-xl font-bold">
                  {formatCurrency(payment.amount)}
                </p>
              </div>
            </div>

            {/* Due Date */}
            <div className="flex items-start gap-3">
              <div className={cn(
                "rounded-lg p-2",
                overdue ? "bg-destructive/10" : "bg-primary/10"
              )}>
                <Calendar className={cn(
                  "h-5 w-5",
                  overdue ? "text-destructive" : "text-primary"
                )} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vencimento</p>
                <p className={cn(
                  "text-lg font-semibold",
                  overdue && "text-destructive"
                )}>
                  {format(new Date(payment.dueDate), 'dd/MM/yyyy', {
                    locale: ptBR,
                  })}
                </p>
              </div>
            </div>

            {/* Paid Date */}
            {payment.paymentDate && (
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-green-100 p-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Pagamento</p>
                  <p className="text-lg font-semibold text-green-600">
                    {format(new Date(payment.paymentDate), 'dd/MM/yyyy', {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Payment Method */}
            {payment.paymentMethod && (
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Método de Pagamento</p>
                  <p className="text-lg font-semibold">{payment.paymentMethod}</p>
                </div>
              </div>
            )}

            {/* Client */}
            {payment.client && (
              <div className="flex items-start gap-3 col-span-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="text-lg font-semibold">
                    {payment.client.user?.name || payment.client.name}
                  </p>
                  {payment.client.companyName && (
                    <p className="text-sm text-muted-foreground">
                      {payment.client.companyName}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {payment.notes && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">Observações</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {payment.notes}
                </p>
              </div>
            </>
          )}

          {/* Attached Documents */}
          {hasDocuments && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Paperclip className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">Documentos Anexados</h4>
                  <Badge variant="secondary" className="ml-auto">
                    {payment.attachedDocuments!.length}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {payment.attachedDocuments!.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-start gap-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="rounded-lg bg-primary/10 p-2">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {attachment.document.title}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {attachment.document.fileName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Anexado em{' '}
                          {format(new Date(attachment.attachedAt), 'dd/MM/yyyy', {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-shrink-0"
                        onClick={() => {
                          window.open(
                            `${process.env.NEXT_PUBLIC_API_URL}/documents/${attachment.document.id}/download`,
                            '_blank'
                          );
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </Button>
                    </div>
                  ))}
                </div>

                {payment.requiresInvoice && payment.invoiceAttachedAt && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground rounded-lg border border-green-200 bg-green-50 p-3">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Nota Fiscal anexada em{' '}
                      {format(new Date(payment.invoiceAttachedAt), 'dd/MM/yyyy', {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Metadata */}
          <Separator />
          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <span className="font-medium">Criado em:</span>{' '}
              {format(new Date(payment.createdAt), "dd/MM/yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </div>
            <div>
              <span className="font-medium">Atualizado em:</span>{' '}
              {format(new Date(payment.updatedAt), "dd/MM/yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
