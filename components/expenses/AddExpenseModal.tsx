'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const categoryOptions = [
  { value: 'FOOD', label: 'Alimentação' },
  { value: 'TRANSPORT', label: 'Transporte' },
  { value: 'HEALTH', label: 'Saúde' },
  { value: 'EDUCATION', label: 'Educação' },
  { value: 'OTHER', label: 'Outros' },
];

export function AddExpenseModal({ isOpen, onClose, onSuccess }: AddExpenseModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Tamanho máximo: 5MB');
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Tipo de arquivo não permitido. Use: JPG, PNG ou PDF');
        return;
      }

      setReceiptFile(file);
    }
  };

  const handleRemoveFile = () => {
    setReceiptFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.error('Descrição é obrigatória');
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

    if (!date) {
      toast.error('Data é obrigatória');
      return;
    }

    const expenseDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (expenseDate > today) {
      toast.error('A data da despesa não pode ser no futuro');
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('description', description.trim());
      formData.append('amount', amount);
      formData.append('category', category);
      formData.append('date', date);

      if (receiptFile) {
        formData.append('receipt', receiptFile);
      }

      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expenses/me`, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao adicionar despesa');
      }

      toast.success('Despesa adicionada com sucesso!');
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error adding expense:', error);
      toast.error(error.message || 'Erro ao adicionar despesa');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setDescription('');
      setAmount('');
      setDisplayAmount('');
      setCategory('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setReceiptFile(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Despesa</DialogTitle>
          <DialogDescription>
            Registre uma nova despesa para acompanhamento
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              placeholder="Ex: Almoço com cliente, Táxi para reunião..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </div>

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
            <Label htmlFor="date">Data *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              max={format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => setDate(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt">Comprovante (Opcional)</Label>
            {!receiptFile ? (
              <div className="flex items-center gap-2">
                <Input
                  id="receipt"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('receipt')?.click()}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Anexar Comprovante
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm truncate">{receiptFile.name}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              JPG, PNG ou PDF (máx. 5MB)
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
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
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
