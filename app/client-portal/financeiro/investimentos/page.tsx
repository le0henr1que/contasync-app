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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Search,
  Loader2,
  TrendingUp,
  SortAsc,
  SortDesc,
  X,
  Plus,
  DollarSign,
  Wallet,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  InvestmentCard,
  Investment,
} from '@/components/financial/InvestmentCard';
import { AddInvestmentModal } from '@/components/financial/AddInvestmentModal';
import { InvestmentTransactionModal } from '@/components/financial/InvestmentTransactionModal';

interface InvestmentsResponse {
  data: Investment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  summary: {
    totalInvestments: number;
    totalInvested: number;
    totalCurrentValue: number;
    totalProfitLoss: number;
    totalProfitLossPercentage: number;
    byType: Record<string, number>;
  };
}

const typeOptions = [
  { value: 'ALL', label: 'Todos os tipos' },
  { value: 'STOCKS', label: 'Ações' },
  { value: 'FUNDS', label: 'Fundos' },
  { value: 'FIXED_INCOME', label: 'Renda Fixa' },
  { value: 'CRYPTO', label: 'Cripto' },
  { value: 'REAL_ESTATE', label: 'FII' },
  { value: 'PENSION', label: 'Previdência' },
  { value: 'OTHER', label: 'Outros' },
];

const sortOptions = [
  { value: 'ticker', label: 'Ticker' },
  { value: 'name', label: 'Nome' },
  { value: 'totalValue', label: 'Valor Total' },
  { value: 'profitLoss', label: 'Lucro/Prejuízo' },
  { value: 'purchaseDate', label: 'Data de Compra' },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export default function InvestmentsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('purchaseDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInvestments, setTotalInvestments] = useState(0);
  const [summary, setSummary] = useState({
    totalInvestments: 0,
    totalInvested: 0,
    totalCurrentValue: 0,
    totalProfitLoss: 0,
    totalProfitLossPercentage: 0,
    byType: {} as Record<string, number>,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionType, setTransactionType] = useState<'BUY' | 'SELL' | 'DEPOSIT' | 'WITHDRAW'>('BUY');
  const [editingInvestment, setEditingInvestment] =
    useState<Investment | null>(null);
  const [deletingInvestment, setDeletingInvestment] =
    useState<Investment | null>(null);
  const [transactingInvestment, setTransactingInvestment] =
    useState<Investment | null>(null);
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
    fetchInvestments();
  }, [search, typeFilter, sortBy, sortOrder, currentPage]);

  const fetchInvestments = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      if (search) params.append('search', search);
      if (typeFilter !== 'ALL') params.append('type', typeFilter);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/financial/investments?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar investimentos');
      }

      const data: InvestmentsResponse = await response.json();
      setInvestments(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotalInvestments(data.pagination.total);
      setSummary(data.summary);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar investimentos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (investment: Investment) => {
    setEditingInvestment(investment);
    setShowAddModal(true);
  };

  const handleDelete = async () => {
    if (!deletingInvestment) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/financial/investments/${deletingInvestment.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Erro ao deletar investimento');
      }

      toast.success('Investimento deletado com sucesso!');
      setDeletingInvestment(null);
      fetchInvestments();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar investimento');
    }
  };

  const handleBuy = (investment: Investment) => {
    setTransactingInvestment(investment);
    setTransactionType('BUY');
    setShowTransactionModal(true);
  };

  const handleSell = (investment: Investment) => {
    setTransactingInvestment(investment);
    setTransactionType('SELL');
    setShowTransactionModal(true);
  };

  const handleDeposit = (investment: Investment) => {
    setTransactingInvestment(investment);
    setTransactionType('DEPOSIT');
    setShowTransactionModal(true);
  };

  const handleWithdraw = (investment: Investment) => {
    setTransactingInvestment(investment);
    setTransactionType('WITHDRAW');
    setShowTransactionModal(true);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const hasActiveFilters = () => {
    return search !== '' || typeFilter !== 'ALL';
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setTypeFilter('ALL');
    setCurrentPage(1);
  };

  const isProfitable = summary.totalProfitLoss >= 0;

  if (isLoading && investments.length === 0) {
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
            <h1 className="text-3xl font-bold">Carteira de Investimentos</h1>
            <p className="text-muted-foreground">
              Acompanhe seus investimentos e rentabilidade
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Investimento
          </Button>
        </div>

        {/* Summary Cards */}
        {totalInvestments > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Total Investido
                    </p>
                    <p className="text-2xl font-bold flex items-center gap-2">
                      <Wallet className="h-6 w-6 text-primary" />
                      {formatCurrency(summary.totalInvested)}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-muted-foreground opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Valor Atual
                    </p>
                    <p className="text-2xl font-bold flex items-center gap-2">
                      <DollarSign className="h-6 w-6 text-blue-600" />
                      {formatCurrency(summary.totalCurrentValue)}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-muted-foreground opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className={isProfitable ? 'border-green-500/50' : 'border-red-500/50'}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Lucro/Prejuízo
                    </p>
                    <p className={`text-2xl font-bold flex items-center gap-2 ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                      <TrendingUp className="h-6 w-6" />
                      {isProfitable ? '+' : ''}
                      {formatCurrency(summary.totalProfitLoss)}
                    </p>
                    <p className={`text-sm ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                      {isProfitable ? '+' : ''}
                      {summary.totalProfitLossPercentage.toFixed(2)}%
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-muted-foreground opacity-20" />
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
                  placeholder="Buscar ticker, nome..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
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

              {/* Sort */}
              <div className="flex gap-2 md:col-span-2">
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

        {/* Investments Grid */}
        {investments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhum investimento encontrado
              </h3>
              <p className="text-muted-foreground mb-4">
                Comece a construir sua carteira de investimentos
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Investimento
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {investments.map((investment) => (
                <InvestmentCard
                  key={investment.id}
                  investment={investment}
                  onEdit={handleEdit}
                  onDelete={(i) => setDeletingInvestment(i)}
                  onBuy={handleBuy}
                  onSell={handleSell}
                  onDeposit={handleDeposit}
                  onWithdraw={handleWithdraw}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages} • {totalInvestments}{' '}
                  investimentos
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

      <AddInvestmentModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingInvestment(null);
        }}
        onSuccess={() => {
          setShowAddModal(false);
          setEditingInvestment(null);
          fetchInvestments();
        }}
        editingInvestment={editingInvestment}
      />

      <InvestmentTransactionModal
        isOpen={showTransactionModal}
        onClose={() => {
          setShowTransactionModal(false);
          setTransactingInvestment(null);
        }}
        onSuccess={() => {
          setShowTransactionModal(false);
          setTransactingInvestment(null);
          fetchInvestments();
        }}
        investment={transactingInvestment}
        transactionType={transactionType}
      />

      <AlertDialog
        open={!!deletingInvestment}
        onOpenChange={() => setDeletingInvestment(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o investimento "
              {deletingInvestment?.ticker} - {deletingInvestment?.name}"? Esta
              ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
