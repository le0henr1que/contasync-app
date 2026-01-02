'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { PieChart, Plus, Trash2, Edit2, Loader2, DollarSign, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface DistributionCategory {
  id: string;
  name: string;
  percentage: number;
  color: string;
  icon: string;
  priority: number;
  isActive: boolean;
  monthlySpent?: number; // Valor gasto no mês
}

interface DistributionConfig {
  id: string;
  isAutoCalculateExpenses: boolean;
  isActive: boolean;
  categories: DistributionCategory[];
}

export default function DistributionPage() {
  const [config, setConfig] = useState<DistributionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingCategory, setAddingCategory] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', percentage: 0 });
  const [simulationAmount, setSimulationAmount] = useState(5000);
  const [simulationAmountDisplay, setSimulationAmountDisplay] = useState('5.000,00');
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [monthlyFixedCost, setMonthlyFixedCost] = useState<number>(0);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingPercentage, setEditingPercentage] = useState<number>(0);

  // Get token from localStorage
  const getToken = () => authService.getStoredAccessToken();

  useEffect(() => {
    fetchConfig();
    fetchMonthlyFixedCost();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/financial/distribution/config', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setConfig(data);
    } catch (error) {
      toast.error('Erro ao carregar configuração');
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyFixedCost = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/financial/distribution/expenses/monthly', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setMonthlyFixedCost(data.total || 0);
    } catch (error) {
      console.error('Erro ao carregar custo mensal fixo:', error);
    }
  };

  const formatCurrencyInput = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';

    const amount = parseFloat(numbers) / 100;
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleSimulationAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numbers = value.replace(/\D/g, '');

    if (!numbers) {
      setSimulationAmount(0);
      setSimulationAmountDisplay('');
      return;
    }

    const numericValue = parseFloat(numbers) / 100;
    setSimulationAmount(numericValue);
    setSimulationAmountDisplay(formatCurrencyInput(value));
  };

  const addCategory = async () => {
    if (!newCategory.name || newCategory.percentage <= 0) {
      toast.error('Preencha todos os campos');
      return;
    }

    // Only count active categories for total percentage
    const activeTotalPercentage = config?.categories?.filter(c => c.isActive).reduce((sum, c) => sum + c.percentage, 0) || 0;
    const totalPercentage = activeTotalPercentage + newCategory.percentage;
    if (totalPercentage > 100) {
      toast.error('Total de porcentagens ativas não pode exceder 100%');
      return;
    }

    try {
      setAddingCategory(true);
      const res = await fetch('http://localhost:3000/api/financial/distribution/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ ...newCategory, color: '#3B82F6', priority: (config?.categories?.length || 0) + 1 }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Erro ao adicionar categoria');
        return;
      }

      toast.success('Categoria adicionada!');
      setNewCategory({ name: '', percentage: 0 });
      fetchConfig();
    } catch (error) {
      toast.error('Erro ao adicionar categoria');
    } finally {
      setAddingCategory(false);
    }
  };

  const toggleCategory = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`http://localhost:3000/api/financial/distribution/categories/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || 'Erro ao atualizar categoria');
        return;
      }

      toast.success(!currentStatus ? 'Categoria ativada!' : 'Categoria desativada!');
      fetchConfig();
    } catch (error) {
      toast.error('Erro ao atualizar categoria');
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await fetch(`http://localhost:3000/api/financial/distribution/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      toast.success('Categoria removida!');
      fetchConfig();
    } catch (error) {
      toast.error('Erro ao remover categoria');
    }
  };

  const startEditing = (categoryId: string, currentPercentage: number) => {
    setEditingCategoryId(categoryId);
    setEditingPercentage(currentPercentage);
  };

  const cancelEditing = () => {
    setEditingCategoryId(null);
    setEditingPercentage(0);
  };

  const savePercentage = async (categoryId: string) => {
    if (editingPercentage < 0 || editingPercentage > 100) {
      toast.error('Porcentagem deve estar entre 0 e 100');
      return;
    }

    // Validate total percentage with the new value
    const otherCategories = config?.categories?.filter(c => c.id !== categoryId && c.isActive) || [];
    const otherCategoriesTotal = otherCategories.reduce((sum, c) => sum + c.percentage, 0);
    const newTotal = otherCategoriesTotal + editingPercentage;

    if (newTotal > 100) {
      toast.error(`Total de porcentagens ativas não pode exceder 100%. Disponível: ${100 - otherCategoriesTotal}%`);
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/financial/distribution/categories/${categoryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ percentage: editingPercentage }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || 'Erro ao atualizar categoria');
        return;
      }

      toast.success('Porcentagem atualizada!');
      setEditingCategoryId(null);
      setEditingPercentage(0);
      await fetchConfig();

      // If simulation is active, re-run it with the updated percentages
      if (simulationResult && simulationAmount > 0) {
        simulate();
      }
    } catch (error) {
      toast.error('Erro ao atualizar categoria');
    }
  };

  const simulate = async () => {
    if (!simulationAmount || simulationAmount <= 0) {
      toast.error('Digite um valor de renda válido');
      return;
    }

    try {
      setSimulating(true);
      const res = await fetch('http://localhost:3000/api/financial/distribution/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ incomeAmount: simulationAmount }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Erro ao simular');
      }

      const data = await res.json();
      console.log('Simulation result:', data);
      setSimulationResult(data);
      toast.success('Simulação concluída!');
    } catch (error: any) {
      console.error('Simulation error:', error);
      toast.error(error.message || 'Erro ao simular distribuição');
    } finally {
      setSimulating(false);
    }
  };

  const totalPercentage = config?.categories?.reduce((sum, c) => sum + c.percentage, 0) || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Distribuição de Renda</h1>
            <p className="text-muted-foreground">Configure como seu salário será distribuído automaticamente</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            {/* Cards de Destaque - Custo Fixo e Fundo Emergencial */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Custo Mensal Fixo */}
              <Card className="border-2 border-primary/50 bg-gradient-to-r from-primary/5 to-primary/10">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Custo Mensal Fixo</p>
                      <p className="text-3xl font-bold text-primary">
                        R$ {monthlyFixedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Recorrentes + Parcelas do mês
                      </p>
                    </div>
                    <DollarSign className="h-14 w-14 text-primary/30 shrink-0" />
                  </div>
                </CardContent>
              </Card>

              {/* Fundo Emergencial */}
              <Card className="border-2 border-orange-500/50 bg-gradient-to-r from-orange-50/50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Fundo Emergencial Recomendado</p>
                      <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                        R$ {(monthlyFixedCost * 12).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        12 meses de custos fixos
                      </p>
                    </div>
                    <PieChart className="h-14 w-14 text-orange-500/30 shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Adicionar Categoria */}
              <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Nova Categoria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Nome da categoria"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Porcentagem"
                  value={newCategory.percentage || ''}
                  onChange={(e) => setNewCategory({ ...newCategory, percentage: Number(e.target.value) })}
                />
                <Button onClick={addCategory} className="w-full" disabled={addingCategory}>
                  {addingCategory ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adicionando...
                    </>
                  ) : (
                    'Adicionar'
                  )}
                </Button>
                {(() => {
                  const activeTotal = config?.categories?.filter(c => c.isActive).reduce((sum, c) => sum + c.percentage, 0) || 0;
                  const remaining = 100 - activeTotal;
                  return (
                    <div className="text-sm">
                      <p className={remaining > 0 ? 'text-orange-600 font-medium' : 'text-green-600 font-medium'}>
                        {remaining > 0 ? `Faltam ${remaining}% para distribuir` : 'Total: 100% ✓'}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Distribuído: {activeTotal}% / 100%
                      </p>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Categorias */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Categorias ({config?.categories?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {config?.categories?.map((category) => {
                  // Calculate real amount based on simulation
                  const realAmount = simulationResult
                    ? (category.percentage / 100) * simulationResult.availableAmount
                    : 0;

                  const isEditing = editingCategoryId === category.id;

                  return (
                    <div key={category.id} className={`space-y-2 p-3 rounded-lg border ${!category.isActive ? 'opacity-50 bg-muted/50' : ''}`}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: category.color }} />
                          <span className="font-medium truncate">{category.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Switch
                            checked={category.isActive}
                            onCheckedChange={() => toggleCategory(category.id, category.isActive)}
                            disabled={isEditing}
                          />
                          {!isEditing && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEditing(category.id, category.percentage)}
                              title="Editar porcentagem"
                            >
                              <Edit2 className="h-4 w-4 text-blue-600" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteCategory(category.id)}
                            disabled={isEditing}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm gap-2">
                        <div className="flex flex-col gap-0.5 flex-1">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={editingPercentage}
                                onChange={(e) => setEditingPercentage(Number(e.target.value))}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    savePercentage(category.id);
                                  } else if (e.key === 'Escape') {
                                    cancelEditing();
                                  }
                                }}
                                className="w-20 h-8"
                                autoFocus
                              />
                              <span className="text-muted-foreground">% da renda disponível</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => savePercentage(category.id)}
                                title="Salvar (Enter)"
                              >
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={cancelEditing}
                                title="Cancelar (Esc)"
                              >
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <span className="text-muted-foreground">
                                {category.percentage}% da renda disponível
                              </span>
                              {simulationResult && realAmount > 0 && (
                                <span className="text-xs font-semibold text-primary">
                                  ≈ R$ {realAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / mês
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        {!isEditing && category.monthlySpent !== undefined && category.monthlySpent > 0 && (
                          <span className="font-semibold text-green-600 text-xs">
                            Gasto: R$ {category.monthlySpent.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>
                      {!isEditing && (
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${category.percentage}%`,
                              backgroundColor: category.color,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
                {!config?.categories?.length && (
                  <p className="text-center text-muted-foreground py-4">Nenhuma categoria configurada</p>
                )}
              </CardContent>
            </Card>

            {/* Simulador */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Simulador de Distribuição
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Digite sua renda mensal. Os gastos fixos serão deduzidos e você receberá uma recomendação de porcentagem para o fundo emergencial.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      R$
                    </span>
                    <Input
                      type="text"
                      placeholder="0,00"
                      value={simulationAmountDisplay}
                      onChange={handleSimulationAmountChange}
                      disabled={simulating}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={simulate} disabled={simulating} className="shrink-0">
                    {simulating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Simulando...
                      </>
                    ) : (
                      'Simular'
                    )}
                  </Button>
                </div>

                {simulationResult && (
                  <div className="space-y-4 p-4 bg-muted rounded-lg">
                    {(() => {
                      const fixedExpensesPercentage = simulationResult.incomeAmount > 0
                        ? (simulationResult.fixedExpenses / simulationResult.incomeAmount) * 100
                        : 0;
                      const isHealthy = fixedExpensesPercentage <= 50;

                      return (
                        <>
                          {/* Alert for Fixed Expenses */}
                          <div className={`p-3 rounded-lg border ${
                            isHealthy
                              ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                              : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                          }`}>
                            <div className="flex items-start gap-2">
                              {isHealthy ? (
                                <div className="shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                                  ✓
                                </div>
                              ) : (
                                <div className="shrink-0 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">
                                  !
                                </div>
                              )}
                              <div className="flex-1">
                                <p className={`text-sm font-semibold ${
                                  isHealthy
                                    ? 'text-green-900 dark:text-green-100'
                                    : 'text-red-900 dark:text-red-100'
                                }`}>
                                  {isHealthy
                                    ? 'Custos Fixos Saudáveis'
                                    : 'Atenção: Custos Fixos Elevados'}
                                </p>
                                <p className={`text-xs mt-1 ${
                                  isHealthy
                                    ? 'text-green-800 dark:text-green-200'
                                    : 'text-red-800 dark:text-red-200'
                                }`}>
                                  Seus custos fixos representam <span className="font-bold">{fixedExpensesPercentage.toFixed(1)}%</span> da sua renda.
                                  {isHealthy
                                    ? ' Excelente! Mantenha abaixo de 50% para ter uma boa margem de manobra financeira.'
                                    : ' O recomendado é manter em até 50% da renda para ter flexibilidade financeira e capacidade de poupança.'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-4 pb-4 border-b">
                            <div>
                              <p className="text-sm text-muted-foreground">Renda</p>
                              <p className="text-xl font-bold text-green-600">
                                R$ {(simulationResult.incomeAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                              <p className="text-xs text-muted-foreground">100%</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Gastos Fixos</p>
                              <p className={`text-xl font-bold ${
                                isHealthy ? 'text-green-600' : 'text-red-600'
                              }`}>
                                - R$ {(simulationResult.fixedExpenses || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                              <p className={`text-xs font-semibold ${
                                isHealthy ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {fixedExpensesPercentage.toFixed(1)}% da renda {isHealthy ? '✓' : '⚠'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Distribuído</p>
                              <p className="text-xl font-bold text-purple-600">
                                - R$ {(simulationResult.totalDistributed || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {simulationResult.incomeAmount > 0 ?
                                  `${((simulationResult.totalDistributed / simulationResult.incomeAmount) * 100).toFixed(1)}% da renda` :
                                  '0%'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Saldo Final</p>
                              <p className="text-xl font-bold text-blue-600">
                                R$ {(simulationResult.remaining || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {simulationResult.incomeAmount > 0 ?
                                  `${((simulationResult.remaining / simulationResult.incomeAmount) * 100).toFixed(1)}% da renda` :
                                  '0%'}
                              </p>
                            </div>
                          </div>
                        </>
                      );
                    })()}

                    {/* Recomendação de Fundo Emergencial */}
                    {simulationResult.emergencyFundRecommendation && (
                      <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center gap-2 mb-2">
                          <PieChart className="h-4 w-4 text-orange-600" />
                          <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">Recomendação: Fundo Emergencial</p>
                        </div>
                        <p className="text-xs text-orange-800 dark:text-orange-200 mb-2">
                          Separe <span className="font-bold">{simulationResult.emergencyFundRecommendation.suggestedPercentage}%</span> da sua renda (
                          <span className="font-bold">R$ {simulationResult.emergencyFundRecommendation.suggestedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          ) mensalmente para sua caixinha de emergência até atingir a meta de <span className="font-bold">R$ {simulationResult.emergencyFundRecommendation.target.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>.
                        </p>
                      </div>
                    )}
                    <div className="space-y-3">
                      <p className="font-medium">Distribuição:</p>
                      {simulationResult.distribution?.map((dist: any) => (
                        <div key={dist.categoryId} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dist.color }} />
                              <span className="text-sm font-medium">{dist.categoryName}</span>
                              <span className="text-xs text-muted-foreground">({dist.percentage}%)</span>
                            </div>
                            <span className="text-sm font-bold">
                              R$ {(dist.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="w-full bg-background rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${((dist.amount || 0) / (simulationResult.availableAmount || 1)) * 100}%`,
                                backgroundColor: dist.color,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
