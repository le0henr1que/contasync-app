'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Acesso Negado</CardTitle>
          <CardDescription className="text-base">
            Você não tem permissão para acessar esta página.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-center text-gray-600">
            Esta área é restrita a usuários com permissões específicas. Se você acredita que deveria ter
            acesso, entre em contato com o administrador do sistema.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => router.back()}>
              Voltar
            </Button>
            <Button onClick={() => router.push('/dashboard')}>
              Ir para Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
