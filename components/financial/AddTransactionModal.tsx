'use client';

import { useState, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Upload, X, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const typeOptions = [
  { value: 'INCOME', label: 'Receita', icon: TrendingUp, color: 'text-green-600' },
  { value: 'EXPENSE', label: 'Despesa', icon: TrendingDown, color: 'text-red-600' },
];

const incomeCategories = [
  { value: 'SALARY', label: 'Salário' },
  { value: 'FREELANCE', label: 'Freelance' },
  { value: 'INVESTMENT_RETURN', label: 'Retorno de Investimentos' },
  { value: 'GIFT', label: 'Presente' },
  { value: 'OTHER_INCOME', label: 'Outras Receitas' },
];

const expenseCategories = [
  { value: 'FOOD', label: 'Alimentação' },
  { value: 'TRANSPORT', label: 'Transporte' },
  { value: 'HEALTH', label: 'Saúde' },
  { value: 'EDUCATION', label: 'Educação' },
  { value: 'HOUSING', label: 'Moradia' },
  { value: 'UTILITIES', label: 'Utilidades' },
  { value: 'ENTERTAINMENT', label: 'Lazer' },
  { value: 'SHOPPING', label: 'Compras' },
  { value: 'SUBSCRIPTION', label: 'Assinaturas' },
  { value: 'INSURANCE', label: 'Seguros' },
  { value: 'INVESTMENT', label: 'Investimentos' },
  { value: 'OTHER_EXPENSE', label: 'Outras Despesas' },
];

const paymentMethods = [
  { value: 'CASH', label: 'Dinheiro' },
  { value: 'PIX', label: 'PIX' },
  { value: 'BANK_TRANSFER', label: 'Transferência Bancária' },
  { value: 'CREDIT_CARD', label: 'Cartão de Crédito' },
  { value: 'DEBIT_CARD', label: 'Cartão de Débito' },
  { value: 'BOLETO', label: 'Boleto' },
];

export function AddTransactionModal({
  isOpen,
  onClose,
  onSuccess,
}: AddTransactionModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isFixed, setIsFixed] = useState(false);
  const [notes, setNotes] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  // Reset category when type changes
  useEffect(() => {
    setCategory('');
  }, [type]);

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

    if (!type) {
      toast.error('Tipo é obrigatório');
      return;
    }

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

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('type', type);
      formData.append('description', description.trim());
      formData.append('amount', amount);
      formData.append('category', category);
      formData.append('date', new Date(date).toISOString());
      formData.append('isFixed', String(isFixed));

      if (paymentMethod) {
        formData.append('paymentMethod', paymentMethod);
      }

      if (notes.trim()) {
        formData.append('notes', notes.trim());
      }

      if (receiptFile) {
        formData.append('receipt', receiptFile);
      }

      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/financial/transactions`, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao adicionar transação');
      }

      toast.success('Transação adicionada com sucesso!');
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      toast.error(error.message || 'Erro ao adicionar transação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setType('');
      setDescription('');
      setAmount('');
      setDisplayAmount('');
      setCategory('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setPaymentMethod('');
      setIsFixed(false);
      setNotes('');
      setReceiptFile(null);
      onClose();
    }
  };

  const categoryOptions = type === 'INCOME' ? incomeCategories : expenseCategories;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Transação</DialogTitle>
          <DialogDescription>
            Registre uma nova receita ou despesa
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo *</Label>
            <Select value={type} onValueChange={setType} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${option.color}`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              placeholder="Ex: Salário mensal, Compra no supermercado..."
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
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select
              value={category}
              onValueChange={setCategory}
              disabled={isSubmitting || !type}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    type
                      ? 'Selecione uma categoria'
                      : 'Selecione o tipo primeiro'
                  }
                />
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
            <Label htmlFor="paymentMethod">Forma de Pagamento (Opcional)</Label>
            <Select
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isFixed"
              checked={isFixed}
              onCheckedChange={(checked) => setIsFixed(checked as boolean)}
              disabled={isSubmitting}
            />
            <Label
              htmlFor="isFixed"
              className="text-sm font-normal cursor-pointer"
            >
              Despesa/Receita fixa (recorrente)
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (Opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Adicione observações ou detalhes adicionais..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              rows={2}
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
            <Button type="submit" disabled={isSubmitting} className="flex-1">
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
