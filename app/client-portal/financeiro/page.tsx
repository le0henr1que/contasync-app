'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  RefreshCw,
  Plus,
  ArrowRight,
  Calendar,
  CreditCard,
  Target,
  Repeat,
} from 'lucide-react';
import { toast } from 'sonner';
import { AddTransactionModal } from '@/components/financial/AddTransactionModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardData {
  currentMonth: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionCount: number;
  };
  monthlyCost?: {
    recurringMonthly: number;
    installmentsThisMonth: number;
    total: number;
  };
  lastSixMonths: Array<{
    month: string;
    monthKey: string;
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionCount: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  recentTransactions: Array<any>;
  upcomingRecurring: Array<any>;
  pendingInstallments: Array<{
    installment: any;
    nextPayment: any;
  }>;
  activeGoals: Array<any>;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

const categoryLabels: Record<string, string> = {
  SALARY: 'Salário',
  FREELANCE: 'Freelance',
  INVESTMENT_RETURN: 'Investimentos',
  GIFT: 'Presente',
  OTHER_INCOME: 'Outras Receitas',
  FOOD: 'Alimentação',
  TRANSPORT: 'Transporte',
  HEALTH: 'Saúde',
  EDUCATION: 'Educação',
  HOUSING: 'Moradia',
  UTILITIES: 'Utilidades',
  ENTERTAINMENT: 'Lazer',
  SHOPPING: 'Compras',
  SUBSCRIPTION: 'Assinaturas',
  INSURANCE: 'Seguros',
  INVESTMENT: 'Investimentos',
  OTHER_EXPENSE: 'Outras Despesas',
};

export default function FinancialDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Redirect if not client
  useEffect(() => {
    if (user && user.role !== 'CLIENT') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/financial/analytics/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar dados do dashboard');
      }

      const dashboardData: DashboardData = await response.json();
      setData(dashboardData);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { currentMonth } = data;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Controle Financeiro</h1>
            <p className="text-muted-foreground">
              Visão geral das suas finanças
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={fetchDashboardData}
              title="Atualizar dados"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Transação
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Monthly Cost - Featured Card */}
          <Card className="lg:col-span-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Custo Fixo Mensal
                </p>
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <p className="text-4xl font-bold text-primary mb-1">
                {data.monthlyCost ? formatCurrency(data.monthlyCost.total) : formatCurrency(0)}
              </p>
              <p className="text-xs text-muted-foreground">
                Recorrentes + Parcelas do mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Receitas
                </p>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(currentMonth.totalIncome)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Despesas
                </p>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(currentMonth.totalExpense)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Saldo
                </p>
                <Wallet className="h-4 w-4 text-primary" />
              </div>
              <p
                className={`text-2xl font-bold ${
                  currentMonth.balance >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {formatCurrency(currentMonth.balance)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Category Distribution */}
        {data.categoryDistribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Despesas por Categoria (Este Mês)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.categoryDistribution.slice(0, 5).map((cat, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        {categoryLabels[cat.category] || cat.category}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(cat.amount)} ({cat.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Transactions & Upcoming Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Transações Recentes</CardTitle>
                <Link href="/client-portal/financeiro/transacoes">
                  <Button variant="ghost" size="sm">
                    Ver todas
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {data.recentTransactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma transação recente
                </p>
              ) : (
                <div className="space-y-3">
                  {data.recentTransactions.slice(0, 5).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {transaction.type === 'INCOME' ? (
                          <TrendingUp className="h-4 w-4 shrink-0 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 shrink-0 text-red-600" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(transaction.date), 'dd/MM/yyyy', {
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                      </div>
                      <p
                        className={`text-sm font-semibold ${
                          transaction.type === 'INCOME'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'INCOME' ? '+' : '-'}
                        {formatCurrency(Number(transaction.amount))}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Recurring & Installments */}
          <div className="space-y-6">
            {/* Upcoming Recurring */}
            {data.upcomingRecurring.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Repeat className="h-5 w-5" />
                    Pagamentos Recorrentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.upcomingRecurring.slice(0, 3).map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {payment.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(payment.nextDueDate), 'dd/MM/yyyy', {
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-red-600">
                          {formatCurrency(Number(payment.amount))}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pending Installments */}
            {data.pendingInstallments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Parcelas Pendentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.pendingInstallments.slice(0, 3).map((item) => (
                      <div
                        key={item.installment.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {item.installment.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.installment.paidCount}/{item.installment.installmentCount} pagas
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-red-600">
                          {formatCurrency(Number(item.nextPayment.amount))}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Goals */}
            {data.activeGoals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Metas Financeiras
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.activeGoals.slice(0, 3).map((goal) => {
                      const progress =
                        (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;
                      return (
                        <div key={goal.id}>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium">{goal.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {progress.toFixed(0)}%
                            </p>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatCurrency(Number(goal.currentAmount))} de{' '}
                            {formatCurrency(Number(goal.targetAmount))}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          fetchDashboardData();
        }}
      />
    </DashboardLayout>
  );
}
