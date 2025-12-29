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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Goal } from './GoalCard';

interface UpdateProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  goal: Goal;
}

export function UpdateProgressModal({
  isOpen,
  onClose,
  onSuccess,
  goal,
}: UpdateProgressModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');

  useEffect(() => {
    if (goal) {
      const currentValue = Number(goal.currentAmount || 0);
      setAmount(currentValue.toString());
      setDisplayAmount(formatCurrencyInput(currentValue.toString()));
    }
  }, [goal]);

  const formatCurrencyInput = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';

    const amountValue = parseFloat(numbers) / 100;
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amountValue);
  };

  const handleAmountChange = (value: string) => {
    const numbers = value.replace(/\D/g, '');

    if (!numbers) {
      setAmount('');
      setDisplayAmount('');
      return;
    }

    const numericValue = parseFloat(numbers) / 100;
    setAmount(numericValue.toString());
    setDisplayAmount(formatCurrencyInput(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) < 0) {
      toast.error('Valor deve ser maior ou igual a zero');
      return;
    }

    try {
      setIsSubmitting(true);

      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/financial/goals/${goal.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
          body: JSON.stringify({
            currentAmount: parseFloat(amount),
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao atualizar progresso');
      }

      toast.success('Progresso atualizado com sucesso!');
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error updating progress:', error);
      toast.error(error.message || 'Erro ao atualizar progresso');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setAmount('');
      setDisplayAmount('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Atualizar Progresso</DialogTitle>
          <DialogDescription>
            Atualize o valor atual acumulado para a meta "{goal?.title}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentAmount">Valor Atual (R$) *</Label>
            <Input
              id="currentAmount"
              type="text"
              placeholder="0,00"
              value={displayAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Meta: {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(Number(goal?.targetAmount || 0))}
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
                  Salvando...
                </>
              ) : (
                'Atualizar'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
