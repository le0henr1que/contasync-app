'use client';

import { Clock, Globe, TrendingUp, FileText } from 'lucide-react';

const benefits = [
  {
    icon: Clock,
    title: 'Economize tempo com automação',
    description: 'Automatize tarefas repetitivas e foque no que realmente importa.',
  },
  {
    icon: Globe,
    title: 'Portal do cliente 24/7',
    description: 'Seus clientes acessam documentos e informações quando quiserem.',
  },
  {
    icon: TrendingUp,
    title: 'Controle de gastos em tempo real',
    description: 'Acompanhe receitas e despesas de todos os seus clientes.',
  },
  {
    icon: FileText,
    title: 'Relatórios em PDF e Excel',
    description: 'Gere relatórios profissionais com um clique.',
  },
];

export function Benefits() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Por que escolher o ContaSync?
          </h2>
          <p className="text-xl text-muted-foreground">
            Tudo que você precisa para gerenciar seus clientes
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
