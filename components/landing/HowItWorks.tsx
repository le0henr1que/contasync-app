'use client';

import { UserPlus, Users, Layout } from 'lucide-react';
import { FadeIn } from '@/components/ui/fade-in';

export function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      title: '1. Cadastre-se em 1 minuto',
      description: 'Crie sua conta gratuitamente e comece seu trial de 14 dias',
    },
    {
      icon: Users,
      title: '2. Convide seus clientes',
      description: 'Envie convites por email e gerencie todos em um só lugar',
    },
    {
      icon: Layout,
      title: '3. Centralize tudo',
      description: 'Documentos, pagamentos e despesas organizados automaticamente',
    },
  ];

  return (
    <section className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Como Funciona
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comece a economizar tempo em 3 passos simples
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <FadeIn key={index} delay={index * 0.2} direction="up">
              <div className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
