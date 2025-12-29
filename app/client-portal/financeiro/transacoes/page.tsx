'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import {
  Search,
  Loader2,
  TrendingUp,
  TrendingDown,
  Wallet,
  SortAsc,
  SortDesc,
  X,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  TransactionCard,
  Transaction,
  TransactionType,
  TransactionCategory,
} from '@/components/financial/TransactionCard';
import { AddTransactionModal } from '@/components/financial/AddTransactionModal';

interface TransactionsResponse {
  data: Transaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
  };
}

const typeOptions = [
  { value: 'ALL', label: 'Todas' },
  { value: 'INCOME', label: 'Receitas' },
  { value: 'EXPENSE', label: 'Despesas' },
];

const categoryOptions = [
  { value: 'ALL', label: 'Todas as categorias' },
  // Income
  { value: 'SALARY', label: 'Salário' },
  { value: 'FREELANCE', label: 'Freelance' },
  { value: 'INVESTMENT_RETURN', label: 'Retorno de Investimentos' },
  { value: 'GIFT', label: 'Presente' },
  { value: 'OTHER_INCOME', label: 'Outras Receitas' },
  // Expense
  { value: 'FOOD', label: 'Alimentação' },
  { value: 'TRANSPORT', label: 'Transporte' },
  { value: 'HEALTH', label: 'Saúde' },
  { value: 'EDUCATION', label: 'Educação' },
  { value: 'HOUSING', label: 'Moradia' },
  { value: 'UTILITIES', label: 'Utilidades' },
  { value: 'ENTERTAINMENT', label: 'Lazer' },
  { value: 'SHOPPING', label: 'Compras' },
  { value: 'SUBSCRIPTION', label: 'Assinaturas' },
  { value: 'INSURANCE', label: 'Seguros' },
  { value: 'INVESTMENT', label: 'Investimentos' },
  { value: 'OTHER_EXPENSE', label: 'Outras Despesas' },
];

const sortOptions = [
  { value: 'date', label: 'Data' },
  { value: 'amount', label: 'Valor' },
  { value: 'description', label: 'Descrição' },
  { value: 'createdAt', label: 'Data de criação' },
];

function formatCurrency(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
}

export default function TransactionsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const limit = 20;

  // Redirect if not client
  useEffect(() => {
    if (user && user.role !== 'CLIENT') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchTransactions();
  }, [search, typeFilter, categoryFilter, sortBy, sortOrder, currentPage]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      if (search) params.append('search', search);
      if (typeFilter && typeFilter !== 'ALL')
        params.append('type', typeFilter);
      if (categoryFilter && categoryFilter !== 'ALL')
        params.append('category', categoryFilter);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/financial/transactions?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar transações');
      }

      const data: TransactionsResponse = await response.json();
      setTransactions(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotalTransactions(data.pagination.total);
      setSummary(data.summary);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar transações');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const hasActiveFilters = () => {
    return (
      search !== '' || typeFilter !== 'ALL' || categoryFilter !== 'ALL'
    );
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setTypeFilter('ALL');
    setCategoryFilter('ALL');
    setCurrentPage(1);
  };

  if (isLoading && transactions.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Transações Financeiras</h1>
            <p className="text-muted-foreground">
              Gerencie suas receitas e despesas
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        </div>

        {/* Summary Cards */}
        {totalTransactions > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Total de Receitas
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(summary.totalIncome)}
                    </p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-green-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Total de Despesas
                    </p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(summary.totalExpense)}
                    </p>
                  </div>
                  <TrendingDown className="h-10 w-10 text-red-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Saldo</p>
                    <p
                      className={`text-2xl font-bold ${
                        summary.balance >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {formatCurrency(summary.balance)}
                    </p>
                  </div>
                  <Wallet className="h-10 w-10 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid gap-4 md:grid-cols-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por descrição..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Type Filter */}
              <Select
                value={typeFilter}
                onValueChange={(value) => {
                  setTypeFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select
                value={categoryFilter}
                onValueChange={(value) => {
                  setCategoryFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <div className="flex gap-2">
                <Select
                  value={sortBy}
                  onValueChange={(value) => {
                    setSortBy(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleSortOrder}
                  title={sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
                >
                  {sortOrder === 'asc' ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters() && (
              <div className="pt-4 border-t flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Limpar filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction Grid */}
        {transactions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhuma transação encontrada
              </h3>
              <p className="text-muted-foreground mb-4">
                Comece adicionando sua primeira transação
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Transação
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Grid Layout - 1 column on mobile, 2 on tablet, 3 on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {transactions.map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages} • {totalTransactions}{' '}
                  transações
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1 || isLoading}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages || isLoading}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          fetchTransactions();
        }}
      />
    </DashboardLayout>
  );
}
