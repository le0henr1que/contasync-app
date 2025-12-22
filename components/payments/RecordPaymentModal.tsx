'use client';

import { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { applyCurrencyMask, parseCurrency, formatCurrency } from '@/lib/currency';
import { Payment } from './PaymentCard';

interface Client {
  id: string;
  companyName: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  payment?: Payment; // Optional: if provided, modal is in edit mode
  clientId?: string; // Optional: if provided, pre-selects and locks client
}

const paymentMethods = [
  { value: 'CASH', label: 'Dinheiro' },
  { value: 'PIX', label: 'PIX' },
  { value: 'BANK_TRANSFER', label: 'Transferência Bancária' },
  { value: 'CREDIT_CARD', label: 'Cartão de Crédito' },
  { value: 'DEBIT_CARD', label: 'Cartão de Débito' },
  { value: 'BOLETO', label: 'Boleto' },
];

const recurringFrequencies = [
  { value: 'MONTHLY', label: 'Mensal' },
  { value: 'QUARTERLY', label: 'Trimestral' },
  { value: 'SEMIANNUAL', label: 'Semestral' },
  { value: 'YEARLY', label: 'Anual' },
];

export function RecordPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  payment,
  clientId: propsClientId,
}: RecordPaymentModalProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [clientId, setClientId] = useState('');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('0,00');
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(undefined);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  // Recurring payment fields
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState('');
  const [recurringDayOfMonth, setRecurringDayOfMonth] = useState('');
  const [recurringEndDate, setRecurringEndDate] = useState<Date | undefined>(undefined);

  // Document attachment
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState('');
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = !!payment;

  useEffect(() => {
    if (isOpen) {
      fetchClients();
      if (payment) {
        // Pre-fill form with payment data
        setClientId(payment.clientId || '');
        setTitle(payment.title || '');
        const amountValue = typeof payment.amount === 'string'
          ? parseFloat(payment.amount)
          : payment.amount;
        // Convert to cents (multiply by 100) and format as string without decimals
        const amountInCents = Math.round(amountValue * 100).toString();
        setAmount(applyCurrencyMask(amountInCents));
        setPaymentDate(payment.paymentDate ? new Date(payment.paymentDate) : undefined);
        setDueDate(new Date(payment.dueDate));
        setPaymentMethod(payment.paymentMethod || '');
        setReference(payment.reference || '');
        setNotes(payment.notes || '');
      } else if (propsClientId) {
        // Pre-fill client from props
        setClientId(propsClientId);
      } else {
        resetForm();
      }
    }
  }, [isOpen, payment, propsClientId]);

  const fetchClients = async () => {
    try {
      setIsLoadingClients(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar clientes');
      }

      const data = await response.json();
      // API returns array directly, not an object with clients property
      setClients(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar clientes');
    } finally {
      setIsLoadingClients(false);
    }
  };

  const fetchDocuments = async (selectedClientId: string) => {
    if (!selectedClientId) {
      setDocuments([]);
      return;
    }

    try {
      setIsLoadingDocuments(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/documents/client/${selectedClientId}/grouped`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar documentos');
      }

      const folders = await response.json();
      // Flatten all documents from all folders
      const allDocs = folders.flatMap((folder: any) =>
        folder.documents.map((doc: any) => ({
          ...doc,
          folderName: folder.name,
        }))
      );
      setDocuments(allDocs);
    } catch (error: any) {
      console.error('Erro ao carregar documentos:', error);
      setDocuments([]);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  // Fetch documents when client changes
  useEffect(() => {
    if (clientId) {
      fetchDocuments(clientId);
    } else {
      setDocuments([]);
      setSelectedDocumentId('');
    }
  }, [clientId]);

  const resetForm = () => {
    setClientId('');
    setTitle('');
    setAmount('0,00');
    setPaymentDate(undefined);
    setDueDate(undefined);
    setPaymentMethod('');
    setReference('');
    setNotes('');
    setIsRecurring(false);
    setRecurringFrequency('');
    setRecurringDayOfMonth('');
    setRecurringEndDate(undefined);
    setSelectedDocumentId('');
    setDocuments([]);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!clientId) {
      newErrors.clientId = 'Selecione um cliente';
    }

    if (!title || title.trim() === '') {
      newErrors.title = 'Digite o titulo do pagamento';
    }

    const numericAmount = parseCurrency(amount);
    if (numericAmount <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }

    if (!dueDate) {
      newErrors.dueDate = 'Selecione a data de vencimento';
    }

    if (paymentDate) {
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      if (paymentDate > today) {
        newErrors.paymentDate = 'Data do pagamento não pode ser no futuro';
      }
    }

    // Recurring payment validations
    if (isRecurring) {
      if (!recurringFrequency) {
        newErrors.recurringFrequency = 'Selecione a frequência de recorrência';
      }

      if (!recurringDayOfMonth || parseInt(recurringDayOfMonth) < 1 || parseInt(recurringDayOfMonth) > 31) {
        newErrors.recurringDayOfMonth = 'Dia do mês deve ser entre 1 e 31';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: any = {
        title: title.trim(),
        amount: parseCurrency(amount),
        paymentDate: paymentDate ? paymentDate.toISOString() : null,
        dueDate: dueDate!.toISOString(),
        paymentMethod: paymentMethod || null,
        reference: reference || null,
        notes: notes || null,
        // Recurring payment fields
        isRecurring: isRecurring,
        recurringFrequency: isRecurring ? recurringFrequency : null,
        recurringDayOfMonth: isRecurring ? parseInt(recurringDayOfMonth) : null,
        recurringEndDate: isRecurring && recurringEndDate ? recurringEndDate.toISOString() : null,
      };

      // Add clientId only for create mode
      if (!isEditMode) {
        payload.clientId = clientId;
      }

      const url = isEditMode
        ? `${process.env.NEXT_PUBLIC_API_URL}/payments/${payment!.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/payments`;

      const method = isEditMode ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            (isEditMode ? 'Erro ao atualizar pagamento' : 'Erro ao registrar pagamento')
        );
      }

      const createdPayment = await response.json();

      // Attach document if selected (only in create mode)
      if (!isEditMode && selectedDocumentId && createdPayment.id) {
        try {
          const attachResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/payments/${createdPayment.id}/attach-document`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              },
              body: JSON.stringify({ documentId: selectedDocumentId }),
            }
          );

          if (!attachResponse.ok) {
            console.error('Erro ao anexar documento, mas pagamento foi criado');
          }
        } catch (error) {
          console.error('Erro ao anexar documento:', error);
          // Não falha a criação do pagamento se anexar documento falhar
        }
      }

      toast.success(
        isEditMode
          ? 'Pagamento atualizado com sucesso'
          : selectedDocumentId
          ? 'Pagamento registrado e documento anexado com sucesso'
          : 'Pagamento registrado com sucesso'
      );
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(
        error.message ||
          (isEditMode
            ? 'Erro ao atualizar pagamento. Tente novamente'
            : 'Erro ao registrar pagamento. Tente novamente')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = applyCurrencyMask(e.target.value);
    setAmount(maskedValue);
    if (errors.amount) {
      setErrors({ ...errors, amount: '' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Editar Pagamento' : 'Registrar Pagamento'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Atualize as informações do pagamento'
              : 'Registre um novo pagamento recebido de um cliente'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client Select */}
          <div className="space-y-2">
            <Label htmlFor="client">
              Cliente <span className="text-destructive">*</span>
            </Label>
            <Select
              value={clientId}
              onValueChange={(value) => {
                setClientId(value);
                if (errors.clientId) {
                  setErrors({ ...errors, clientId: '' });
                }
              }}
              disabled={isLoadingClients || isEditMode || !!propsClientId}
            >
              <SelectTrigger id="client" className={errors.clientId ? 'border-destructive' : ''}>
                <SelectValue placeholder={isLoadingClients ? 'Carregando...' : 'Selecione um cliente'} />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.companyName || client.user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(isEditMode || propsClientId) && (
              <p className="text-xs text-muted-foreground">
                Cliente não pode ser alterado
              </p>
            )}
            {errors.clientId && (
              <p className="text-xs text-destructive">{errors.clientId}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Titulo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) {
                  setErrors({ ...errors, title: '' });
                }
              }}
              className={errors.title ? 'border-destructive' : ''}
              placeholder="Ex: Honorarios Mensais, Mensalidade Dez/2024"
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              Valor (R$) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-muted-foreground">R$</span>
              <Input
                id="amount"
                value={amount}
                onChange={handleAmountChange}
                className={cn('pl-10', errors.amount ? 'border-destructive' : '')}
                placeholder="0,00"
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount}</p>
            )}
          </div>

          {/* Payment Date */}
          <div className="space-y-2">
            <Label>Data do Pagamento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !paymentDate && 'text-muted-foreground',
                    errors.paymentDate && 'border-destructive'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {paymentDate ? (
                    format(paymentDate, 'dd/MM/yyyy', { locale: ptBR })
                  ) : (
                    <span>Selecione a data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={paymentDate}
                  onSelect={(date) => {
                    setPaymentDate(date);
                    if (errors.paymentDate) {
                      setErrors({ ...errors, paymentDate: '' });
                    }
                  }}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
            {errors.paymentDate && (
              <p className="text-xs text-destructive">{errors.paymentDate}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Opcional - Deixe em branco se ainda não foi pago
            </p>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>
              Data de Vencimento <span className="text-destructive">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dueDate && 'text-muted-foreground',
                    errors.dueDate && 'border-destructive'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? (
                    format(dueDate, 'dd/MM/yyyy', { locale: ptBR })
                  ) : (
                    <span>Selecione a data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => {
                    setDueDate(date);
                    if (errors.dueDate) {
                      setErrors({ ...errors, dueDate: '' });
                    }
                  }}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
            {errors.dueDate && (
              <p className="text-xs text-destructive">{errors.dueDate}</p>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="paymentMethod">
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Opcional</p>
          </div>

          {/* Reference */}
          <div className="space-y-2">
            <Label htmlFor="reference">Referência</Label>
            <Input
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Ex: Mensalidade Dez/2024"
            />
            <p className="text-xs text-muted-foreground">Opcional</p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações adicionais sobre o pagamento"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">Opcional</p>
          </div>

          {/* Recurring Payment Section */}
          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRecurring"
                checked={isRecurring}
                onCheckedChange={(checked) => setIsRecurring(checked === true)}
              />
              <Label htmlFor="isRecurring" className="cursor-pointer">
                Pagamento Recorrente
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Marque esta opção para gerar automaticamente este pagamento de forma recorrente
            </p>

            {isRecurring && (
              <>
                {/* Recurring Frequency */}
                <div className="space-y-2">
                  <Label htmlFor="recurringFrequency">
                    Frequência <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={recurringFrequency}
                    onValueChange={(value) => {
                      setRecurringFrequency(value);
                      if (errors.recurringFrequency) {
                        setErrors({ ...errors, recurringFrequency: '' });
                      }
                    }}
                  >
                    <SelectTrigger
                      id="recurringFrequency"
                      className={errors.recurringFrequency ? 'border-destructive' : ''}
                    >
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                    <SelectContent>
                      {recurringFrequencies.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.recurringFrequency && (
                    <p className="text-xs text-destructive">{errors.recurringFrequency}</p>
                  )}
                </div>

                {/* Recurring Day of Month */}
                <div className="space-y-2">
                  <Label htmlFor="recurringDayOfMonth">
                    Dia do Mês <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="recurringDayOfMonth"
                    type="number"
                    min="1"
                    max="31"
                    value={recurringDayOfMonth}
                    onChange={(e) => {
                      setRecurringDayOfMonth(e.target.value);
                      if (errors.recurringDayOfMonth) {
                        setErrors({ ...errors, recurringDayOfMonth: '' });
                      }
                    }}
                    className={errors.recurringDayOfMonth ? 'border-destructive' : ''}
                    placeholder="Ex: 5"
                  />
                  {errors.recurringDayOfMonth && (
                    <p className="text-xs text-destructive">{errors.recurringDayOfMonth}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Dia do mês em que o pagamento será gerado (1-31)
                  </p>
                </div>

                {/* Recurring End Date */}
                <div className="space-y-2">
                  <Label>Data de Término</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !recurringEndDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {recurringEndDate ? (
                          format(recurringEndDate, 'dd/MM/yyyy', { locale: ptBR })
                        ) : (
                          <span>Selecione a data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={recurringEndDate}
                        onSelect={(date) => setRecurringEndDate(date)}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground">
                    Opcional - Deixe em branco para recorrência indefinida
                  </p>
                </div>
              </>
            )}

            {/* Document Attachment - Only in create mode and if client selected */}
            {!isEditMode && clientId && documents.length > 0 && (
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label htmlFor="document">Anexar Documento (Opcional)</Label>
                  {selectedDocumentId && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDocumentId('')}
                      className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Limpar seleção
                    </Button>
                  )}
                </div>
                <Select
                  value={selectedDocumentId || undefined}
                  onValueChange={setSelectedDocumentId}
                  disabled={isLoadingDocuments}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        isLoadingDocuments
                          ? 'Carregando documentos...'
                          : 'Selecione um documento (opcional)'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {documents.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{doc.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {doc.folderName} • {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {isLoadingDocuments ? 'Buscando documentos do cliente...' : `${documents.length} documento(s) disponível(is)`}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Salvar Alterações' : 'Registrar Pagamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
