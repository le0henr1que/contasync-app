import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Desabilitar checagem de TypeScript durante o build para Vercel
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Permitir imagens de domínios externos
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '*.contasync.com',
        pathname: '/uploads/**',
      },
    ],
    // Formatos otimizados (Next.js converte automaticamente para WebP/AVIF)
    formats: ['image/avif', 'image/webp'],
    // Tamanhos responsivos padrão
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache das imagens otimizadas (1 ano)
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
