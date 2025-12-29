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
import { Loader2, Plus, Trash2, ListTodo } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Goal } from './GoalCard';

interface GoalItemInput {
  title: string;
  description?: string;
  amount: number;
}

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingGoal?: Goal | null;
}

const priorityOptions = [
  { value: 'LOW', label: 'Baixa' },
  { value: 'MEDIUM', label: 'Média' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'CRITICAL', label: 'Crítica' },
];

export function AddGoalModal({
  isOpen,
  onClose,
  onSuccess,
  editingGoal,
}: AddGoalModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  // Items management
  const [items, setItems] = useState<GoalItemInput[]>([]);
  const [itemTitle, setItemTitle] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemAmount, setItemAmount] = useState('');
  const [displayItemAmount, setDisplayItemAmount] = useState('');

  // Calculate target amount from items
  const targetAmount = items.reduce((sum, item) => sum + item.amount, 0);

  // Load editing data
  useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title);
      setDescription(editingGoal.description || '');
      setPriority(editingGoal.priority);

      if (editingGoal.targetDate) {
        const date = new Date(editingGoal.targetDate);
        setTargetDate(format(date, 'yyyy-MM-dd'));
      }
    } else {
      // Set default date to 1 year from now
      const defaultDate = new Date();
      defaultDate.setFullYear(defaultDate.getFullYear() + 1);
      setTargetDate(format(defaultDate, 'yyyy-MM-dd'));
    }
  }, [editingGoal]);

  const formatCurrencyInput = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';

    const amount = parseFloat(numbers) / 100;
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleItemAmountChange = (value: string) => {
    const numbers = value.replace(/\D/g, '');

    if (!numbers) {
      setItemAmount('');
      setDisplayItemAmount('');
      return;
    }

    const numericValue = parseFloat(numbers) / 100;
    setItemAmount(numericValue.toString());
    setDisplayItemAmount(formatCurrencyInput(value));
  };

  const handleAddItem = () => {
    if (!itemTitle.trim()) {
      toast.error('Título do item é obrigatório');
      return;
    }

    if (!itemAmount || parseFloat(itemAmount) <= 0) {
      toast.error('Valor do item deve ser maior que zero');
      return;
    }

    const newItem: GoalItemInput = {
      title: itemTitle.trim(),
      description: itemDescription.trim() || undefined,
      amount: parseFloat(itemAmount),
    };

    setItems([...items, newItem]);
    setItemTitle('');
    setItemDescription('');
    setItemAmount('');
    setDisplayItemAmount('');
    toast.success('Item adicionado!');
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    toast.success('Item removido!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    if (!editingGoal && items.length === 0) {
      toast.error('Adicione pelo menos um item à meta');
      return;
    }

    if (!editingGoal && targetAmount <= 0) {
      toast.error('Valor total dos items deve ser maior que zero');
      return;
    }

    if (!targetDate) {
      toast.error('Data alvo é obrigatória');
      return;
    }

    try {
      setIsSubmitting(true);

      const token = localStorage.getItem('accessToken');
      const payload: any = {
        title: title.trim(),
        targetAmount: editingGoal ? Number(editingGoal.targetAmount) : targetAmount,
        targetDate: new Date(targetDate).toISOString(),
        priority,
      };

      if (description.trim()) {
        payload.description = description.trim();
      }

      const url = editingGoal
        ? `${process.env.NEXT_PUBLIC_API_URL}/financial/goals/${editingGoal.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/financial/goals`;

      const method = editingGoal ? 'PATCH' : 'POST';

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
        throw new Error(error.message || 'Erro ao salvar meta');
      }

      const createdGoal = await response.json();
      const goalId = editingGoal ? editingGoal.id : createdGoal.id;

      // Create items if any (only for new goals)
      if (!editingGoal && items.length > 0) {
        for (const item of items) {
          const itemResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/financial/goals/${goalId}/items`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
              },
              body: JSON.stringify(item),
            },
          );

          if (!itemResponse.ok) {
            console.error('Failed to create item:', item.title);
          }
        }
      }

      toast.success(
        editingGoal
          ? 'Meta atualizada com sucesso!'
          : items.length > 0
          ? `Meta criada com ${items.length} item(ns)!`
          : 'Meta criada com sucesso!',
      );
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error saving goal:', error);
      toast.error(error.message || 'Erro ao salvar meta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setItems([]);
      setItemTitle('');
      setItemDescription('');
      setItemAmount('');
      setDisplayItemAmount('');
      const defaultDate = new Date();
      defaultDate.setFullYear(defaultDate.getFullYear() + 1);
      setTargetDate(format(defaultDate, 'yyyy-MM-dd'));
      onClose();
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingGoal ? 'Editar' : 'Nova'} Meta Financeira
          </DialogTitle>
          <DialogDescription>
            {editingGoal
              ? 'Atualize as informações da sua meta'
              : 'Defina um objetivo financeiro e acompanhe seu progresso'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Ex: Viagem para Europa, Carro Novo..."
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
              placeholder="Detalhes sobre sua meta..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDate">Data Alvo *</Label>
            <Input
              id="targetDate"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Prioridade</Label>
            <Select
              value={priority}
              onValueChange={setPriority}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!editingGoal && (
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-medium text-sm">
                  Lista de Itens (Opcional)
                </h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Adicione itens com valores estimados para esta meta
              </p>

              <div className="space-y-3 p-3 bg-secondary/30 rounded-lg">
                <div className="space-y-2">
                  <Input
                    placeholder="Nome do item (ex: Azulejo, Pia...)"
                    value={itemTitle}
                    onChange={(e) => setItemTitle(e.target.value)}
                    disabled={isSubmitting}
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Textarea
                    placeholder="Descrição (opcional)"
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    disabled={isSubmitting}
                    rows={2}
                  />
                </div>

                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Valor (R$)"
                    value={displayItemAmount}
                    onChange={(e) => handleItemAmountChange(e.target.value)}
                    disabled={isSubmitting}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddItem}
                    disabled={isSubmitting}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
              </div>

              {items.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-secondary/30 rounded-md">
                    <span className="text-sm font-medium">
                      Total ({items.length} {items.length === 1 ? 'item' : 'itens'}):
                    </span>
                    <span className="text-sm font-bold text-primary">
                      {formatCurrency(items.reduce((sum, item) => sum + item.amount, 0))}
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 rounded-md bg-secondary/50 hover:bg-secondary transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium truncate">
                              {item.title}
                            </p>
                            <span className="text-sm font-medium text-primary whitespace-nowrap">
                              {formatCurrency(item.amount)}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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
              ) : editingGoal ? (
                'Atualizar'
              ) : (
                'Criar Meta'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
