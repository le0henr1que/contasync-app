'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { InstallmentPayment } from './InstallmentCard';

interface PayInstallmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  payment: InstallmentPayment | null;
  installmentTitle?: string;
}

export function PayInstallmentModal({
  isOpen,
  onClose,
  onSuccess,
  payment,
  installmentTitle,
}: PayInstallmentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentDate, setPaymentDate] = useState(
    format(new Date(), 'yyyy-MM-dd'),
  );
  const [amountPaid, setAmountPaid] = useState('');
  const [displayAmountPaid, setDisplayAmountPaid] = useState('');
  const [notes, setNotes] = useState('');

  // Reset form when payment changes
  useEffect(() => {
    if (payment) {
      setPaymentDate(format(new Date(), 'yyyy-MM-dd'));
      const defaultAmount =
        typeof payment.amount === 'string'
          ? parseFloat(payment.amount)
          : payment.amount;
      setAmountPaid(defaultAmount.toString());
      // Convert amount to cents (multiply by 100) before formatting
      const amountInCents = Math.round(defaultAmount * 100).toString();
      setDisplayAmountPaid(formatCurrencyInput(amountInCents));
      setNotes('');
    }
  }, [payment]);

  const formatCurrencyInput = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';

    const amount = parseFloat(numbers) / 100;
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numbers = value.replace(/\D/g, '');

    if (!numbers) {
      setAmountPaid('');
      setDisplayAmountPaid('');
      return;
    }

    const numericValue = parseFloat(numbers) / 100;
    setAmountPaid(numericValue.toString());
    setDisplayAmountPaid(formatCurrencyInput(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!payment) {
      toast.error('Nenhuma parcela selecionada');
      return;
    }

    if (!paymentDate) {
      toast.error('Data de pagamento é obrigatória');
      return;
    }

    if (!amountPaid || parseFloat(amountPaid) <= 0) {
      toast.error('Valor pago deve ser maior que zero');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: any = {
        installmentPaymentId: payment.id,
        paymentDate: new Date(paymentDate).toISOString(),
        amountPaid: parseFloat(amountPaid),
      };

      if (notes.trim()) {
        payload.notes = notes.trim();
      }

      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/financial/installments/pay`,
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

      toast.success('Pagamento registrado com sucesso!');
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error paying installment:', error);
      toast.error(error.message || 'Erro ao processar pagamento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setPaymentDate(format(new Date(), 'yyyy-MM-dd'));
      setAmountPaid('');
      setDisplayAmountPaid('');
      setNotes('');
      onClose();
    }
  };

  if (!payment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Pagamento</DialogTitle>
          <DialogDescription>
            {installmentTitle && (
              <span className="block font-medium text-foreground">
                {installmentTitle}
              </span>
            )}
            Parcela {payment.installmentNumber} - Vencimento:{' '}
            {format(new Date(payment.dueDate), 'dd/MM/yyyy')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paymentDate">Data do Pagamento *</Label>
            <Input
              id="paymentDate"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amountPaid">Valor Pago (R$) *</Label>
            <Input
              id="amountPaid"
              type="text"
              placeholder="0,00"
              value={displayAmountPaid}
              onChange={handleAmountChange}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Valor original:{' '}
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(
                typeof payment.amount === 'string'
                  ? parseFloat(payment.amount)
                  : payment.amount,
              )}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (Opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Ex: Pago via PIX, desconto de 5%..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              rows={2}
            />
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
