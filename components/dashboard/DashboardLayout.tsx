'use client';

import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { useAuthStore } from '@/store/auth.store';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuthStore();

  return (
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
        <header className="hidden lg:flex h-16 items-center justify-end gap-4 border-b bg-background px-6">
          {user?.role === 'CLIENT' && <NotificationCenter />}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-muted/30">
          <div className="container mx-auto p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
