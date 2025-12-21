'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Users, FileText, DollarSign } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    setIsLoading(true);
    try {
      await authService.completeOnboarding();

      // Revalidate user state from server to update onboardingCompleted flag
      const updatedUser = await authService.getCurrentUser();
      setUser(updatedUser);

      onClose();
      toast.success('Bem-vindo ao ContaSync!');
      // Optional: Navigate to add client page or show add client modal
    } catch (error: any) {
      toast.error(error.message || 'Erro ao completar onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      await authService.completeOnboarding();

      // Revalidate user state from server to update onboardingCompleted flag
      const updatedUser = await authService.getCurrentUser();
      setUser(updatedUser);

      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao completar onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Bem-vindo ao ContaSync!
          </DialogTitle>
          <DialogDescription className="text-center text-base mt-2">
            Sua plataforma completa de gestão contábil
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <p className="text-sm text-muted-foreground text-center">
            Com o ContaSync, você pode gerenciar seus clientes, documentos e pagamentos de forma simples e organizada.
          </p>

          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Gestão de Clientes</h4>
                <p className="text-sm text-muted-foreground">
                  Cadastre e organize todos os seus clientes em um só lugar
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Documentos Organizados</h4>
                <p className="text-sm text-muted-foreground">
                  Envie e receba documentos fiscais com segurança
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Controle Financeiro</h4>
                <p className="text-sm text-muted-foreground">
                  Registre e acompanhe pagamentos de forma eficiente
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Tudo Sincronizado</h4>
                <p className="text-sm text-muted-foreground">
                  Seus clientes podem acessar seus documentos e pagamentos em tempo real
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm font-medium">Próximo passo</p>
            <p className="text-sm text-muted-foreground mt-1">
              Comece cadastrando seu primeiro cliente!
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Pular
          </Button>
          <Button
            onClick={handleStart}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? 'Carregando...' : 'Começar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
