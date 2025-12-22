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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Loader2,
  Receipt,
  SortAsc,
  SortDesc,
  CalendarIcon,
  X,
  Eye,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  MoreVertical,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Payment } from '@/components/payments/PaymentCard';
import { AttachReceiptModal } from '@/components/payments/AttachReceiptModal';
import { PaymentDetailModal } from '@/components/payments/PaymentDetailModal';

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

type PaymentStatus = 'PENDING' | 'AWAITING_INVOICE' | 'READY_TO_PAY' | 'AWAITING_VALIDATION' | 'PAID' | 'OVERDUE' | 'CANCELLED';

const statusConfig: Record<
  PaymentStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: React.ReactNode;
  }
> = {
  PENDING: {
    label: 'Pendente',
    variant: 'secondary',
    icon: <Clock className="h-3 w-3" />,
  },
  AWAITING_INVOICE: {
    label: 'Aguardando NF',
    variant: 'outline',
    icon: <AlertCircle className="h-3 w-3" />,
  },
  READY_TO_PAY: {
    label: 'Pronto para Pagar',
    variant: 'default',
    icon: <CheckCircle className="h-3 w-3" />,
  },
  AWAITING_VALIDATION: {
    label: 'Aguardando Validação',
    variant: 'secondary',
    icon: <Clock className="h-3 w-3" />,
  },
  PAID: {
    label: 'Pago',
    variant: 'default',
    icon: <CheckCircle className="h-3 w-3" />,
  },
  OVERDUE: {
    label: 'Vencido',
    variant: 'destructive',
    icon: <AlertCircle className="h-3 w-3" />,
  },
  CANCELLED: {
    label: 'Cancelado',
    variant: 'outline',
    icon: <XCircle className="h-3 w-3" />,
  },
};

function formatCurrency(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
}

function isOverdue(payment: Payment): boolean {
  if (payment.status === 'PAID' || payment.status === 'CANCELLED') {
    return false;
  }
  const dueDate = new Date(payment.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDate < today;
}

export default function ClientPaymentsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [periodFilter, setPeriodFilter] = useState('THIS_MONTH');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSum, setTotalSum] = useState<number>(0);
  const [totalPayments, setTotalPayments] = useState(0);
  const [showAttachReceiptModal, setShowAttachReceiptModal] = useState(false);
  const [attachingReceiptPayment, setAttachingReceiptPayment] = useState<Payment | undefined>(undefined);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewingPayment, setViewingPayment] = useState<Payment | null>(null);
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
  }, [search, statusFilter, periodFilter, customStartDate, customEndDate, sortBy, sortOrder, currentPage]);

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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/me?${params}`, {
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

  const handleAttachReceipt = (payment: Payment) => {
    setAttachingReceiptPayment(payment);
    setShowAttachReceiptModal(true);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const hasActiveFilters = () => {
    return (
      search !== '' ||
      statusFilter !== 'ALL' ||
      periodFilter !== 'THIS_MONTH' ||
      customStartDate !== undefined ||
      customEndDate !== undefined
    );
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setStatusFilter('ALL');
    setPeriodFilter('THIS_MONTH');
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
            <h1 className="text-3xl font-bold">Meus Pagamentos</h1>
            <p className="text-muted-foreground">
              Visualize seus pagamentos e envie comprovantes
            </p>
          </div>
        </div>

        {/* AWAITING_INVOICE Alert */}
        {payments.some(p => p.status === 'AWAITING_INVOICE') && (
          <Alert className="border-blue-600/50 bg-blue-50 dark:bg-blue-950">
            <FileText className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900 dark:text-blue-100">
              <strong>Aguardando Nota Fiscal:</strong> Alguns pagamentos estão aguardando a contadora anexar a Nota Fiscal (NF).
              Após a NF ser anexada, você poderá enviar o comprovante de pagamento.
            </AlertDescription>
          </Alert>
        )}

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
              {/* Search */}
              <div className="relative md:col-span-5">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por referência..."
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="!h-10 pl-9"
                />
              </div>

              {/* Status Filter */}
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

              {/* Period Filter */}
              <div className="md:col-span-2">
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

              {/* Sort */}
              <div className="md:col-span-3 flex gap-2">
                <Select
                  value={sortBy}
                  onValueChange={(value) => {
                    setSortBy(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="!h-10 w-full">
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
                        className="!h-10 w-full justify-start text-left font-normal"
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
                        className="!h-10 w-full justify-start text-left font-normal"
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
              <p className="text-muted-foreground">
                Você não possui pagamentos no momento
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Comprovante</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => {
                    const status = statusConfig[payment.status as PaymentStatus];
                    const overdue = isOverdue(payment);
                    const canAttachReceipt =
                      payment.status === 'READY_TO_PAY' ||
                      payment.status === 'AWAITING_VALIDATION' ||
                      payment.status === 'OVERDUE';

                    return (
                      <TableRow
                        key={payment.id}
                        className="cursor-pointer transition-colors hover:bg-muted/50"
                        onClick={() => handleViewPayment(payment)}
                      >
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">{payment.title}</span>
                            {payment.reference && (
                              <span className="text-xs text-muted-foreground">
                                Ref: {payment.reference}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="font-semibold">
                            {formatCurrency(payment.amount)}
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            {overdue && (
                              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                            )}
                            <div className="flex flex-col gap-1">
                              <span className="text-sm">
                                {format(new Date(payment.dueDate), 'dd/MM/yyyy', {
                                  locale: ptBR,
                                })}
                              </span>
                              {payment.paidDate && (
                                <span className="text-xs text-muted-foreground">
                                  Pago em:{' '}
                                  {format(new Date(payment.paidDate), 'dd/MM/yyyy', {
                                    locale: ptBR,
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={overdue ? 'destructive' : status.variant}
                            className="flex w-fit items-center gap-1"
                          >
                            {overdue ? (
                              <>
                                <AlertCircle className="h-3 w-3" />
                                Vencido
                              </>
                            ) : (
                              <>
                                {status.icon}
                                {status.label}
                              </>
                            )}
                          </Badge>
                        </TableCell>

                        <TableCell onClick={(e) => e.stopPropagation()}>
                          {payment.receiptUrl ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-muted-foreground">Enviado</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>

                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
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
                              {canAttachReceipt && (
                                <DropdownMenuItem onClick={() => handleAttachReceipt(payment)}>
                                  <Upload className="mr-2 h-4 w-4" />
                                  Anexar Comprovante
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

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
        />
      )}

      <PaymentDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setViewingPayment(null);
        }}
        payment={viewingPayment}
        onEdit={() => {}} // Cliente não pode editar
        onDelete={() => {}} // Cliente não pode deletar
        showClientInfo={false} // Cliente não precisa ver info do cliente (é ele mesmo)
      />
    </DashboardLayout>
  );
}
