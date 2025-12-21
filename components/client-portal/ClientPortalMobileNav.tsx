'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Home,
  FileText,
  Receipt,
  TrendingUp,
  User,
  LogOut,
  Menu,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { authService } from '@/services/auth.service';

interface ClientPortalMobileNavProps {
  expenseModuleEnabled: boolean;
}

export function ClientPortalMobileNav({ expenseModuleEnabled }: ClientPortalMobileNavProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);

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
    setOpen(false);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">CS</span>
          </div>
          <span className="text-lg font-semibold">ContaSync</span>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-full flex-col">
              {/* Header */}
              <SheetHeader className="border-b p-6">
                <SheetTitle className="flex items-center gap-2 text-left">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <span className="text-sm font-bold">CS</span>
                  </div>
                  <span className="text-lg font-semibold">ContaSync</span>
                </SheetTitle>
              </SheetHeader>

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
                      onClick={() => setOpen(false)}
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
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
