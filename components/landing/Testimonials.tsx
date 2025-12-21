'use client';

import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Maria Silva',
    role: 'Contadora Autônoma',
    content: 'O ContaSync mudou a forma como gerencio meus clientes. Economizo pelo menos 10 horas por semana!',
    rating: 5,
  },
  {
    name: 'João Santos',
    role: 'Escritório Contábil',
    content: 'Finalmente encontrei uma solução completa. Meus clientes adoram o portal self-service.',
    rating: 5,
  },
  {
    name: 'Ana Oliveira',
    role: 'Freelancer',
    content: 'Interface intuitiva e relatórios profissionais. Recomendo para todos os contadores!',
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">O que dizem nossos clientes</h2>
          <p className="text-xl text-muted-foreground">Junte-se a centenas de contadores satisfeitos</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6">&ldquo;{testimonial.content}&rdquo;</p>
              <div>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
