'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { FadeIn } from '@/components/ui/fade-in';

export function Testimonials() {
  const testimonials = [
    {
      name: 'Maria Silva',
      role: 'Contadora',
      company: 'Silva & Associados',
      content: 'O ContaSync revolucionou minha rotina. Economizo mais de 10 horas por semana apenas na organização de documentos.',
      rating: 5,
    },
    {
      name: 'João Santos',
      role: 'Gestor',
      company: 'Contabilidade Moderna',
      content: 'Ferramenta indispensável! O portal do cliente melhorou muito nossa comunicação e reduz drasticamente ligações.',
      rating: 5,
    },
    {
      name: 'Ana Costa',
      role: 'Contadora',
      company: 'Costa Contabilidade',
      content: 'Simples, intuitivo e completo. Meus clientes adoram ter acesso 24/7 aos documentos e pagamentos.',
      rating: 5,
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            O que nossos clientes dizem
          </h2>
          <p className="text-lg text-muted-foreground">
            Junte-se a centenas de contadores satisfeitos
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <FadeIn key={index} delay={index * 0.15} direction="up">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                  <div className="border-t pt-4">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.company}</p>
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
