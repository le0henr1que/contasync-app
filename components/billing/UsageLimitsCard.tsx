'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, TrendingUp, Users, FileText, CreditCard, HardDrive } from 'lucide-react';

interface UsageData {
  limits: {
    maxClients: number;
    maxDocuments: number;
    maxPayments: number;
    storageGB: number;
  };
  usage: {
    clientsCount: number;
    documentsCount: number;
    paymentsCount: number;
    storageUsedGB: number;
  };
  percentages: {
    clients: number;
    documents: number;
    payments: number;
    storage: number;
  };
}

export function UsageLimitsCard() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/subscriptions/me/usage', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUsage(data);
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTextColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  const hasWarning = usage && Object.values(usage.percentages).some(p => p >= 80);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Uso & Limites</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usage) return null;

  const metrics = [
    {
      icon: Users,
      label: 'Clientes',
      used: usage.usage.clientsCount,
      max: usage.limits.maxClients,
      percentage: usage.percentages.clients,
    },
    {
      icon: FileText,
      label: 'Documentos',
      used: usage.usage.documentsCount,
      max: usage.limits.maxDocuments,
      percentage: usage.percentages.documents,
    },
    {
      icon: CreditCard,
      label: 'Pagamentos',
      used: usage.usage.paymentsCount,
      max: usage.limits.maxPayments,
      percentage: usage.percentages.payments,
    },
    {
      icon: HardDrive,
      label: 'Armazenamento',
      used: usage.usage.storageUsedGB,
      max: usage.limits.storageGB,
      percentage: usage.percentages.storage,
      unit: 'GB',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Uso & Limites</CardTitle>
            <CardDescription>Acompanhe seu uso em relação aos limites do plano</CardDescription>
          </div>
          {hasWarning && (
            <Button size="sm">
              <TrendingUp className="mr-2 h-4 w-4" />
              Fazer Upgrade
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Warning Alert */}
        {hasWarning && (
          <Alert className="border-yellow-500 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Atenção</AlertTitle>
            <AlertDescription className="text-yellow-700">
              Você está próximo de atingir o limite de um ou mais recursos (acima de 80%).
              Considere fazer upgrade do plano.
            </AlertDescription>
          </Alert>
        )}

        {/* Usage Metrics */}
        <div className="space-y-6">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            const percentage = Math.min(metric.percentage, 100);

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{metric.label}</span>
                      <span className={`text-sm font-semibold ${getTextColor(percentage)}`}>
                        {percentage}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {metric.used} {metric.unit || ''} de {metric.max} {metric.unit || ''} usados
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <Progress value={percentage} className="h-2" />
                  <div
                    className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor(percentage)}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Footer */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Os limites são redefinidos mensalmente. Para aumentar seus limites, faça upgrade do plano.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
