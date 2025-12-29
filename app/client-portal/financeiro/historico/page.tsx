'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
  FileDown,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';

enum TimeRange {
  LAST_7_DAYS = 'LAST_7_DAYS',
  LAST_30_DAYS = 'LAST_30_DAYS',
  LAST_3_MONTHS = 'LAST_3_MONTHS',
  LAST_6_MONTHS = 'LAST_6_MONTHS',
  LAST_12_MONTHS = 'LAST_12_MONTHS',
  THIS_MONTH = 'THIS_MONTH',
  LAST_MONTH = 'LAST_MONTH',
  THIS_YEAR = 'THIS_YEAR',
  LAST_YEAR = 'LAST_YEAR',
}

enum GroupBy {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  YEAR = 'YEAR',
}

interface HistoryData {
  period: {
    start: string;
    end: string;
    days: number;
  };
  metrics: {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    savingsRate: number;
    transactionCount: number;
    averageIncome: number;
    averageExpense: number;
  };
  groupedData: Array<{
    period: string;
    income: number;
    expense: number;
    balance: number;
    count: number;
  }>;
  trends: {
    income: string;
    expense: string;
    balance: string;
  };
  comparison?: {
    previous: {
      period: {
        start: string;
        end: string;
      };
      metrics: {
        totalIncome: number;
        totalExpense: number;
        netBalance: number;
      };
    };
  };
}

interface CategoryData {
  period: {
    start: string;
    end: string;
  };
  categories: Array<{
    category: string;
    income: number;
    expense: number;
    total: number;
  }>;
}

interface TopTransactionsData {
  period: {
    start: string;
    end: string;
  };
  topExpenses: any[];
  topIncomes: any[];
}

const timeRangeLabels: Record<TimeRange, string> = {
  LAST_7_DAYS: 'Últimos 7 dias',
  LAST_30_DAYS: 'Últimos 30 dias',
  LAST_3_MONTHS: 'Últimos 3 meses',
  LAST_6_MONTHS: 'Últimos 6 meses',
  LAST_12_MONTHS: 'Últimos 12 meses',
  THIS_MONTH: 'Este mês',
  LAST_MONTH: 'Mês passado',
  THIS_YEAR: 'Este ano',
  LAST_YEAR: 'Ano passado',
};

const groupByLabels: Record<GroupBy, string> = {
  DAY: 'Dia',
  WEEK: 'Semana',
  MONTH: 'Mês',
  QUARTER: 'Trimestre',
  YEAR: 'Ano',
};

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function getTrendIcon(trend: string) {
  switch (trend) {
    case 'increasing':
    case 'improving':
      return <ArrowUp className="h-4 w-4 text-green-600" />;
    case 'decreasing':
    case 'declining':
      return <ArrowDown className="h-4 w-4 text-red-600" />;
    default:
      return <Minus className="h-4 w-4 text-gray-600" />;
  }
}

