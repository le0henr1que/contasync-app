'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { IntervalToggle } from '@/components/pricing/IntervalToggle';
import { PricingCard } from '@/components/pricing/PricingCard';
import { Footer } from '@/components/landing/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  sortOrder: number;
  isActive: boolean;
}

export default function PricingPage() {
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('yearly');
  const [tenantType, setTenantType] = useState<'INDIVIDUAL' | 'ACCOUNTANT_FIRM'>('INDIVIDUAL');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, [tenantType]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from API
      const response = await fetch(
        `http://localhost:3000/api/plans?tenantType=${tenantType}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Falha ao carregar planos');
      }

      const data = await response.json();
      setPlans(data.sort((a: Plan, b: Plan) => a.sortOrder - b.sortOrder));
    } catch (err) {
      console.error('Error fetching plans:', err);
      // Use fallback plans (static data)
      console.log('Using fallback plans...');
      setPlans(getFallbackPlans(tenantType));
    } finally {
      setLoading(false);
    }
  };

  const getFallbackPlans = (type: 'INDIVIDUAL' | 'ACCOUNTANT_FIRM'): Plan[] => {
    if (type === 'INDIVIDUAL') {
      return [
        {
          id: '1',
          name: 'Free Trial',
          slug: 'individual-free-trial',
          description: 'Experimente gratuitamente por 14 dias',
          tenantType: 'INDIVIDUAL',
          priceMonthly: 0,
          priceYearly: 0,
          featuresJson: { trialDays: 14 },
          limitsJson: { maxPayments: 10, maxExpenses: 10, maxDocuments: 5 },
          sortOrder: 1,
          isActive: true,
        },
        {
          id: '2',
          name: 'Starter',
          slug: 'individual-starter',
          description: 'Ideal para freelancers e MEIs',
          tenantType: 'INDIVIDUAL',
          priceMonthly: 29.9,
          priceYearly: 299,
          featuresJson: { support: 'email' },
          limitsJson: { maxPayments: 50, maxExpenses: 50, maxDocuments: 20, storageGB: 0.5 },
          sortOrder: 2,
          isActive: true,
        },
        {
          id: '3',
          name: 'Professional',
          slug: 'individual-professional',
          description: 'Para profissionais autônomos avançados',
          tenantType: 'INDIVIDUAL',
          priceMonthly: 59.9,
          priceYearly: 599,
          featuresJson: { advancedReports: true, support: 'priority', apiAccess: false },
          limitsJson: { maxPayments: -1, maxExpenses: -1, maxDocuments: -1, storageGB: 2 },
          sortOrder: 3,
          isActive: true,
        },
      ];
    } else {
      return [
        {
          id: '4',
          name: 'Accountant Trial',
          slug: 'firm-trial',
          description: 'Teste grátis para escritórios',
          tenantType: 'ACCOUNTANT_FIRM',
          priceMonthly: 0,
          priceYearly: 0,
          featuresJson: { trialDays: 14 },
          limitsJson: { maxClients: 5, maxUsers: 2, storageGB: 0.2 },
          sortOrder: 1,
          isActive: true,
        },
        {
          id: '5',
          name: 'Starter Firm',
          slug: 'firm-starter',
          description: 'Para pequenos escritórios',
          tenantType: 'ACCOUNTANT_FIRM',
          priceMonthly: 149.9,
          priceYearly: 1499,
          featuresJson: { support: 'email', apiAccess: false },
          limitsJson: { maxClients: 20, maxUsers: 5, storageGB: 2 },
          sortOrder: 2,
          isActive: true,
        },
        {
          id: '6',
          name: 'Professional Firm',
          slug: 'firm-professional',
          description: 'Para escritórios em crescimento',
          tenantType: 'ACCOUNTANT_FIRM',
          priceMonthly: 299.9,
          priceYearly: 2999,
          featuresJson: { advancedReports: true, support: 'priority', apiAccess: false, whiteLabel: false },
          limitsJson: { maxClients: 100, maxUsers: 15, storageGB: 10 },
          sortOrder: 3,
          isActive: true,
        },
        {
          id: '7',
          name: 'Enterprise Firm',
          slug: 'firm-enterprise',
          description: 'Para grandes escritórios',
          tenantType: 'ACCOUNTANT_FIRM',
          priceMonthly: 599.9,
          priceYearly: 5999,
          featuresJson: { advancedReports: true, support: 'dedicated', apiAccess: true, whiteLabel: true },
          limitsJson: { maxClients: -1, maxUsers: -1, storageGB: -1 },
          sortOrder: 4,
          isActive: true,
        },
      ];
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="text-xl font-bold">ContaSync</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Começar Grátis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Planos e Preços</h1>
            <p className="text-xl text-muted-foreground">
              Escolha o plano ideal para você. Trial gratuito de 14 dias.
            </p>
          </div>

          <IntervalToggle interval={interval} onIntervalChange={setInterval} />

          <Tabs
            value={tenantType}
            onValueChange={(value) => setTenantType(value as 'INDIVIDUAL' | 'ACCOUNTANT_FIRM')}
            className="mb-12"
          >
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="INDIVIDUAL">Individual</TabsTrigger>
              <TabsTrigger value="ACCOUNTANT_FIRM">Escritórios</TabsTrigger>
            </TabsList>

            <TabsContent value={tenantType} className="mt-12">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Carregando planos...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-500 mb-4">{error}</p>
                  <Button onClick={fetchPlans}>Tentar Novamente</Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
                  {plans.map((plan) => (
                    <PricingCard key={plan.id} plan={plan} interval={interval} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="text-center mt-16">
            <h2 className="text-2xl font-bold mb-4">Precisa de ajuda para escolher?</h2>
            <p className="text-muted-foreground mb-6">
              Nossa equipe está pronta para ajudar você a encontrar o plano perfeito.
            </p>
            <Button variant="outline" size="lg" asChild>
              <Link href="/">Voltar para Home</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
