'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, TrendingUp, Users, FileText, CreditCard, Receipt, HardDrive } from 'lucide-react';
import Link from 'next/link';

interface UsageInfo {
  current: number;
  limit: number;
  percentage: number;
  isUnlimited: boolean;
}

interface UsageMeterProps {
  title: string;
  usage: UsageInfo;
  icon?: React.ReactNode;
}

export function UsageMeter({ title, usage, icon }: UsageMeterProps) {
  const getColor = () => {
    if (usage.isUnlimited) return 'text-blue-600';
    if (usage.percentage >= 100) return 'text-red-600';
    if (usage.percentage >= 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = () => {
    if (usage.isUnlimited) return '';
    if (usage.percentage >= 100) return '[&>div]:bg-red-600';
    if (usage.percentage >= 80) return '[&>div]:bg-yellow-600';
    return '[&>div]:bg-green-600';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{title}</span>
        </div>
        <span className={`text-sm font-semibold ${getColor()}`}>
          {usage.isUnlimited ? (
            'Ilimitado'
          ) : (
            <>
              {usage.current} / {usage.limit}
            </>
          )}
        </span>
      </div>
      {!usage.isUnlimited && (
        <Progress value={Math.min(usage.percentage, 100)} className={getProgressColor()} />
      )}
      {usage.percentage >= 80 && !usage.isUnlimited && (
        <div className="flex items-center gap-2 text-xs text-yellow-600">
          <AlertCircle className="h-3 w-3" />
          <span>Próximo do limite - considere fazer upgrade</span>
        </div>
      )}
      {usage.percentage >= 100 && !usage.isUnlimited && (
        <div className="flex items-center gap-2 text-xs text-red-600">
          <AlertCircle className="h-3 w-3" />
          <span>Limite atingido! Faça upgrade para continuar</span>
        </div>
      )}
    </div>
  );
}

interface LimitsData {
  limits: {
    maxClients: number;
    maxDocuments: number;
    maxPayments: number;
    maxExpenses: number;
    storageGB: number;
  };
  usage: {
    clients: UsageInfo;
    documents: UsageInfo;
    payments: UsageInfo;
    expenses: UsageInfo;
    storage: UsageInfo;
  };
  planName: string;
}

interface LimitsCardProps {
  limitsData: LimitsData | null;
}

export function LimitsCard({ limitsData }: LimitsCardProps) {
  if (!limitsData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Uso do Plano</CardTitle>
          <CardDescription>Carregando informações de uso...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { limits, usage, planName } = limitsData;
  const hasNearLimit =
    usage.clients.percentage >= 80 ||
    usage.documents.percentage >= 80 ||
    usage.payments.percentage >= 80 ||
    usage.expenses.percentage >= 80 ||
    usage.storage.percentage >= 80;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Uso do Plano</CardTitle>
            <CardDescription>
              Plano Atual: <span className="font-semibold">{planName}</span>
            </CardDescription>
          </div>
          {hasNearLimit && (
            <Badge variant="destructive" className="bg-yellow-100 text-yellow-800 border-yellow-300">
              Atenção
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <UsageMeter
          title="Clientes"
          usage={usage.clients}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <UsageMeter
          title="Documentos"
          usage={usage.documents}
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
        />
        <UsageMeter
          title="Pagamentos"
          usage={usage.payments}
          icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
        />
        <UsageMeter
          title="Despesas"
          usage={usage.expenses}
          icon={<Receipt className="h-4 w-4 text-muted-foreground" />}
        />
        <UsageMeter
          title="Armazenamento"
          usage={usage.storage}
          icon={<HardDrive className="h-4 w-4 text-muted-foreground" />}
        />

        {hasNearLimit && (
          <div className="pt-4 border-t">
            <div className="mb-3 text-sm text-muted-foreground">
              <p className="font-medium mb-2">Benefícios de fazer upgrade:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Mais clientes no seu portfólio</li>
                <li>Limite maior de documentos por cliente</li>
                <li>Mais lançamentos de pagamentos e despesas</li>
                <li>Maior capacidade de armazenamento</li>
                <li>Suporte prioritário</li>
              </ul>
            </div>
            <Link href="/billing">
              <Button className="w-full" variant="default">
                <TrendingUp className="mr-2 h-4 w-4" />
                Fazer Upgrade
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