export default function HistoryPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>(TimeRange.LAST_30_DAYS);
  const [groupBy, setGroupBy] = useState<GroupBy>(GroupBy.DAY);
  const [includeComparison, setIncludeComparison] = useState(false);
  const [historyData, setHistoryData] = useState<HistoryData | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryData | null>(null);
  const [topTransactions, setTopTransactions] =
    useState<TopTransactionsData | null>(null);

  useEffect(() => {
    if (user && user.role !== 'CLIENT') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    fetchData();
  }, [timeRange, groupBy, includeComparison]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;

      const [historyRes, categoryRes, topRes] = await Promise.all([
        fetch(
          `${baseUrl}/financial/history?timeRange=${timeRange}&groupBy=${groupBy}&includeComparison=${includeComparison}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
        fetch(`${baseUrl}/financial/history/categories?timeRange=${timeRange}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(
          `${baseUrl}/financial/history/top-transactions?timeRange=${timeRange}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
      ]);

      if (!historyRes.ok || !categoryRes.ok || !topRes.ok) {
        throw new Error('Erro ao carregar dados do histórico');
      }

      const [history, categories, top] = await Promise.all([
        historyRes.json(),
        categoryRes.json(),
        topRes.json(),
      ]);

      setHistoryData(history);
      setCategoryData(categories);
      setTopTransactions(top);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar histórico');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;

      const url = `${baseUrl}/financial/history/export/pdf?timeRange=${timeRange}&groupBy=${groupBy}&includeComparison=${includeComparison}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Erro ao exportar PDF');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `historico-financeiro-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('PDF exportado com sucesso');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao exportar PDF');
    }
  };

  const handleExportExcel = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;

      const url = `${baseUrl}/financial/history/export/excel?timeRange=${timeRange}&groupBy=${groupBy}&includeComparison=${includeComparison}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Erro ao exportar Excel');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `historico-financeiro-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('Excel exportado com sucesso');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao exportar Excel');
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

  const metrics = historyData?.metrics;
  const trends = historyData?.trends;
  const comparison = historyData?.comparison;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Histórico Financeiro</h1>
            <p className="text-muted-foreground">
              Análise temporal das suas transações financeiras
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportPDF}>
              <FileDown className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button variant="outline" onClick={handleExportExcel}>
              <FileDown className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Período
                </label>
                <Select
                  value={timeRange}
                  onValueChange={(value) => setTimeRange(value as TimeRange)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(timeRangeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Agrupar por
                </label>
                <Select
                  value={groupBy}
                  onValueChange={(value) => setGroupBy(value as GroupBy)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(groupByLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant={includeComparison ? 'default' : 'outline'}
                  onClick={() => setIncludeComparison(!includeComparison)}
                  className="w-full"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {includeComparison ? 'Comparação Ativa' : 'Comparar Período'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Summary */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Receitas</p>
                  {trends && getTrendIcon(trends.income)}
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(metrics.totalIncome)}
                </p>
                {comparison && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Anterior: {formatCurrency(comparison.previous.metrics.totalIncome)}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Despesas</p>
                  {trends && getTrendIcon(trends.expense)}
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(metrics.totalExpense)}
                </p>
                {comparison && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Anterior: {formatCurrency(comparison.previous.metrics.totalExpense)}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Saldo Líquido</p>
                  {trends && getTrendIcon(trends.balance)}
                </div>
                <p
                  className={`text-2xl font-bold ${
                    metrics.netBalance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(metrics.netBalance)}
                </p>
                {comparison && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Anterior: {formatCurrency(comparison.previous.metrics.netBalance)}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Taxa de Economia</p>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold text-primary">
                  {metrics.savingsRate.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.transactionCount} transações
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Time-based Chart */}
        {historyData && historyData.groupedData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Evolução Temporal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={historyData.groupedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="period"
                    tickFormatter={formatDate}
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    tickFormatter={(value) =>
                      new Intl.NumberFormat('pt-BR', {
                        notation: 'compact',
                        style: 'currency',
                        currency: 'BRL',
                      }).format(value)
                    }
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    formatter={(value: any) => formatCurrency(value)}
                    labelFormatter={(label) => `Período: ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Receitas"
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Despesas"
                  />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Saldo"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {categoryData && categoryData.categories.length > 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Por Categoria (Despesas)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={categoryData.categories
                          .filter((c) => c.expense > 0)
                          .slice(0, 8)}
                        dataKey="expense"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry: any) =>
                          `${entry.category}: ${formatCurrency(entry.expense)}`
                        }
                      >
                        {categoryData.categories.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Ranking de Categorias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={categoryData.categories.slice(0, 8)}
                      layout="horizontal"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        type="number"
                        tickFormatter={(value) =>
                          new Intl.NumberFormat('pt-BR', {
                            notation: 'compact',
                            style: 'currency',
                            currency: 'BRL',
                          }).format(value)
                        }
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis
                        type="category"
                        dataKey="category"
                        width={100}
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip formatter={(value: any) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="income" fill="#10b981" name="Receitas" />
                      <Bar dataKey="expense" fill="#ef4444" name="Despesas" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Top Transactions */}
        {topTransactions && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  Maiores Despesas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topTransactions.topExpenses.slice(0, 5).map((txn, idx) => (
                    <div
                      key={txn.id}
                      className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium">{txn.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {txn.category}
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-red-600">
                        {formatCurrency(Number(txn.amount))}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Maiores Receitas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topTransactions.topIncomes.slice(0, 5).map((txn, idx) => (
                    <div
                      key={txn.id}
                      className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 text-xs font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium">{txn.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {txn.category}
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-green-600">
                        {formatCurrency(Number(txn.amount))}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
