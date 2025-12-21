'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, FileText, CreditCard, TrendingUp, HardDrive } from 'lucide-react';

interface UsageData {
  limits: {
    maxPayments: number;
    maxExpenses: number;
    maxDocuments: number;
    storageGB: number;
  };
  usage: {
    paymentsCount: number;
    expensesCount: number;
    documentsCount: number;
    storageUsedGB: number;
  };
  percentages: {
    payments: number;
    expenses: number;
    documents: number;
    storage: number;
  };
}

interface LimitItemProps {
  icon: React.ReactNode;
  label: string;
  used: number | string;
  max: number | string;
  percentage: number;
  unit?: string;
}

function LimitItem({ icon, label, used, max, percentage, unit = '' }: LimitItemProps) {
  const getProgressColor = (pct: number) => {
    if (pct >= 90) return 'bg-red-500';
    if (pct >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTextColor = (pct: number) => {
    if (pct >= 90) return 'text-red-600';
    if (pct >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="text-muted-foreground">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">{label}</span>
            <span className={`text-sm font-semibold ${getTextColor(percentage)}`}>
              {percentage}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {used} {unit} de {max} {unit} usados
          </p>
        </div>
      </div>
      <div className="relative">
        <Progress value={percentage} className="h-2" />
        <div
          className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor(percentage)}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

export function PlanLimitsInfo() {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/me/usage`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar informações de uso');
      }

      const data = await response.json();
      setUsageData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Limites do Plano</CardTitle>
          <CardDescription>Definidos pelo plano do contador</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
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

  if (!usageData) {
    return null;
  }

  const { limits, usage, percentages } = usageData;
  const hasLimitReached =
    percentages.payments >= 100 ||
    percentages.expenses >= 100 ||
    percentages.documents >= 100 ||
    percentages.storage >= 100;

  const hasWarning =
    percentages.payments >= 90 ||
    percentages.expenses >= 90 ||
    percentages.documents >= 90 ||
    percentages.storage >= 90;

  return (
    <div className="space-y-4">
      {/* Warning Alert */}
      {hasLimitReached && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Limite Atingido</AlertTitle>
          <AlertDescription>
            Você atingiu o limite de um ou mais recursos. Contate seu contador para fazer um upgrade do
            plano.
          </AlertDescription>
        </Alert>
      )}

      {hasWarning && !hasLimitReached && (
        <Alert className="border-yellow-500 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Atenção</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Você está próximo de atingir o limite de um ou mais recursos (acima de 90%).
          </AlertDescription>
        </Alert>
      )}

      {/* Limits Card */}
      <Card>
        <CardHeader>
          <CardTitle>Limites do Plano</CardTitle>
          <CardDescription>Definidos pelo plano do contador</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payments */}
          <LimitItem
            icon={<CreditCard className="h-4 w-4" />}
            label="Pagamentos"
            used={usage.paymentsCount}
            max={limits.maxPayments}
            percentage={percentages.payments}
          />

          {/* Expenses */}
          <LimitItem
            icon={<TrendingUp className="h-4 w-4" />}
            label="Despesas"
            used={usage.expensesCount}
            max={limits.maxExpenses}
            percentage={percentages.expenses}
          />

          {/* Documents */}
          <LimitItem
            icon={<FileText className="h-4 w-4" />}
            label="Documentos"
            used={usage.documentsCount}
            max={limits.maxDocuments}
            percentage={percentages.documents}
          />

          {/* Storage */}
          <LimitItem
            icon={<HardDrive className="h-4 w-4" />}
            label="Armazenamento"
            used={usage.storageUsedGB}
            max={limits.storageGB}
            percentage={percentages.storage}
            unit="GB"
          />
        </CardContent>
      </Card>
    </div>
  );
}
