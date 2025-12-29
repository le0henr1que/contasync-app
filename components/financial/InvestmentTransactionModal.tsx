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
import type { Investment } from './InvestmentCard';

interface InvestmentTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  investment: Investment | null;
  transactionType: 'BUY' | 'SELL';
}

export function InvestmentTransactionModal({
  isOpen,
  onClose,
  onSuccess,
  investment,
  transactionType,
}: InvestmentTransactionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [displayPrice, setDisplayPrice] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [fees, setFees] = useState('');
  const [displayFees, setDisplayFees] = useState('');
  const [notes, setNotes] = useState('');

  // Reset form when investment/type changes
  useEffect(() => {
    if (investment && isOpen) {
      setQuantity('');
      const currentPrice = Number(investment.currentPrice);
      setPrice(currentPrice.toString());
      setDisplayPrice(formatCurrencyInput(currentPrice.toString()));
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setFees('');
      setDisplayFees('');
      setNotes('');
    }
  }, [investment, transactionType, isOpen]);

  const formatCurrencyInput = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';

    const amount = parseFloat(numbers) / 100;
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handlePriceChange = (
    value: string,
    setter: (v: string) => void,
    displaySetter: (v: string) => void,
  ) => {
    const numbers = value.replace(/\D/g, '');

    if (!numbers) {
      setter('');
      displaySetter('');
      return;
    }

    const numericValue = parseFloat(numbers) / 100;
    setter(numericValue.toString());
    displaySetter(formatCurrencyInput(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!investment) {
      toast.error('Nenhum investimento selecionado');
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error('Quantidade deve ser maior que zero');
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      toast.error('Preço deve ser maior que zero');
      return;
    }

    if (!date) {
      toast.error('Data é obrigatória');
      return;
    }

    // Validate SELL quantity
    if (transactionType === 'SELL') {
      const currentQty = Number(investment.currentQuantity);
      const sellQty = parseFloat(quantity);
      if (sellQty > currentQty) {
        toast.error(
          `Quantidade insuficiente. Você possui ${currentQty.toFixed(6)} unidades.`,
        );
        return;
      }
    }

    try {
      setIsSubmitting(true);

      const payload: any = {
        type: transactionType,
        quantity: parseFloat(quantity),
        price: parseFloat(price),
        date: new Date(date).toISOString(),
      };

      if (fees && parseFloat(fees) > 0) {
        payload.fees = parseFloat(fees);
      }

      if (notes.trim()) {
        payload.notes = notes.trim();
      }

      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/financial/investments/${investment.id}/transaction`,
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
        throw new Error(error.message || 'Erro ao processar transação');
      }

      toast.success(
        `${transactionType === 'BUY' ? 'Compra' : 'Venda'} registrada com sucesso!`,
      );
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      toast.error(error.message || 'Erro ao processar transação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setQuantity('');
      setPrice('');
      setDisplayPrice('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setFees('');
      setDisplayFees('');
      setNotes('');
      onClose();
    }
  };

  if (!investment) return null;

  const totalValue =
    quantity && price
      ? parseFloat(quantity) * parseFloat(price) +
        (fees ? parseFloat(fees) : 0)
      : 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {transactionType === 'BUY' ? 'Comprar' : 'Vender'} {investment.ticker}
          </DialogTitle>
          <DialogDescription>
            <span className="block font-medium text-foreground">
              {investment.name}
            </span>
            {transactionType === 'SELL' && (
              <span className="block mt-1">
                Quantidade disponível:{' '}
                {Number(investment.currentQuantity).toFixed(6)}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade *</Label>
            <Input
              id="quantity"
              type="number"
              step="0.000001"
              min="0.000001"
              placeholder="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
            {transactionType === 'SELL' && (
              <p className="text-xs text-muted-foreground">
                Máximo: {Number(investment.currentQuantity).toFixed(6)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Preço por Unidade (R$) *</Label>
            <Input
              id="price"
              type="text"
              placeholder="0,00"
              value={displayPrice}
              onChange={(e) =>
                handlePriceChange(e.target.value, setPrice, setDisplayPrice)
              }
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Preço médio de compra:{' '}
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(Number(investment.averagePrice))}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data da Transação *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fees">Taxas/Corretagem (R$)</Label>
            <Input
              id="fees"
              type="text"
              placeholder="0,00"
              value={displayFees}
              onChange={(e) =>
                handlePriceChange(e.target.value, setFees, setDisplayFees)
              }
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (Opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Motivo da transação..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              rows={2}
            />
          </div>

          {totalValue > 0 && (
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">
                Valor total da transação:
              </p>
              <p className="text-lg font-bold text-primary">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(totalValue)}
              </p>
              {transactionType === 'SELL' && price && (
                <p className="text-xs text-muted-foreground mt-1">
                  {parseFloat(price) > Number(investment.averagePrice)
                    ? 'Lucro potencial'
                    : 'Prejuízo potencial'}
                  :{' '}
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(
                    parseFloat(quantity || '0') *
                      (parseFloat(price) - Number(investment.averagePrice)),
                  )}
                </p>
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
                  Processando...
                </>
              ) : transactionType === 'BUY' ? (
                'Confirmar Compra'
              ) : (
                'Confirmar Venda'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
