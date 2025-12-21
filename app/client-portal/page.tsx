'use client';

import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, CreditCard, TrendingUp, AlertCircle, Clock, CheckCircle, Plus, Upload, Receipt } from 'lucide-react';
import Link from 'next/link';
import { AccountantPlanWidget } from '@/components/client-portal/AccountantPlanWidget';

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
        fetch('http://localhost:3000/api/clients/me', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }),
        fetch('http://localhost:3000/api/clients/me/statistics', {
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
          <p className="text-muted-foreground mt-2">
            Bem-vindo de volta, {user.name}!
          </p>
        </div>

        {/* Accountant Plan Widget */}
        <AccountantPlanWidget />

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documentos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.documents.total}</div>
              <p className="text-xs text-muted-foreground">
                {statistics.documents.pendingRequests > 0 && (
                  <span className="text-amber-600 font-medium">
                    {statistics.documents.pendingRequests} pendente{statistics.documents.pendingRequests > 1 ? 's' : ''}
                  </span>
                )}
                {statistics.documents.pendingRequests === 0 && 'Tudo em dia'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagamentos</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.payments.total}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{statistics.payments.paid} pagos</span>
                {statistics.payments.pending > 0 && (
                  <> • <span className="text-amber-600">{statistics.payments.pending} pendentes</span></>
                )}
                {statistics.payments.overdue > 0 && (
                  <> • <span className="text-red-600">{statistics.payments.overdue} atrasados</span></>
                )}
              </p>
            </CardContent>
          </Card>

          <Card className={statistics.pendingItems > 0 ? 'border-amber-200 bg-amber-50' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Itens Pendentes</CardTitle>
              <AlertCircle className={`h-4 w-4 ${statistics.pendingItems > 0 ? 'text-amber-600' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${statistics.pendingItems > 0 ? 'text-amber-600' : ''}`}>
                {statistics.pendingItems}
              </div>
              <p className="text-xs text-muted-foreground">
                {statistics.documents.pendingRequests} docs + {statistics.payments.withoutReceipt} recibos
              </p>
            </CardContent>
          </Card>

          {clientProfile.expenseModuleEnabled && statistics.expenses && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Despesas</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.expenses.total}</div>
                <p className="text-xs text-muted-foreground">
                  R$ {(statistics.expenses.totalAmount / 100).toFixed(2)} total
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pending Items Alert */}
        {statistics.pendingItems > 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-base">Atenção Necessária</CardTitle>
              </div>
              <CardDescription>
                Você possui {statistics.pendingItems} item{statistics.pendingItems > 1 ? 'ns' : ''} que requer{statistics.pendingItems === 1 ? '' : 'em'} sua ação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {statistics.documents.pendingRequests > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span>{statistics.documents.pendingRequests} documento{statistics.documents.pendingRequests > 1 ? 's' : ''} solicitado{statistics.documents.pendingRequests > 1 ? 's' : ''}</span>
                    <Link href="/client-portal/documents">
                      <Button size="sm" variant="outline">
                        Ver documentos
                      </Button>
                    </Link>
                  </div>
                )}
                {statistics.payments.withoutReceipt > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span>{statistics.payments.withoutReceipt} pagamento{statistics.payments.withoutReceipt > 1 ? 's' : ''} sem comprovante</span>
                    <Link href="/client-portal/payments">
                      <Button size="sm" variant="outline">
                        Ver pagamentos
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
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Link href="/client-portal/documents">
                <Card className="bg-muted/50 border-dashed cursor-pointer hover:bg-muted transition-colors h-full">
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <FileText className="h-8 w-8 mb-2 text-primary" />
                    <p className="text-sm font-medium">Ver Documentos</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Acesse seus documentos contábeis
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/client-portal/payments">
                <Card className="bg-muted/50 border-dashed cursor-pointer hover:bg-muted transition-colors h-full">
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <CreditCard className="h-8 w-8 mb-2 text-primary" />
                    <p className="text-sm font-medium">Ver Pagamentos</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Acompanhe seus pagamentos
                    </p>
                  </CardContent>
                </Card>
              </Link>

              {clientProfile.expenseModuleEnabled && (
                <Link href="/client-portal/expenses">
                  <Card className="bg-muted/50 border-dashed cursor-pointer hover:bg-muted transition-colors h-full">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                      <TrendingUp className="h-8 w-8 mb-2 text-primary" />
                      <p className="text-sm font-medium">Ver Despesas</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Gerencie suas despesas
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
