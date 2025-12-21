'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Crown, ExternalLink, Check, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CurrentPlan {
  id: string;
  name: string;
  price: number;
  interval: 'MONTH' | 'YEAR';
  status: 'ACTIVE' | 'TRIALING' | 'CANCELED' | 'PAST_DUE';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd: string | null;
  features: string[];
}

export function CurrentPlanCard() {
  const [plan, setPlan] = useState<CurrentPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isManaging, setIsManaging] = useState(false);

  useEffect(() => {
    fetchCurrentPlan();
  }, []);

  const fetchCurrentPlan = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Erro ao carregar plano');

      const data = await response.json();
      setPlan(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: CurrentPlan['status']) => {
    const config = {
      ACTIVE: { label: 'Ativo', className: 'bg-green-500' },
      TRIALING: { label: 'Trial', className: 'bg-blue-500' },
      CANCELED: { label: 'Cancelado', className: 'bg-gray-500' },
      PAST_DUE: { label: 'Vencido', className: 'bg-red-500' },
    };
    const { label, className } = config[status];
    return <Badge className={className}>{label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number, interval: string) => {
    return `R$ ${(price / 100).toFixed(2)}/${interval === 'MONTH' ? 'mês' : 'ano'}`;
  };

  const handleManageStripe = async () => {
    setIsManaging(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ returnUrl: window.location.href }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar sessão do portal');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao abrir portal do Stripe');
      setIsManaging(false);
    }
  };

  const handleChangePlan = () => {
    // Scroll to the ChangePlanSection
    const changePlanSection = document.getElementById('change-plan-section');
    if (changePlanSection) {
      changePlanSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Plano Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !plan) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error || 'Plano não encontrado'}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            <CardTitle>Plano Atual</CardTitle>
          </div>
          {getStatusBadge(plan.status)}
        </div>
        <CardDescription>Informações da sua assinatura</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan Info */}
        <div>
          <h3 className="text-2xl font-bold">{plan.name}</h3>
          <p className="text-xl text-muted-foreground">{formatPrice(plan.price, plan.interval)}</p>
        </div>

        {/* Trial Warning */}
        {plan.status === 'TRIALING' && plan.trialEnd && (
          <Alert className="border-blue-500 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              Seu trial termina em {formatDate(plan.trialEnd)}. Escolha um plano para continuar usando.
            </AlertDescription>
          </Alert>
        )}

        {/* Cancel Warning */}
        {plan.cancelAtPeriodEnd && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Sua assinatura será cancelada em {formatDate(plan.currentPeriodEnd)}.
            </AlertDescription>
          </Alert>
        )}

        {/* Next Billing */}
        {!plan.cancelAtPeriodEnd && plan.status === 'ACTIVE' && (
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Próxima cobrança</p>
            <p className="font-semibold">{formatDate(plan.currentPeriodEnd)}</p>
          </div>
        )}

        {/* Features */}
        {plan.features && plan.features.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Recursos incluídos:</h4>
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleManageStripe}
            disabled={isManaging}
          >
            {isManaging ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Abrindo...
              </>
            ) : (
              <>
                <ExternalLink className="mr-2 h-4 w-4" />
                Gerenciar no Stripe
              </>
            )}
          </Button>
          <Button className="flex-1" onClick={handleChangePlan}>
            Trocar Plano
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
