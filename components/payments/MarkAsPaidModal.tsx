'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Payment } from '@/hooks/usePayments';

interface MarkAsPaidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  payment: Payment | null;
}

export function MarkAsPaidModal({
  isOpen,
  onClose,
  onSuccess,
  payment,
}: MarkAsPaidModalProps) {
  const [paidDate, setPaidDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!payment) return;

    try {
      setIsSubmitting(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/${payment.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({
            status: 'PAID',
            paidDate,
            paymentMethod: paymentMethod || undefined,
            notes: notes || undefined,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao marcar pagamento como pago');
      }

      toast.success('Pagamento marcado como pago com sucesso');
      onSuccess?.();
      handleClose();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao marcar pagamento como pago');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPaidDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('');
    setNotes('');
    onClose();
  };

  if (!payment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Marcar como Pago</DialogTitle>
          <DialogDescription>
            Registre o pagamento de "{payment.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Payment Info */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Valor:</span>
              </div>
              <div className="text-right font-semibold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(payment.amount)}
              </div>
              <div>
                <span className="text-muted-foreground">Vencimento:</span>
              </div>
              <div className="text-right">
                {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>

          {/* Paid Date */}
          <div className="space-y-2">
            <Label htmlFor="paidDate">Data do Pagamento *</Label>
            <Input
              id="paidDate"
              type="date"
              value={paidDate}
              onChange={(e) => setPaidDate(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
            <Select
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="TRANSFERENCIA_BANCARIA">
                  Transferência Bancária
                </SelectItem>
                <SelectItem value="BOLETO">Boleto</SelectItem>
                <SelectItem value="CARTAO_CREDITO">Cartão de Crédito</SelectItem>
                <SelectItem value="CARTAO_DEBITO">Cartão de Débito</SelectItem>
                <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                <SelectItem value="CHEQUE">Cheque</SelectItem>
                <SelectItem value="OUTRO">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Adicione observações sobre o pagamento (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar Pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
