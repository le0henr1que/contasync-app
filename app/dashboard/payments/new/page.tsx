'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Loader2, DollarSign, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface Client {
  id: string;
  user: {
    name: string;
    email: string;
  };
  companyName?: string;
}

export default function NewPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get('clientId');

  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [paymentType, setPaymentType] = useState<'CLIENT' | 'OFFICE'>('CLIENT');
  const [clientId, setClientId] = useState(preselectedClientId || '');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('PENDING');

  useEffect(() => {
    if (preselectedClientId) {
      setPaymentType('CLIENT');
      setClientId(preselectedClientId);
    }
    fetchClients();
  }, [preselectedClientId]);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:3000/api/clients', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) throw new Error('Erro ao carregar clientes');

      const data = await response.json();
      setClients(data.clients || []);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validacoes
      if (paymentType === 'CLIENT' && !clientId) {
        toast.error('Selecione um cliente para pagamentos do tipo Cliente');
        setIsSubmitting(false);
        return;
      }

      if (!title || !amount || !dueDate) {
        toast.error('Preencha todos os campos obrigatorios');
        setIsSubmitting(false);
        return;
      }

      const payload: any = {
        paymentType,
        title,
        amount: parseFloat(amount),
        dueDate,
        status,
      };

      // Adicionar campos opcionais
      if (paymentType === 'CLIENT') {
        payload.clientId = clientId;
      }
      if (paymentDate) payload.paymentDate = paymentDate;
      if (paymentMethod) payload.paymentMethod = paymentMethod;
      if (reference) payload.reference = reference;
      if (notes) payload.notes = notes;

      const response = await fetch('http://localhost:3000/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar pagamento');
      }

      toast.success('Pagamento registrado com sucesso!');

      // Redirecionar para a pagina do cliente ou lista de pagamentos
      if (preselectedClientId) {
        router.push(`/dashboard/clients/${preselectedClientId}`);
      } else {
        router.push('/dashboard/payments');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao registrar pagamento');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Registrar Pagamento</h1>
          <p className="text-muted-foreground">
            Registre um novo pagamento de cliente ou despesa do escritorio
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Informacoes do Pagamento</CardTitle>
              <CardDescription>
                Preencha os dados abaixo para registrar o pagamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tipo de Pagamento */}
              <div className="space-y-3">
                <Label>Tipo de Pagamento *</Label>
                <RadioGroup
                  value={paymentType}
                  onValueChange={(value: 'CLIENT' | 'OFFICE') => {
                    setPaymentType(value);
                    if (value === 'OFFICE') {
                      setClientId('');
                    }
                  }}
                  className="flex gap-4"
                  disabled={!!preselectedClientId}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CLIENT" id="client" />
                    <Label htmlFor="client" className="cursor-pointer flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Cliente
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="OFFICE" id="office" />
                    <Label htmlFor="office" className="cursor-pointer flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Escritorio
                    </Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-muted-foreground">
                  {paymentType === 'CLIENT'
                    ? 'Pagamento vinculado a um cliente especifico'
                    : 'Despesa do escritorio (aluguel, software, etc.)'}
                </p>
              </div>

              {/* Cliente (apenas se tipo CLIENT) */}
              {paymentType === 'CLIENT' && (
                <div className="space-y-2">
                  <Label htmlFor="client">Cliente *</Label>
                  <Select
                    value={clientId}
                    onValueChange={setClientId}
                    disabled={!!preselectedClientId || isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.companyName || client.user.name} - {client.user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Titulo */}
              <div className="space-y-2">
                <Label htmlFor="title">Titulo *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Honorarios Mensais, Aluguel Escritorio"
                  required
                />
              </div>

              {/* Valor e Data de Vencimento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor (R$) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Data de Vencimento *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Status e Forma de Pagamento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pendente</SelectItem>
                      <SelectItem value="PAID">Pago</SelectItem>
                      <SelectItem value="OVERDUE">Vencido</SelectItem>
                      <SelectItem value="CANCELED">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PIX">PIX</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Transferencia Bancaria</SelectItem>
                      <SelectItem value="BOLETO">Boleto</SelectItem>
                      <SelectItem value="CREDIT_CARD">Cartao de Credito</SelectItem>
                      <SelectItem value="DEBIT_CARD">Cartao de Debito</SelectItem>
                      <SelectItem value="CASH">Dinheiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Data de Pagamento */}
              <div className="space-y-2">
                <Label htmlFor="paymentDate">Data de Pagamento</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Deixe em branco se ainda nao foi pago
                </p>
              </div>

              {/* Referencia */}
              <div className="space-y-2">
                <Label htmlFor="reference">Referencia</Label>
                <Input
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Ex: Nota Fiscal #123, Contrato #456"
                />
              </div>

              {/* Observacoes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Observacoes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Informacoes adicionais sobre o pagamento"
                  rows={3}
                />
              </div>

              {/* Botoes */}
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Registrar Pagamento
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}
