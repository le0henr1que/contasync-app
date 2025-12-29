'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CreditCard,
  Edit,
  Trash2,
  XCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  Store,
} from 'lucide-react';

export interface InstallmentPayment {
  id: string;
  installmentId: string;
  installmentNumber: number;
  amount: string | number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'SKIPPED';
  paidDate?: string | null;
  transactionId?: string | null;
}

export interface Installment {
  id: string;
  clientId: string;
  title: string;
  description?: string | null;
  totalAmount: string | number;
  installmentCount: number;
  installmentAmount: string | number;
  interestRate?: string | number | null;
  category: string;
  firstDueDate: string;
  store?: string | null;
  notes?: string | null;
  paidCount: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELED';
  createdAt: string;
  updatedAt: string;
  payments: InstallmentPayment[];
}

interface InstallmentCardProps {
  installment: Installment;
  onEdit?: (installment: Installment) => void;
  onDelete?: (installment: Installment) => void;
  onCancel?: (installment: Installment) => void;
  onPay?: (payment: InstallmentPayment) => void;
}

const categoryLabels: Record<string, string> = {
  SALARY: 'Salário',
  INVESTMENT: 'Investimento',
  FREELANCE: 'Freelance',
  RENT: 'Aluguel',
  FOOD: 'Alimentação',
  TRANSPORT: 'Transporte',
  HEALTH: 'Saúde',
  EDUCATION: 'Educação',
  ENTERTAINMENT: 'Entretenimento',
  UTILITIES: 'Contas',
  SHOPPING: 'Compras',
  FURNITURE: 'Móveis',
  EQUIPMENT: 'Equipamentos',
  SUBSCRIPTION: 'Assinaturas',
  OTHER_INCOME: 'Outras Receitas',
  OTHER_EXPENSE: 'Outras Despesas',
};

const statusLabels = {
  ACTIVE: 'Ativo',
  COMPLETED: 'Completo',
  CANCELED: 'Cancelado',
};

const statusColors = {
  ACTIVE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  CANCELED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

function formatCurrency(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
}

export function InstallmentCard({
  installment,
  onEdit,
  onDelete,
  onCancel,
  onPay,
}: InstallmentCardProps) {
  const progress = (installment.paidCount / installment.installmentCount) * 100;
  const remainingAmount =
    Number(installment.totalAmount) -
    (installment.payments || [])
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0);

  const nextUnpaidPayment = (installment.payments || []).find(
    (p) => p.status !== 'PAID',
  );

  return (
    <Card
      variant="default"
      className={`transition-all ${
        installment.status === 'COMPLETED'
          ? 'border-green-500/50'
          : installment.status === 'CANCELED'
          ? 'opacity-60 border-muted'
          : 'border-primary/50'
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{installment.title}</span>
            </CardTitle>
            {installment.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {installment.description}
              </p>
            )}
            {installment.store && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Store className="h-3 w-3" />
                {installment.store}
              </div>
            )}
          </div>
          <Badge className={statusColors[installment.status]}>
            {statusLabels[installment.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Amounts */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Total</p>
            <p className="text-lg font-bold">
              {formatCurrency(installment.totalAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Por parcela</p>
            <p className="text-lg font-bold text-primary">
              {formatCurrency(installment.installmentAmount)}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">
              {installment.paidCount}/{installment.installmentCount} pagas (
              {progress.toFixed(0)}%)
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary rounded-full h-2 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          {installment.status === 'ACTIVE' && (
            <p className="text-xs text-muted-foreground mt-1">
              Restam {formatCurrency(remainingAmount)}
            </p>
          )}
        </div>

        {/* Next Payment */}
        {nextUnpaidPayment && installment.status === 'ACTIVE' && (
          <div className="p-3 bg-secondary/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium">Próxima parcela</span>
              </div>
              <span className="text-sm font-semibold">
                {nextUnpaidPayment.installmentNumber}/
                {installment.installmentCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Vencimento</p>
                <p className="text-sm font-medium">
                  {format(new Date(nextUnpaidPayment.dueDate), 'dd/MM/yyyy', {
                    locale: ptBR,
                  })}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => onPay?.(nextUnpaidPayment)}
                className="gap-1.5"
              >
                <DollarSign className="h-3.5 w-3.5" />
                Pagar {formatCurrency(nextUnpaidPayment.amount)}
              </Button>
            </div>
          </div>
        )}

        {/* Payment List (collapsed) */}
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {(installment.payments || []).map((payment) => (
            <div
              key={payment.id}
              className={`flex items-center justify-between text-xs p-2 rounded ${
                payment.status === 'PAID'
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : new Date(payment.dueDate) < new Date()
                  ? 'bg-red-50 dark:bg-red-900/20'
                  : 'bg-secondary/30'
              }`}
            >
              <div className="flex items-center gap-2">
                {payment.status === 'PAID' ? (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                ) : (
                  <Clock className="h-3 w-3 text-muted-foreground" />
                )}
                <span>
                  {payment.installmentNumber}/{installment.installmentCount}
                </span>
                <span className="text-muted-foreground">
                  {format(new Date(payment.dueDate), 'dd/MM/yy')}
                </span>
              </div>
              <span className="font-medium">
                {formatCurrency(payment.amount)}
              </span>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>{categoryLabels[installment.category] || installment.category}</span>
          {installment.interestRate && Number(installment.interestRate) > 0 && (
            <span>Juros: {Number(installment.interestRate).toFixed(2)}%</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          {installment.status === 'ACTIVE' && onCancel && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onCancel(installment)}
            >
              <XCircle className="h-3.5 w-3.5 mr-1.5" />
              Cancelar
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(installment)}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(installment)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
