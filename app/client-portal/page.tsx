'use client';

import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  Plus,
  Upload,
  Receipt,
  ArrowRight,
  Eye,
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';
import { AccountantPlanWidget } from './components/AccountantPlanWidget';

interface ClientProfile {
  id: string;
  expenseModuleEnabled: boolean;
  user: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    documents: number;
    payments: number;
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
  expenses?: {
    total: number;
    totalAmount: number;
  };
}

export default function ClientPortalPage() {
  const { user, isLoading: isAuthLoading } = useAuthStore();
  const router = useRouter();
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [statistics, setStatistics] = useState<ClientStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClientData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [profileRes, statsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/me/statistics`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }),
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setClientProfile(profileData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStatistics(statsData);
      }
    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Wait for auth to finish loading
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'CLIENT') {
      router.push('/dashboard');
      return;
    }

    fetchClientData();
  }, [user, isAuthLoading, router, fetchClientData]);

  if (isAuthLoading || isLoading || !user || !clientProfile || !statistics) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo de volta, {user.name}!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Documentos</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="text-2xl font-bold">{statistics.documents.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {statistics.documents.pendingRequests > 0 ? (
                  <>
                    {statistics.documents.pendingRequests} pendente{statistics.documents.pendingRequests > 1 ? 's' : ''}
                  </>
                ) : (
                  'Tudo em dia'
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Pagamentos</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="text-2xl font-bold">{statistics.payments.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {statistics.payments.paid} pagos, {statistics.payments.pending} pendentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Itens Pendentes</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{statistics.pendingItems}</div>
                {statistics.pendingItems > 0 && (
                  <Badge variant="secondary">Atenção</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Documentos e recibos pendentes
              </p>
            </CardContent>
          </Card>

          {clientProfile.expenseModuleEnabled && statistics.expenses && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Despesas</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="text-2xl font-bold">{statistics.expenses.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  R$ {(statistics.expenses.totalAmount / 100).toFixed(2)} total
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Accountant Plan Widget */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-1">
            <AccountantPlanWidget />
          </div>
        </div>

        {/* Pending Items Alert */}
        {statistics.pendingItems > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <CardTitle className="text-base">Atenção Necessária</CardTitle>
                  </div>
                  <CardDescription>
                    Você possui {statistics.pendingItems} item{statistics.pendingItems > 1 ? 'ns' : ''} que requer{statistics.pendingItems === 1 ? '' : 'em'} sua ação
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {statistics.pendingItems} {statistics.pendingItems === 1 ? 'item' : 'itens'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {statistics.documents.pendingRequests > 0 && (
                  <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {statistics.documents.pendingRequests} documento{statistics.documents.pendingRequests > 1 ? 's' : ''} solicitado{statistics.documents.pendingRequests > 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Enviados pelo seu contador
                        </p>
                      </div>
                    </div>
                    <Link href="/client-portal/documents">
                      <Button size="sm" variant="outline" className="gap-2">
                        <Eye className="h-4 w-4" />
                        Ver
                      </Button>
                    </Link>
                  </div>
                )}
                {statistics.payments.withoutReceipt > 0 && (
                  <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Receipt className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {statistics.payments.withoutReceipt} pagamento{statistics.payments.withoutReceipt > 1 ? 's' : ''} sem comprovante
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Envie os comprovantes
                        </p>
                      </div>
                    </div>
                    <Link href="/client-portal/payments">
                      <Button size="sm" variant="outline" className="gap-2">
                        <Upload className="h-4 w-4" />
                        Enviar
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesso rápido às principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-12">
              <div className="md:col-span-6">
                <Link href="/client-portal/documents">
                  <Button
                    variant="outline"
                    className="justify-start gap-3 h-auto py-4 w-full"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium">Ver Documentos</div>
                      <div className="text-xs text-muted-foreground">
                        Acesse seus documentos contábeis
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </Link>
              </div>

              <div className="md:col-span-6">
                <Link href="/client-portal/payments">
                  <Button
                    variant="outline"
                    className="justify-start gap-3 h-auto py-4 w-full"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium">Ver Pagamentos</div>
                      <div className="text-xs text-muted-foreground">
                        Acompanhe seus pagamentos
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </Link>
              </div>

              {clientProfile.expenseModuleEnabled && (
                <div className="md:col-span-6">
                  <Link href="/client-portal/expenses">
                    <Button
                      variant="outline"
                      className="justify-start gap-3 h-auto py-4 w-full"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-medium">Ver Despesas</div>
                        <div className="text-xs text-muted-foreground">
                          Gerencie suas despesas
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Empty State - No pending items */}
        {statistics.pendingItems === 0 && (
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
  );
}
