'use client';

import { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  Loader2,
  Receipt,
  SortAsc,
  SortDesc,
  CalendarIcon,
  X,
  Eye,
  Edit,
  Trash2,
  Download,
  MoreVertical,
  FileText,
  AlertCircle,
  CheckCircle,
  Bell,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Payment } from '@/components/payments/PaymentCard';
import { RecordPaymentModal } from '@/components/payments/RecordPaymentModal';
import { AttachReceiptModal } from '@/components/payments/AttachReceiptModal';
import { AttachDocumentModal } from '@/components/payments/AttachDocumentModal';
import { PaymentDetailModal } from '@/components/payments/PaymentDetailModal';
import { ConfirmDeletePaymentDialog } from '@/components/payments/ConfirmDeletePaymentDialog';

interface PaymentsResponse {
  payments: Payment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  totalSum: string | number;
}

const statusOptions = [
  { value: 'ALL', label: 'Todos os status' },
  { value: 'PENDING', label: 'Pendente' },
  { value: 'AWAITING_INVOICE', label: 'Aguardando NF' },
  { value: 'READY_TO_PAY', label: 'Pronto para Pagar' },
  { value: 'AWAITING_VALIDATION', label: 'Aguardando Validação' },
  { value: 'PAID', label: 'Pago' },
  { value: 'OVERDUE', label: 'Atrasado' },
  { value: 'CANCELED', label: 'Cancelado' },
];

const periodOptions = [
  { value: 'ALL', label: 'Todos os períodos' },
  { value: 'THIS_MONTH', label: 'Este mês' },
  { value: 'LAST_MONTH', label: 'Mês passado' },
  { value: 'THIS_YEAR', label: 'Este ano' },
  { value: 'CUSTOM', label: 'Personalizado' },
];

const sortOptions = [
  { value: 'createdAt', label: 'Data de criação' },
  { value: 'dueDate', label: 'Vencimento' },
  { value: 'paymentDate', label: 'Data de pagamento' },
  { value: 'amount', label: 'Valor' },
];

function formatCurrency(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
}

interface Client {
  id: string;
  companyName: string;
  user: {
    name: string;
  };
}

