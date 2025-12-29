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
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Investment } from './InvestmentCard';

interface AddInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingInvestment?: Investment | null;
}

const typeOptions = [
  { value: 'STOCK', label: 'Ações' },
  { value: 'FUND', label: 'Fundos de Investimento' },
  { value: 'FIXED_INCOME', label: 'Renda Fixa' },
  { value: 'CRYPTO', label: 'Criptomoedas' },
  { value: 'REAL_ESTATE', label: 'Fundos Imobiliários' },
  { value: 'SAVINGS_BOX', label: 'Caixinha' },
  { value: 'OTHER', label: 'Outros' },
];

export function AddInvestmentModal({
  isOpen,
  onClose,
  onSuccess,
  editingInvestment,
}: AddInvestmentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState('');
  const [ticker, setTicker] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [displayPurchasePrice, setDisplayPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(
    format(new Date(), 'yyyy-MM-dd'),
  );
  const [broker, setBroker] = useState('');
  const [fees, setFees] = useState('');
  const [displayFees, setDisplayFees] = useState('');
  const [notes, setNotes] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [displayCurrentPrice, setDisplayCurrentPrice] = useState('');

  // Campos específicos para SAVINGS_BOX
  const [initialValue, setInitialValue] = useState('');
  const [displayInitialValue, setDisplayInitialValue] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [displayMonthlyContribution, setDisplayMonthlyContribution] = useState('');
  const [hasMonthlyContribution, setHasMonthlyContribution] = useState(false);

  const isSavingsBox = type === 'SAVINGS_BOX';

  // Load editing data
  useEffect(() => {
    if (editingInvestment) {
      setTicker(editingInvestment.ticker);
      setName(editingInvestment.name);
      setDescription(editingInvestment.description || '');
      setBroker(editingInvestment.broker || '');

      const price = Number(editingInvestment.currentPrice);
      setCurrentPrice(price.toString());
      setDisplayCurrentPrice(formatCurrencyInput(price.toString()));
    }
  }, [editingInvestment]);

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

    if (editingInvestment) {
      // Update mode
      if (!ticker.trim() || !name.trim()) {
        toast.error('Ticker e nome são obrigatórios');
        return;
      }
    } else {
      // Create mode
      if (!type) {
        toast.error('Tipo de investimento é obrigatório');
        return;
      }

      if (!ticker.trim()) {
        toast.error('Ticker/Código é obrigatório');
        return;
      }

      if (!name.trim()) {
        toast.error('Nome é obrigatório');
        return;
      }

      if (isSavingsBox) {
        // Validation for SAVINGS_BOX
        if (!initialValue || parseFloat(initialValue) < 0) {
          toast.error('Valor inicial deve ser maior ou igual a zero');
          return;
        }

        if (hasMonthlyContribution && (!monthlyContribution || parseFloat(monthlyContribution) <= 0)) {
          toast.error('Valor mensal deve ser maior que zero');
          return;
        }
      } else {
        // Validation for regular investments
        if (!quantity || parseFloat(quantity) <= 0) {
          toast.error('Quantidade deve ser maior que zero');
          return;
        }

        if (!purchasePrice || parseFloat(purchasePrice) <= 0) {
          toast.error('Preço de compra deve ser maior que zero');
          return;
        }

        if (!purchaseDate) {
          toast.error('Data de compra é obrigatória');
          return;
        }
      }
    }

    try {
      setIsSubmitting(true);

      const token = localStorage.getItem('accessToken');
      let payload: any;

      if (editingInvestment) {
        // Update mode - only editable fields
        payload = {
          ticker: ticker.trim().toUpperCase(),
          name: name.trim(),
        };

        if (description.trim()) {
          payload.description = description.trim();
        }

        if (broker.trim()) {
          payload.broker = broker.trim();
        }

        if (currentPrice && parseFloat(currentPrice) > 0) {
          payload.currentPrice = parseFloat(currentPrice);
        }
      } else {
        // Create mode
        if (isSavingsBox) {
          // SAVINGS_BOX payload
          const initialVal = parseFloat(initialValue) || 0;
          payload = {
            type,
            ticker: ticker.trim().toUpperCase(),
            name: name.trim(),
            totalInvested: initialVal,
            currentValue: initialVal,
          };

          if (description.trim()) {
            payload.description = description.trim();
          }

          if (broker.trim()) {
            payload.broker = broker.trim();
          }

          if (notes.trim()) {
            payload.notes = notes.trim();
          }

          // Store monthly contribution info in notes if enabled
          if (hasMonthlyContribution && monthlyContribution) {
            const contributionNote = `Aporte mensal: R$ ${formatCurrencyInput(monthlyContribution)}`;
            payload.notes = payload.notes
              ? `${payload.notes}\n${contributionNote}`
              : contributionNote;
          }
        } else {
          // Regular investment payload
          payload = {
            type,
            ticker: ticker.trim().toUpperCase(),
            name: name.trim(),
            quantity: parseFloat(quantity),
            purchasePrice: parseFloat(purchasePrice),
            purchaseDate: new Date(purchaseDate).toISOString(),
          };

          if (description.trim()) {
            payload.description = description.trim();
          }

          if (broker.trim()) {
            payload.broker = broker.trim();
          }

          if (fees && parseFloat(fees) > 0) {
            payload.fees = parseFloat(fees);
          }

          if (notes.trim()) {
            payload.notes = notes.trim();
          }
        }
      }

      const url = editingInvestment
        ? `${process.env.NEXT_PUBLIC_API_URL}/financial/investments/${editingInvestment.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/financial/investments`;

      const method = editingInvestment ? 'PATCH' : 'POST';

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
        throw new Error(error.message || 'Erro ao salvar investimento');
      }

      toast.success(
        editingInvestment
          ? 'Investimento atualizado com sucesso!'
          : 'Investimento criado com sucesso!',
      );
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error saving investment:', error);
      toast.error(error.message || 'Erro ao salvar investimento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setType('');
      setTicker('');
      setName('');
      setDescription('');
      setQuantity('');
      setPurchasePrice('');
      setDisplayPurchasePrice('');
      setPurchaseDate(format(new Date(), 'yyyy-MM-dd'));
      setBroker('');
      setFees('');
      setDisplayFees('');
      setNotes('');
      setCurrentPrice('');
      setDisplayCurrentPrice('');
      setInitialValue('');
      setDisplayInitialValue('');
      setMonthlyContribution('');
      setDisplayMonthlyContribution('');
      setHasMonthlyContribution(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingInvestment ? 'Editar' : 'Adicionar'} Investimento
          </DialogTitle>
          <DialogDescription>
            {editingInvestment
              ? 'Edite as informações do investimento'
              : 'Registre um novo investimento na sua carteira'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingInvestment && (
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select value={type} onValueChange={setType} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ticker">Ticker/Código *</Label>
              <Input
                id="ticker"
                placeholder="Ex: PETR4, BTC"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                disabled={isSubmitting}
                maxLength={20}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                placeholder="Ex: Petrobras PN"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
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

          {!editingInvestment && !isSavingsBox && (
            <>
              <div className="grid grid-cols-2 gap-4">
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Preço de Compra (R$) *</Label>
                  <Input
                    id="purchasePrice"
                    type="text"
                    placeholder="0,00"
                    value={displayPurchasePrice}
                    onChange={(e) =>
                      handlePriceChange(
                        e.target.value,
                        setPurchasePrice,
                        setDisplayPurchasePrice,
                      )
                    }
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Data de Compra *</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
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
              </div>
            </>
          )}

          {!editingInvestment && isSavingsBox && (
            <>
              <div className="space-y-2">
                <Label htmlFor="initialValue">Valor Inicial (R$) *</Label>
                <Input
                  id="initialValue"
                  type="text"
                  placeholder="0,00"
                  value={displayInitialValue}
                  onChange={(e) =>
                    handlePriceChange(
                      e.target.value,
                      setInitialValue,
                      setDisplayInitialValue,
                    )
                  }
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  Valor que você deseja começar a guardar na caixinha
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasMonthlyContribution"
                    checked={hasMonthlyContribution}
                    onCheckedChange={(checked) =>
                      setHasMonthlyContribution(!!checked)
                    }
                    disabled={isSubmitting}
                  />
                  <Label
                    htmlFor="hasMonthlyContribution"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Definir aporte mensal recorrente
                  </Label>
                </div>

                {hasMonthlyContribution && (
                  <div className="space-y-2 ml-6">
                    <Label htmlFor="monthlyContribution">
                      Valor Mensal (R$) *
                    </Label>
                    <Input
                      id="monthlyContribution"
                      type="text"
                      placeholder="0,00"
                      value={displayMonthlyContribution}
                      onChange={(e) =>
                        handlePriceChange(
                          e.target.value,
                          setMonthlyContribution,
                          setDisplayMonthlyContribution,
                        )
                      }
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground">
                      Valor que será depositado mensalmente (informativo)
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="broker">Corretora/Plataforma (Opcional)</Label>
            <Input
              id="broker"
              placeholder="Ex: XP, Rico, Binance..."
              value={broker}
              onChange={(e) => setBroker(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {editingInvestment && (
            <div className="space-y-2">
              <Label htmlFor="currentPrice">Preço Atual (R$)</Label>
              <Input
                id="currentPrice"
                type="text"
                placeholder="0,00"
                value={displayCurrentPrice}
                onChange={(e) =>
                  handlePriceChange(
                    e.target.value,
                    setCurrentPrice,
                    setDisplayCurrentPrice,
                  )
                }
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Atualize manualmente ou deixe em branco
              </p>
            </div>
          )}

          {!editingInvestment && (
            <div className="space-y-2">
              <Label htmlFor="notes">Observações (Opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Motivo do investimento, estratégia..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isSubmitting}
                rows={2}
              />
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
              ) : editingInvestment ? (
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
