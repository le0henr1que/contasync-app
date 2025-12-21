'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Crown, Mail, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface AccountantPlan {
  accountantName: string;
  plan: {
    name: string;
    status: 'ACTIVE' | 'TRIALING' | 'EXPIRED' | 'PAST_DUE' | 'CANCELED';
    trialEndsAt: string | null;
    currentPeriodEnd: string | null;
    daysRemaining: number | null;
  };
}

export function AccountantPlanWidget() {
  const [planData, setPlanData] = useState<AccountantPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlanData();
  }, []);

  const fetchPlanData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/me/accountant-plan`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar informações do plano');
      }

      const data = await response.json();
      setPlanData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: AccountantPlan['plan']['status']) => {
    const statusConfig = {
      ACTIVE: { label: 'Ativo', variant: 'default' as const, className: 'bg-green-500' },
      TRIALING: { label: 'Trial', variant: 'secondary' as const, className: 'bg-blue-500 text-white' },
      EXPIRED: { label: 'Expirado', variant: 'destructive' as const, className: 'bg-red-500' },
      PAST_DUE: { label: 'Vencido', variant: 'destructive' as const, className: 'bg-orange-500' },
      CANCELED: { label: 'Cancelado', variant: 'outline' as const, className: 'bg-gray-500' },
    };

    const config = statusConfig[status] || statusConfig.EXPIRED;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Plano do Contador
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

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!planData) {
    return null;
  }

  const { accountantName, plan } = planData;
  const isTrialExpiring = plan.status === 'TRIALING' && plan.daysRemaining !== null && plan.daysRemaining < 3;
  const isPlanExpired = plan.status === 'EXPIRED' || plan.status === 'PAST_DUE' || plan.status === 'CANCELED';

  return (
    <>
      {/* Trial Expiring Warning */}
      {isTrialExpiring && (
        <Alert className="mb-4 border-yellow-500 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Trial Expirando em Breve</AlertTitle>
          <AlertDescription className="text-yellow-700">
            O período de trial do seu contador expira em {plan.daysRemaining}{' '}
            {plan.daysRemaining === 1 ? 'dia' : 'dias'}. Entre em contato para garantir continuidade do serviço.
          </AlertDescription>
        </Alert>
      )}

      {/* Plan Expired Warning */}
      {isPlanExpired && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Plano Expirado</AlertTitle>
          <AlertDescription>
            O plano do seu contador expirou. Algumas funcionalidades podem estar limitadas. Entre em contato com{' '}
            {accountantName} para mais informações.
          </AlertDescription>
        </Alert>
      )}

      {/* Plan Widget Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Plano do Contador
          </CardTitle>
          <CardDescription>Informações sobre o plano do seu contador</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Accountant Name */}
          <div>
            <p className="text-sm text-muted-foreground">Seu Contador</p>
            <p className="text-lg font-semibold">{accountantName}</p>
          </div>

          {/* Plan Name and Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Plano Atual</p>
              <p className="text-base font-medium">{plan.name}</p>
            </div>
            {getStatusBadge(plan.status)}
          </div>

          {/* Trial Information */}
          {plan.status === 'TRIALING' && plan.daysRemaining !== null && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">Período de Trial</p>
                  <p className="text-sm text-blue-700">
                    {plan.daysRemaining} {plan.daysRemaining === 1 ? 'dia restante' : 'dias restantes'}
                  </p>
                  {plan.trialEndsAt && (
                    <p className="text-xs text-blue-600 mt-1">
                      Expira em: {formatDate(plan.trialEndsAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Active Plan Information */}
          {plan.status === 'ACTIVE' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">Plano Ativo</p>
                  {plan.currentPeriodEnd && (
                    <p className="text-xs text-green-600 mt-1">
                      Próxima renovação: {formatDate(plan.currentPeriodEnd)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Contact Accountant Button */}
          <div className="pt-2">
            <Button variant="outline" className="w-full" asChild>
              <Link href={`mailto:${accountantName.toLowerCase().replace(/\s+/g, '')}@contasync.com`}>
                <Mail className="mr-2 h-4 w-4" />
                Entrar em Contato
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