export default function PaymentsPage() {
  const { user } = useAuthStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(''); // Immediate input value
  const [search, setSearch] = useState(''); // Debounced search value
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [clientFilter, setClientFilter] = useState('ALL');
  const [periodFilter, setPeriodFilter] = useState('ALL');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSum, setTotalSum] = useState<number>(0);
  const [totalPayments, setTotalPayments] = useState(0);
  const [clients, setClients] = useState<Client[]>([]);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | undefined>(undefined);
  const [showAttachReceiptModal, setShowAttachReceiptModal] = useState(false);
  const [attachingReceiptPayment, setAttachingReceiptPayment] = useState<Payment | undefined>(undefined);
  const [showAttachDocumentModal, setShowAttachDocumentModal] = useState(false);
  const [attachingDocumentPayment, setAttachingDocumentPayment] = useState<Payment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewingPayment, setViewingPayment] = useState<Payment | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null);
  const limit = 20;

  const isClient = user?.role === 'CLIENT';

  // Fetch clients on mount - only for accountants
  useEffect(() => {
    if (isClient) return;

    const fetchClients = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setClients(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    fetchClients();
  }, [isClient]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1); // Reset to first page when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchPayments();
  }, [search, statusFilter, clientFilter, periodFilter, customStartDate, customEndDate, sortBy, sortOrder, currentPage]);

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
      if (statusFilter && statusFilter !== 'ALL') params.append('status', statusFilter);
      if (clientFilter && clientFilter !== 'ALL') params.append('clientId', clientFilter);

      // Handle period filter
      if (periodFilter === 'CUSTOM') {
        if (customStartDate) {
          params.append('startDate', customStartDate.toISOString().split('T')[0]);
        }
        if (customEndDate) {
          params.append('endDate', customEndDate.toISOString().split('T')[0]);
        }
      } else if (periodFilter && periodFilter !== 'ALL') {
        params.append('period', periodFilter);
      }

      // Use different endpoint for client vs accountant
      const endpoint = isClient
        ? `${process.env.NEXT_PUBLIC_API_URL}/payments/me?${params}`
        : `${process.env.NEXT_PUBLIC_API_URL}/payments?${params}`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar pagamentos');
      }

      const data: PaymentsResponse = await response.json();
      setPayments(data.payments);
      setTotalPages(data.pagination.totalPages);
      setTotalPayments(data.pagination.total);
      setTotalSum(typeof data.totalSum === 'string' ? parseFloat(data.totalSum) : data.totalSum);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar pagamentos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleViewPayment = (payment: Payment) => {
    setViewingPayment(payment);
    setShowDetailModal(true);
  };

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setShowRecordModal(true);
  };

  const handleAttachReceipt = (payment: Payment) => {
    setAttachingReceiptPayment(payment);
    setShowAttachReceiptModal(true);
  };

  const handleAttachDocument = (payment: Payment) => {
    setAttachingDocumentPayment(payment);
    setShowAttachDocumentModal(true);
  };

  const handleDeletePayment = (payment: Payment) => {
    setDeletingPayment(payment);
    setShowDeleteDialog(true);
  };

  const handleApprovePayment = async (payment: Payment) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/${payment.id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao aprovar pagamento');
      }

      toast.success('Pagamento aprovado com sucesso!');
      fetchPayments();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao aprovar pagamento');
    }
  };

  const handleChargePayment = async (payment: Payment) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/${payment.id}/charge`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao enviar cobrança');
      }

      const data = await response.json();
      toast.success(data.message || 'Cobrança enviada com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar cobrança');
    }
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const hasActiveFilters = () => {
    return (
      search !== '' ||
      statusFilter !== 'ALL' ||
      clientFilter !== 'ALL' ||
      periodFilter !== 'ALL' ||
      customStartDate !== undefined ||
      customEndDate !== undefined
    );
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setStatusFilter('ALL');
    setClientFilter('ALL');
    setPeriodFilter('ALL');
    setCustomStartDate(undefined);
    setCustomEndDate(undefined);
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
            <h1 className="text-3xl font-bold">
              {isClient ? 'Meus Pagamentos' : 'Pagamentos'}
            </h1>
            <p className="text-muted-foreground">
              {isClient
                ? 'Visualize seus pagamentos e envie comprovantes'
                : 'Gerencie pagamentos e cobranças dos clientes'}
            </p>
          </div>
          {!isClient && (
            <Button className="gap-2" onClick={() => setShowRecordModal(true)}>
              <Plus className="h-4 w-4" />
              Novo Pagamento
            </Button>
          )}
        </div>

        {/* Summary Card */}
        {totalPayments > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total de Pagamentos</p>
                  <p className="text-2xl font-bold">{totalPayments}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Valor Total</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(totalSum)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-12">
              {/* Search - 50% da largura (6/12 colunas) */}
              <div className="relative md:col-span-6">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por referência, cliente..."
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 !h-10"
                />
              </div>

              {/* Status Filter - 16.6% (2/12 colunas) */}
              <div className="md:col-span-2">
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="!h-10 w-full">
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
              </div>

              {/* Client Filter - Only for accountants - 16.6% (2/12 colunas) */}
              {!isClient && (
                <div className="md:col-span-2">
                  <Select
                    value={clientFilter}
                    onValueChange={(value) => {
                      setClientFilter(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="!h-10 w-full">
                      <SelectValue placeholder="Cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos os clientes</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.companyName || client.user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Period Filter - Ajusta baseado em isClient */}
              <div className={isClient ? "md:col-span-3" : "md:col-span-2"}>
                <Select
                  value={periodFilter}
                  onValueChange={(value) => {
                    setPeriodFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="!h-10 w-full">
                    <SelectValue placeholder="Período" />
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

              {/* Sort - Ajusta baseado em isClient */}
              <div className={isClient ? "md:col-span-3 flex gap-2" : "md:col-span-2 flex gap-2"}>
                <Select
                  value={sortBy}
                  onValueChange={(value) => {
                    setSortBy(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="!h-10 flex-1">
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
                  className="!h-10 !w-10 flex-shrink-0"
                >
                  {sortOrder === 'asc' ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Custom Date Range Picker */}
            {periodFilter === 'CUSTOM' && (
              <div className="flex gap-4 pt-4 border-t">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Data Inicial</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customStartDate ? (
                          format(customStartDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecione a data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={customStartDate}
                        onSelect={setCustomStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Data Final</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customEndDate ? (
                          format(customEndDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecione a data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={customEndDate}
                        onSelect={setCustomEndDate}
                        initialFocus
                        disabled={(date) =>
                          customStartDate ? date < customStartDate : false
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}

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

        {/* Payments Table */}
        {payments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum pagamento encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {isClient
                  ? 'Você não possui pagamentos no momento'
                  : 'Comece criando pagamentos para seus clientes'}
              </p>
              {!isClient && (
                <Button onClick={() => setShowRecordModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Pagamento
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Referência</TableHead>
                      {!isClient && <TableHead>Cliente</TableHead>}
                      <TableHead>Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => {
                      const statusConfig = {
                        PENDING: { label: 'Pendente', variant: 'secondary' as const },
                        AWAITING_INVOICE: { label: 'Aguardando NF', variant: 'secondary' as const },
                        READY_TO_PAY: { label: 'Pronto para Pagar', variant: 'default' as const },
                        AWAITING_VALIDATION: { label: 'Aguardando Validação', variant: 'secondary' as const },
                        PAID: { label: 'Pago', variant: 'default' as const },
                        OVERDUE: { label: 'Atrasado', variant: 'destructive' as const },
                        CANCELED: { label: 'Cancelado', variant: 'outline' as const },
                      };

                      return (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <Receipt className="h-5 w-5 text-muted-foreground" />
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{payment.title}</span>
                              {payment.notes && (
                                <span className="text-xs text-muted-foreground">
                                  {payment.notes}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          {!isClient && payment.client && (
                            <TableCell>
                              <span className="text-sm">
                                {payment.client.companyName || payment.client.user?.name || payment.client.name || '-'}
                              </span>
                            </TableCell>
                          )}
                          <TableCell>
                            <span className="font-medium">{formatCurrency(payment.amount)}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {payment.status === 'OVERDUE' && (
                                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                              )}
                              {payment.status === 'AWAITING_INVOICE' && (
                                <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                              )}
                              {payment.status === 'AWAITING_VALIDATION' && (
                                <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                              )}
                              <span className="text-sm text-muted-foreground">
                                {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusConfig[payment.status as keyof typeof statusConfig].variant}>
                              {statusConfig[payment.status as keyof typeof statusConfig].label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="sr-only">Ações</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewPayment(payment)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Visualizar
                                  </DropdownMenuItem>
                                  {!isClient && (
                                    <>
                                      {(payment.status === 'AWAITING_INVOICE' || payment.status === 'OVERDUE') && (
                                        <>
                                          <DropdownMenuItem
                                            onClick={() => handleAttachDocument(payment)}
                                            className="text-blue-600"
                                          >
                                            <FileText className="mr-2 h-4 w-4" />
                                            Anexar Nota Fiscal
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                        </>
                                      )}
                                      {payment.status === 'AWAITING_VALIDATION' && (
                                        <>
                                          <DropdownMenuItem
                                            onClick={() => handleApprovePayment(payment)}
                                            className="text-green-600"
                                          >
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Aprovar Pagamento
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                        </>
                                      )}
                                      {payment.clientId && payment.status !== 'PAID' && payment.status !== 'CANCELED' && (
                                        <>
                                          <DropdownMenuItem
                                            onClick={() => handleChargePayment(payment)}
                                            className="text-orange-600"
                                          >
                                            <Bell className="mr-2 h-4 w-4" />
                                            Cobrar Pagamento
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                        </>
                                      )}
                                      <DropdownMenuItem onClick={() => handleEditPayment(payment)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => handleDeletePayment(payment)}
                                        className="text-destructive"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Excluir
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {isClient && payment.status === 'PENDING' && (
                                    <DropdownMenuItem onClick={() => handleAttachReceipt(payment)}>
                                      <Download className="mr-2 h-4 w-4" />
                                      Anexar Comprovante
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || isLoading}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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

      <RecordPaymentModal
        isOpen={showRecordModal}
        onClose={() => {
          setShowRecordModal(false);
          setEditingPayment(undefined);
        }}
        onSuccess={() => {
          fetchPayments();
          setEditingPayment(undefined);
        }}
        payment={editingPayment}
      />

      {attachingReceiptPayment && (
        <AttachReceiptModal
          isOpen={showAttachReceiptModal}
          onClose={() => {
            setShowAttachReceiptModal(false);
            setAttachingReceiptPayment(undefined);
          }}
          onSuccess={() => {
            fetchPayments();
            setAttachingReceiptPayment(undefined);
          }}
          payment={attachingReceiptPayment}
          userRole="ACCOUNTANT"
        />
      )}

      <AttachDocumentModal
        isOpen={showAttachDocumentModal}
        onClose={() => {
          setShowAttachDocumentModal(false);
          setAttachingDocumentPayment(null);
        }}
        onSuccess={() => {
          fetchPayments();
          setAttachingDocumentPayment(null);
        }}
        payment={attachingDocumentPayment}
      />

      <PaymentDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setViewingPayment(null);
        }}
        payment={viewingPayment}
        onEdit={handleEditPayment}
        onDelete={handleDeletePayment}
        showClientInfo={true}
      />

      <ConfirmDeletePaymentDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeletingPayment(null);
        }}
        onSuccess={() => {
          fetchPayments();
          setDeletingPayment(null);
          // Close detail modal if open
          setShowDetailModal(false);
          setViewingPayment(null);
        }}
        payment={deletingPayment}
      />
    </DashboardLayout>
  );
}
