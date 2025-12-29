'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { FadeIn } from '@/components/ui/fade-in';

export function PricingPreview() {
  const plans = [
    {
      name: 'Starter',
      price: 'R$ 29,90',
      period: '/mês',
      features: ['Até 50 clientes', '100 GB armazenamento', 'Suporte por email'],
    },
    {
      name: 'Professional',
      price: 'R$ 59,90',
      period: '/mês',
      popular: true,
      features: ['Até 200 clientes', '500 GB armazenamento', 'Suporte prioritário', 'API Access'],
    },
    {
      name: 'Enterprise',
      price: 'Personalizado',
      features: ['Clientes ilimitados', 'Armazenamento ilimitado', 'Suporte dedicado', 'White-label'],
    },
  ];

  return (
    <section className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Planos para todos os tamanhos
          </h2>
          <p className="text-lg text-muted-foreground">
            14 dias grátis em todos os planos. Sem cartão de crédito.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <FadeIn key={index} delay={index * 0.15} direction="up">
              <Card className={plan.popular ? 'border-primary shadow-lg' : ''}>
                {plan.popular && (
                  <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
                    Mais Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={plan.popular ? 'default' : 'outline'} asChild>
                    <Link href="/signup">{index === 2 ? 'Contato' : 'Começar Trial'}</Link>
                  </Button>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/pricing">
            <Button variant="link">Ver comparação completa de planos →</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
