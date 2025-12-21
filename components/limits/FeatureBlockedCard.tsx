'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, TrendingUp, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface FeatureBlockedCardProps {
  featureName: string;
  featureDescription: string;
  icon?: React.ReactNode;
  benefits?: string[];
}

export function FeatureBlockedCard({
  featureName,
  featureDescription,
  icon,
  benefits = [
    'Acesso completo a esta funcionalidade',
    'Suporte prioritário',
    'Recursos ilimitados ou expandidos',
    'Atualizações contínuas',
  ],
}: FeatureBlockedCardProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {icon || <Lock className="h-8 w-8 text-muted-foreground" />}
              <div>
                <CardTitle className="text-2xl">{featureName}</CardTitle>
                <CardDescription className="mt-1">{featureDescription}</CardDescription>
              </div>
            </div>
            <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300">
              <Lock className="h-3 w-3 mr-1" />
              Bloqueado
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 p-6 rounded-lg border border-muted">
            <div className="flex items-start gap-3 mb-4">
              <Lock className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Funcionalidade não disponível no seu plano</h3>
                <p className="text-sm text-muted-foreground">
                  Esta funcionalidade não está incluída no seu plano atual. Faça upgrade para desbloquear
                  {' '}{featureName.toLowerCase()} e aproveitar todos os recursos da plataforma.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              O que você ganha ao fazer upgrade:
            </h4>
            <ul className="space-y-2">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t">
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/billing" className="flex-1">
                <Button className="w-full" size="lg">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Ver Planos e Fazer Upgrade
                </Button>
              </Link>
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full" size="lg">
                  Voltar ao Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
