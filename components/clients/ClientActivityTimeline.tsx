'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  UserPlus,
  Edit,
  Trash2,
  ToggleLeft,
  Zap,
  Loader2,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ActivityLog {
  id: string;
  clientId: string;
  userId: string;
  action: string;
  description: string;
  metadata: any;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface ActivityResponse {
  logs: ActivityLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ClientActivityTimelineProps {
  clientId: string;
}

const getActivityIcon = (action: string) => {
  switch (action) {
    case 'CLIENT_CREATED':
      return <UserPlus className="h-5 w-5" />;
    case 'CLIENT_UPDATED':
      return <Edit className="h-5 w-5" />;
    case 'CLIENT_DELETED':
      return <Trash2 className="h-5 w-5" />;
    case 'CLIENT_STATUS_CHANGED':
      return <ToggleLeft className="h-5 w-5" />;
    case 'CLIENT_EXPENSE_MODULE_TOGGLED':
      return <Zap className="h-5 w-5" />;
    default:
      return <Edit className="h-5 w-5" />;
  }
};

const getActivityColor = (action: string) => {
  switch (action) {
    case 'CLIENT_CREATED':
      return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950';
    case 'CLIENT_UPDATED':
      return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950';
    case 'CLIENT_DELETED':
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950';
    case 'CLIENT_STATUS_CHANGED':
      return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950';
    case 'CLIENT_EXPENSE_MODULE_TOGGLED':
      return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950';
    default:
      return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950';
  }
};

export function ClientActivityTimeline({ clientId }: ClientActivityTimelineProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const fetchActivities = async (page: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/clients/${clientId}/activities?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (response.ok) {
        const data: ActivityResponse = await response.json();
        setActivities(data.logs);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities(currentPage);
  }, [clientId, currentPage]);

  const formatRelativeTime = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: ptBR,
    });
  };

  const formatAbsoluteTime = (date: string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading && activities.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Clock className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma atividade ainda</h3>
          <p className="text-muted-foreground">
            As atividades relacionadas a este cliente aparecerao aqui
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Historico de Atividades</CardTitle>
          <CardDescription>
            Todas as alteracoes e acoes realizadas neste cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Timeline */}
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />

              {/* Activity items */}
              <div className="space-y-6">
                {activities.map((activity) => (
                  <div key={activity.id} className="relative flex gap-4">
                    {/* Icon */}
                    <div
                      className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ${getActivityColor(
                        activity.action
                      )}`}
                    >
                      {getActivityIcon(activity.action)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-1 pb-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Por {activity.user.name}</span>
                            <span>•</span>
                            <span
                              title={formatAbsoluteTime(activity.createdAt)}
                              className="cursor-help"
                            >
                              {formatRelativeTime(activity.createdAt)}
                            </span>
                          </div>
                        </div>
                        {activity.action === 'CLIENT_STATUS_CHANGED' &&
                          activity.metadata?.newStatus !== undefined && (
                            <Badge
                              variant={
                                activity.metadata.newStatus ? 'default' : 'secondary'
                              }
                            >
                              {activity.metadata.newStatus ? 'Ativo' : 'Inativo'}
                            </Badge>
                          )}
                        {activity.action === 'CLIENT_EXPENSE_MODULE_TOGGLED' &&
                          activity.metadata?.expenseModuleEnabled !== undefined && (
                            <Badge
                              variant={
                                activity.metadata.expenseModuleEnabled
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {activity.metadata.expenseModuleEnabled
                                ? 'Habilitado'
                                : 'Desabilitado'}
                            </Badge>
                          )}
                      </div>

                      {/* Metadata details */}
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="mt-2 rounded-md bg-muted p-3 text-xs">
                          {activity.metadata.oldName && activity.metadata.newName && (
                            <p>
                              <span className="text-muted-foreground">Nome: </span>
                              <span className="line-through">
                                {activity.metadata.oldName}
                              </span>{' '}
                              - <span className="font-medium">{activity.metadata.newName}</span>
                            </p>
                          )}
                          {activity.metadata.oldEmail && activity.metadata.newEmail && (
                            <p>
                              <span className="text-muted-foreground">Email: </span>
                              <span className="line-through">
                                {activity.metadata.oldEmail}
                              </span>{' '}
                              - <span className="font-medium">{activity.metadata.newEmail}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Pagina {currentPage} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || isLoading}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || isLoading}
            >
              Proxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
