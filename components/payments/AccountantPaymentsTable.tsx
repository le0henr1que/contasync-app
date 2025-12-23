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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Eye,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Paperclip,
  Link as LinkIcon,
  Unlink,
  Check,
  Download,
  ExternalLink,
  MoreVertical,
  Edit,
  Trash2,
  Bell,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Payment, PaymentStatus } from '@/hooks/usePayments';
import { cn } from '@/lib/utils';

interface AccountantPaymentsTableProps {
  payments: Payment[];
  onViewDetails?: (payment: Payment) => void;
  onEdit?: (payment: Payment) => void;
  onDelete?: (payment: Payment) => void;
  onAttachDocument?: (payment: Payment) => void;
  onDetachDocument?: (payment: Payment, documentId: string) => void;
  onMarkAsPaid?: (payment: Payment) => void;
  onApprove?: (payment: Payment) => void;
  onCharge?: (payment: Payment) => void;
  isLoading?: boolean;
  showClientColumn?: boolean;
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

export function AccountantPaymentsTable({
  payments,
  onViewDetails,
  onEdit,
  onDelete,
  onAttachDocument,
  onDetachDocument,
  onMarkAsPaid,
  onApprove,
  onCharge,
  isLoading,
  showClientColumn = false,
}: AccountantPaymentsTableProps) {
  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numAmount);
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
            {showClientColumn && <TableHead>Cliente</TableHead>}
            <TableHead>Título</TableHead>
            <TableHead>Tipo</TableHead>
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
            const canMarkAsPaid =
              payment.status === 'READY_TO_PAY' ||
              (payment.status === 'PENDING' && !payment.requiresInvoice);

            return (
              <TableRow
                key={payment.id}
                className="cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => onViewDetails?.(payment)}
              >
                {showClientColumn && (
                  <TableCell>
                    <span className="font-medium">
                      {payment.client?.user?.name || payment.client?.name || '—'}
                    </span>
                  </TableCell>
                )}

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
                  <Badge
                    variant={
                      payment.paymentType === 'OFFICE' ? 'secondary' : 'outline'
                    }
                  >
                    {payment.paymentType === 'OFFICE'
                      ? 'Escritório'
                      : 'Cliente'}
                  </Badge>
                </TableCell>

                <TableCell>
                  <span className="font-semibold">
                    {formatCurrency(payment.amount)}
                  </span>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    {overdue && (
                      <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                    )}
                    <div className="flex flex-col gap-1">
                      <span className="text-sm">
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

                <TableCell onClick={(e) => e.stopPropagation()}>
                  {hasDocuments ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1 hover:bg-accent"
                        >
                          <div className="flex items-center gap-1 text-sm text-primary">
                            <Paperclip className="h-4 w-4" />
                            <span>{payment.attachedDocuments!.length}</span>
                          </div>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80" align="start">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm">Documentos Anexados</h4>
                            <Badge variant="secondary" className="text-xs">
                              {payment.attachedDocuments!.length}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            {payment.attachedDocuments!.map((attachment) => (
                              <div
                                key={attachment.id}
                                className="flex items-start gap-2 rounded-lg border p-2 hover:bg-accent/50 transition-colors"
                              >
                                <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {attachment.document.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {attachment.document.fileName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Anexado em {format(new Date(attachment.attachedAt), 'dd/MM/yyyy', { locale: ptBR })}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => {
                                      // Open document in new tab
                                      window.open(`${process.env.NEXT_PUBLIC_API_URL}/documents/${attachment.document.id}/download`, '_blank');
                                    }}
                                    title="Baixar documento"
                                  >
                                    <Download className="h-3 w-3" />
                                  </Button>
                                  {onDetachDocument && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                      onClick={() => onDetachDocument(payment, attachment.document.id)}
                                      title="Desanexar documento"
                                    >
                                      <Unlink className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          {payment.requiresInvoice && payment.invoiceAttachedAt && (
                            <div className="pt-2 border-t">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                <span>Nota Fiscal anexada</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>

                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Ações</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onViewDetails && (
                        <DropdownMenuItem onClick={() => onViewDetails(payment)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>
                      )}

                      {onAttachDocument && (payment.status === 'AWAITING_INVOICE' || payment.status === 'OVERDUE') && (
                        <>
                          <DropdownMenuItem
                            onClick={() => onAttachDocument(payment)}
                            className="text-blue-600"
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Anexar Nota Fiscal
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}

                      {onApprove && payment.status === 'AWAITING_VALIDATION' && (
                        <>
                          <DropdownMenuItem
                            onClick={() => onApprove(payment)}
                            className="text-green-600"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Aprovar Pagamento
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}

                      {onCharge && payment.clientId && payment.status !== 'PAID' && payment.status !== 'CANCELED' && (
                        <>
                          <DropdownMenuItem
                            onClick={() => onCharge(payment)}
                            className="text-orange-600"
                          >
                            <Bell className="mr-2 h-4 w-4" />
                            Cobrar Pagamento
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}

                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(payment)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />

                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(payment)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
