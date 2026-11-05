import { MetadataRoute } from 'next';

import { envConfigs } from '@/config';

export default function robots(): MetadataRoute.Robots {
  const appUrl = envConfigs.app_url;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/*?*q=',
          '/privacy-policy',
          '/terms-of-service',
          '/settings/*',
          '/activity/*',
          '/admin/*',
          '/api/*',
        ],
      },
      // Explicitly allow Generative Engine Optimization (GEO) Search Crawlers
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/admin/*', '/settings/*'],
      },
      {
        userAgent: 'OAI-SearchBot',
        allow: '/',
        disallow: ['/admin/*', '/settings/*'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/admin/*', '/settings/*'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/admin/*', '/settings/*'],
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: ['/admin/*', '/settings/*'],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
