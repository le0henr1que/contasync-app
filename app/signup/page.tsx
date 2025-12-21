'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [tenantType, setTenantType] = useState<'INDIVIDUAL' | 'ACCOUNTANT_FIRM'>('INDIVIDUAL');
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    cpfCnpj: '',
  });

  // Read query param and save to localStorage on mount
  useEffect(() => {
    const planParam = searchParams.get('plan');
    if (planParam) {
      setSelectedPlan(planParam);
      localStorage.setItem('selectedPlan', planParam);

      // Determine tenant type from plan slug
      if (planParam.includes('firm') || planParam.includes('enterprise')) {
        setTenantType('ACCOUNTANT_FIRM');
      } else {
        setTenantType('INDIVIDUAL');
      }
    } else {
      // Check localStorage for previously selected plan
      const storedPlan = localStorage.getItem('selectedPlan');
      if (storedPlan) {
        setSelectedPlan(storedPlan);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          type: tenantType,
          cpfCnpj: formData.cpfCnpj || undefined,
          companyName: formData.companyName || undefined,
          // planId will be automatically set to trial plan by backend
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar conta');
      }

      const data = await response.json();

      // Save access token to localStorage
      localStorage.setItem('accessToken', data.accessToken);

      // Clear selected plan from localStorage after successful signup
      localStorage.removeItem('selectedPlan');

      // If checkoutUrl is returned, redirect to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      // Otherwise, redirect to onboarding wizard if accountant, or dashboard if individual
      if (tenantType === 'ACCOUNTANT_FIRM') {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert(error instanceof Error ? error.message : 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background py-12 px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="text-2xl font-bold">ContaSync</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Criar Conta</h1>
          <p className="text-muted-foreground">
            Comece seu trial gratuito de 14 dias
          </p>
          {selectedPlan && (
            <Badge className="mt-4" variant="secondary">
              Plano selecionado: {selectedPlan}
            </Badge>
          )}
        </div>

        <Tabs value={tenantType} onValueChange={(value) => setTenantType(value as typeof tenantType)} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="INDIVIDUAL">Individual</TabsTrigger>
            <TabsTrigger value="ACCOUNTANT_FIRM">Escritório</TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome {tenantType === 'ACCOUNTANT_FIRM' ? 'Completo' : ''}</Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Seu nome completo"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="seu@email.com"
            />
          </div>

          {tenantType === 'ACCOUNTANT_FIRM' && (
            <>
              <div>
                <Label htmlFor="companyName">Nome do Escritório</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Nome da empresa"
                />
              </div>
              <div>
                <Label htmlFor="cpfCnpj">CNPJ</Label>
                <Input
                  id="cpfCnpj"
                  name="cpfCnpj"
                  type="text"
                  required
                  value={formData.cpfCnpj}
                  onChange={handleChange}
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </>
          )}

          {tenantType === 'INDIVIDUAL' && (
            <div>
              <Label htmlFor="cpfCnpj">CPF (opcional)</Label>
              <Input
                id="cpfCnpj"
                name="cpfCnpj"
                type="text"
                value={formData.cpfCnpj}
                onChange={handleChange}
                placeholder="000.000.000-00"
              />
            </div>
          )}

          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Digite a senha novamente"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>14 dias grátis • Sem cartão de crédito</span>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Criando conta...' : 'Criar Conta Grátis'}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            Ao criar uma conta, você concorda com nossos{' '}
            <Link href="/terms" className="text-primary hover:underline">
              Termos de Uso
            </Link>{' '}
            e{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              Política de Privacidade
            </Link>
          </p>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Fazer login
              </Link>
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background">
        <Card className="w-full max-w-md p-8">
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </Card>
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
}
