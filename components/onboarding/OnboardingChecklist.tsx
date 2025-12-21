'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Circle,
  X,
  CreditCard,
  FileText,
  Users,
  User,
  Loader2,
  ChevronRight,
} from 'lucide-react';

interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: React.ElementType;
  action: string;
  link: string;
}

interface OnboardingProgress {
  onboardingCompleted: boolean;
  tasks: {
    hasAddedClient: boolean;
    hasUploadedDocument: boolean;
    hasRegisteredPayment: boolean;
    hasCompletedProfile: boolean;
  };
  completionPercentage: number;
}

export function OnboardingChecklist() {
  const router = useRouter();
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the checklist
    const dismissed = localStorage.getItem('onboardingChecklistDismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      setLoading(false);
      return;
    }

    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/users/me/onboarding-progress', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProgress(data);

        // Auto-dismiss if onboarding is completed
        if (data.onboardingCompleted) {
          setIsDismissed(true);
        }
      }
    } catch (error) {
      console.error('Error fetching onboarding progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('onboardingChecklistDismissed', 'true');
  };

  const handleTaskClick = (link: string) => {
    router.push(link);
  };

  if (loading) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't show if dismissed or completed
  if (isDismissed || !progress || progress.onboardingCompleted) {
    return null;
  }

  const tasks: OnboardingTask[] = [
    {
      id: 'client',
      title: 'Adicione seu primeiro cliente',
      description: 'Convide um cliente para se conectar com você',
      completed: progress.tasks.hasAddedClient,
      icon: Users,
      action: 'Convidar Cliente',
      link: '/dashboard/clients',
    },
    {
      id: 'document',
      title: 'Faça upload de um documento',
      description: 'Teste o sistema de documentos fiscais',
      completed: progress.tasks.hasUploadedDocument,
      icon: FileText,
      action: 'Enviar Documento',
      link: '/dashboard/documents',
    },
    {
      id: 'payment',
      title: 'Registre um pagamento',
      description: 'Experimente o controle financeiro',
      completed: progress.tasks.hasRegisteredPayment,
      icon: CreditCard,
      action: 'Adicionar Pagamento',
      link: '/dashboard/payments',
    },
    {
      id: 'profile',
      title: 'Complete seu perfil',
      description: 'Adicione informações importantes da sua empresa',
      completed: progress.tasks.hasCompletedProfile,
      icon: User,
      action: 'Editar Perfil',
      link: '/dashboard/profile',
    },
  ];

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const completionPercentage = (completedTasks / totalTasks) * 100;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 relative">
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-1 rounded-full hover:bg-background/50 transition-colors"
        aria-label="Dispensar checklist"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>

      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle>Comece por Aqui</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {completedTasks}/{totalTasks} completas
              </Badge>
            </div>
            <CardDescription>
              Complete estas tarefas para aproveitar ao máximo o ContaSync
            </CardDescription>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Progresso</span>
            <span className="text-sm font-bold text-primary">{Math.round(completionPercentage)}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {tasks.map((task, index) => {
            const Icon = task.icon;
            return (
              <div
                key={task.id}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                  task.completed
                    ? 'bg-background/50 border-border/50 opacity-75'
                    : 'bg-background border-primary/20 hover:border-primary/40 cursor-pointer hover:shadow-sm'
                }`}
                onClick={() => !task.completed && handleTaskClick(task.link)}
              >
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {task.completed ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>

                {/* Task Icon */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    task.completed ? 'bg-green-100' : 'bg-primary/10'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${task.completed ? 'text-green-600' : 'text-primary'}`}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-semibold mb-0.5 ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {task.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                </div>

                {/* Action */}
                {!task.completed && (
                  <Button size="sm" variant="ghost" className="flex-shrink-0 gap-1">
                    {task.action}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Completion message */}
        {completedTasks === totalTasks && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-900">Parabéns!</p>
              <p className="text-sm text-green-700">
                Você completou todas as tarefas iniciais. Agora está pronto para usar o ContaSync!
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
