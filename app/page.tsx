import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Benefits } from '@/components/landing/Benefits';
import { PricingPreview } from '@/components/landing/PricingPreview';
import { Testimonials } from '@/components/landing/Testimonials';
import { FAQ } from '@/components/landing/FAQ';
import { Footer } from '@/components/landing/Footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'ContaSync - Gestão Financeira para Contadores e Escritórios',
  description:
    'Plataforma completa para contadores gerenciarem clientes, documentos, pagamentos e despesas. Trial gratuito de 14 dias.',
  openGraph: {
    title: 'ContaSync - Gestão Financeira para Contadores',
    description: 'Centralize seus clientes em um só lugar. Trial gratuito de 14 dias.',
    url: 'https://contasync.com',
    siteName: 'ContaSync',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ContaSync - Gestão Financeira',
    description: 'Trial gratuito de 14 dias',
  },
};

export default function LandingPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ContaSync',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '29.90',
      priceCurrency: 'BRL',
      priceValidUntil: '2025-12-31',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127',
    },
    description:
      'Plataforma completa para contadores gerenciarem clientes, documentos, pagamentos e despesas. Trial gratuito de 14 dias.',
  };

  return (
    <div className="min-h-screen">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Header/Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="h-8 w-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xl font-bold">ContaSync</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#como-funciona" className="text-sm hover:text-primary">
              Como Funciona
            </Link>
            <Link href="/pricing" className="text-sm hover:text-primary">
              Preços
            </Link>
            <Link href="#faq" className="text-sm hover:text-primary">
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Começar Grátis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Sections */}
      <Hero />
      <div id="como-funciona">
        <HowItWorks />
      </div>
      <Benefits />
      <PricingPreview />
      <Testimonials />
      <div id="faq">
        <FAQ />
      </div>

      {/* Final CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Comece seu trial gratuito de 14 dias agora. Sem cartão de crédito.
          </p>
          <Button size="lg" variant="secondary" asChild className="text-lg px-8">
            <Link href="/signup">Começar Trial Gratuito</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
