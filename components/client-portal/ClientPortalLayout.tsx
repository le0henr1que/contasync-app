'use client';

import { ClientPortalSidebar } from './ClientPortalSidebar';
import { ClientPortalMobileNav } from './ClientPortalMobileNav';

interface ClientPortalLayoutProps {
  children: React.ReactNode;
  expenseModuleEnabled: boolean;
}

export function ClientPortalLayout({ children, expenseModuleEnabled }: ClientPortalLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block">
        <ClientPortalSidebar expenseModuleEnabled={expenseModuleEnabled} />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <ClientPortalMobileNav expenseModuleEnabled={expenseModuleEnabled} />

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
