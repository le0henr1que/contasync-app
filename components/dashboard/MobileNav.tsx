'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Users,
  FileText,
  DollarSign,
  Receipt,
  Settings,
  LogOut,
  Menu,
  Clock,
  Wallet,
  CreditCard,
  ChevronDown,
  ChevronRight,
  Repeat,
  TrendingUp,
  Target,
  History,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { differenceInDays } from 'date-fns';

interface NavItem {
  name: string;
  href?: string;
  icon: any;
  requiresExpenseModule?: boolean;
  requiresFinancialModule?: boolean;
  requiresIndividualClient?: boolean;
  children?: NavItem[];
}

const accountantNavigation: NavItem[] = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Clientes', href: '/dashboard/clients', icon: Users },
  { name: 'Documentos', href: '/dashboard/documents', icon: FileText },
  { name: 'Pagamentos', href: '/dashboard/payments', icon: DollarSign },
  { name: 'Configurações', href: '/dashboard/settings', icon: Settings },
];

// Base client navigation - will be filtered dynamically
const clientNavigation: NavItem[] = [
  { name: 'Home', href: '/client-portal', icon: Home },
  // Módulos de Contabilidade (apenas para clientes gerenciados)
  { name: 'Documentos', href: '/client-portal/documents', icon: FileText, requiresExpenseModule: true },
  { name: 'Pagamentos', href: '/client-portal/payments', icon: DollarSign, requiresExpenseModule: true },
  { name: 'Despesas', href: '/client-portal/expenses', icon: Receipt, requiresExpenseModule: true },
  // Módulo Financeiro (para clientes individuais)
  {
    name: 'Financeiro',
    icon: Wallet,
    requiresFinancialModule: true,
    children: [
      { name: 'Dashboard', href: '/client-portal/financeiro', icon: Home },
      { name: 'Transações', href: '/client-portal/financeiro/transacoes', icon: Receipt },
      { name: 'Recorrentes', href: '/client-portal/financeiro/recorrentes', icon: Repeat },
      { name: 'Parcelamentos', href: '/client-portal/financeiro/parcelamentos', icon: CreditCard },
      { name: 'Investimentos', href: '/client-portal/financeiro/investimentos', icon: TrendingUp },
      { name: 'Metas', href: '/client-portal/financeiro/metas', icon: Target },
      { name: 'Histórico', href: '/client-portal/financeiro/historico', icon: History },
      { name: 'IA Financeira', href: '/client-portal/financeiro/ia', icon: Sparkles },
    ]
  },
  // Assinatura (para clientes individuais)
  { name: 'Assinatura', href: '/client-portal/subscription', icon: CreditCard, requiresIndividualClient: true },
  { name: 'Configurações', href: '/client-portal/settings', icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuthStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Filter navigation based on user role and module flags
  let navigation = user?.role === 'CLIENT' ? clientNavigation : accountantNavigation;

  // For client users, filter based on module enablement
  if (user?.role === 'CLIENT') {
    const isIndividualClient = !user?.accountantId;

    navigation = navigation.filter(item => {
      // Always show Home and Settings
      if (!item.requiresExpenseModule && !item.requiresFinancialModule && !item.requiresIndividualClient) {
        return true;
      }

      // Show expense-related modules only if expense module is enabled
      if (item.requiresExpenseModule) {
        return user?.expenseModuleEnabled === true;
      }

      // Show financial module only if financial module is enabled
      if (item.requiresFinancialModule) {
        return user?.financialModuleEnabled === true;
      }

      // Show subscription only for individual clients
      if (item.requiresIndividualClient) {
        return isIndividualClient;
      }

      return true;
    });
  }

  const handleLogout = () => {
    logout();
    setOpen(false);
    router.push('/login');
  };

  const toggleExpand = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isItemActive = (item: NavItem): boolean => {
    if (item.href) {
      return pathname === item.href ||
        (item.href !== '/dashboard' && item.href !== '/client-portal' && pathname?.startsWith(item.href + '/'));
    }
    if (item.children) {
      return item.children.some(child =>
        child.href && (pathname === child.href || pathname?.startsWith(child.href + '/'))
      );
    }
    return false;
  };

  // Show loading state while user is being fetched
  if (isLoading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">CS</span>
            </div>
            <span className="text-lg font-semibold">ContaSync</span>
          </div>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </header>
    );
  }

  // Calculate trial info for accountants
  const isTrialing = user?.role === 'ACCOUNTANT' && user?.subscriptionStatus === 'TRIALING';
  const daysLeft = isTrialing && user?.trialEndsAt
    ? differenceInDays(new Date(user.trialEndsAt), new Date())
    : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">CS</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold leading-tight">ContaSync</span>
            {isTrialing && daysLeft !== null && (
              <Badge
                variant={daysLeft <= 2 ? 'destructive' : daysLeft <= 6 ? 'secondary' : 'outline'}
                className="text-[10px] h-4 px-1 w-fit"
              >
                <Clock className="h-2.5 w-2.5 mr-1" />
                Trial {daysLeft}d
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <NotificationCenter />
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
              <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
                {navigation.map((item) => {
                  const isActive = isItemActive(item);
                  const isExpanded = expandedItems.includes(item.name);
                  const Icon = item.icon;
                  const hasChildren = item.children && item.children.length > 0;

                  return (
                    <div key={item.name}>
                      {/* Parent Item */}
                      {hasChildren ? (
                        <button
                          onClick={() => toggleExpand(item.name)}
                          className={cn(
                            'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-primary/10 text-primary'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5" />
                            {item.name}
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      ) : (
                        <Link
                          href={item.href!}
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
                      )}

                      {/* Children Items */}
                      {hasChildren && isExpanded && (
                        <div className="ml-4 mt-1 space-y-1">
                          {item.children!.map((child) => {
                            const ChildIcon = child.icon;
                            const isChildActive = pathname === child.href;

                            return (
                              <Link
                                key={child.name}
                                href={child.href!}
                                onClick={() => setOpen(false)}
                                className={cn(
                                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                  isChildActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                )}
                              >
                                <ChildIcon className="h-4 w-4" />
                                {child.name}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
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
      </div>
    </header>
  );
}
