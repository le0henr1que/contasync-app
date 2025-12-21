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
  Receipt,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export type ExpenseCategory = 'FOOD' | 'TRANSPORT' | 'HEALTH' | 'EDUCATION' | 'OTHER';

export interface Expense {
  id: string;
  clientId: string;
  date: string;
  description: string;
  category: ExpenseCategory;
  amount: string | number;
  receiptPath: string | null;
  fileName: string | null;
  mimeType: string | null;
  fileSize: number | null;
  createdAt: string;
  updatedAt: string;
}

interface ExpenseCardProps {
  expense: Expense;
  onView?: (expense: Expense) => void;
}

const categoryConfig: Record<
  ExpenseCategory,
  { label: string; color: string }
> = {
  FOOD: { label: 'Alimentação', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  TRANSPORT: { label: 'Transporte', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  HEALTH: { label: 'Saúde', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  EDUCATION: { label: 'Educação', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  OTHER: { label: 'Outros', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
};

function formatCurrency(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
}

export function ExpenseCard({ expense, onView }: ExpenseCardProps) {
  const categoryInfo = categoryConfig[expense.category];

  return (
    <Card
      variant="default"
      className={`hover:border-primary/50 transition-colors ${onView ? 'cursor-pointer' : ''}`}
      onClick={() => onView?.(expense)}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Receipt className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{expense.description}</span>
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Amount */}
        <div>
          <p className="text-2xl font-bold text-primary">
            {formatCurrency(expense.amount)}
          </p>
        </div>

        {/* Date & Category */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {format(new Date(expense.date), 'dd/MM/yyyy', {
                locale: ptBR,
              })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {expense.receiptPath && (
              <div
                className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400"
                title="Recibo anexado"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="sr-only">Recibo anexado</span>
              </div>
            )}
            <Badge className={categoryInfo.color}>
              {categoryInfo.label}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
