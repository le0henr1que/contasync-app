'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { CurrentPlanCard } from '@/components/billing/CurrentPlanCard';
import { ChangePlanSection } from '@/components/billing/ChangePlanSection';
import { UsageLimitsCard } from '@/components/billing/UsageLimitsCard';
import { BillingHistoryTable } from '@/components/billing/BillingHistoryTable';
import { Loader2 } from 'lucide-react';

export default function BillingPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to finish loading before checking user
    if (authLoading) {
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'ACCOUNTANT') {
      router.push('/dashboard');
      return;
    }

    setIsLoading(false);
  }, [user, authLoading, router]);

  if (isLoading) {
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
        <div>
          <h1 className="text-3xl font-bold">Assinatura e Billing</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie sua assinatura, veja seu uso e histórico de pagamentos
          </p>
        </div>

        {/* Current Plan */}
        <CurrentPlanCard />

        {/* Usage & Limits */}
        <UsageLimitsCard />

        {/* Change Plan */}
        <ChangePlanSection />

        {/* Billing History */}
        <BillingHistoryTable />
      </div>
    </DashboardLayout>
  );
}
