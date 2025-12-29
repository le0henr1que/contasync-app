'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, Mail, ArrowRight, Calendar, CreditCard } from 'lucide-react';

function SignupSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('ID de sessão não encontrado');
      setLoading(false);
      return;
    }

    // In a real implementation, you might want to verify the session with the backend
    // For now, we'll just show a success message
    setLoading(false);
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando seu pagamento...</p>
        </div>
      </div>
    );
  }

  if (error && !sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md p-8 text-center">
          <div className="mb-6">
            <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Link Inválido</h1>
            <p className="text-muted-foreground">
              O link de confirmação está inválido ou expirado.
            </p>
          </div>

          <Button asChild className="w-full">
            <Link href="/pricing">
              Voltar para Planos
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background px-4 py-12">
      <Card className="max-w-2xl p-8">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Pagamento Confirmado!</h1>
          <p className="text-lg text-muted-foreground">
            Sua conta foi criada com sucesso
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Verifique seu Email</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Enviamos um email de boas-vindas com instruções para começar a usar o ContaSync.
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Cobrança Confirmada</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Seu pagamento foi processado com sucesso pelo Stripe. Você receberá um recibo por email.
            </p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-muted/50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Próximos Passos
          </h3>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 flex items-center justify-center flex-shrink-0">
                1
              </Badge>
              <span>
                Verifique sua caixa de entrada (e spam) para o email de boas-vindas
              </span>
            </li>
            <li className="flex gap-3">
              <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 flex items-center justify-center flex-shrink-0">
                2
              </Badge>
              <span>
                Faça login no sistema usando o email e senha cadastrados
              </span>
            </li>
            <li className="flex gap-3">
              <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 flex items-center justify-center flex-shrink-0">
                3
              </Badge>
              <span>
                Complete o wizard de onboarding para configurar sua conta
              </span>
            </li>
            <li className="flex gap-3">
              <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 flex items-center justify-center flex-shrink-0">
                4
              </Badge>
              <span>
                Comece a adicionar clientes, documentos e pagamentos!
              </span>
            </li>
          </ol>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="flex-1" size="lg">
            <Link href="/login">
              <ArrowRight className="mr-2 h-4 w-4" />
              Fazer Login
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1" size="lg">
            <Link href="/">
              Voltar para Home
            </Link>
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          Precisa de ajuda? Entre em contato conosco em{' '}
          <a href="mailto:suporte@contasync.com" className="text-primary hover:underline">
            suporte@contasync.com
          </a>
        </p>
      </Card>
    </div>
  );
}

export default function SignupSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <SignupSuccessContent />
    </Suspense>
  );
}
