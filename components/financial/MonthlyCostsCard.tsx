'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, Loader2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface MonthCost {
  month: string;
  monthLabel: string;
  monthFull: string;
  recurringCost: number;
  installmentCost: number;
  total: number;
  isCurrent: boolean;
}

interface MonthlyCostsData {
  currentMonth: MonthCost;
  projection: MonthCost[];
  summary: {
    averageMonthly: number;
    recurringPaymentsCount: number;
    activeInstallmentsCount: number;
    totalRecurringMonthly: number;
    totalInstallmentsThisMonth: number;
    totalThisMonth: number;
  };
}

export function MonthlyCostsCard() {
  const [data, setData] = useState<MonthlyCostsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showProjection, setShowProjection] = useState(false);

  useEffect(() => {
    fetchMonthlyCosts();
  }, []);

  const fetchMonthlyCosts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/financial/monthly-costs`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar custos mensais');
      }

      const result = await response.json();
      setData(result);
    } catch (error: any) {
      console.error('Error fetching monthly costs:', error);
      toast.error(error.message || 'Erro ao carregar custos mensais');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Custos Mensais</CardTitle>
          <CardDescription>Seus gastos fixos mensais</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Custos Mensais</CardTitle>
            <CardDescription>Seus gastos fixos mensais</CardDescription>
          </div>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Month */}
        <div className="space-y-4">
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-sm text-muted-foreground">Mês Atual</span>
              <Badge variant="secondary">{data.currentMonth.monthLabel}</Badge>
            </div>
            <div className="text-3xl font-bold">{formatCurrency(data.currentMonth.total)}</div>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Recorrentes</div>
              <div className="text-lg font-semibold">{formatCurrency(data.currentMonth.recurringCost)}</div>
              <div className="text-xs text-muted-foreground">
                {data.summary.recurringPaymentsCount} {data.summary.recurringPaymentsCount === 1 ? 'pagamento' : 'pagamentos'}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Parcelas</div>
              <div className="text-lg font-semibold">{formatCurrency(data.currentMonth.installmentCost)}</div>
              <div className="text-xs text-muted-foreground">
                {data.summary.activeInstallmentsCount} {data.summary.activeInstallmentsCount === 1 ? 'parcelamento' : 'parcelamentos'}
              </div>
            </div>
          </div>
        </div>

        {/* Average */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Média mensal (6 meses)</div>
              <div className="text-xl font-semibold">{formatCurrency(data.summary.averageMonthly)}</div>
            </div>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        {/* Projection Toggle */}
        <div>
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => setShowProjection(!showProjection)}
          >
            {showProjection ? 'Ocultar' : 'Ver'} projeção futura
            <ChevronRight className={`h-4 w-4 transition-transform ${showProjection ? 'rotate-90' : ''}`} />
          </Button>
        </div>

        {/* Future Projection */}
        {showProjection && (
          <div className="space-y-2 pt-4 border-t">
            <div className="text-sm font-medium mb-3">Próximos 6 meses</div>
            {data.projection.map((month) => (
              <div
                key={month.month}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  month.isCurrent ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {month.isCurrent && (
                    <Badge variant="default" className="text-xs">Atual</Badge>
                  )}
                  <div>
                    <div className="text-sm font-medium">{month.monthFull}</div>
                    <div className="text-xs text-muted-foreground">
                      Recorrentes: {formatCurrency(month.recurringCost)} •
                      Parcelas: {formatCurrency(month.installmentCost)}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-semibold">{formatCurrency(month.total)}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
