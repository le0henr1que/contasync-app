'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Plus, Trash2, Edit2, Loader2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface DistributionCategory {
  id: string;
  name: string;
  percentage: number;
  color: string;
  icon: string;
  priority: number;
  isActive: boolean;
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
  const [newCategory, setNewCategory] = useState({ name: '', percentage: 0 });
  const [simulationAmount, setSimulationAmount] = useState(5000);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  // Get token from localStorage
  const getToken = () => authService.getStoredAccessToken();

  useEffect(() => {
    fetchConfig();
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

  const addCategory = async () => {
    if (!newCategory.name || newCategory.percentage <= 0) {
      toast.error('Preencha todos os campos');
      return;
    }

    const totalPercentage = (config?.categories?.reduce((sum, c) => sum + c.percentage, 0) || 0) + newCategory.percentage;
    if (totalPercentage > 100) {
      toast.error('Total de porcentagens não pode exceder 100%');
      return;
    }

    try {
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

  const simulate = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/financial/distribution/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ incomeAmount: simulationAmount }),
      });
      const data = await res.json();
      setSimulationResult(data);
      toast.success('Simulação concluída!');
    } catch (error) {
      toast.error('Erro ao simular distribuição');
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
                <Button onClick={addCategory} className="w-full">
                  Adicionar
                </Button>
                <p className="text-sm text-muted-foreground">
                  Total: {totalPercentage}% / 100%
                </p>
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
                {config?.categories?.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{category.percentage}%</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${category.percentage}%`,
                          backgroundColor: category.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
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
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    type="number"
                    placeholder="Valor do salário"
                    value={simulationAmount}
                    onChange={(e) => setSimulationAmount(Number(e.target.value))}
                  />
                  <Button onClick={simulate}>Simular</Button>
                </div>

                {simulationResult && (
                  <div className="space-y-4 p-4 bg-muted rounded-lg">
                    <div className="grid grid-cols-3 gap-4 pb-4 border-b">
                      <div>
                        <p className="text-sm text-muted-foreground">Renda</p>
                        <p className="text-xl font-bold text-green-600">
                          R$ {(simulationResult.incomeAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Gastos Fixos</p>
                        <p className="text-xl font-bold text-red-600">
                          - R$ {(simulationResult.fixedExpenses || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Disponível</p>
                        <p className="text-xl font-bold text-blue-600">
                          R$ {(simulationResult.availableAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
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
        )}
      </div>
    </DashboardLayout>
  );
}
