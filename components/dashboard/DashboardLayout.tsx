'use client';

import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { FeedbackWidget } from '@/components/feedback/feedback-widget';
import { UpgradeModal } from './UpgradeModal';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth.store';
import { differenceInDays } from 'date-fns';
import { Clock } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuthStore();

  // Check trial status
  const isTrialing = user?.role === 'ACCOUNTANT' && user?.subscriptionStatus === 'TRIALING';
  const daysLeft = isTrialing && user?.trialEndsAt
    ? differenceInDays(new Date(user.trialEndsAt), new Date())
    : null;
  const isTrialExpired = daysLeft !== null && daysLeft < 0;

  return (
    <>
      {/* Upgrade Modal - Shown when trial is expired */}
      {isTrialExpired && (
        <UpgradeModal
          isOpen={true}
          canClose={false}
          trialEndDate={user?.trialEndsAt}
          companyName={user?.accountant?.companyName}
        />
      )}

      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile Header */}
          <MobileNav />

          {/* Desktop Header */}
          <header className="hidden lg:flex h-16 items-center justify-between gap-4 border-b bg-background px-6">
            <div className="flex items-center gap-3">
              {isTrialing && daysLeft !== null && daysLeft >= 0 && (
                <Badge
                  variant={daysLeft <= 2 ? 'destructive' : daysLeft <= 6 ? 'secondary' : 'outline'}
                  className="gap-1.5"
                >
                  <Clock className="h-3.5 w-3.5" />
                  Trial: {daysLeft} {daysLeft === 1 ? 'dia restante' : 'dias restantes'}
                </Badge>
              )}
            </div>
            <NotificationCenter />
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-muted/30">
            <div className="container mx-auto p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>

        {/* Feedback Widget - Available for all authenticated users */}
        <FeedbackWidget />
      </div>
    </>
  );
}
