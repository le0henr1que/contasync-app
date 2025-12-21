'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Home,
  Users,
  FileText,
  DollarSign,
  Receipt,
  Settings,
  LogOut,
  CreditCard,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

const accountantNavigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Clientes', href: '/dashboard/clients', icon: Users },
  { name: 'Documentos', href: '/dashboard/documents', icon: FileText },
  { name: 'Pagamentos', href: '/dashboard/payments', icon: DollarSign },
  { name: 'Assinatura', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Configurações', href: '/dashboard/settings', icon: Settings },
];

const clientNavigation = [
  { name: 'Home', href: '/client-portal', icon: Home },
  { name: 'Documentos', href: '/client-portal/documents', icon: FileText },
  { name: 'Pagamentos', href: '/client-portal/payments', icon: DollarSign },
  { name: 'Despesas', href: '/client-portal/expenses', icon: Receipt },
  { name: 'Configurações', href: '/client-portal/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuthStore();

  // Filter navigation based on user role and expense module
  let navigation = user?.role === 'CLIENT' ? clientNavigation : accountantNavigation;

  // If user is a client without expense module enabled, remove Despesas from menu
  if (user?.role === 'CLIENT' && !user?.expenseModuleEnabled) {
    navigation = navigation.filter(item => item.href !== '/client-portal/expenses');
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Show loading state while user is being fetched
  if (isLoading) {
    return (
      <div className="flex h-full w-64 flex-col border-r bg-card">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">CS</span>
          </div>
          <span className="text-lg font-semibold">ContaSync</span>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <span className="text-sm font-bold">CS</span>
        </div>
        <span className="text-lg font-semibold">ContaSync</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && item.href !== '/client-portal' && pathname?.startsWith(item.href + '/'));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.name || 'Usuário'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <div className="space-y-2">
          {user?.role === 'CLIENT' && (
            <Button
              variant="outline"
              className="w-full gap-2 justify-start"
              onClick={() => router.push('/client-portal/profile')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Configurações
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full gap-2 justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
}
