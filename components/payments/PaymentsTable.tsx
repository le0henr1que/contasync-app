'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Eye,
  Download,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Paperclip,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Payment, PaymentStatus } from '@/hooks/usePayments';
import { cn } from '@/lib/utils';

interface PaymentsTableProps {
  payments: Payment[];
  onViewDetails?: (payment: Payment) => void;
  onAttachDocument?: (payment: Payment) => void;
  isLoading?: boolean;
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
    icon: <Clock className="h-3 w-3" />,
  },
  AWAITING_INVOICE: {
    label: 'Aguardando NF',
    variant: 'outline',
    icon: <AlertCircle className="h-3 w-3" />,
  },
  READY_TO_PAY: {
    label: 'Pronto para Pagar',
    variant: 'default',
    icon: <CheckCircle className="h-3 w-3" />,
  },
  AWAITING_VALIDATION: {
    label: 'Aguardando Validação',
    variant: 'secondary',
    icon: <Clock className="h-3 w-3" />,
  },
  PAID: {
    label: 'Pago',
    variant: 'default',
    icon: <CheckCircle className="h-3 w-3" />,
  },
  OVERDUE: {
    label: 'Vencido',
    variant: 'destructive',
    icon: <AlertCircle className="h-3 w-3" />,
  },
  CANCELED: {
    label: 'Cancelado',
    variant: 'outline',
    icon: <XCircle className="h-3 w-3" />,
  },
};

export function PaymentsTable({
  payments,
  onViewDetails,
  onAttachDocument,
  isLoading,
}: PaymentsTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const isOverdue = (payment: Payment) => {
    if (payment.status === 'PAID' || payment.status === 'CANCELED') {
      return false;
    }
    const dueDate = new Date(payment.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-lg border bg-muted/50"
          />
        ))}
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Nenhum pagamento encontrado</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Não há pagamentos cadastrados no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Documentos</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => {
            const status = statusConfig[payment.status];
            const hasDocuments =
              payment.attachedDocuments && payment.attachedDocuments.length > 0;
            const overdue = isOverdue(payment);

            return (
              <TableRow
                key={payment.id}
                className={cn(
                  'cursor-pointer transition-colors hover:bg-muted/50',
                  overdue && 'bg-destructive/5'
                )}
                onClick={() => onViewDetails?.(payment)}
              >
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{payment.title}</span>
                    {payment.reference && (
                      <span className="text-xs text-muted-foreground">
                        Ref: {payment.reference}
                      </span>
                    )}
                    {payment.isRecurring && (
                      <Badge variant="outline" className="w-fit text-xs">
                        Recorrente
                      </Badge>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <span className="font-semibold">
                    {formatCurrency(payment.amount)}
                  </span>
                </TableCell>

                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span
                      className={cn(
                        'text-sm',
                        overdue && 'font-semibold text-destructive'
                      )}
                    >
                      {format(new Date(payment.dueDate), 'dd/MM/yyyy', {
                        locale: ptBR,
                      })}
                    </span>
                    {payment.paymentDate && (
                      <span className="text-xs text-muted-foreground">
                        Pago em:{' '}
                        {format(new Date(payment.paymentDate), 'dd/MM/yyyy', {
                          locale: ptBR,
                        })}
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={overdue ? 'destructive' : status.variant}
                    className="flex w-fit items-center gap-1"
                  >
                    {overdue ? (
                      <>
                        <AlertCircle className="h-3 w-3" />
                        Vencido
                      </>
                    ) : (
                      <>
                        {status.icon}
                        {status.label}
                      </>
                    )}
                  </Badge>
                </TableCell>

                <TableCell>
                  {hasDocuments ? (
                    <div className="flex items-center gap-1 text-sm text-primary">
                      <Paperclip className="h-4 w-4" />
                      <span>{payment.attachedDocuments!.length}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {onViewDetails && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails(payment);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}

                    {onAttachDocument && payment.requiresInvoice && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAttachDocument(payment);
                        }}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
