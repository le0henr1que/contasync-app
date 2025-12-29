'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  FileText,
  Receipt,
  HardDrive,
  Info
} from 'lucide-react';

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

interface LimitItem {
  label: string;
  icon: React.ReactNode;
  current: number;
  limit: number;
  percentage: number;
  unit?: string;
  formatValue?: (value: number) => string;
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
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/clients/me/usage`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar limites do plano');
      }

      const data = await response.json();
      setUsageData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 100) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Limite Atingido
        </Badge>
      );
    }
    if (percentage >= 90) {
      return (
        <Badge variant="secondary" className="gap-1 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
          <AlertTriangle className="h-3 w-3" />
          Próximo do Limite
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-700 dark:text-green-400">
        <CheckCircle2 className="h-3 w-3" />
        Normal
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !usageData) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error || 'Erro ao carregar dados'}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const limitItems: LimitItem[] = [
    {
      label: 'Pagamentos',
      icon: <CreditCard className="h-5 w-5" />,
      current: usageData.usage.paymentsCount,
      limit: usageData.limits.maxPayments,
      percentage: usageData.percentages.payments,
    },
    {
      label: 'Despesas',
      icon: <Receipt className="h-5 w-5" />,
      current: usageData.usage.expensesCount,
      limit: usageData.limits.maxExpenses,
      percentage: usageData.percentages.expenses,
    },
    {
      label: 'Documentos',
      icon: <FileText className="h-5 w-5" />,
      current: usageData.usage.documentsCount,
      limit: usageData.limits.maxDocuments,
      percentage: usageData.percentages.documents,
    },
    {
      label: 'Armazenamento',
      icon: <HardDrive className="h-5 w-5" />,
      current: usageData.usage.storageUsedGB,
      limit: usageData.limits.storageGB,
      percentage: usageData.percentages.storage,
      unit: 'GB',
      formatValue: (value) => value.toFixed(2),
    },
  ];

  const hasWarning = limitItems.some((item) => item.percentage >= 90);
  const hasError = limitItems.some((item) => item.percentage >= 100);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Limites do Plano
            </CardTitle>
            <CardDescription className="mt-1">
              Definidos pelo plano do seu contador
            </CardDescription>
          </div>
          {(hasError || hasWarning) && (
            <div className="flex items-center gap-2">
              {getStatusBadge(
                Math.max(...limitItems.map((item) => item.percentage))
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Você atingiu o limite de um ou mais recursos. Contate seu contador para fazer upgrade do plano.
            </AlertDescription>
          </Alert>
        )}

        {limitItems.map((item, index) => {
          const isUnlimited = item.limit === -1;
          const displayLimit = isUnlimited ? '' : item.limit;
          const displayCurrent = item.formatValue
            ? item.formatValue(item.current)
            : item.current;
          const displayLimitValue = isUnlimited
            ? 'Ilimitado'
            : item.formatValue
            ? item.formatValue(item.limit)
            : item.limit;

          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-muted-foreground">{item.icon}</div>
                  <p className="text-sm font-medium">{item.label}</p>
                </div>
                {!isUnlimited && item.percentage >= 90 && getStatusBadge(item.percentage)}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {displayCurrent} de {displayLimitValue} {item.unit || ''}
                  </span>
                  {!isUnlimited && (
                    <span
                      className={`font-medium ${
                        item.percentage >= 90
                          ? 'text-red-600 dark:text-red-400'
                          : item.percentage >= 70
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-green-600 dark:text-green-400'
                      }`}
                    >
                      {item.percentage}%
                    </span>
                  )}
                </div>

                {isUnlimited ? (
                  <div className="h-2 bg-muted rounded-full">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: '100%' }}
                    />
                  </div>
                ) : (
                  <Progress
                    value={Math.min(item.percentage, 100)}
                    className={`h-2 ${
                      item.percentage >= 90
                        ? '[&>div]:bg-red-500'
                        : item.percentage >= 70
                        ? '[&>div]:bg-yellow-500'
                        : '[&>div]:bg-green-500'
                    }`}
                  />
                )}
              </div>

              {item.percentage >= 100 && (
                <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Limite atingido. Contate seu contador para upgrade.
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
