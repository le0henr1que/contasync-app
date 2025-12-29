'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function FAQ() {
  const faqs = [
    {
      question: 'O que é o período de trial?',
      answer: 'O trial gratuito dura 14 dias e você tem acesso completo a todos os recursos do plano escolhido. Não é necessário cartão de crédito para começar.',
    },
    {
      question: 'Preciso de cartão de crédito para testar?',
      answer: 'Não! Você pode iniciar seu trial de 14 dias sem informar nenhum dado de pagamento. Só pedimos cartão quando você decidir assinar um plano pago.',
    },
    {
      question: 'Posso cancelar a qualquer momento?',
      answer: 'Sim, você pode cancelar sua assinatura a qualquer momento diretamente no painel. Não há taxas de cancelamento e você continua com acesso até o fim do período pago.',
    },
    {
      question: 'Quais são os métodos de pagamento aceitos?',
      answer: 'Aceitamos todos os principais cartões de crédito (Visa, Mastercard, Amex, Elo) através da Stripe. Para planos Enterprise, também oferecemos pagamento por boleto.',
    },
    {
      question: 'Os dados dos meus clientes estão seguros?',
      answer: 'Sim! Todos os dados são criptografados e armazenados com os mais altos padrões de segurança. Somos compatíveis com LGPD e realizamos backups diários automáticos.',
    },
    {
      question: 'Posso mudar de plano depois?',
      answer: 'Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. O valor é ajustado proporcionalmente na próxima cobrança.',
    },
  ];

  return (
    <section className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-lg text-muted-foreground">
            Tire suas dúvidas sobre o ContaSync
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
