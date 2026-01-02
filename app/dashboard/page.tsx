'use client';

import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { WelcomeModal } from '@/components/onboarding/welcome-modal';
import { ClientUploadDocumentModal } from '@/components/documents/ClientUploadDocumentModal';
import { TrialBanner } from '@/components/dashboard/TrialBanner';
import { MonthlyCostsCard } from '@/components/financial/MonthlyCostsCard';
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Plus,
  Upload,
  AlertCircle,
  Calendar,
  Loader2,
  Eye,
  Receipt,
  CreditCard,
  Bell,
  Mail,
  Crown,
  Clock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DocumentRequest {
  id: string;
  type: string;
  description: string;
  dueDate: string;
  createdAt: string;
}

const documentTypeLabels: Record<string, string> = {
  NFE: 'NF-e',
  NFSE: 'NFS-e',
  RECEIPT: 'Recibo',
  CONTRACT: 'Contrato',
  BANK_STATEMENT: 'Comprovante Bancário',
  STATEMENT: 'Declaração',
  OTHER: 'Outros',
};

interface PaymentStatistics {
  count: {
    total: number;
    paid: number;
    pending: number;
    overdue: number;
    canceled: number;
  };
  amount: {
    total: number;
    paid: number;
    pending: number;
    overdue: number;
  };
}

interface ClientStatistics {
  documents: {
    total: number;
    pendingRequests: number;
  };
  payments: {
    total: number;
    paid: number;
    pending: number;
    overdue: number;
    withoutReceipt: number;
  };
  pendingItems: number;
}

