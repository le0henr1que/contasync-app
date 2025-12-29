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
import { format } from 'date-fns';
import type { Installment } from './InstallmentCard';

interface AddInstallmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingInstallment?: Installment | null;
}

const categoryOptions = [
  { value: 'FURNITURE', label: 'Móveis' },
  { value: 'EQUIPMENT', label: 'Equipamentos' },
  { value: 'EDUCATION', label: 'Educação' },
  { value: 'HEALTH', label: 'Saúde' },
  { value: 'TRANSPORT', label: 'Transporte' },
  { value: 'SHOPPING', label: 'Compras' },
  { value: 'ENTERTAINMENT', label: 'Entretenimento' },
  { value: 'SUBSCRIPTION', label: 'Assinaturas' },
  { value: 'OTHER_EXPENSE', label: 'Outros' },
];

export function AddInstallmentModal({
  isOpen,
  onClose,
  onSuccess,
  editingInstallment,
}: AddInstallmentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [displayTotalAmount, setDisplayTotalAmount] = useState('');
  const [installmentCount, setInstallmentCount] = useState('12');
  const [interestRate, setInterestRate] = useState('0');
  const [category, setCategory] = useState('');
  const [firstDueDate, setFirstDueDate] = useState(
    format(new Date(), 'yyyy-MM-dd'),
  );
  const [store, setStore] = useState('');
  const [notes, setNotes] = useState('');

  // Load editing data
  useEffect(() => {
    if (editingInstallment) {
      setTitle(editingInstallment.title);
      setDescription(editingInstallment.description || '');
      setCategory(editingInstallment.category);
      setStore(editingInstallment.store || '');
      setNotes(editingInstallment.notes || '');
      // Cannot edit amounts/dates in update mode
    }
  }, [editingInstallment]);

  const formatCurrencyInput = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';

    const amount = parseFloat(numbers) / 100;
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleTotalAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numbers = value.replace(/\D/g, '');

    if (!numbers) {
      setTotalAmount('');
      setDisplayTotalAmount('');
      return;
    }

    const numericValue = parseFloat(numbers) / 100;
    setTotalAmount(numericValue.toString());
    setDisplayTotalAmount(formatCurrencyInput(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    if (!editingInstallment) {
      // Validation only for create mode
      if (!totalAmount || parseFloat(totalAmount) <= 0) {
        toast.error('Valor total deve ser maior que zero');
        return;
      }

      const count = parseInt(installmentCount);
      if (isNaN(count) || count < 2 || count > 60) {
        toast.error('Número de parcelas deve estar entre 2 e 60');
        return;
      }

      if (!category) {
        toast.error('Categoria é obrigatória');
        return;
      }

      if (!firstDueDate) {
        toast.error('Data do primeiro vencimento é obrigatória');
        return;
      }
    }

    try {
      setIsSubmitting(true);

      const token = localStorage.getItem('accessToken');
      let payload: any;

      if (editingInstallment) {
        // Update mode - only editable fields
        payload = {
          title: title.trim(),
        };

        if (description.trim()) {
          payload.description = description.trim();
        }

        if (category) {
          payload.category = category;
        }

        if (store.trim()) {
          payload.store = store.trim();
        }

        if (notes.trim()) {
          payload.notes = notes.trim();
        }
      } else {
        // Create mode - all fields
        payload = {
          title: title.trim(),
          totalAmount: parseFloat(totalAmount),
          installmentCount: parseInt(installmentCount),
          category,
          firstDueDate: new Date(firstDueDate).toISOString(),
        };

        if (description.trim()) {
          payload.description = description.trim();
        }

        const rate = parseFloat(interestRate);
        if (!isNaN(rate) && rate > 0) {
          payload.interestRate = rate;
        }

        if (store.trim()) {
          payload.store = store.trim();
        }

        if (notes.trim()) {
          payload.notes = notes.trim();
        }
      }

      const url = editingInstallment
        ? `${process.env.NEXT_PUBLIC_API_URL}/financial/installments/${editingInstallment.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/financial/installments`;

      const method = editingInstallment ? 'PATCH' : 'POST';

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
        throw new Error(error.message || 'Erro ao salvar parcelamento');
      }

      toast.success(
        editingInstallment
          ? 'Parcelamento atualizado com sucesso!'
          : 'Parcelamento criado com sucesso!',
      );
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error saving installment:', error);
      toast.error(error.message || 'Erro ao salvar parcelamento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTitle('');
      setDescription('');
      setTotalAmount('');
      setDisplayTotalAmount('');
      setInstallmentCount('12');
      setInterestRate('0');
      setCategory('');
      setFirstDueDate(format(new Date(), 'yyyy-MM-dd'));
      setStore('');
      setNotes('');
      onClose();
    }
  };

  // Calculate preview of installment amount
  const calculateInstallmentPreview = () => {
    if (!totalAmount || !installmentCount) return null;

    const total = parseFloat(totalAmount);
    const count = parseInt(installmentCount);
    const rate = parseFloat(interestRate) || 0;

    if (isNaN(total) || isNaN(count) || count <= 0) return null;

    if (rate === 0) {
      return total / count;
    }

    // Price formula
    const i = rate / 100;
    const numerator = i * Math.pow(1 + i, count);
    const denominator = Math.pow(1 + i, count) - 1;
    return total * (numerator / denominator);
  };

  const previewAmount = calculateInstallmentPreview();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingInstallment ? 'Editar' : 'Adicionar'} Parcelamento
          </DialogTitle>
          <DialogDescription>
            {editingInstallment
              ? 'Edite as informações do parcelamento'
              : 'Configure uma compra parcelada (valores e datas não podem ser alterados depois)'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Ex: Notebook Dell, Geladeira Samsung..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              placeholder="Detalhes adicionais..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={2}
            />
          </div>

          {!editingInstallment && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalAmount">Valor Total (R$) *</Label>
                  <Input
                    id="totalAmount"
                    type="text"
                    placeholder="0,00"
                    value={displayTotalAmount}
                    onChange={handleTotalAmountChange}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="installmentCount">Número de Parcelas *</Label>
                  <Input
                    id="installmentCount"
                    type="number"
                    min="2"
                    max="60"
                    placeholder="12"
                    value={installmentCount}
                    onChange={(e) => setInstallmentCount(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interestRate">
                  Taxa de Juros (% ao mês - Opcional)
                </Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  Deixe 0 para parcelamento sem juros
                </p>
              </div>

              {previewAmount && (
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">
                    Valor de cada parcela (estimativa):
                  </p>
                  <p className="text-lg font-bold text-primary">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(previewAmount)}
                  </p>
                </div>
              )}
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select
              value={category}
              onValueChange={setCategory}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!editingInstallment && (
            <div className="space-y-2">
              <Label htmlFor="firstDueDate">Primeiro Vencimento *</Label>
              <Input
                id="firstDueDate"
                type="date"
                value={firstDueDate}
                onChange={(e) => setFirstDueDate(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="store">Loja/Vendedor (Opcional)</Label>
            <Input
              id="store"
              placeholder="Ex: Magazine Luiza, Mercado Livre..."
              value={store}
              onChange={(e) => setStore(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (Opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Informações adicionais..."
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
                  Salvando...
                </>
              ) : editingInstallment ? (
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
