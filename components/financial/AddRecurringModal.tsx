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
import type { RecurringPayment } from './RecurringPaymentCard';

interface AddRecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingPayment?: RecurringPayment | null;
}

const categoryOptions = [
  { value: 'SUBSCRIPTION', label: 'Assinatura' },
  { value: 'HOUSING', label: 'Moradia' },
  { value: 'UTILITIES', label: 'Utilidades' },
  { value: 'INSURANCE', label: 'Seguro' },
  { value: 'EDUCATION', label: 'Educação' },
  { value: 'HEALTH', label: 'Saúde' },
  { value: 'TRANSPORT', label: 'Transporte' },
  { value: 'OTHER_EXPENSE', label: 'Outros' },
];

const frequencyOptions = [
  { value: 'MONTHLY', label: 'Mensal' },
  { value: 'QUARTERLY', label: 'Trimestral (a cada 3 meses)' },
  { value: 'SEMIANNUAL', label: 'Semestral (a cada 6 meses)' },
  { value: 'YEARLY', label: 'Anual' },
];

export function AddRecurringModal({
  isOpen,
  onClose,
  onSuccess,
  editingPayment,
}: AddRecurringModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');
  const [category, setCategory] = useState('');
  const [frequency, setFrequency] = useState('MONTHLY');
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState('');

  // Load editing data
  useEffect(() => {
    if (editingPayment) {
      setTitle(editingPayment.title);
      setDescription(editingPayment.description || '');
      const numAmount = typeof editingPayment.amount === 'string'
        ? parseFloat(editingPayment.amount)
        : editingPayment.amount;
      setAmount(numAmount.toString());
      // Format the amount for display (value is already in reais, need to convert to centavos format)
      const amountInCents = Math.round(numAmount * 100).toString();
      setDisplayAmount(formatCurrencyInput(amountInCents));
      setCategory(editingPayment.category);
      setFrequency(editingPayment.frequency);
      setDayOfMonth(editingPayment.dayOfMonth.toString());
      setStartDate(format(new Date(editingPayment.startDate), 'yyyy-MM-dd'));
      setEndDate(
        editingPayment.endDate
          ? format(new Date(editingPayment.endDate), 'yyyy-MM-dd')
          : ''
      );
    }
  }, [editingPayment]);

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

    if (!category) {
      toast.error('Categoria é obrigatória');
      return;
    }

    const dayNum = parseInt(dayOfMonth);
    if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
      toast.error('Dia do mês deve estar entre 1 e 31');
      return;
    }

    if (!startDate) {
      toast.error('Data de início é obrigatória');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: any = {
        title: title.trim(),
        amount: parseFloat(amount),
        category,
        frequency,
        dayOfMonth: dayNum,
        startDate: new Date(startDate).toISOString(),
      };

      if (description.trim()) {
        payload.description = description.trim();
      }

      if (endDate) {
        payload.endDate = new Date(endDate).toISOString();
      }

      const token = localStorage.getItem('accessToken');
      const url = editingPayment
        ? `${process.env.NEXT_PUBLIC_API_URL}/financial/recurring/${editingPayment.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/financial/recurring`;

      const method = editingPayment ? 'PATCH' : 'POST';

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
        throw new Error(error.message || 'Erro ao salvar pagamento recorrente');
      }

      toast.success(
        editingPayment
          ? 'Pagamento recorrente atualizado com sucesso!'
          : 'Pagamento recorrente criado com sucesso!'
      );
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error saving recurring payment:', error);
      toast.error(error.message || 'Erro ao salvar pagamento recorrente');
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
      setCategory('');
      setFrequency('MONTHLY');
      setDayOfMonth('1');
      setStartDate(format(new Date(), 'yyyy-MM-dd'));
      setEndDate('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingPayment ? 'Editar' : 'Adicionar'} Pagamento Recorrente
          </DialogTitle>
          <DialogDescription>
            Configure um pagamento que se repete automaticamente (assinatura,
            aluguel, etc.)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Ex: Netflix Premium, Aluguel..."
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$) *</Label>
              <Input
                id="amount"
                type="text"
                placeholder="0,00"
                value={displayAmount}
                onChange={handleAmountChange}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dayOfMonth">Dia do Mês *</Label>
              <Input
                id="dayOfMonth"
                type="number"
                min="1"
                max="31"
                placeholder="1"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(e.target.value)}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">1 a 31</p>
            </div>
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="frequency">Frequência *</Label>
            <Select
              value={frequency}
              onValueChange={setFrequency}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a frequência" />
              </SelectTrigger>
              <SelectContent>
                {frequencyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Data de Término</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">Opcional</p>
            </div>
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
              ) : editingPayment ? (
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
