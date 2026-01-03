'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  CreditCard,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Subscription, Plan, SubscriptionStatus } from '@/types';

const statusConfig: Record<SubscriptionStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
  TRIALING: { label: 'Período de Teste', variant: 'secondary', icon: Clock },
  ACTIVE: { label: 'Ativa', variant: 'default', icon: CheckCircle2 },
  PAST_DUE: { label: 'Pagamento Atrasado', variant: 'destructive', icon: AlertTriangle },
  CANCELED: { label: 'Cancelada', variant: 'destructive', icon: XCircle },
  EXPIRED: { label: 'Expirada', variant: 'destructive', icon: XCircle },
  INCOMPLETE: { label: 'Incompleta', variant: 'outline', icon: AlertTriangle },
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export default function SubscriptionPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  // Redirect if not individual client
  useEffect(() => {
    if (user) {
      if (user.role !== 'CLIENT' || user.accountantId) {
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  useEffect(() => {
    if (user && !user.accountantId) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/subscriptions/me`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar assinatura');
      }

      const data = await response.json();
      setSubscription(data);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar assinatura');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      setIsUpgrading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/subscriptions/upgrade`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao fazer upgrade');
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        toast.success('Upgrade realizado com sucesso!');
        fetchSubscription();
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer upgrade');
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/subscriptions/portal`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao acessar portal de pagamento');
      }

      const { url } = await response.json();
      window.open(url, '_blank');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao acessar portal de pagamento');
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura?')) {
      return;
    }

    try {
      setIsCanceling(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/subscriptions/cancel`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao cancelar assinatura');
      }

      toast.success('Assinatura cancelada com sucesso');
      fetchSubscription();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cancelar assinatura');
    } finally {
      setIsCanceling(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!subscription) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Assinatura</h1>
            <p className="text-muted-foreground">
              Você ainda não possui uma assinatura ativa
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Escolha um Plano</CardTitle>
              <CardDescription>
                Selecione o plano ideal para suas necessidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push('/pricing')}>
                Ver Planos Disponíveis
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const statusInfo = statusConfig[subscription.status];
  const StatusIcon = statusInfo.icon;
  const isTrialing = subscription.status === 'TRIALING';
  const isActive = subscription.status === 'ACTIVE';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Assinatura</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie sua assinatura atual
          </p>
        </div>

        {/* Subscription Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Status da Assinatura
                </CardTitle>
              </div>
              <Badge variant={statusInfo.variant} className="gap-1">
                <StatusIcon className="h-3 w-3" />
                {statusInfo.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription.plan && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Plano Atual</p>
                <p className="text-2xl font-bold">{subscription.plan.name}</p>
                <p className="text-muted-foreground">{subscription.plan.description}</p>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Intervalo de Cobrança
                </p>
                <p className="font-medium">
                  {subscription.interval === 'MONTHLY' ? 'Mensal' : 'Anual'}
                </p>
              </div>

              {subscription.plan && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Valor
                  </p>
                  <p className="font-medium">
                    {formatCurrency(
                      subscription.interval === 'MONTHLY'
                        ? subscription.plan.priceMonthly
                        : subscription.plan.priceYearly
                    )}
                    {subscription.interval === 'MONTHLY' ? '/mês' : '/ano'}
                  </p>
                </div>
              )}

              {subscription.currentPeriodStart && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Início do Período
                  </p>
                  <p className="font-medium">
                    {format(new Date(subscription.currentPeriodStart), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
              )}

              {subscription.currentPeriodEnd && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {isTrialing ? 'Fim do Teste Gratuito' : 'Próxima Cobrança'}
                  </p>
                  <p className="font-medium">
                    {format(
                      new Date(isTrialing && subscription.trialEnd ? subscription.trialEnd : subscription.currentPeriodEnd),
                      'dd/MM/yyyy',
                      { locale: ptBR }
                    )}
                  </p>
                </div>
              )}
            </div>

            {subscription.cancelAtPeriodEnd && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Assinatura será cancelada</p>
                  <p className="text-sm text-muted-foreground">
                    Sua assinatura será cancelada em{' '}
                    {format(new Date(subscription.currentPeriodEnd), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plan Features */}
        {subscription.plan && (
          <Card>
            <CardHeader>
              <CardTitle>Recursos do Plano</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subscription.plan.limitsJson.maxClients && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Até {subscription.plan.limitsJson.maxClients} clientes</span>
                  </div>
                )}
                {subscription.plan.limitsJson.maxPayments && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Até {subscription.plan.limitsJson.maxPayments} pagamentos/mês</span>
                  </div>
                )}
                {subscription.plan.limitsJson.maxExpenses && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Até {subscription.plan.limitsJson.maxExpenses} despesas/mês</span>
                  </div>
                )}
                {subscription.plan.limitsJson.maxDocuments && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Até {subscription.plan.limitsJson.maxDocuments} documentos/mês</span>
                  </div>
                )}
                {subscription.plan.limitsJson.storageGB && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>{subscription.plan.limitsJson.storageGB}GB de armazenamento</span>
                  </div>
                )}
                {subscription.plan.featuresJson.apiAccess && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Acesso à API</span>
                  </div>
                )}
                {subscription.plan.featuresJson.prioritySupport && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Suporte Prioritário</span>
                  </div>
                )}
                {subscription.plan.featuresJson.multiUser && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Múltiplos Usuários</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(isActive || isTrialing) && !subscription.cancelAtPeriodEnd && (
              <>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={handleManageBilling}
                >
                  <span className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Gerenciar Forma de Pagamento
                  </span>
                  <ExternalLink className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                >
                  {isUpgrading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Alterar Plano
                      </span>
                      <ExternalLink className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <Separator />

                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleCancelSubscription}
                  disabled={isCanceling}
                >
                  {isCanceling ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Cancelar Assinatura
                </Button>
              </>
            )}

            {subscription.cancelAtPeriodEnd && (
              <p className="text-sm text-center text-muted-foreground">
                Sua assinatura será cancelada ao final do período atual.
                <br />
                Você pode reativar sua assinatura a qualquer momento.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
