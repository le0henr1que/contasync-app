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
  Receipt,
  SortAsc,
  SortDesc,
  Download,
  X,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface Expense {
  id: string;
  clientId: string;
  date: string;
  description: string;
  category: string;
  amount: string | number;
  receiptPath: string | null;
  fileName: string | null;
  createdAt: string;
  client: {
    id: string;
    companyName: string;
    user: {
      name: string;
      email: string;
    };
  };
}

interface ExpensesResponse {
  expenses: Expense[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  totalSum: string | number;
}

const categoryOptions = [
  { value: 'ALL', label: 'Todas as categorias' },
  { value: 'FOOD', label: 'Alimentação' },
  { value: 'TRANSPORT', label: 'Transporte' },
  { value: 'HEALTH', label: 'Saúde' },
  { value: 'EDUCATION', label: 'Educação' },
  { value: 'OTHER', label: 'Outros' },
];

const sortOptions = [
  { value: 'date', label: 'Data' },
  { value: 'amount', label: 'Valor' },
  { value: 'category', label: 'Categoria' },
  { value: 'createdAt', label: 'Data de criação' },
];

function formatCurrency(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
}

const categoryLabels: Record<string, string> = {
  FOOD: 'Alimentação',
  TRANSPORT: 'Transporte',
  HEALTH: 'Saúde',
  EDUCATION: 'Educação',
  OTHER: 'Outros',
};

export default function AccountantExpensesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSum, setTotalSum] = useState<number>(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const limit = 20;

  useEffect(() => {
    if (user && user.role !== 'ACCOUNTANT') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchExpenses();
  }, [search, clientFilter, categoryFilter, sortBy, sortOrder, currentPage]);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/clients', {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      if (search) params.append('search', search);
      if (clientFilter && clientFilter !== 'ALL') params.append('clientId', clientFilter);
      if (categoryFilter && categoryFilter !== 'ALL') params.append('category', categoryFilter);

      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/expenses?' + params, {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar despesas');
      }

      const data: ExpensesResponse = await response.json();
      setExpenses(data.expenses);
      setTotalPages(data.pagination.totalPages);
      setTotalExpenses(data.pagination.total);
      setTotalSum(typeof data.totalSum === 'string' ? parseFloat(data.totalSum) : data.totalSum);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar despesas');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const hasActiveFilters = () => {
    return (
      search !== '' ||
      clientFilter !== 'ALL' ||
      categoryFilter !== 'ALL'
    );
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setClientFilter('ALL');
    setCategoryFilter('ALL');
    setCurrentPage(1);
  };

  const handleDownloadReceipt = async (expense: Expense) => {
    if (!expense.receiptPath) {
      toast.error('Esta despesa não possui comprovante');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/expenses/' + expense.id + '/receipt', {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao baixar comprovante');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = expense.fileName || 'comprovante.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao baixar comprovante');
    }
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '10000', // Export all
        sortBy,
        sortOrder,
      });

      if (search) params.append('search', search);
      if (clientFilter && clientFilter !== 'ALL') params.append('clientId', clientFilter);
      if (categoryFilter && categoryFilter !== 'ALL') params.append('category', categoryFilter);

      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `http://localhost:3000/api/expenses/export/${format}?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao exportar despesas');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `despesas-clientes-${Date.now()}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Despesas exportadas com sucesso em ${format === 'excel' ? 'Excel' : 'PDF'}!`);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao exportar despesas');
    }
  };

  if (isLoading && expenses.length === 0) {
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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Despesas dos Clientes</h1>
            <p className="text-muted-foreground">
              Visualize e gerencie as despesas de todos os seus clientes
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exportar Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="h-4 w-4 mr-2" />
                Exportar PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {totalExpenses > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total de Despesas</p>
                  <p className="text-2xl font-bold">{totalExpenses}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Valor Total</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(totalSum)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-4">
            <div className="grid gap-4 md:grid-cols-5">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por descrição..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select
                value={clientFilter}
                onValueChange={(value) => {
                  setClientFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
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

            {hasActiveFilters() && (
              <div className="pt-4 border-t flex justify-end mt-4">
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

        {expenses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma despesa encontrada</h3>
              <p className="text-muted-foreground">
                Não há despesas registradas no momento
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="border rounded-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Data</th>
                      <th className="text-left p-4 font-medium">Cliente</th>
                      <th className="text-left p-4 font-medium">Descrição</th>
                      <th className="text-left p-4 font-medium">Categoria</th>
                      <th className="text-right p-4 font-medium">Valor</th>
                      <th className="text-center p-4 font-medium">Comprovante</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense) => (
                      <tr key={expense.id} className="border-t hover:bg-muted/30">
                        <td className="p-4">
                          {format(new Date(expense.date), 'dd/MM/yyyy', { locale: ptBR })}
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{expense.client.companyName || expense.client.user.name}</p>
                            <p className="text-sm text-muted-foreground">{expense.client.user.email}</p>
                          </div>
                        </td>
                        <td className="p-4">{expense.description}</td>
                        <td className="p-4">
                          <span className="text-sm">{categoryLabels[expense.category] || expense.category}</span>
                        </td>
                        <td className="p-4 text-right font-medium">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="p-4 text-center">
                          {expense.receiptPath ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadReceipt(expense)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

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
    </DashboardLayout>
  );
}
