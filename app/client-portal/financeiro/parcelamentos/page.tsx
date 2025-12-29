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
  CreditCard,
  SortAsc,
  SortDesc,
  X,
  Plus,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  InstallmentCard,
  Installment,
  InstallmentPayment,
} from '@/components/financial/InstallmentCard';
import { AddInstallmentModal } from '@/components/financial/AddInstallmentModal';
import { PayInstallmentModal } from '@/components/financial/PayInstallmentModal';

interface InstallmentsResponse {
  data: Installment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  summary: {
    totalRemainingAmount: number;
    totalUpcomingPayments: number;
    activeInstallments: number;
  };
}

const categoryOptions = [
  { value: 'ALL', label: 'Todas as categorias' },
  { value: 'ELECTRONICS', label: 'Eletrônicos' },
  { value: 'FURNITURE', label: 'Móveis' },
  { value: 'EDUCATION', label: 'Educação' },
  { value: 'HEALTH', label: 'Saúde' },
  { value: 'TRANSPORT', label: 'Transporte' },
  { value: 'SERVICES', label: 'Serviços' },
  { value: 'SHOPPING', label: 'Compras' },
  { value: 'OTHER_EXPENSE', label: 'Outros' },
];

const statusOptions = [
  { value: 'ALL', label: 'Todos os status' },
  { value: 'ACTIVE', label: 'Ativos' },
  { value: 'COMPLETED', label: 'Completos' },
  { value: 'CANCELED', label: 'Cancelados' },
];

const sortOptions = [
  { value: 'createdAt', label: 'Data de criação' },
  { value: 'totalAmount', label: 'Valor total' },
  { value: 'title', label: 'Título' },
  { value: 'firstDueDate', label: 'Primeiro vencimento' },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export default function InstallmentsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInstallments, setTotalInstallments] = useState(0);
  const [summary, setSummary] = useState({
    totalRemainingAmount: 0,
    totalUpcomingPayments: 0,
    activeInstallments: 0,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [editingInstallment, setEditingInstallment] =
    useState<Installment | null>(null);
  const [deletingInstallment, setDeletingInstallment] =
    useState<Installment | null>(null);
  const [cancelingInstallment, setCancelingInstallment] =
    useState<Installment | null>(null);
  const [payingPayment, setPayingPayment] = useState<InstallmentPayment | null>(
    null,
  );
  const [paymentInstallmentTitle, setPaymentInstallmentTitle] = useState('');
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
    fetchInstallments();
  }, [search, statusFilter, categoryFilter, sortBy, sortOrder, currentPage]);

  const fetchInstallments = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      if (search) params.append('search', search);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (categoryFilter && categoryFilter !== 'ALL')
        params.append('category', categoryFilter);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/financial/installments?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar parcelamentos');
      }

      const data: InstallmentsResponse = await response.json();
      setInstallments(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotalInstallments(data.pagination.total);
      setSummary(data.summary);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar parcelamentos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (installment: Installment) => {
    setEditingInstallment(installment);
    setShowAddModal(true);
  };

  const handleDelete = async () => {
    if (!deletingInstallment) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/financial/installments/${deletingInstallment.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Erro ao deletar parcelamento');
      }

      toast.success('Parcelamento deletado com sucesso!');
      setDeletingInstallment(null);
      fetchInstallments();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar parcelamento');
    }
  };

  const handleCancel = async () => {
    if (!cancelingInstallment) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/financial/installments/${cancelingInstallment.id}/cancel`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao cancelar parcelamento');
      }

      toast.success('Parcelamento cancelado com sucesso!');
      setCancelingInstallment(null);
      fetchInstallments();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cancelar parcelamento');
    }
  };

  const handlePay = (payment: InstallmentPayment) => {
    const installment = installments.find((i) =>
      (i.payments || []).some((p) => p.id === payment.id),
    );
    setPaymentInstallmentTitle(installment?.title || '');
    setPayingPayment(payment);
    setShowPayModal(true);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const hasActiveFilters = () => {
    return (
      search !== '' || statusFilter !== 'ACTIVE' || categoryFilter !== 'ALL'
    );
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setStatusFilter('ACTIVE');
    setCategoryFilter('ALL');
    setCurrentPage(1);
  };

  if (isLoading && installments.length === 0) {
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
            <h1 className="text-3xl font-bold">Parcelamentos</h1>
            <p className="text-muted-foreground">
              Gerencie compras parceladas e acompanhe pagamentos
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Parcelamento
          </Button>
        </div>

        {/* Summary Card */}
        {totalInstallments > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Parcelamentos Ativos
                  </p>
                  <p className="text-2xl font-bold flex items-center gap-2">
                    <CreditCard className="h-6 w-6 text-primary" />
                    {summary.activeInstallments}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Parcelas Pendentes
                  </p>
                  <p className="text-2xl font-bold flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                    {summary.totalUpcomingPayments}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">
                    Valor Total Restante
                  </p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center justify-end gap-2">
                    <DollarSign className="h-6 w-6" />
                    {formatCurrency(summary.totalRemainingAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid gap-4 md:grid-cols-4">
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

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
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

        {/* Installments Grid */}
        {installments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhum parcelamento encontrado
              </h3>
              <p className="text-muted-foreground mb-4">
                Adicione compras parceladas para acompanhar seus pagamentos
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Parcelamento
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {installments.map((installment) => (
                <InstallmentCard
                  key={installment.id}
                  installment={installment}
                  onEdit={handleEdit}
                  onDelete={(i) => setDeletingInstallment(i)}
                  onCancel={(i) => setCancelingInstallment(i)}
                  onPay={handlePay}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages} • {totalInstallments}{' '}
                  parcelamentos
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

      <AddInstallmentModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingInstallment(null);
        }}
        onSuccess={() => {
          setShowAddModal(false);
          setEditingInstallment(null);
          fetchInstallments();
        }}
        editingInstallment={editingInstallment}
      />

      <PayInstallmentModal
        isOpen={showPayModal}
        onClose={() => {
          setShowPayModal(false);
          setPayingPayment(null);
          setPaymentInstallmentTitle('');
        }}
        onSuccess={() => {
          setShowPayModal(false);
          setPayingPayment(null);
          setPaymentInstallmentTitle('');
          fetchInstallments();
        }}
        payment={payingPayment}
        installmentTitle={paymentInstallmentTitle}
      />

      <AlertDialog
        open={!!deletingInstallment}
        onOpenChange={() => setDeletingInstallment(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o parcelamento "
              {deletingInstallment?.title}"? Esta ação não pode ser desfeita.
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

      <AlertDialog
        open={!!cancelingInstallment}
        onOpenChange={() => setCancelingInstallment(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar cancelamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar o parcelamento "
              {cancelingInstallment?.title}"? O status será alterado para
              CANCELADO.
              {cancelingInstallment &&
                cancelingInstallment.paidCount > 0 &&
                ' Pagamentos já realizados não serão afetados.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel}>
              Cancelar Parcelamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
