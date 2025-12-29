'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Target,
  Repeat,
  PieChart,
  DollarSign,
  Shield,
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';

enum InsightType {
  SPENDING_ALERT = 'SPENDING_ALERT',
  SAVING_OPPORTUNITY = 'SAVING_OPPORTUNITY',
  GOAL_SUGGESTION = 'GOAL_SUGGESTION',
  RECURRING_OPTIMIZATION = 'RECURRING_OPTIMIZATION',
  CATEGORY_ANALYSIS = 'CATEGORY_ANALYSIS',
  INVESTMENT_SUGGESTION = 'INVESTMENT_SUGGESTION',
  BUDGET_WARNING = 'BUDGET_WARNING',
}

enum InsightPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

interface AIInsight {
  id: string;
  type: InsightType;
  priority: InsightPriority;
  title: string;
  content: string;
  isRead: boolean;
  isDismissed: boolean;
  metadata?: {
    actionItems?: string[];
    estimatedImpact?: number;
    overallScore?: number;
    summary?: string;
  };
  createdAt: string;
}

const insightTypeLabels: Record<InsightType, string> = {
  SPENDING_ALERT: 'Alerta de Gastos',
  SAVING_OPPORTUNITY: 'Oportunidade de Economia',
  GOAL_SUGGESTION: 'Sugestão de Meta',
  RECURRING_OPTIMIZATION: 'Otimização Recorrente',
  CATEGORY_ANALYSIS: 'Análise de Categoria',
  INVESTMENT_SUGGESTION: 'Sugestão de Investimento',
  BUDGET_WARNING: 'Aviso de Orçamento',
};

const insightTypeIcons: Record<InsightType, React.ReactNode> = {
  SPENDING_ALERT: <AlertTriangle className="h-5 w-5" />,
  SAVING_OPPORTUNITY: <DollarSign className="h-5 w-5" />,
  GOAL_SUGGESTION: <Target className="h-5 w-5" />,
  RECURRING_OPTIMIZATION: <Repeat className="h-5 w-5" />,
  CATEGORY_ANALYSIS: <PieChart className="h-5 w-5" />,
  INVESTMENT_SUGGESTION: <TrendingUp className="h-5 w-5" />,
  BUDGET_WARNING: <Shield className="h-5 w-5" />,
};

const priorityColors: Record<InsightPriority, string> = {
  LOW: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  URGENT: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const priorityLabels: Record<InsightPriority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function AIInsightsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [showDismissed, setShowDismissed] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'CLIENT') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    fetchInsights();
  }, [filterType, filterPriority, showDismissed]);

  const fetchInsights = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;

      let url = `${baseUrl}/financial/ai-insights?`;
      if (filterType !== 'ALL') url += `type=${filterType}&`;
      if (filterPriority !== 'ALL') url += `priority=${filterPriority}&`;
      url += `isDismissed=${showDismissed}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Erro ao carregar insights');

      const data = await response.json();
      setInsights(data);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar insights');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const token = localStorage.getItem('accessToken');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(
        `${baseUrl}/financial/ai-insights/generate`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao gerar insights');
      }

      toast.success('Insights gerados com sucesso!');
      fetchInsights();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao gerar insights');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(
        `${baseUrl}/financial/ai-insights/${id}/read`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) throw new Error('Erro ao marcar como lido');

      toast.success('Marcado como lido');
      fetchInsights();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao marcar como lido');
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(
        `${baseUrl}/financial/ai-insights/${id}/dismiss`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) throw new Error('Erro ao dispensar insight');

      toast.success('Insight dispensado');
      fetchInsights();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao dispensar insight');
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
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-purple-600" />
              Insights Financeiros com IA
            </h1>
            <p className="text-muted-foreground">
              Recomendações personalizadas baseadas no seu histórico financeiro
            </p>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar Novos Insights
              </>
            )}
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos os tipos</SelectItem>
                    {Object.entries(insightTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Prioridade
                </label>
                <Select
                  value={filterPriority}
                  onValueChange={setFilterPriority}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todas as prioridades</SelectItem>
                    {Object.entries(priorityLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant={showDismissed ? 'default' : 'outline'}
                  onClick={() => setShowDismissed(!showDismissed)}
                  className="w-full"
                >
                  {showDismissed ? 'Ocultar Dispensados' : 'Mostrar Dispensados'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insights List */}
        {insights.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhum insight encontrado
              </h3>
              <p className="text-muted-foreground mb-4">
                Gere insights personalizados com IA para entender melhor suas
                finanças
              </p>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar Primeiro Insight
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {insights.map((insight) => (
              <Card
                key={insight.id}
                className={`transition-all ${
                  insight.isRead ? 'opacity-60' : ''
                } ${insight.isDismissed ? 'border-dashed' : ''}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        {insightTypeIcons[insight.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg">
                            {insight.title}
                          </CardTitle>
                          {!insight.isRead && (
                            <Badge variant="outline" className="text-xs">
                              Novo
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge className={priorityColors[insight.priority]}>
                            {priorityLabels[insight.priority]}
                          </Badge>
                          <span>•</span>
                          <span>{insightTypeLabels[insight.type]}</span>
                          <span>•</span>
                          <span>{formatDate(insight.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{insight.content}</p>

                  {insight.metadata?.actionItems &&
                    insight.metadata.actionItems.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-sm">
                          Ações Recomendadas:
                        </h4>
                        <ul className="space-y-1">
                          {insight.metadata.actionItems.map((action, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-muted-foreground flex items-start gap-2"
                            >
                              <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {insight.metadata?.estimatedImpact && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">
                        Impacto Estimado:{' '}
                        <span className="font-bold">
                          {formatCurrency(insight.metadata.estimatedImpact)}/mês
                        </span>
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t">
                    {!insight.isRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsRead(insight.id)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        Marcar como Lido
                      </Button>
                    )}
                    {!insight.isDismissed && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDismiss(insight.id)}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1.5" />
                        Dispensar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
