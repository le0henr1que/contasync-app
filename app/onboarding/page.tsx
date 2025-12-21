'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  User,
  Target,
  Rocket,
  FileText,
  CreditCard,
  Users,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

type OnboardingStep = 1 | 2 | 3 | 4;

interface FormData {
  cpf: string;
  phone: string;
  goal: 'ORGANIZATION' | 'TAX_COMPLIANCE' | 'FINANCIAL_CONTROL' | '';
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    cpf: '',
    phone: '',
    goal: '',
  });

  const progress = (currentStep / 4) * 100;

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as OnboardingStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as OnboardingStep);
    }
  };

  const handleSkip = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as OnboardingStep);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/complete-onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao completar onboarding');
      }

      toast.success('Bem-vindo ao ContaSync!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Complete onboarding error:', error);
      toast.error('Erro ao completar onboarding');
    } finally {
      setIsCompleting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Bem-vindo ao ContaSync!</h2>
              <p className="text-muted-foreground text-lg">
                Vamos configurar sua conta em apenas 4 passos rápidos.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3 mt-8">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Documentos</h3>
                <p className="text-sm text-muted-foreground">
                  Organize e compartilhe documentos fiscais
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <CreditCard className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Pagamentos</h3>
                <p className="text-sm text-muted-foreground">
                  Registre e acompanhe pagamentos
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Clientes</h3>
                <p className="text-sm text-muted-foreground">
                  Gerencie todos seus clientes
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-900">Trial de 14 dias grátis</p>
                <p className="text-sm text-blue-700">
                  Você tem acesso completo a todos os recursos. Sem cartão de crédito necessário.
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <User className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Informações Pessoais</h2>
              <p className="text-muted-foreground">
                Ajude-nos a conhecer você melhor (opcional)
              </p>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Usado apenas para identificação
                </p>
              </div>

              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Para contato e notificações importantes
                </p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Qual seu objetivo principal?</h2>
              <p className="text-muted-foreground">
                Isso nos ajuda a personalizar sua experiência
              </p>
            </div>

            <div className="grid gap-4 max-w-2xl mx-auto">
              <button
                onClick={() => setFormData({ ...formData, goal: 'ORGANIZATION' })}
                className={`p-4 rounded-lg border-2 text-left transition-all hover:border-primary ${
                  formData.goal === 'ORGANIZATION'
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                }`}
              >
                <div className="flex items-start gap-3">
                  <FileText className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Organizar Documentos</h3>
                    <p className="text-sm text-muted-foreground">
                      Manter documentos fiscais organizados e acessíveis
                    </p>
                  </div>
                  {formData.goal === 'ORGANIZATION' && (
                    <CheckCircle2 className="h-5 w-5 text-primary ml-auto flex-shrink-0" />
                  )}
                </div>
              </button>

              <button
                onClick={() => setFormData({ ...formData, goal: 'TAX_COMPLIANCE' })}
                className={`p-4 rounded-lg border-2 text-left transition-all hover:border-primary ${
                  formData.goal === 'TAX_COMPLIANCE'
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                }`}
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Conformidade Fiscal</h3>
                    <p className="text-sm text-muted-foreground">
                      Garantir que tudo está em dia com o contador
                    </p>
                  </div>
                  {formData.goal === 'TAX_COMPLIANCE' && (
                    <CheckCircle2 className="h-5 w-5 text-primary ml-auto flex-shrink-0" />
                  )}
                </div>
              </button>

              <button
                onClick={() => setFormData({ ...formData, goal: 'FINANCIAL_CONTROL' })}
                className={`p-4 rounded-lg border-2 text-left transition-all hover:border-primary ${
                  formData.goal === 'FINANCIAL_CONTROL'
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                }`}
              >
                <div className="flex items-start gap-3">
                  <CreditCard className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Controle Financeiro</h3>
                    <p className="text-sm text-muted-foreground">
                      Acompanhar receitas, despesas e pagamentos
                    </p>
                  </div>
                  {formData.goal === 'FINANCIAL_CONTROL' && (
                    <CheckCircle2 className="h-5 w-5 text-primary ml-auto flex-shrink-0" />
                  )}
                </div>
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Rocket className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Tudo Pronto!</h2>
              <p className="text-muted-foreground text-lg">
                Sua conta está configurada. Vamos começar?
              </p>
            </div>

            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="font-semibold text-lg mb-4">Próximos Passos Recomendados:</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Adicione seu primeiro cliente</p>
                    <p className="text-sm text-muted-foreground">
                      Comece convidando clientes para se conectarem com você
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Faça upload de um documento</p>
                    <p className="text-sm text-muted-foreground">
                      Teste o sistema de documentos fiscais
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Registre um pagamento</p>
                    <p className="text-sm text-muted-foreground">
                      Experimente o controle financeiro
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 max-w-2xl mx-auto">
              <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-900">Trial ativo até {getTrialEndDate()}</p>
                <p className="text-sm text-blue-700">
                  Explore todos os recursos sem limitações. Escolha seu plano antes do fim do trial.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getTrialEndDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            Passo {currentStep} de 4
          </Badge>
          <Progress value={progress} className="h-2 mb-2" />
        </div>

        {/* Content Card */}
        <Card className="mb-8">
          <CardContent className="pt-8 pb-8">{renderStep()}</CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>

          <div className="flex gap-2">
            {currentStep < 4 && (
              <Button variant="ghost" onClick={handleSkip}>
                Pular
              </Button>
            )}

            {currentStep < 4 ? (
              <Button onClick={handleNext} className="gap-2">
                Próximo
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={isCompleting} className="gap-2">
                {isCompleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Finalizando...
                  </>
                ) : (
                  <>
                    Ir para o Dashboard
                    <Rocket className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
