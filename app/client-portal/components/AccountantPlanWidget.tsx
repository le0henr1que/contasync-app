'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, AlertCircle, Mail, MessageCircle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AccountantPlan {
  accountantName: string;
  plan: {
    name: string;
    status: 'ACTIVE' | 'TRIALING' | 'EXPIRED' | 'PAST_DUE';
    trialEndsAt: string | null;
    currentPeriodEnd: string | null;
    daysRemaining?: number;
  };
}

const STATUS_CONFIG = {
  ACTIVE: {
    label: 'Ativo',
    color: 'bg-green-500',
    badgeVariant: 'default' as const,
    icon: '✓',
  },
  TRIALING: {
    label: 'Trial',
    color: 'bg-yellow-500',
    badgeVariant: 'secondary' as const,
    icon: '⏳',
  },
  EXPIRED: {
    label: 'Expirado',
    color: 'bg-red-500',
    badgeVariant: 'destructive' as const,
    icon: '✗',
  },
  PAST_DUE: {
    label: 'Pagamento Pendente',
    color: 'bg-orange-500',
    badgeVariant: 'secondary' as const,
    icon: '⚠',
  },
};

export function AccountantPlanWidget() {
  const [planData, setPlanData] = useState<AccountantPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAccountantPlan();
  }, []);

  const fetchAccountantPlan = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/clients/me/accountant-plan`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar informações do plano');
      }

      const data = await response.json();
      setPlanData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !planData) {
    return null; // Don't show widget if there's an error
  }

  const statusConfig = STATUS_CONFIG[planData.plan.status];
  const isTrialing = planData.plan.status === 'TRIALING';
  const isExpired = planData.plan.status === 'EXPIRED';
  const isPastDue = planData.plan.status === 'PAST_DUE';
  const needsAttention = isExpired || isPastDue || (isTrialing && (planData.plan.daysRemaining ?? 999) < 7);

  return (
    <Card className={needsAttention ? 'border-orange-500 shadow-lg' : ''}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="h-5 w-5 text-primary" />
          Plano do Contador
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Escritório</p>
          <p className="font-semibold">{planData.accountantName}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Plano</p>
          <p className="font-medium">{planData.plan.name}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-1">Status</p>
          <Badge variant={statusConfig.badgeVariant} className="gap-1">
            <span>{statusConfig.icon}</span>
            <span>{statusConfig.label}</span>
          </Badge>
        </div>

        {isTrialing && planData.plan.trialEndsAt && (
          <div className={planData.plan.daysRemaining! < 7 ? 'bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800' : ''}>
            <p className="text-sm text-muted-foreground">Trial expira em</p>
            <p className="font-semibold text-yellow-700 dark:text-yellow-400">
              {planData.plan.daysRemaining} {planData.plan.daysRemaining === 1 ? 'dia' : 'dias'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(planData.plan.trialEndsAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
        )}

        {planData.plan.status === 'ACTIVE' && planData.plan.currentPeriodEnd && (
          <div>
            <p className="text-sm text-muted-foreground">Renovação</p>
            <p className="font-medium">
              {format(new Date(planData.plan.currentPeriodEnd), "dd 'de' MMMM, yyyy", { locale: ptBR })}
            </p>
          </div>
        )}

        {isExpired && (
          <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                  Plano Expirado
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Contate seu contador para reativar o acesso completo
                </p>
              </div>
            </div>
          </div>
        )}

        {isPastDue && (
          <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                  Pagamento Pendente
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  Há uma pendência no pagamento do plano
                </p>
              </div>
            </div>
          </div>
        )}

        {needsAttention && (
          <div className="flex flex-col gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open(`mailto:contador@example.com?subject=Sobre o plano`)}
            >
              <Mail className="h-4 w-4 mr-2" />
              Enviar Email
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open(`https://wa.me/5511999999999?text=Olá, tenho uma dúvida sobre o plano`)}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
