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
import type { GoalItem } from './GoalCard';

interface AddGoalItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  goalId: string;
  editingItem?: GoalItem | null;
}

export function AddGoalItemModal({
  isOpen,
  onClose,
  onSuccess,
  goalId,
  editingItem,
}: AddGoalItemModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');

  // Load editing data
  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title);
      setDescription(editingItem.description || '');

      const itemAmount = Number(editingItem.amount);
      setAmount(itemAmount.toString());
      setDisplayAmount(formatCurrencyInput(itemAmount.toString()));
    }
  }, [editingItem]);

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

    if (!title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Valor deve ser maior que zero');
      return;
    }

    try {
      setIsSubmitting(true);

      const token = localStorage.getItem('accessToken');
      const payload: any = {
        title: title.trim(),
        amount: parseFloat(amount),
      };

      if (description.trim()) {
        payload.description = description.trim();
      }

      const url = editingItem
        ? `${process.env.NEXT_PUBLIC_API_URL}/financial/goals/${goalId}/items/${editingItem.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/financial/goals/${goalId}/items`;

      const method = editingItem ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao salvar item');
      }

      toast.success(
        editingItem
          ? 'Item atualizado com sucesso!'
          : 'Item adicionado com sucesso!',
      );
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error saving goal item:', error);
      toast.error(error.message || 'Erro ao salvar item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTitle('');
      setDescription('');
      setAmount('');
      setDisplayAmount('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? 'Editar' : 'Adicionar'} Item
          </DialogTitle>
          <DialogDescription>
            {editingItem
              ? 'Atualize as informações do item'
              : 'Adicione um item com valor estimado à sua meta'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Ex: Azulejo, Pia, Material elétrico..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              placeholder="Detalhes sobre o item..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor Estimado (R$) *</Label>
            <Input
              id="amount"
              type="text"
              placeholder="0,00"
              value={displayAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              disabled={isSubmitting}
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
                  Salvando...
                </>
              ) : editingItem ? (
                'Atualizar'
              ) : (
                'Adicionar'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