export default function DashboardPage() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(false);
  const [documentRequests, setDocumentRequests] = useState<DocumentRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [paymentStats, setPaymentStats] = useState<PaymentStatistics | null>(null);
  const [clientStats, setClientStats] = useState<ClientStatistics | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DocumentRequest | null>(null);
  const [monthlyCost, setMonthlyCost] = useState<number | null>(null);

  const fetchPaymentStatistics = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/statistics`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar estatísticas');
      }

      const data = await response.json();
      setPaymentStats(data);
    } catch (error: any) {
      console.error('Error fetching payment statistics:', error);
    }
  }, []);

  const fetchClientStatistics = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/me/statistics`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar estatísticas');
      }

      const data = await response.json();
      setClientStats(data);
    } catch (error: any) {
      console.error('Error fetching client statistics:', error);
    }
  }, []);

  const fetchMonthlyCost = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/financial/monthly-costs?monthsAhead=1`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar custo mensal');
      }

      const data = await response.json();
      setMonthlyCost(data.currentMonth.total);
    } catch (error: any) {
      console.error('Error fetching monthly cost:', error);
    }
  }, []);

  const fetchDocumentRequests = useCallback(async () => {
    try {
      setIsLoadingRequests(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/document-requests`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar solicitações');
      }

      const data = await response.json();
      setDocumentRequests(data);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar solicitações');
    } finally {
      setIsLoadingRequests(false);
    }
  }, []);

  const handleUploadDocument = (request: DocumentRequest) => {
    setSelectedRequest(request);
    setShowUploadModal(true);
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setSelectedRequest(null);
  };

  const handleUploadSuccess = useCallback(() => {
    fetchDocumentRequests();
  }, [fetchDocumentRequests]);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
  };

  useEffect(() => {
    // Don't redirect while loading auth state
    if (isLoading) return;

    if (!user) {
      router.push('/login');
    } else if (user.role === 'ACCOUNTANT' && !user.onboardingCompleted) {
      setShowWelcome(true);
    } else if (user.role === 'ACCOUNTANT') {
      fetchPaymentStatistics();
    } else if (user.role === 'CLIENT') {
      fetchClientStatistics();
      fetchDocumentRequests();
      fetchMonthlyCost();
    }
  }, [user, isLoading, fetchPaymentStatistics, fetchClientStatistics, fetchDocumentRequests, fetchMonthlyCost, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Client Dashboard View
  if (user.role === 'CLIENT') {
    return (
      <>
        <ClientUploadDocumentModal
          isOpen={showUploadModal}
          onClose={handleCloseUploadModal}
          onSuccess={handleUploadSuccess}
          request={selectedRequest}
        />

        <DashboardLayout>
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold">Portal do Cliente</h1>
              <p className="text-muted-foreground mt-1">
                Bem-vindo, {user.name}! Acompanhe seus documentos e pagamentos
              </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {/* Monthly Cost - Featured Card */}
              <Card className="lg:col-span-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Custo Fixo Mensal</CardTitle>
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  {monthlyCost !== null ? (
                    <>
                      <div className="text-4xl font-bold text-primary">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(monthlyCost)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Recorrentes + Parcelas do mês
                      </p>
                    </>
                  ) : (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Meus Documentos</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="text-2xl font-bold">{clientStats?.documents.total ?? 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {clientStats?.documents.pendingRequests ?? 0} solicitações pendentes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Pagamentos Atrasados</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">{clientStats?.payments.overdue ?? 0}</div>
                    {clientStats && clientStats.payments.overdue > 0 && (
                      <Badge variant="destructive">Atenção</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {clientStats && clientStats.payments.overdue > 0
                      ? 'Verifique seus pagamentos'
                      : 'Nenhum pagamento atrasado'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Itens Pendentes</CardTitle>
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">{clientStats?.pendingItems ?? 0}</div>
                    {clientStats && clientStats.pendingItems > 0 && (
                      <Badge variant="secondary">Atenção</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Documentos e recibos pendentes
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Costs Card */}
            <MonthlyCostsCard />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>Acesse funções comuns rapidamente</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-12">
                  <div className="md:col-span-6">
                    <Button
                      variant="outline"
                      className="justify-start gap-3 h-auto py-4 w-full"
                      onClick={() => router.push('/dashboard/documents')}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Eye className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-medium">Ver Documentos</div>
                        <div className="text-xs text-muted-foreground">
                          Acessar meus documentos
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>

                  <div className="md:col-span-6">
                    <Button
                      variant="outline"
                      className="justify-start gap-3 h-auto py-4 w-full"
                      onClick={() => router.push('/dashboard/payments')}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-medium">Ver Pagamentos</div>
                        <div className="text-xs text-muted-foreground">
                          Consultar pagamentos
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>

                  <div className="md:col-span-6">
                    <Button
                      variant="outline"
                      className="justify-start gap-3 h-auto py-4 w-full"
                      onClick={() => setShowUploadModal(true)}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Upload className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-medium">Enviar Documento</div>
                        <div className="text-xs text-muted-foreground">
                          Upload de arquivos
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>

                  <div className="md:col-span-6">
                    <Button
                      variant="outline"
                      className="justify-start gap-3 h-auto py-4 w-full"
                      onClick={() => toast.info('Funcionalidade em breve')}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-medium">Contatar Contador</div>
                        <div className="text-xs text-muted-foreground">
                          Enviar mensagem
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Document Requests */}
            {documentRequests.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Documentos Solicitados</CardTitle>
                      <CardDescription>Seu contador solicitou os seguintes documentos</CardDescription>
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {documentRequests.length} {documentRequests.length === 1 ? 'pendente' : 'pendentes'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {isLoadingRequests ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Prazo</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documentRequests.map((request) => {
                          const isOverdue = new Date(request.dueDate) < new Date();
                          const daysUntilDue = differenceInDays(new Date(request.dueDate), new Date());

                          return (
                            <TableRow key={request.id}>
                              <TableCell>
                                <FileText className="h-5 w-5 text-muted-foreground" />
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {documentTypeLabels[request.type] || request.type}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm">{request.description}</span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {isOverdue && (
                                    <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                                  )}
                                  <div className="flex flex-col gap-1">
                                    <span className="text-sm">
                                      {format(new Date(request.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
                                    </span>
                                    {isOverdue ? (
                                      <Badge variant="destructive" className="w-fit">
                                        Atrasado
                                      </Badge>
                                    ) : daysUntilDue <= 3 && (
                                      <span className="text-xs text-muted-foreground">
                                        {daysUntilDue} {daysUntilDue === 1 ? 'dia' : 'dias'} restante{daysUntilDue !== 1 ? 's' : ''}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  onClick={() => handleUploadDocument(request)}
                                  size="sm"
                                  className="gap-2"
                                >
                                  <Upload className="h-4 w-4" />
                                  Enviar
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Payments Without Receipt */}
            {clientStats && clientStats.payments.withoutReceipt > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Pagamentos Sem Comprovante</CardTitle>
                      <CardDescription>Envie os comprovantes de pagamento para manter tudo em dia</CardDescription>
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <Receipt className="h-3 w-3" />
                      {clientStats.payments.withoutReceipt} {clientStats.payments.withoutReceipt === 1 ? 'pendente' : 'pendentes'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Receipt className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        {clientStats.payments.withoutReceipt} {clientStats.payments.withoutReceipt === 1 ? 'pagamento precisa' : 'pagamentos precisam'} de comprovante
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Acesse a página de pagamentos para enviar os comprovantes
                      </p>
                      <Button
                        onClick={() => router.push('/dashboard/payments')}
                        className="gap-2"
                      >
                        <CreditCard className="h-4 w-4" />
                        Ver Pagamentos
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State - No pending items */}
            {documentRequests.length === 0 && (!clientStats || clientStats.payments.withoutReceipt === 0) && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Tudo em dia!</h3>
                    <p className="text-sm text-muted-foreground">
                      Você não tem nenhuma pendência no momento
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DashboardLayout>
      </>
    );
  }

  // Accountant Dashboard View (existing code)
  return (
    <>
      <WelcomeModal isOpen={showWelcome} onClose={handleCloseWelcome} />

      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                Bem-vindo, {user.name}! Visão geral da sua contabilidade
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Cliente
            </Button>
          </div>

          {/* Trial Status Banner */}
          {user.subscriptionStatus === 'TRIALING' && user.trialEndsAt && (
            <TrialBanner
              trialEndsAt={user.trialEndsAt}
              planName={user.subscription?.plan?.name}
            />
          )}

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Clientes
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  +3 novos este mês
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Documentos Pendentes
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">5</div>
                  <Badge variant="secondary">Atenção</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Aguardando análise
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pagamentos Atrasados
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">
                    {paymentStats?.count.overdue ?? 0}
                  </div>
                  {paymentStats && paymentStats.count.overdue > 0 && (
                    <Badge variant="destructive">Atenção</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {paymentStats?.amount.overdue
                    ? `Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(paymentStats.amount.overdue))}`
                    : 'Nenhum pagamento atrasado'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Documentos Este Mês
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">142</div>
                <p className="text-xs text-muted-foreground">
                  +12 desde a semana passada
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Quick Actions */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>Acesse funções comuns rapidamente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  <Button variant="outline" className="justify-start gap-2 h-auto py-4">
                    <Plus className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Adicionar Cliente</div>
                      <div className="text-xs text-muted-foreground">
                        Cadastrar novo cliente
                      </div>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start gap-2 h-auto py-4">
                    <Upload className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Enviar Documento</div>
                      <div className="text-xs text-muted-foreground">
                        Upload de arquivos
                      </div>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start gap-2 h-auto py-4">
                    <DollarSign className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Registrar Pagamento</div>
                      <div className="text-xs text-muted-foreground">
                        Lançar recebimento
                      </div>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start gap-2 h-auto py-4">
                    <FileText className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Solicitar Documento</div>
                      <div className="text-xs text-muted-foreground">
                        Requisitar de cliente
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>Últimas 5 atividades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">Novo cliente cadastrado</p>
                      <p className="text-xs text-muted-foreground">ABC Contabilidade</p>
                      <p className="text-xs text-muted-foreground">há 2 horas</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">Documento enviado</p>
                      <p className="text-xs text-muted-foreground">Contrato Social - XYZ Ltda</p>
                      <p className="text-xs text-muted-foreground">há 5 horas</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-yellow-500" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">Pagamento recebido</p>
                      <p className="text-xs text-muted-foreground">R$ 1.500,00 - Cliente DEF</p>
                      <p className="text-xs text-muted-foreground">há 1 dia</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">Documento recebido</p>
                      <p className="text-xs text-muted-foreground">RG - Cliente GHI</p>
                      <p className="text-xs text-muted-foreground">há 1 dia</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">Novo cliente cadastrado</p>
                      <p className="text-xs text-muted-foreground">JKL Comércio</p>
                      <p className="text-xs text-muted-foreground">há 2 dias</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Itens Pendentes</CardTitle>
                  <CardDescription>Requerem sua atenção</CardDescription>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  5 itens
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { doc: 'Contrato Social', client: 'ABC Contabilidade', days: 2 },
                  { doc: 'RG', client: 'Cliente XYZ', days: 1 },
                  { doc: 'Comprovante de Residência', client: 'DEF Ltda', days: 3 },
                  { doc: 'CNPJ', client: 'GHI S.A.', days: 1 },
                  { doc: 'Declaração IR', client: 'JKL Comércio', days: 5 },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{item.doc}</p>
                        <p className="text-xs text-muted-foreground">{item.client}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        há {item.days} {item.days === 1 ? 'dia' : 'dias'}
                      </span>
                      <Button size="sm" variant="outline">
                        Analisar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
}
