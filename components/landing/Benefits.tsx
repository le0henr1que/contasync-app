'use client';

import { Clock, Globe, TrendingUp, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { FadeIn } from '@/components/ui/fade-in';

export function Benefits() {
  const benefits = [
    {
      icon: Clock,
      title: 'Economize tempo com automação',
      description: 'Automatize processos repetitivos e foque no que importa',
    },
    {
      icon: Globe,
      title: 'Portal do cliente 24/7',
      description: 'Seus clientes acessam documentos e pagamentos a qualquer hora',
    },
    {
      icon: TrendingUp,
      title: 'Controle de gastos em tempo real',
      description: 'Dashboards e relatórios atualizados automaticamente',
    },
    {
      icon: FileText,
      title: 'Relatórios em PDF e Excel',
      description: 'Exporte dados facilmente para análise e compartilhamento',
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Por que escolher o ContaSync?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tudo que você precisa para gerenciar seus clientes de forma eficiente
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {benefits.map((benefit, index) => (
            <FadeIn key={index} delay={index * 0.15} direction="up">
              <Card>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="shrink-0">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <benefit.icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
