'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    slug: 'individual-starter',
    price: 29.9,
    description: 'Ideal para freelancers',
    features: ['Até 50 pagamentos/mês', 'Até 100 despesas/mês', '20 documentos', 'Suporte por email'],
  },
  {
    name: 'Professional',
    slug: 'individual-professional',
    price: 59.9,
    description: 'Para profissionais avançados',
    features: ['Pagamentos ilimitados', 'Despesas ilimitadas', 'Documentos ilimitados', 'Suporte prioritário'],
    popular: true,
  },
  {
    name: 'Enterprise',
    slug: 'firm-enterprise',
    price: 699.9,
    description: 'Para grandes escritórios',
    features: ['Tudo do Professional', 'White label', 'Acesso à API', 'Suporte dedicado'],
  },
];

export function PricingPreview() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Planos Simples e Transparentes</h2>
          <p className="text-xl text-muted-foreground">Escolha o plano ideal para você</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`p-8 ${plan.popular ? 'border-primary shadow-xl scale-105' : ''}`}>
              {plan.popular && (
                <div className="bg-primary text-primary-foreground text-sm font-semibold px-3 py-1 rounded-full w-fit mb-4">
                  Mais Popular
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-muted-foreground mb-4">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">R$ {plan.price.toFixed(2)}</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" variant={plan.popular ? 'default' : 'outline'} asChild>
                <Link href={`/signup?plan=${plan.slug}`}>Começar Trial</Link>
              </Button>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button variant="link" asChild>
            <Link href="/pricing">Ver todos os planos →</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
