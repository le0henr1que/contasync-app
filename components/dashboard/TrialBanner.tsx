'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Crown, AlertTriangle, Zap, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { differenceInDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEffect, useState } from 'react';

interface TrialBannerProps {
  trialEndsAt: string | Date;
  planName?: string;
  className?: string;
}

export function TrialBanner({ trialEndsAt, planName = 'Starter', className }: TrialBannerProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const endDate = new Date(trialEndsAt);
  const now = new Date();
  const daysLeft = differenceInDays(endDate, now);
  const totalTrialDays = 14; // Assuming 14-day trial
  const progressPercentage = Math.max(0, Math.min(100, ((totalTrialDays - daysLeft) / totalTrialDays) * 100));

  // Determine urgency level and styles
  const getUrgencyConfig = () => {
    if (daysLeft <= 0) {
      return {
        variant: 'destructive' as const,
        icon: AlertTriangle,
        bgGradient: 'from-destructive/10 to-destructive/20',
        borderColor: 'border-destructive',
        iconBg: 'bg-destructive',
        iconColor: 'text-destructive-foreground',
        badgeVariant: 'destructive' as const,
        badgeText: 'Expirado',
        title: 'Trial Expirado',
        description: 'Seu período de avaliação terminou. Escolha um plano para continuar usando o ContaSync.',
        ctaText: 'Assinar Agora',
        ctaVariant: 'destructive' as const,
      };
    } else if (daysLeft <= 2) {
      return {
        variant: 'default' as const,
        icon: Zap,
        bgGradient: 'from-red-500/10 to-orange-500/20',
        borderColor: 'border-red-500',
        iconBg: 'bg-red-500',
        iconColor: 'text-white',
        badgeVariant: 'destructive' as const,
        badgeText: 'Urgente',
        title: `Período de Avaliação - ${planName}`,
        description: `Seu trial termina ${daysLeft === 1 ? 'amanhã' : 'em breve'}! Não perca acesso aos seus dados e clientes.`,
        ctaText: 'Escolher Plano Agora',
        ctaVariant: 'destructive' as const,
      };
    } else if (daysLeft <= 6) {
      return {
        variant: 'default' as const,
        icon: Clock,
        bgGradient: 'from-yellow-500/10 to-orange-500/15',
        borderColor: 'border-yellow-600',
        iconBg: 'bg-yellow-600',
        iconColor: 'text-white',
        badgeVariant: 'secondary' as const,
        badgeText: 'Atenção',
        title: `Período de Avaliação - ${planName}`,
        description: 'Seu trial está chegando ao fim. Aproveite para conhecer todos os recursos e escolha seu plano.',
        ctaText: 'Ver Planos',
        ctaVariant: 'default' as const,
      };
    } else {
      return {
        variant: 'default' as const,
        icon: Crown,
        bgGradient: 'from-primary/5 to-primary/10',
        borderColor: 'border-primary',
        iconBg: 'bg-primary',
        iconColor: 'text-primary-foreground',
        badgeVariant: 'secondary' as const,
        badgeText: 'Trial Ativo',
        title: `Período de Avaliação - ${planName}`,
        description: 'Explore todas as funcionalidades e escolha o melhor plano para seu escritório.',
        ctaText: 'Conhecer Planos',
        ctaVariant: 'outline' as const,
      };
    }
  };

  const config = getUrgencyConfig();
  const Icon = config.icon;

  return (
    <Card className={`bg-gradient-to-r ${config.bgGradient} ${config.borderColor} ${className || ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${config.iconBg} ${config.iconColor}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <CardTitle className="text-xl">{config.title}</CardTitle>
                <Badge variant={config.badgeVariant}>{config.badgeText}</Badge>
              </div>
              <CardDescription className="text-base">
                {config.description}
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={() => router.push('/dashboard/billing')}
            variant={config.ctaVariant}
            className="gap-2 flex-shrink-0"
          >
            <CreditCard className="h-4 w-4" />
            {config.ctaText}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Trial Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso do Trial</span>
            <span className="font-medium">
              {daysLeft > 0 ? (
                <>
                  <Clock className="h-3.5 w-3.5 inline mr-1" />
                  {daysLeft} {daysLeft === 1 ? 'dia restante' : 'dias restantes'}
                </>
              ) : (
                <span className="text-destructive">Expirado</span>
              )}
            </span>
          </div>
          <Progress
            value={progressPercentage}
            className={`h-2 ${daysLeft <= 2 ? 'bg-red-200' : daysLeft <= 6 ? 'bg-yellow-200' : 'bg-primary/20'}`}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Início do trial</span>
            <span>
              Termina em {format(endDate, "dd 'de' MMMM", { locale: ptBR })}
            </span>
          </div>
        </div>

        {/* Additional Info */}
        {daysLeft > 0 && (
          <div className="text-sm text-muted-foreground bg-background/50 rounded-lg p-4 border">
            <p className="font-medium mb-2">Durante o trial você tem acesso a:</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>Gestão completa de clientes e documentos</li>
              <li>Controle de pagamentos e despesas</li>
              <li>Portal exclusivo para seus clientes</li>
              <li>Relatórios financeiros detalhados</li>
            </ul>
          </div>
        )}

        {/* Expired state additional info */}
        {daysLeft <= 0 && (
          <div className="text-sm bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="font-medium text-destructive mb-2">O que acontece agora?</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>❌ Seu acesso está bloqueado</li>
              <li>❌ Seus clientes não podem acessar o portal</li>
              <li>✅ Seus dados estão seguros e serão mantidos</li>
              <li>✅ Assine um plano para restaurar o acesso imediatamente</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
