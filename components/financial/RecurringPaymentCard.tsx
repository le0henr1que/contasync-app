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
  Calendar,
  Repeat,
  Power,
  PowerOff,
  Edit,
  Trash2,
} from 'lucide-react';

export type RecurringFrequency = 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUAL' | 'YEARLY';

export interface RecurringPayment {
  id: string;
  clientId: string;
  title: string;
  description?: string | null;
  amount: string | number;
  category: string;
  frequency: RecurringFrequency;
  dayOfMonth: number;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
  lastProcessedDate?: string | null;
  nextDueDate: string;
  createdAt: string;
  updatedAt: string;
}

interface RecurringPaymentCardProps {
  payment: RecurringPayment;
  onToggle?: (payment: RecurringPayment) => void;
  onEdit?: (payment: RecurringPayment) => void;
  onDelete?: (payment: RecurringPayment) => void;
}

const categoryLabels: Record<string, string> = {
  SUBSCRIPTION: 'Assinatura',
  HOUSING: 'Moradia',
  UTILITIES: 'Utilidades',
  INSURANCE: 'Seguro',
  EDUCATION: 'Educação',
  HEALTH: 'Saúde',
  TRANSPORT: 'Transporte',
  OTHER_EXPENSE: 'Outros',
};

const frequencyLabels: Record<RecurringFrequency, string> = {
  MONTHLY: 'Mensal',
  QUARTERLY: 'Trimestral',
  SEMIANNUAL: 'Semestral',
  YEARLY: 'Anual',
};

const frequencyColors: Record<RecurringFrequency, string> = {
  MONTHLY: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  QUARTERLY: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  SEMIANNUAL: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  YEARLY: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

function formatCurrency(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
}

export function RecurringPaymentCard({
  payment,
  onToggle,
  onEdit,
  onDelete,
}: RecurringPaymentCardProps) {
  return (
    <Card
      variant="default"
      className={`transition-all ${
        payment.isActive
          ? 'border-primary/50'
          : 'opacity-60 border-muted'
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Repeat className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{payment.title}</span>
              {!payment.isActive && (
                <PowerOff className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </CardTitle>
            {payment.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {payment.description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Amount */}
        <div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(payment.amount)}
          </p>
          <p className="text-xs text-muted-foreground">
            por {frequencyLabels[payment.frequency].toLowerCase()}
          </p>
        </div>

        {/* Next Due Date & Frequency */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <div>
              <p className="text-xs font-medium">Próximo vencimento</p>
              <p className="text-xs">
                {format(new Date(payment.nextDueDate), "dd/MM/yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
              </p>
            </div>
          </div>

          <Badge className={frequencyColors[payment.frequency]}>
            {frequencyLabels[payment.frequency]}
          </Badge>
        </div>

        {/* Category & Day of Month */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{categoryLabels[payment.category] || payment.category}</span>
          <span>Dia {payment.dayOfMonth}</span>
        </div>

        {/* Last Processed */}
        {payment.lastProcessedDate && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Último processamento:{' '}
              {format(new Date(payment.lastProcessedDate), 'dd/MM/yyyy', {
                locale: ptBR,
              })}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant={payment.isActive ? 'outline' : 'default'}
            size="sm"
            className="flex-1"
            onClick={() => onToggle?.(payment)}
          >
            {payment.isActive ? (
              <>
                <PowerOff className="h-3.5 w-3.5 mr-1.5" />
                Desativar
              </>
            ) : (
              <>
                <Power className="h-3.5 w-3.5 mr-1.5" />
                Ativar
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit?.(payment)}
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete?.(payment)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
