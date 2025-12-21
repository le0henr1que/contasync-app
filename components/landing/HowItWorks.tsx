'use client';

import { UserPlus, Users, LayoutDashboard } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Cadastre-se em 1 minuto',
    description: 'Crie sua conta gratuita e comece seu trial de 14 dias sem precisar de cartão.',
  },
  {
    icon: Users,
    title: 'Convide seus clientes',
    description: 'Envie convites por email e seus clientes terão acesso ao portal personalizado.',
  },
  {
    icon: LayoutDashboard,
    title: 'Centralize tudo em um lugar',
    description: 'Gerencie documentos, pagamentos, despesas e relatórios de forma organizada.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Como Funciona</h2>
          <p className="text-xl text-muted-foreground">
            Em apenas 3 passos você está pronto para usar
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <div className="bg-background rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-primary/20" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
