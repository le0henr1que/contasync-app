'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  Target,
  CreditCard,
  BarChart3,
  Percent,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface MetricsData {
  period: string;
  summary: {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    savingsRate: number;
    averageMonthlyIncome: number;
    averageMonthlyExpense: number;
    expenseToIncomeRatio: number;
  };
  monthlyTrends: Array<{
    month: string;
    monthFull: string;
    income: number;
    expense: number;
    balance: number;
    savingsRate: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    transactions: number;
  }>;
  goals: {
    total: number;
    totalTarget: number;
    totalCurrent: number;
    averageProgress: number;
    onTrack: number;
  };
  recurring: {
    total: number;
    monthlyTotal: number;
    byFrequency: Record<string, number>;
  };
  installments: {
    total: number;
    totalAmount: number;
    totalPaid: number;
    totalRemaining: number;
    upcomingThisMonth: number;
  };
  investments: {
    total: number;
    totalInvested: number;
    byType: Record<string, number>;
  };
  savings: {
    total: number;
    totalSaved: number;
    totalTarget: number;
  };
  healthIndicators: {
    savingsRate: {
      value: number;
      status: 'GOOD' | 'MODERATE' | 'LOW';
      message: string;
    };
    expenseToIncome: {
      value: number;
      status: 'GOOD' | 'MODERATE' | 'HIGH';
      message: string;
    };
    goalsProgress: {
      value: number;
      status: 'GOOD' | 'MODERATE' | 'LOW';
      message: string;
    };
  };
}

const periodOptions = [
  { value: '1M', label: 'Último Mês' },
  { value: '3M', label: 'Últimos 3 Meses' },
  { value: '6M', label: 'Últimos 6 Meses' },
  { value: '12M', label: 'Último Ano' },
];

const categoryLabels: Record<string, string> = {
  FOOD: 'Alimentação',
  TRANSPORT: 'Transporte',
  HOUSING: 'Moradia',
  UTILITIES: 'Utilidades',
  HEALTHCARE: 'Saúde',
  EDUCATION: 'Educação',
  ENTERTAINMENT: 'Entretenimento',
  SHOPPING: 'Compras',
  EQUIPMENT: 'Equipamentos',
  SERVICES: 'Serviços',
  OTHER: 'Outros',
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export default function MetricsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('6M');

  useEffect(() => {
    if (user && user.role !== 'CLIENT') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    fetchMetrics();
  }, [period]);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/financial/analytics/metrics?period=${period}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        },
      );

      if (!response.ok) throw new Error('Erro ao carregar métricas');

      const data = await response.json();
      setMetrics(data);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar métricas');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !metrics) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GOOD':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'MODERATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'GOOD':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'MODERATE':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Métricas Financeiras</h1>
            <p className="text-muted-foreground">
              Análise detalhada da sua saúde financeira
            </p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Receitas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(metrics.summary.totalIncome)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Média: {formatCurrency(metrics.summary.averageMonthlyIncome)}/mês
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Despesas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(metrics.summary.totalExpense)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Média: {formatCurrency(metrics.summary.averageMonthlyExpense)}/mês
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Saldo Líquido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-2xl font-bold ${metrics.summary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(metrics.summary.netBalance)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    No período
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Economia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {metrics.summary.savingsRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Do que você ganha
                  </p>
                </div>
                <PiggyBank className="h-8 w-8 text-muted-foreground opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Health Indicators */}
        <Card>
          <CardHeader>
            <CardTitle>Indicadores de Saúde Financeira</CardTitle>
            <CardDescription>
              Avaliação automática baseada nas suas finanças
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg border ${getStatusColor(metrics.healthIndicators.savingsRate.status)}`}>
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(metrics.healthIndicators.savingsRate.status)}
                  <h4 className="font-semibold">Taxa de Economia</h4>
                </div>
                <div className="text-2xl font-bold mb-1">
                  {metrics.healthIndicators.savingsRate.value.toFixed(1)}%
                </div>
                <p className="text-sm opacity-90">
                  {metrics.healthIndicators.savingsRate.message}
                </p>
              </div>

              <div className={`p-4 rounded-lg border ${getStatusColor(metrics.healthIndicators.expenseToIncome.status)}`}>
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(metrics.healthIndicators.expenseToIncome.status)}
                  <h4 className="font-semibold">Gastos vs Renda</h4>
                </div>
                <div className="text-2xl font-bold mb-1">
                  {metrics.healthIndicators.expenseToIncome.value.toFixed(1)}%
                </div>
                <p className="text-sm opacity-90">
                  {metrics.healthIndicators.expenseToIncome.message}
                </p>
              </div>

              <div className={`p-4 rounded-lg border ${getStatusColor(metrics.healthIndicators.goalsProgress.status)}`}>
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(metrics.healthIndicators.goalsProgress.status)}
                  <h4 className="font-semibold">Progresso das Metas</h4>
                </div>
                <div className="text-2xl font-bold mb-1">
                  {metrics.healthIndicators.goalsProgress.value.toFixed(1)}%
                </div>
                <p className="text-sm opacity-90">
                  {metrics.healthIndicators.goalsProgress.message}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Tendências Mensais</CardTitle>
            <CardDescription>
              Evolução das suas finanças nos últimos meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.monthlyTrends.map((month, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium">{month.month}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1 text-sm">
                      <span>Receita: {formatCurrency(month.income)}</span>
                      <span>Despesa: {formatCurrency(month.expense)}</span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600"
                        style={{ width: `${Math.min((month.income / Math.max(month.income, month.expense)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className={`w-32 text-right text-sm font-semibold ${month.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(month.balance)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Gastos por Categoria</CardTitle>
              <CardDescription>
                Distribuição das suas despesas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.categoryBreakdown.slice(0, 5).map((category, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        {categoryLabels[category.category] || category.category}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {category.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold w-28 text-right">
                        {formatCurrency(category.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo Rápido</CardTitle>
              <CardDescription>
                Visão geral de outros indicadores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Metas Ativas</span>
                  </div>
                  <span className="text-lg font-bold">{metrics.goals.total}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Recorrências</span>
                  </div>
                  <span className="text-lg font-bold">{metrics.recurring.total}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Parcelamentos</span>
                  </div>
                  <span className="text-lg font-bold">{metrics.installments.total}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <PiggyBank className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Investimentos</span>
                  </div>
                  <span className="text-lg font-bold">{metrics.investments.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Metas Financeiras</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total em Metas</span>
                <span className="font-semibold">{formatCurrency(metrics.goals.totalTarget)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Acumulado</span>
                <span className="font-semibold text-primary">{formatCurrency(metrics.goals.totalCurrent)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">No caminho</span>
                <span className="font-semibold">{metrics.goals.onTrack} de {metrics.goals.total}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pagamentos Recorrentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Mensal</span>
                <span className="font-semibold">{formatCurrency(metrics.recurring.monthlyTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ativos</span>
                <span className="font-semibold">{metrics.recurring.total}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Parcelamentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Parcelado</span>
                <span className="font-semibold">{formatCurrency(metrics.installments.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pago</span>
                <span className="font-semibold text-green-600">{formatCurrency(metrics.installments.totalPaid)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Restante</span>
                <span className="font-semibold text-orange-600">{formatCurrency(metrics.installments.totalRemaining)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
