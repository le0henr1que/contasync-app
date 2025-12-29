'use client';

import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Target,
  TrendingUp,
  Edit,
  Trash2,
  Plus,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Clock,
  ListTodo,
  Circle,
  CheckCircle,
} from 'lucide-react';

export type GoalCategory =
  | 'EMERGENCY_FUND'
  | 'RETIREMENT'
  | 'VACATION'
  | 'HOUSE'
  | 'CAR'
  | 'EDUCATION'
  | 'WEDDING'
  | 'BUSINESS'
  | 'DEBT_PAYMENT'
  | 'OTHER';

export type GoalPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELED' | 'PAUSED';

export interface GoalItem {
  id: string;
  goalId: string;
  title: string;
  description?: string | null;
  amount: string | number;
  isPurchased: boolean;
  purchasedAt?: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: string | number;
  date: string;
  notes?: string | null;
}

export interface Goal {
  id: string;
  clientId: string;
  title: string;
  description?: string | null;
  targetAmount: string | number;
  currentAmount: string | number;
  targetDate: string;
  priority: GoalPriority;
  category?: GoalCategory;
  monthlyContribution?: string | number | null;
  notes?: string | null;
  status: GoalStatus;
  progress?: number;
  remaining?: number;
  daysRemaining?: number;
  isCompleted?: boolean;
  isOverdue?: boolean;
  createdAt: string;
  updatedAt: string;
  contributions?: GoalContribution[];
  items?: GoalItem[];
}

interface GoalCardProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goal: Goal) => void;
  onAddContribution?: (goal: Goal) => void;
  onViewInsights?: (goal: Goal) => void;
  onAddItem?: (goal: Goal) => void;
  onToggleItem?: (goalId: string, itemId: string) => void;
  onDeleteItem?: (goalId: string, itemId: string) => void;
  onUpdateProgress?: (goal: Goal) => void;
}

const categoryLabels: Record<GoalCategory, string> = {
  EMERGENCY_FUND: 'Fundo de Emergência',
  RETIREMENT: 'Aposentadoria',
  VACATION: 'Viagem',
  HOUSE: 'Casa',
  CAR: 'Carro',
  EDUCATION: 'Educação',
  WEDDING: 'Casamento',
  BUSINESS: 'Negócio',
  DEBT_PAYMENT: 'Quitação de Dívidas',
  OTHER: 'Outros',
};

const categoryColors: Record<GoalCategory, string> = {
  EMERGENCY_FUND:
    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  RETIREMENT:
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  VACATION:
    'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  HOUSE: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  CAR: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  EDUCATION:
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  WEDDING:
    'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  BUSINESS:
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  DEBT_PAYMENT:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  OTHER: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

function formatCurrency(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
}

export function GoalCard({
  goal,
  onEdit,
  onDelete,
  onAddContribution,
  onViewInsights,
  onAddItem,
  onToggleItem,
  onDeleteItem,
  onUpdateProgress,
}: GoalCardProps) {
  const progressPercentage = Math.min(goal.progress || 0, 100);
  const isNearTarget = progressPercentage >= 90 && progressPercentage < 100;
  const isUrgent = (goal.daysRemaining || 0) <= 30 && (goal.daysRemaining || 0) > 0;

  return (
    <Card
      variant="default"
      className={`transition-all ${
        goal.isCompleted
          ? 'border-green-500/50'
          : goal.isOverdue
          ? 'border-red-500/50'
          : 'border-primary/50'
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{goal.title}</span>
              {goal.isCompleted && (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              )}
              {goal.isOverdue && (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              {isUrgent && !goal.isCompleted && (
                <Clock className="h-4 w-4 text-orange-600" />
              )}
            </CardTitle>
            {goal.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {goal.description}
              </p>
            )}
          </div>
          {goal.category && (
            <Badge className={categoryColors[goal.category]}>
              {categoryLabels[goal.category]}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-bold">{progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-3">
            <div
              className={`rounded-full h-3 transition-all ${
                goal.isCompleted
                  ? 'bg-green-600'
                  : goal.isOverdue
                  ? 'bg-red-600'
                  : isNearTarget
                  ? 'bg-orange-600'
                  : 'bg-primary'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Atual</p>
            <p className="text-lg font-bold text-primary">
              {formatCurrency(goal.currentAmount)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-0.5">Meta</p>
            <p className="text-lg font-bold">
              {formatCurrency(goal.targetAmount)}
            </p>
          </div>
        </div>

        {/* Remaining */}
        {!goal.isCompleted && (
          <div className="p-3 bg-secondary/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Faltam</p>
                <p className="text-base font-bold">
                  {formatCurrency(goal.remaining || 0)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  {goal.isOverdue ? 'Atrasado há' : 'Prazo'}
                </p>
                <p
                  className={`text-base font-bold ${
                    goal.isOverdue ? 'text-red-600' : ''
                  }`}
                >
                  {Math.abs(goal.daysRemaining || 0)} dias
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Target Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            Data alvo:{' '}
            {format(new Date(goal.targetDate), "dd 'de' MMMM 'de' yyyy", {
              locale: ptBR,
            })}
          </span>
        </div>

        {/* Monthly Contribution */}
        {goal.monthlyContribution && Number(goal.monthlyContribution) > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>
              <span className="text-muted-foreground">Contribuição mensal:</span>{' '}
              <span className="font-medium">
                {formatCurrency(goal.monthlyContribution)}
              </span>
            </span>
          </div>
        )}

        {/* Items/Expenses List */}
        {goal.items && goal.items.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ListTodo className="h-4 w-4 text-muted-foreground" />
                <span>
                  Lista de Itens ({goal.items.filter(i => i.isPurchased).length}/
                  {goal.items.length})
                </span>
              </div>
              {onAddItem && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => onAddItem(goal)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Total Summary */}
            <div className="flex items-center justify-between text-sm p-2 bg-secondary/30 rounded-md">
              <span className="font-medium">Total Estimado:</span>
              <span className="font-bold text-primary">
                {formatCurrency(
                  goal.items.reduce((sum, item) => sum + Number(item.amount || 0), 0)
                )}
              </span>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {goal.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary/50 transition-colors group"
                >
                  <button
                    onClick={() => onToggleItem?.(goal.id, item.id)}
                    className="flex-shrink-0 transition-transform hover:scale-110"
                  >
                    {item.isPurchased ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-sm truncate ${
                          item.isPurchased
                            ? 'line-through text-muted-foreground'
                            : ''
                        }`}
                      >
                        {item.title}
                      </p>
                      <span className={`text-sm font-medium whitespace-nowrap ${
                        item.isPurchased ? 'text-muted-foreground' : 'text-primary'
                      }`}>
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </p>
                    )}
                  </div>
                  {onDeleteItem && (
                    <button
                      onClick={() => onDeleteItem(goal.id, item.id)}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          {!goal.isCompleted && onUpdateProgress && (
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={() => onUpdateProgress(goal)}
            >
              <DollarSign className="h-3.5 w-3.5 mr-1.5" />
              Atualizar Progresso
            </Button>
          )}
          {onViewInsights && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onViewInsights(goal)}
            >
              <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
              Insights
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(goal)}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(goal)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
