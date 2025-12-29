'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Check, Crown, Lock, TrendingUp, Users, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose?: () => void;
  canClose?: boolean; // If false, user must upgrade to continue
  trialEndDate?: string | Date;
  companyName?: string;
}

export function UpgradeModal({
  isOpen,
  onClose,
  canClose = false,
  trialEndDate,
  companyName,
}: UpgradeModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleUpgrade = () => {
    router.push('/dashboard/billing');
  };

  const handleViewPlans = () => {
    router.push('/pricing');
  };

  const handleLogout = () => {
    // Clear auth state and redirect to login
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/login');
  };

  if (!mounted) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={canClose ? onClose : undefined}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={canClose ? undefined : (e) => e.preventDefault()}
        onEscapeKeyDown={canClose ? undefined : (e) => e.preventDefault()}
      >
        {/* Header */}
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <Lock className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Seu Trial Expirou
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {companyName && (
              <>
                O período de avaliação gratuito da <strong>{companyName}</strong> terminou.
                <br />
              </>
            )}
            Para continuar usando o ContaSync, escolha um plano que atenda às suas necessidades.
          </DialogDescription>
        </DialogHeader>

        {/* What Happens Now */}
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              O que acontece agora?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 text-sm">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/20 text-destructive flex-shrink-0 mt-0.5">
                ✕
              </div>
              <div>
                <p className="font-medium">Acesso bloqueado</p>
                <p className="text-muted-foreground">Você não pode mais acessar o sistema</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/20 text-destructive flex-shrink-0 mt-0.5">
                ✕
              </div>
              <div>
                <p className="font-medium">Portal do cliente desativado</p>
                <p className="text-muted-foreground">Seus clientes não podem acessar documentos e pagamentos</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-white flex-shrink-0 mt-0.5">
                ✓
              </div>
              <div>
                <p className="font-medium">Seus dados estão seguros</p>
                <p className="text-muted-foreground">Todas as informações serão preservadas e restauradas ao assinar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Plan Highlights */}
        <div className="space-y-3">
          <h3 className="font-semibold text-center">Escolha o plano ideal para você</h3>
          <div className="grid gap-3 md:grid-cols-3">
            {/* Starter Plan */}
            <Card className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Users className="h-5 w-5 text-primary" />
                  <Badge variant="outline">Ideal para começar</Badge>
                </div>
                <CardTitle className="text-lg">Starter</CardTitle>
                <div className="text-2xl font-bold">R$ 97<span className="text-sm font-normal text-muted-foreground">/mês</span></div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Até 10 clientes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>100 documentos/mês</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>5 GB armazenamento</span>
                </div>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className="relative border-primary shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary">Mais Popular</Badge>
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <Badge variant="secondary">Recomendado</Badge>
                </div>
                <CardTitle className="text-lg">Professional</CardTitle>
                <div className="text-2xl font-bold">R$ 197<span className="text-sm font-normal text-muted-foreground">/mês</span></div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Até 50 clientes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>500 documentos/mês</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>25 GB armazenamento</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Relatórios avançados</span>
                </div>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Crown className="h-5 w-5 text-primary" />
                  <Badge variant="outline">Sem limites</Badge>
                </div>
                <CardTitle className="text-lg">Enterprise</CardTitle>
                <div className="text-2xl font-bold">R$ 397<span className="text-sm font-normal text-muted-foreground">/mês</span></div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Clientes ilimitados</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Documentos ilimitados</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>100 GB armazenamento</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Suporte prioritário</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>API Access</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <DialogFooter className="flex-col sm:flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              onClick={handleUpgrade}
              className="flex-1 gap-2"
              size="lg"
            >
              <Zap className="h-5 w-5" />
              Escolher Plano e Continuar
            </Button>
            <Button
              onClick={handleViewPlans}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              Comparar Todos os Planos
            </Button>
          </div>

          {canClose && (
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full"
              size="sm"
            >
              Fechar
            </Button>
          )}

          {!canClose && (
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full text-muted-foreground"
              size="sm"
            >
              Sair da Conta
            </Button>
          )}
        </DialogFooter>

        {/* Help Text */}
        <div className="text-center text-sm text-muted-foreground">
          Dúvidas? Entre em contato com nosso suporte:{' '}
          <a href="mailto:suporte@contasync.com" className="text-primary hover:underline">
            suporte@contasync.com
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
