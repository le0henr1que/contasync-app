'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Target, Plus, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { GoalCard, Goal } from '@/components/financial/GoalCard';
import { AddGoalModal } from '@/components/financial/AddGoalModal';
import { AddGoalItemModal } from '@/components/financial/AddGoalItemModal';
import { UpdateProgressModal } from '@/components/financial/UpdateProgressModal';

interface GoalsResponse {
  data: Goal[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  summary: {
    totalGoals: number;
    totalTarget: number;
    totalCurrent: number;
    totalRemaining: number;
    totalProgress: number;
    byStatus: {
      active: number;
      completed: number;
      behind: number;
    };
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export default function GoalsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [summary, setSummary] = useState({
    totalGoals: 0,
    totalTarget: 0,
    totalCurrent: 0,
    totalRemaining: 0,
    totalProgress: 0,
    byStatus: { active: 0, completed: 0, behind: 0 },
  });

  useEffect(() => {
    if (user && user.role !== 'CLIENT') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/financial/goals?limit=50`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        },
      );

      if (!response.ok) throw new Error('Erro ao carregar metas');

      const data: GoalsResponse = await response.json();
      setGoals(data.data);
      setSummary(data.summary);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar metas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = (goal: Goal) => {
    setSelectedGoalId(goal.id);
    setIsItemModalOpen(true);
  };

  const handleToggleItem = async (goalId: string, itemId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/financial/goals/${goalId}/items/${itemId}/toggle`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        },
      );

      if (!response.ok) throw new Error('Erro ao atualizar item');

      toast.success('Item atualizado!');
      fetchGoals();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar item');
    }
  };

  const handleDeleteItem = async (goalId: string, itemId: string) => {
    if (!confirm('Tem certeza que deseja remover este item?')) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/financial/goals/${goalId}/items/${itemId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        },
      );

      if (!response.ok) throw new Error('Erro ao remover item');

      toast.success('Item removido!');
      fetchGoals();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover item');
    }
  };

  const handleUpdateItem = async (goalId: string, itemId: string, amount: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/financial/goals/${goalId}/items/${itemId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({ amount }),
        },
      );

      if (!response.ok) throw new Error('Erro ao atualizar item');

      toast.success('Valor do item atualizado!');
      fetchGoals();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar item');
    }
  };

  const handleUpdateProgress = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsProgressModalOpen(true);
  };

  const handleDeleteGoal = async (goal: Goal) => {
    if (!confirm(`Tem certeza que deseja remover a meta "${goal.title}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/financial/goals/${goal.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        },
      );

      if (!response.ok) throw new Error('Erro ao remover meta');

      toast.success('Meta removida com sucesso!');
      fetchGoals();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover meta');
    }
  };

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
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Metas Financeiras</h1>
            <p className="text-muted-foreground">
              Defina e acompanhe seus objetivos financeiros
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Meta
          </Button>
        </div>

        {summary.totalGoals > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Total em Metas
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(summary.totalTarget)}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-muted-foreground opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Total Acumulado
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(summary.totalCurrent)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Progresso Geral
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {summary.totalProgress.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {summary.byStatus.completed} concluídas
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-muted-foreground opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {goals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhuma meta encontrada
              </h3>
              <p className="text-muted-foreground mb-4">
                Defina suas metas financeiras e acompanhe seu progresso
              </p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeira Meta
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onAddItem={handleAddItem}
                onToggleItem={handleToggleItem}
                onDeleteItem={handleDeleteItem}
                onUpdateItem={handleUpdateItem}
                onUpdateProgress={handleUpdateProgress}
                onDelete={handleDeleteGoal}
              />
            ))}
          </div>
        )}
      </div>

      <AddGoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchGoals();
          setIsModalOpen(false);
        }}
      />

      <AddGoalItemModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setSelectedGoalId('');
        }}
        onSuccess={() => {
          fetchGoals();
          setIsItemModalOpen(false);
          setSelectedGoalId('');
        }}
        goalId={selectedGoalId}
      />

      {selectedGoal && (
        <UpdateProgressModal
          isOpen={isProgressModalOpen}
          onClose={() => {
            setIsProgressModalOpen(false);
            setSelectedGoal(null);
          }}
          onSuccess={() => {
            fetchGoals();
            setIsProgressModalOpen(false);
            setSelectedGoal(null);
          }}
          goal={selectedGoal}
        />
      )}
    </DashboardLayout>
  );
}
