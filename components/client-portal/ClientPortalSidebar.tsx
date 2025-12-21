'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Home,
  FileText,
  Receipt,
  TrendingUp,
  User,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';

interface ClientPortalSidebarProps {
  expenseModuleEnabled: boolean;
}

export function ClientPortalSidebar({ expenseModuleEnabled }: ClientPortalSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const navigation = [
    { name: 'Dashboard', href: '/client-portal', icon: Home },
    { name: 'Documentos', href: '/client-portal/documents', icon: FileText },
    { name: 'Pagamentos', href: '/client-portal/payments', icon: Receipt },
    ...(expenseModuleEnabled ? [{ name: 'Despesas', href: '/client-portal/expenses', icon: TrendingUp }] : []),
    { name: 'Perfil', href: '/client-portal/profile', icon: User },
  ];

  const handleLogout = async () => {
    const refreshToken = authService.getStoredRefreshToken();
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    logout();
    router.push('/login');
  };

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
            (item.href !== '/client-portal' && pathname?.startsWith(item.href + '/'));
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
  );
}
