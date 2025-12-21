'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  Check,
  CheckCheck,
  FileText,
  CreditCard,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';

interface Notification {
  id: string;
  type: 'DOCUMENT_AVAILABLE' | 'DOCUMENT_REQUESTED' | 'PAYMENT_REGISTERED' | 'PAYMENT_OVERDUE';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

const notificationIcons = {
  DOCUMENT_AVAILABLE: FileText,
  DOCUMENT_REQUESTED: FileText,
  PAYMENT_REGISTERED: CreditCard,
  PAYMENT_OVERDUE: AlertCircle,
};

const notificationColors = {
  DOCUMENT_AVAILABLE: 'text-blue-500 bg-blue-50',
  DOCUMENT_REQUESTED: 'text-yellow-500 bg-yellow-50',
  PAYMENT_REGISTERED: 'text-green-500 bg-green-50',
  PAYMENT_OVERDUE: 'text-red-500 bg-red-50',
};

const notificationLabels = {
  DOCUMENT_AVAILABLE: 'Documento Disponível',
  DOCUMENT_REQUESTED: 'Documento Solicitado',
  PAYMENT_REGISTERED: 'Pagamento Registrado',
  PAYMENT_OVERDUE: 'Pagamento Atrasado',
};

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Redirect if not client
  useEffect(() => {
    if (user && user.role !== 'CLIENT') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar notificações');
      }

      const data = await response.json();
      setNotifications(data);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar notificações');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao marcar notificação');
      }

      // Update local state
      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (error: any) {
      toast.error(error.message || 'Erro ao marcar notificação');
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao marcar todas notificações');
      }

      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('Todas as notificações foram marcadas como lidas');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao marcar todas notificações');
    }
  };

  const formatTime = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: ptBR
    });
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Bell className="h-8 w-8" />
              Notificações
            </h1>
            <p className="text-muted-foreground mt-2">
              {unreadCount > 0
                ? `Você tem ${unreadCount} notificação${unreadCount > 1 ? 'ões' : ''} não lida${unreadCount > 1 ? 's' : ''}`
                : 'Você não tem notificações não lidas'}
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Marcar todas como lidas
            </Button>
          )}
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Todas ({notifications.length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Não lidas ({unreadCount})
          </Button>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">
                  {filter === 'unread'
                    ? 'Nenhuma notificação não lida'
                    : 'Nenhuma notificação'}
                </p>
                <p className="text-sm mt-1">
                  {filter === 'unread'
                    ? 'Você está em dia com suas notificações!'
                    : 'Você ainda não recebeu notificações'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification, index) => {
              const Icon = notificationIcons[notification.type];
              const colorClasses = notificationColors[notification.type];
              const label = notificationLabels[notification.type];

              return (
                <Card
                  key={notification.id}
                  className={`transition-colors ${
                    !notification.isRead ? 'bg-muted/30 border-primary/20' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`p-3 rounded-lg ${colorClasses}`}>
                        <Icon className="h-5 w-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {label}
                              </Badge>
                              {!notification.isRead && (
                                <Badge variant="default" className="text-xs">
                                  Nova
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-semibold text-base">
                              {notification.title}
                            </h3>
                          </div>

                          {/* Mark as Read Button */}
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="gap-2 flex-shrink-0"
                            >
                              <Check className="h-4 w-4" />
                              Marcar como lida
                            </Button>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
