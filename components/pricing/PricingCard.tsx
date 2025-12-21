'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import Link from 'next/link';

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  featuresJson: any;
  limitsJson: any;
  isPopular?: boolean;
}

interface PricingCardProps {
  plan: Plan;
  interval: 'monthly' | 'yearly';
}

export function PricingCard({ plan, interval }: PricingCardProps) {
  const price = interval === 'monthly' ? plan.priceMonthly : plan.priceYearly;
  const monthlyEquivalent = interval === 'yearly' ? (plan.priceYearly / 12).toFixed(2) : null;

  const isTrial = plan.slug.includes('trial') || plan.slug.includes('free');
  const isPopular = plan.slug.includes('professional') || plan.isPopular;

  // Extract features
  const features = [];
  if (plan.limitsJson) {
    if (plan.limitsJson.maxPayments) {
      features.push({
        name: plan.limitsJson.maxPayments === -1
          ? 'Pagamentos ilimitados'
          : `Até ${plan.limitsJson.maxPayments} pagamentos/mês`,
        included: true,
      });
    }
    if (plan.limitsJson.maxExpenses) {
      features.push({
        name: plan.limitsJson.maxExpenses === -1
          ? 'Despesas ilimitadas'
          : `Até ${plan.limitsJson.maxExpenses} despesas/mês`,
        included: true,
      });
    }
    if (plan.limitsJson.maxDocuments) {
      features.push({
        name: plan.limitsJson.maxDocuments === -1
          ? 'Documentos ilimitados'
          : `${plan.limitsJson.maxDocuments} documentos`,
        included: true,
      });
    }
    if (plan.limitsJson.storageGB) {
      features.push({
        name: plan.limitsJson.storageGB === -1
          ? 'Armazenamento ilimitado'
          : `${plan.limitsJson.storageGB} GB de armazenamento`,
        included: true,
      });
    }
  }

  if (plan.featuresJson) {
    if (plan.featuresJson.advancedReports) {
      features.push({ name: 'Relatórios avançados', included: true });
    }
    if (plan.featuresJson.apiAccess !== undefined) {
      features.push({ name: 'Acesso à API', included: plan.featuresJson.apiAccess });
    }
    if (plan.featuresJson.whiteLabel !== undefined) {
      features.push({ name: 'White Label', included: plan.featuresJson.whiteLabel });
    }
    if (plan.featuresJson.support) {
      const supportText = {
        email: 'Suporte por email',
        priority: 'Suporte prioritário',
        dedicated: 'Suporte dedicado',
      }[plan.featuresJson.support] || 'Suporte';
      features.push({ name: supportText, included: true });
    }
  }

  return (
    <Card
      className={`p-8 relative ${
        isPopular ? 'border-primary shadow-xl scale-105 z-10' : ''
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-1 rounded-full">
            Mais Popular
          </div>
        </div>
      )}
      {isTrial && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="bg-green-500 text-white text-sm font-semibold px-4 py-1 rounded-full">
            Trial Gratuito
          </div>
        </div>
      )}

      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
      <p className="text-muted-foreground mb-6">{plan.description}</p>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">R$ {price.toFixed(2)}</span>
          <span className="text-muted-foreground">
            /{interval === 'monthly' ? 'mês' : 'ano'}
          </span>
        </div>
        {monthlyEquivalent && (
          <p className="text-sm text-muted-foreground mt-1">
            ou R$ {monthlyEquivalent}/mês
          </p>
        )}
      </div>

      <ul className="space-y-3 mb-8 min-h-[200px]">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            {feature.included ? (
              <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            )}
            <span className={`text-sm ${!feature.included ? 'text-muted-foreground' : ''}`}>
              {feature.name}
            </span>
          </li>
        ))}
      </ul>

      <Button
        className="w-full"
        variant={isPopular ? 'default' : 'outline'}
        size="lg"
        asChild
      >
        <Link href={`/signup?plan=${plan.slug}`}>
          {isTrial ? 'Começar Trial Gratuito' : 'Assinar Agora'}
        </Link>
      </Button>
    </Card>
  );
}
