'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { RecurringPayment } from './RecurringPaymentCard';

interface PayRecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  payment: RecurringPayment | null;
}

// Generate month options for current year and next year
const generateMonthOptions = () => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const options: { value: string; label: string }[] = [];
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  // Add months from last year
  for (let month = 0; month < 12; month++) {
    const year = currentYear - 1;
    const monthStr = (month + 1).toString().padStart(2, '0');
    options.push({
      value: `${year}-${monthStr}`,
      label: `${months[month]} ${year}`
    });
  }

  // Add months from current year
  for (let month = 0; month < 12; month++) {
    const year = currentYear;
    const monthStr = (month + 1).toString().padStart(2, '0');
    options.push({
      value: `${year}-${monthStr}`,
      label: `${months[month]} ${year}`
    });
  }

  // Add months from next year
  for (let month = 0; month < 12; month++) {
    const year = currentYear + 1;
    const monthStr = (month + 1).toString().padStart(2, '0');
    options.push({
      value: `${year}-${monthStr}`,
      label: `${months[month]} ${year}`
    });
  }

  return options;
};

export function PayRecurringModal({
  isOpen,
  onClose,
  onSuccess,
  payment,
}: PayRecurringModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referenceMonth, setReferenceMonth] = useState('');

  const monthOptions = generateMonthOptions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!payment) {
      toast.error('Nenhum pagamento selecionado');
      return;
    }

    if (!referenceMonth) {
      toast.error('Selecione o mês de referência');
      return;
    }

    try {
      setIsSubmitting(true);

      // Parse reference month to create payment date
      const [year, month] = referenceMonth.split('-');
      const paymentDate = new Date(parseInt(year), parseInt(month) - 1, payment.dayOfMonth, 12, 0, 0);

      const payload = {
        paymentDate: paymentDate.toISOString(),
      };

      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/financial/recurring/${payment.id}/pay`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao processar pagamento');
      }

      toast.success('Pagamento recorrente processado com sucesso!');
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error processing recurring payment:', error);
      toast.error(error.message || 'Erro ao processar pagamento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReferenceMonth('');
      onClose();
    }
  };

  if (!payment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Pagamento Recorrente</DialogTitle>
          <DialogDescription>
            {payment.title}
            <br />
            Valor:{' '}
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(
              typeof payment.amount === 'string'
                ? parseFloat(payment.amount)
                : payment.amount
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="referenceMonth">Mês de Referência *</Label>
            <Select
              value={referenceMonth}
              onValueChange={setReferenceMonth}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Selecione o mês referente a este pagamento
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                'Confirmar Pagamento'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
