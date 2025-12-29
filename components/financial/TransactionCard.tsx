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
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle2,
  CreditCard,
  Repeat,
} from 'lucide-react';

export type TransactionType = 'INCOME' | 'EXPENSE';
export type TransactionCategory =
  | 'SALARY'
  | 'FREELANCE'
  | 'INVESTMENT_RETURN'
  | 'GIFT'
  | 'OTHER_INCOME'
  | 'FOOD'
  | 'TRANSPORT'
  | 'HEALTH'
  | 'EDUCATION'
  | 'HOUSING'
  | 'UTILITIES'
  | 'ENTERTAINMENT'
  | 'SHOPPING'
  | 'SUBSCRIPTION'
  | 'INSURANCE'
  | 'INVESTMENT'
  | 'OTHER_EXPENSE';

export type PaymentMethod =
  | 'CASH'
  | 'PIX'
  | 'BANK_TRANSFER'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'BOLETO';

export interface Transaction {
  id: string;
  clientId: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: string | number;
  date: string;
  paymentMethod?: PaymentMethod | null;
  isFixed: boolean;
  notes?: string | null;
  receiptPath?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  createdAt: string;
  updatedAt: string;
}

interface TransactionCardProps {
  transaction: Transaction;
  onView?: (transaction: Transaction) => void;
}

const categoryConfig: Record<
  TransactionCategory,
  { label: string; color: string }
> = {
  // Income categories
  SALARY: {
    label: 'Salário',
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  },
  FREELANCE: {
    label: 'Freelance',
    color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  },
  INVESTMENT_RETURN: {
    label: 'Investimentos',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  GIFT: {
    label: 'Presente',
    color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  },
  OTHER_INCOME: {
    label: 'Outras Receitas',
    color: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200',
  },
  // Expense categories
  FOOD: {
    label: 'Alimentação',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  },
  TRANSPORT: {
    label: 'Transporte',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  HEALTH: {
    label: 'Saúde',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
  EDUCATION: {
    label: 'Educação',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  },
  HOUSING: {
    label: 'Moradia',
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  },
  UTILITIES: {
    label: 'Utilidades',
    color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  },
  ENTERTAINMENT: {
    label: 'Lazer',
    color: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-200',
  },
  SHOPPING: {
    label: 'Compras',
    color: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
  },
  SUBSCRIPTION: {
    label: 'Assinaturas',
    color: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
  },
  INSURANCE: {
    label: 'Seguros',
    color: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
  },
  INVESTMENT: {
    label: 'Investimentos',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  },
  OTHER_EXPENSE: {
    label: 'Outras Despesas',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  },
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
  CASH: 'Dinheiro',
  PIX: 'PIX',
  BANK_TRANSFER: 'Transferência',
  CREDIT_CARD: 'Cartão de Crédito',
  DEBIT_CARD: 'Cartão de Débito',
  BOLETO: 'Boleto',
};

function formatCurrency(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
}

export function TransactionCard({ transaction, onView }: TransactionCardProps) {
  const categoryInfo = categoryConfig[transaction.category];
  const isIncome = transaction.type === 'INCOME';

  return (
    <Card
      variant="default"
      className={`hover:border-primary/50 transition-colors ${onView ? 'cursor-pointer' : ''}`}
      onClick={() => onView?.(transaction)}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 text-base">
              {isIncome ? (
                <TrendingUp className="h-4 w-4 shrink-0 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 shrink-0 text-red-600" />
              )}
              <span className="truncate">{transaction.description}</span>
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Amount */}
        <div>
          <p
            className={`text-2xl font-bold ${
              isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}
          >
            {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
          </p>
        </div>

        {/* Date & Category */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {format(new Date(transaction.date), 'dd/MM/yyyy', {
                locale: ptBR,
              })}
            </span>
          </div>

          <Badge className={categoryInfo.color}>{categoryInfo.label}</Badge>
        </div>

        {/* Payment Method & Indicators */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {transaction.paymentMethod && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CreditCard className="h-3.5 w-3.5" />
              <span>{paymentMethodLabels[transaction.paymentMethod]}</span>
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {transaction.isFixed && (
              <div
                className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400"
                title="Despesa fixa"
              >
                <Repeat className="h-3.5 w-3.5" />
              </div>
            )}
            {transaction.receiptPath && (
              <div
                className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400"
                title="Comprovante anexado"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        </div>

        {/* Notes preview */}
        {transaction.notes && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground line-clamp-2">
              {transaction.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
