import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Planos e Preços - ContaSync',
  description: 'Compare nossos planos e escolha o melhor para você. A partir de R$ 29,90/mês. Trial gratuito de 14 dias.',
  openGraph: {
    title: 'Planos e Preços - ContaSync',
    description: 'Compare nossos planos e escolha o melhor para você. Trial gratuito de 14 dias.',
    url: 'https://contasync.com/pricing',
    siteName: 'ContaSync',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Planos e Preços - ContaSync',
    description: 'A partir de R$ 29,90/mês. Trial gratuito de 14 dias.',
  },
  alternates: {
    canonical: 'https://contasync.com/pricing',
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
