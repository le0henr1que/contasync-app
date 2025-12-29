'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, ArrowLeft, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  tenantType: 'INDIVIDUAL' | 'ACCOUNTANT_FIRM';
  priceMonthly: number;
  priceYearly: number;
  featuresJson: any;
  limitsJson: any;
}

function CheckoutContent() {
  const params = useParams();
  const router = useRouter();
  const planSlug = params.slug as string;

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [billingInterval, setBillingInterval] = useState<'MONTH' | 'YEAR'>('YEAR');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    cpfCnpj: '',
    crc: '',
    phone: '',
  });

  useEffect(() => {
    fetchPlan();
  }, [planSlug]);

  const fetchPlan = async () => {
    try {
      setLoading(true);

      // First try to get plan by slug
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/plans`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar plano');
      }

      const plans: Plan[] = await response.json();
      const foundPlan = plans.find(p => p.slug === planSlug);

      if (!foundPlan) {
        toast.error('Plano não encontrado');
        router.push('/pricing');
        return;
      }

      setPlan(foundPlan);
    } catch (error) {
      console.error('Error fetching plan:', error);
      toast.error('Erro ao carregar informações do plano');
      router.push('/pricing');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      toast.error('A senha deve ter no mínimo 8 caracteres');
      return;
    }

    // Validate CPF/CNPJ format
    const cpfCnpjClean = formData.cpfCnpj.replace(/\D/g, '');
    if (cpfCnpjClean.length !== 11 && cpfCnpjClean.length !== 14) {
      toast.error('CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos');
      return;
    }

    // For ACCOUNTANT_FIRM, require company name and CRC
    if (plan?.tenantType === 'ACCOUNTANT_FIRM') {
      if (!formData.companyName.trim()) {
        toast.error('Nome do escritório é obrigatório');
        return;
      }
      if (!formData.crc.trim()) {
        toast.error('CRC é obrigatório para escritórios');
        return;
      }
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkout/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          password: formData.password,
          cpfCnpj: cpfCnpjClean,
          companyName: formData.companyName || undefined,
          crc: formData.crc || undefined,
          phone: formData.phone || undefined,
          planId: plan!.id,
          billingInterval: billingInterval,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao processar checkout');
      }

      const data = await response.json();

      // Redirect to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('URL de checkout não retornada');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao processar checkout');
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Format CPF/CNPJ
  const formatCpfCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, '');

    if (numbers.length <= 11) {
      // CPF: 000.000.000-00
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      // CNPJ: 00.000.000/0000-00
      return numbers
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
  };

  const handleCpfCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpfCnpj(e.target.value);
    setFormData({ ...formData, cpfCnpj: formatted });
  };

  // Format phone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');

    if (numbers.length === 0) return '';
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    }
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  const price = billingInterval === 'MONTH' ? plan.priceMonthly : plan.priceYearly;
  const monthlyEquivalent = billingInterval === 'YEAR' ? (plan.priceYearly / 12).toFixed(2) : null;

  // Extract features
  const features = [];
  if (plan.limitsJson) {
    if (plan.limitsJson.maxPayments) {
      features.push(
        plan.limitsJson.maxPayments === -1
          ? 'Pagamentos ilimitados'
          : `Até ${plan.limitsJson.maxPayments} pagamentos/mês`
      );
    }
    if (plan.limitsJson.maxClients) {
      features.push(
        plan.limitsJson.maxClients === -1
          ? 'Clientes ilimitados'
          : `Até ${plan.limitsJson.maxClients} clientes`
      );
    }
    if (plan.limitsJson.storageGB) {
      features.push(
        plan.limitsJson.storageGB === -1
          ? 'Armazenamento ilimitado'
          : `${plan.limitsJson.storageGB} GB de armazenamento`
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/pricing">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para planos
            </Link>
          </Button>
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-2xl font-bold">ContaSync</span>
            </Link>
            <h1 className="text-3xl font-bold mb-2">Finalize sua Assinatura</h1>
            <p className="text-muted-foreground">
              Preencha seus dados e complete o pagamento via Stripe
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">Suas Informações</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Billing Interval */}
                <div>
                  <Label>Período de Cobrança</Label>
                  <Select value={billingInterval} onValueChange={(value) => setBillingInterval(value as 'MONTH' | 'YEAR')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MONTH">Mensal</SelectItem>
                      <SelectItem value="YEAR">Anual (economize 17%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Name */}
                <div>
                  <Label htmlFor="name">
                    Nome Completo <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Seu nome completo"
                    disabled={submitting}
                  />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    disabled={submitting}
                  />
                </div>

                {/* CPF/CNPJ */}
                <div>
                  <Label htmlFor="cpfCnpj">
                    {plan.tenantType === 'ACCOUNTANT_FIRM' ? 'CNPJ' : 'CPF/CNPJ'}{' '}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cpfCnpj"
                    name="cpfCnpj"
                    type="text"
                    required
                    value={formData.cpfCnpj}
                    onChange={handleCpfCnpjChange}
                    placeholder={plan.tenantType === 'ACCOUNTANT_FIRM' ? '00.000.000/0000-00' : '000.000.000-00'}
                    maxLength={18}
                    disabled={submitting}
                  />
                </div>

                {/* Accountant Firm Fields */}
                {plan.tenantType === 'ACCOUNTANT_FIRM' && (
                  <>
                    <div>
                      <Label htmlFor="companyName">
                        Nome do Escritório <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="companyName"
                        name="companyName"
                        type="text"
                        required
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Nome da empresa"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <Label htmlFor="crc">
                        CRC (Registro no Conselho) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="crc"
                        name="crc"
                        type="text"
                        required
                        value={formData.crc}
                        onChange={handleChange}
                        placeholder="CRC/XX 000000"
                        disabled={submitting}
                      />
                    </div>
                  </>
                )}

                {/* Phone */}
                <div>
                  <Label htmlFor="phone">Telefone (opcional)</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="text"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    disabled={submitting}
                  />
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="password">
                    Senha <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mínimo 8 caracteres"
                    minLength={8}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">
                    Confirmar Senha <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repita a senha"
                    minLength={8}
                    disabled={submitting}
                  />
                </div>

                {/* Submit */}
                <div className="pt-4">
                  <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Ir para Pagamento
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Você será redirecionado para o Stripe para completar o pagamento de forma segura
                  </p>
                </div>
              </form>
            </Card>
          </div>

          {/* Plan Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h3 className="text-xl font-bold mb-4">Resumo do Plano</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg">{plan.name}</h4>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-3xl font-bold">R$ {price.toFixed(2)}</span>
                    <span className="text-muted-foreground">
                      /{billingInterval === 'MONTH' ? 'mês' : 'ano'}
                    </span>
                  </div>
                  {monthlyEquivalent && (
                    <p className="text-sm text-muted-foreground">
                      R$ {monthlyEquivalent}/mês
                    </p>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h5 className="font-semibold mb-3">O que está incluído:</h5>
                  <ul className="space-y-2">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {billingInterval === 'YEAR' && (
                  <div className="border-t pt-4">
                    <Badge variant="secondary" className="w-full justify-center py-2">
                      Economize 17% no plano anual
                    </Badge>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
