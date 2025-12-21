'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Check, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  interval: 'MONTH' | 'YEAR';
  features: string[];
  limits: {
    maxClients: number;
    maxDocuments: number;
    maxPayments: number;
    storageGB: number;
  };
  stripePriceIdMonthly?: string | null;
  stripePriceIdYearly?: string | null;
}

interface CurrentSubscription {
  planId: string;
  planSlug: string;
  status?: string;
  stripeSubscriptionId?: string | null;
}

export function ChangePlanSection() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSub, setCurrentSub] = useState<CurrentSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');

      const [plansRes, subRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/plans`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (plansRes.ok) {
        const plansData = await plansRes.json();
        console.log('Plans data:', plansData);
        // Transform plans data to match expected interface
        const transformedPlans = plansData.map((plan: any) => ({
          id: plan.id,
          name: plan.name,
          slug: plan.slug,
          // Convert price from string (e.g. "29.9") to cents (e.g. 2990)
          price: Math.round(parseFloat(plan.priceMonthly || '0') * 100),
          interval: 'MONTH' as const,
          features: Array.isArray(plan.featuresJson) ? plan.featuresJson : [],
          limits: {
            maxClients: plan.limitsJson?.maxClients || 0,
            maxDocuments: plan.limitsJson?.maxDocuments || 0,
            maxPayments: plan.limitsJson?.maxPayments || 0,
            storageGB: plan.limitsJson?.storageGB || 0,
          },
          stripePriceIdMonthly: plan.stripePriceIdMonthly,
          stripePriceIdYearly: plan.stripePriceIdYearly,
        }));
        console.log('Transformed plans:', transformedPlans);
        setPlans(transformedPlans);
      }

      if (subRes.ok) {
        const subData = await subRes.json();
        console.log('Subscription data:', subData);
        setCurrentSub({
          planId: subData.planId,
          planSlug: subData.slug,
          status: subData.status
        });
        console.log('Current subscription set:', {
          planId: subData.planId,
          planSlug: subData.slug,
          status: subData.status
        });
      } else {
        console.error('Failed to fetch subscription:', subRes.status, await subRes.text());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = async () => {
    if (!selectedPlan || !currentSub) return;

    setIsChanging(true);
    try {
      const token = localStorage.getItem('accessToken');

      console.log('[ChangePlan] Current subscription status:', currentSub.status);
      console.log('[ChangePlan] Selected plan:', selectedPlan.name, selectedPlan.id);

      // Se usuário está em trial OU não tem Stripe subscription, criar checkout session
      // Trial users precisam de checkout para qualquer mudança de plano
      if (currentSub.status === 'TRIALING' || !currentSub.stripeSubscriptionId) {
        console.log('[ChangePlan] User is in TRIALING or no Stripe subscription, redirecting to checkout');

        // Verificar se o plano tem Stripe configurado
        if (!selectedPlan.stripePriceIdMonthly && !selectedPlan.stripePriceIdYearly) {
          toast.error(
            'Stripe não configurado. ' +
            'Este plano ainda não tem preços configurados no Stripe. ' +
            'Continue usando o trial gratuitamente ou contate o suporte.'
          );
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            planId: selectedPlan.id,
            successUrl: window.location.href,
            cancelUrl: window.location.href,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Erro ao criar checkout');
        }

        const { url } = await response.json();
        window.location.href = url; // Redireciona para o Stripe Checkout
        return;
      }

      console.log('[ChangePlan] User has active subscription, proceeding with upgrade/downgrade');

      // Usuário já tem assinatura ativa no Stripe, fazer upgrade/downgrade
      const isUpgrade = selectedPlan.price > plans.find(p => p.id === currentSub.planId)?.price!;

      const endpoint = isUpgrade
        ? `${process.env.NEXT_PUBLIC_API_URL}/subscriptions/upgrade`
        : `${process.env.NEXT_PUBLIC_API_URL}/subscriptions/downgrade`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPlanId: selectedPlan.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao alterar plano');
      }

      toast.success('Plano alterado com sucesso!');
      setShowConfirmDialog(false);
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao alterar plano');
    } finally {
      setIsChanging(false);
    }
  };

  const getPlanAction = (plan: Plan) => {
    console.log('getPlanAction called for plan:', plan.name, 'currentSub:', currentSub);

    if (!currentSub) {
      console.log('No currentSub, returning null');
      return null;
    }

    if (plan.slug === currentSub.planSlug) {
      console.log('This is the current plan');
      return { label: 'Plano Atual', variant: 'secondary' as const, disabled: true };
    }

    // For trial users, show upgrade to any paid plan
    // Use price from subscription API response (which includes trial plan price)
    const currentPrice = currentSub.status === 'TRIALING' ? 0 : (plans.find(p => p.id === currentSub.planId)?.price || 0);
    console.log('Current price:', currentPrice, 'Plan price:', plan.price);

    const isUpgrade = plan.price > currentPrice;
    console.log('Is upgrade?', isUpgrade);

    return {
      label: isUpgrade ? 'Fazer Upgrade' : 'Fazer Downgrade',
      variant: isUpgrade ? 'default' as const : 'outline' as const,
      disabled: false,
      icon: isUpgrade ? ArrowUp : ArrowDown,
    };
  };

  const formatPrice = (price: number) => {
    return `R$ ${(price / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trocar Plano</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card id="change-plan-section">
        <CardHeader>
          <CardTitle>Trocar Plano</CardTitle>
          <CardDescription>
            Compare os planos disponíveis e faça upgrade ou downgrade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const action = getPlanAction(plan);
              const isCurrent = plan.slug === currentSub?.planSlug;

              return (
                <Card
                  key={plan.id}
                  className={`relative ${isCurrent ? 'border-primary border-2' : ''}`}
                >
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary">Plano Atual</Badge>
                    </div>
                  )}

                  <CardHeader>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">
                        {formatPrice(plan.price)}
                      </span>
                      <span className="text-muted-foreground">
                        /{plan.interval === 'MONTH' ? 'mês' : 'ano'}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Features */}
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Limits */}
                    <div className="pt-4 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Limites:</p>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        <li>• {plan.limits.maxClients === -1 ? 'Clientes ilimitados' : `${plan.limits.maxClients} clientes`}</li>
                        <li>• {plan.limits.maxDocuments === -1 ? 'Documentos ilimitados' : `${plan.limits.maxDocuments} documentos`}</li>
                        <li>• {plan.limits.maxPayments === -1 ? 'Pagamentos ilimitados' : `${plan.limits.maxPayments} pagamentos`}</li>
                        <li>• {plan.limits.storageGB}GB armazenamento</li>
                      </ul>
                    </div>

                    {/* Action Button */}
                    {action && (
                      <Button
                        variant={action.variant}
                        className="w-full"
                        disabled={action.disabled}
                        onClick={() => {
                          setSelectedPlan(plan);
                          setShowConfirmDialog(true);
                        }}
                      >
                        {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                        {action.label}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Alteração de Plano</DialogTitle>
            <DialogDescription>
              Você está prestes a alterar seu plano para <strong>{selectedPlan?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-muted rounded-lg p-4">
              <h4 className="font-semibold mb-2">Entenda a cobrança:</h4>
              {currentSub?.status === 'TRIALING' ? (
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Você será redirecionado para o checkout do Stripe</li>
                  <li>• Precisará cadastrar um cartão de crédito</li>
                  <li>• Cobrança inicia após o término do trial</li>
                  <li>• Você pode cancelar a qualquer momento</li>
                </ul>
              ) : (
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• O valor será proporcional (proration)</li>
                  <li>• A mudança é imediata</li>
                  <li>• Próxima cobrança: mesmo dia do ciclo atual</li>
                </ul>
              )}
            </div>

            {selectedPlan && (
              <div className="text-center py-2">
                <p className="text-2xl font-bold">
                  {formatPrice(selectedPlan.price)}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{selectedPlan.interval === 'MONTH' ? 'mês' : 'ano'}
                  </span>
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isChanging}
            >
              Cancelar
            </Button>
            <Button onClick={handlePlanChange} disabled={isChanging}>
              {isChanging ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                'Confirmar Alteração'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
