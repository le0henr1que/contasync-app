'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
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
  Wallet,
  ChevronDown,
  ChevronRight,
  Repeat,
  TrendingUp,
  Target,
  History,
  Sparkles,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

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
  { name: 'Assinatura', href: '/dashboard/billing', icon: CreditCard },
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
      { name: 'Distribuição', href: '/client-portal/financeiro/distribuicao', icon: PieChart },
      { name: 'Métricas', href: '/client-portal/financeiro/metricas', icon: BarChart3 },
      { name: 'Histórico', href: '/client-portal/financeiro/historico', icon: History },
      { name: 'IA Financeira', href: '/client-portal/financeiro/ia', icon: Sparkles },
    ]
  },
  // Assinatura (para clientes individuais)
  { name: 'Assinatura', href: '/client-portal/subscription', icon: CreditCard, requiresIndividualClient: true },
  { name: 'Configurações', href: '/client-portal/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuthStore();
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

  // Auto-expand parent if child is active
  const autoExpandParents = () => {
    navigation.forEach(item => {
      if (item.children && isItemActive(item) && !expandedItems.includes(item.name)) {
        setExpandedItems(prev => [...prev, item.name]);
      }
    });
  };

  // Run auto-expand on mount and when pathname changes
  useState(() => {
    autoExpandParents();
  });

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
