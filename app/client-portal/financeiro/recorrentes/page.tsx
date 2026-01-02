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
  Repeat,
  SortAsc,
  SortDesc,
  X,
  Plus,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  RecurringPaymentCard,
  RecurringPayment,
} from '@/components/financial/RecurringPaymentCard';
import { AddRecurringModal } from '@/components/financial/AddRecurringModal';
import { PayRecurringModal } from '@/components/financial/PayRecurringModal';

interface RecurringResponse {
  data: RecurringPayment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  summary: {
    activeMonthlyCost: number;
  };
}

const categoryOptions = [
  { value: 'ALL', label: 'Todas as categorias' },
  { value: 'SUBSCRIPTION', label: 'Assinaturas' },
  { value: 'HOUSING', label: 'Moradia' },
  { value: 'UTILITIES', label: 'Utilidades' },
  { value: 'INSURANCE', label: 'Seguros' },
  { value: 'EDUCATION', label: 'Educação' },
  { value: 'HEALTH', label: 'Saúde' },
  { value: 'TRANSPORT', label: 'Transporte' },
  { value: 'OTHER_EXPENSE', label: 'Outros' },
];

const frequencyOptions = [
  { value: 'ALL', label: 'Todas as frequências' },
  { value: 'MONTHLY', label: 'Mensal' },
  { value: 'QUARTERLY', label: 'Trimestral' },
  { value: 'SEMIANNUAL', label: 'Semestral' },
  { value: 'YEARLY', label: 'Anual' },
];

const sortOptions = [
  { value: 'nextDueDate', label: 'Próximo vencimento' },
  { value: 'title', label: 'Título' },
  { value: 'amount', label: 'Valor' },
  { value: 'createdAt', label: 'Data de criação' },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export default function RecurringPaymentsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [payments, setPayments] = useState<RecurringPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('true');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [frequencyFilter, setFrequencyFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('nextDueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);
  const [monthlyCost, setMonthlyCost] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<RecurringPayment | null>(
    null
  );
  const [deletingPayment, setDeletingPayment] = useState<RecurringPayment | null>(
    null
  );
  const [payingPayment, setPayingPayment] = useState<RecurringPayment | null>(
    null
  );
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
    fetchPayments();
  }, [
    search,
    activeFilter,
    categoryFilter,
    frequencyFilter,
    sortBy,
    sortOrder,
    currentPage,
  ]);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      if (search) params.append('search', search);
      if (activeFilter !== 'ALL') params.append('isActive', activeFilter);
      if (categoryFilter && categoryFilter !== 'ALL')
        params.append('category', categoryFilter);
      if (frequencyFilter && frequencyFilter !== 'ALL')
        params.append('frequency', frequencyFilter);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/financial/recurring?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar pagamentos recorrentes');
      }

      const data: RecurringResponse = await response.json();
      setPayments(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotalPayments(data.pagination.total);
      setMonthlyCost(data.summary.activeMonthlyCost);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar pagamentos recorrentes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (payment: RecurringPayment) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/financial/recurring/${payment.id}/toggle`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao alterar status');
      }

      toast.success(
        `Pagamento ${payment.isActive ? 'desativado' : 'ativado'} com sucesso!`
      );
      fetchPayments();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao alterar status');
    }
  };

  const handleEdit = (payment: RecurringPayment) => {
    setEditingPayment(payment);
    setShowAddModal(true);
  };

  const handleDelete = async () => {
    if (!deletingPayment) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/financial/recurring/${deletingPayment.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao deletar pagamento recorrente');
      }

      toast.success('Pagamento recorrente deletado com sucesso!');
      setDeletingPayment(null);
      fetchPayments();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar pagamento recorrente');
    }
  };


  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const hasActiveFilters = () => {
    return (
      search !== '' ||
      activeFilter !== 'true' ||
      categoryFilter !== 'ALL' ||
      frequencyFilter !== 'ALL'
    );
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setActiveFilter('true');
    setCategoryFilter('ALL');
    setFrequencyFilter('ALL');
    setCurrentPage(1);
  };

  if (isLoading && payments.length === 0) {
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
            <h1 className="text-3xl font-bold">Pagamentos Recorrentes</h1>
            <p className="text-muted-foreground">
              Gerencie assinaturas e pagamentos fixos
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Recorrente
          </Button>
        </div>

        {/* Summary Card */}
        {totalPayments > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total de Recorrentes Ativos
                  </p>
                  <p className="text-2xl font-bold">
                    {payments.filter((p) => p.isActive).length}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">
                    Custo Mensal Estimado
                  </p>
                  <p className="text-2xl font-bold text-primary flex items-center gap-2">
                    <DollarSign className="h-6 w-6" />
                    {formatCurrency(monthlyCost)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid gap-4 md:grid-cols-5">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Active Filter */}
              <Select value={activeFilter} onValueChange={setActiveFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="true">Ativos</SelectItem>
                  <SelectItem value="false">Inativos</SelectItem>
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

              {/* Frequency Filter */}
              <Select
                value={frequencyFilter}
                onValueChange={(value) => {
                  setFrequencyFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Frequência" />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map((option) => (
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

        {/* Payments Grid */}
        {payments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Repeat className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhum pagamento recorrente encontrado
              </h3>
              <p className="text-muted-foreground mb-4">
                Adicione assinaturas, aluguéis e outros pagamentos fixos
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Recorrente
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {payments.map((payment) => (
                <RecurringPaymentCard
                  key={payment.id}
                  payment={payment}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                  onDelete={(p) => setDeletingPayment(p)}
                  onPay={(p) => setPayingPayment(p)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages} • {totalPayments}{' '}
                  recorrentes
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

      <AddRecurringModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingPayment(null);
        }}
        onSuccess={() => {
          setShowAddModal(false);
          setEditingPayment(null);
          fetchPayments();
        }}
        editingPayment={editingPayment}
      />

      <AlertDialog
        open={!!deletingPayment}
        onOpenChange={() => setDeletingPayment(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o pagamento recorrente "
              {deletingPayment?.title}"? Esta ação não pode ser desfeita.
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

      <PayRecurringModal
        isOpen={!!payingPayment}
        onClose={() => setPayingPayment(null)}
        onSuccess={() => {
          setPayingPayment(null);
          fetchPayments();
        }}
        payment={payingPayment}
      />
    </DashboardLayout>
  );
}
