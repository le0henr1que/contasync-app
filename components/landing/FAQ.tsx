'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'O que é o período de trial?',
    answer:
      'O trial gratuito dura 14 dias e você tem acesso completo a todas as funcionalidades do plano escolhido. Não é necessário cartão de crédito para começar.',
  },
  {
    question: 'Preciso de cartão de crédito para testar?',
    answer:
      'Não! Você pode começar seu trial de 14 dias sem precisar cadastrar nenhum cartão de crédito. Só pedimos os dados de pagamento se você decidir continuar usando após o trial.',
  },
  {
    question: 'Posso cancelar a qualquer momento?',
    answer:
      'Sim! Você pode cancelar sua assinatura a qualquer momento, sem multas ou taxas. Se cancelar, você ainda terá acesso até o final do período pago.',
  },
  {
    question: 'Quais são os métodos de pagamento?',
    answer:
      'Aceitamos todos os principais cartões de crédito (Visa, Mastercard, Elo, American Express) através do Stripe, nossa plataforma de pagamentos segura.',
  },
  {
    question: 'Os dados dos meus clientes estão seguros?',
    answer:
      'Sim! Utilizamos criptografia de ponta a ponta e seguimos as melhores práticas de segurança. Os dados de cada cliente são completamente isolados e protegidos.',
  },
  {
    question: 'Posso mudar de plano depois?',
    answer:
      'Claro! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. No caso de upgrade, o valor é proporcional. No downgrade, a mudança entra em vigor no próximo ciclo de cobrança.',
  },
];

export function FAQ() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Perguntas Frequentes</h2>
          <p className="text-xl text-muted-foreground">
            Tire suas dúvidas sobre o ContaSync
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-background rounded-lg px-6 border">
                <AccordionTrigger className="text-left hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
