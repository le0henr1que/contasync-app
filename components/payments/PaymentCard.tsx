'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Building2,
  Calendar,
  CreditCard,
  Wallet,
  Banknote,
  Receipt,
  CheckCircle2,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Paperclip,
  Repeat,
  Zap,
} from 'lucide-react';

export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELED';
export type PaymentMethod =
  | 'CASH'
  | 'PIX'
  | 'BANK_TRANSFER'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'BOLETO';

export interface Payment {
  id: string;
  clientId: string;
  client: {
    id: string;
    companyName: string | null;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  amount: string | number;
  paymentDate: string | null;
  dueDate: string;
  paymentMethod: PaymentMethod | null;
  reference: string | null;
  notes: string | null;
  status: PaymentStatus;
  receiptPath: string | null;
  fileName: string | null;
  mimeType: string | null;
  fileSize: number | null;
  // Recurring payment fields
  isRecurring?: boolean;
  recurringFrequency?: 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUAL' | 'YEARLY' | null;
  recurringDayOfMonth?: number | null;
  recurringEndDate?: string | null;
  parentPaymentId?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaymentCardProps {
  payment: Payment;
  onView?: (payment: Payment) => void;
  onEdit?: (payment: Payment) => void;
  onDelete?: (payment: Payment) => void;
  onAttachReceipt?: (payment: Payment) => void;
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
  BANK_TRANSFER: { icon: Banknote, label: 'Transferência' },
  CREDIT_CARD: { icon: CreditCard, label: 'Cartão Crédito' },
  DEBIT_CARD: { icon: CreditCard, label: 'Cartão Débito' },
  BOLETO: { icon: Receipt, label: 'Boleto' },
};

function formatCurrency(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
}

export function PaymentCard({
  payment,
  onView,
  onEdit,
  onDelete,
  onAttachReceipt,
}: PaymentCardProps) {
  const statusInfo = statusConfig[payment.status];
  const paymentMethodInfo = payment.paymentMethod
    ? paymentMethodConfig[payment.paymentMethod]
    : null;

  const clientName = payment?.client?.companyName || payment?.client?.user?.name;

  const recurringFrequencyLabels = {
    MONTHLY: 'Mensal',
    QUARTERLY: 'Trimestral',
    SEMIANNUAL: 'Semestral',
    YEARLY: 'Anual',
  };

  return (
    <Card variant="default" className="hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{clientName}</span>
              </CardTitle>
              {payment.isRecurring && !payment.parentPaymentId && (
                <Badge variant="secondary" className="gap-1">
                  <Repeat className="h-3 w-3" />
                  {payment.recurringFrequency && recurringFrequencyLabels[payment.recurringFrequency]}
                </Badge>
              )}
              {payment.parentPaymentId && (
                <Badge variant="outline" className="gap-1">
                  <Zap className="h-3 w-3" />
                  Auto
                </Badge>
              )}
            </div>
            {payment.reference && (
              <p className="text-xs text-muted-foreground mt-1">
                Ref: {payment.reference}
              </p>
            )}
          </div>
          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Ações do pagamento"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onView && (
                  <DropdownMenuItem onClick={() => onView(payment)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver detalhes
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(payment)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                )}
                {onAttachReceipt && (
                  <DropdownMenuItem onClick={() => onAttachReceipt(payment)}>
                    <Paperclip className="h-4 w-4 mr-2" />
                    {payment.receiptPath ? 'Alterar Recibo' : 'Anexar Recibo'}
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(payment)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Amount */}
        <div>
          <p className="text-2xl font-bold text-primary">
            {formatCurrency(payment.amount)}
          </p>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Vencimento
            </p>
            <p className="font-medium">
              {format(new Date(payment.dueDate), 'dd/MM/yyyy', {
                locale: ptBR,
              })}
            </p>
          </div>

          {payment.paymentDate && (
            <div className="space-y-1">
              <p className="text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Pagamento
              </p>
              <p className="font-medium">
                {format(new Date(payment.paymentDate), 'dd/MM/yyyy', {
                  locale: ptBR,
                })}
              </p>
            </div>
          )}
        </div>

        {/* Payment Method & Status */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            {paymentMethodInfo && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <paymentMethodInfo.icon className="h-4 w-4" />
                <span>{paymentMethodInfo.label}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {payment.receiptPath && (
              <div
                className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400"
                title="Comprovante anexado"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="sr-only">Comprovante anexado</span>
              </div>
            )}
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
