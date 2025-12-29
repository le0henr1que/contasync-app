import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://contasync.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/pricing',
          '/signup',
          '/login',
        ],
        disallow: [
          '/dashboard/',
          '/client-portal/',
          '/accountant-portal/',
          '/onboarding/',
          '/api/',
          '/admin/',
          '/*?*', // Disallow query parameters (can be adjusted)
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/'], // Block OpenAI crawlers if desired
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
