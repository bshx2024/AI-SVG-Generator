import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';
import createIntlMiddleware from 'next-intl/middleware';

import { routing } from '@/core/i18n/config';

const intlMiddleware = createIntlMiddleware(routing);

// Suspicious probing patterns often hit by vulnerability scanners
const SCANNER_INDICATORS = [
  'wp-admin',
  'wp-content',
  'wp-includes',
  'wp-login',
  'phpmyadmin',
  'actuator',
  'solr',
  'cgi-bin',
  'autodiscover',
  'xmlrpc',
  '.env',
  '.git',
  '.php',
];

interface BotClassification {
  isBot: boolean;
  botName: string;
  category: 'search' | 'ai' | 'social' | 'seo_tool' | 'human';
}

function classifyUserAgent(ua: string): BotClassification {
  if (!ua) return { isBot: false, botName: '', category: 'human' };
  const lower = ua.toLowerCase();

  // 1. Search Engine Crawlers
  if (lower.includes('googlebot')) return { isBot: true, botName: 'googlebot', category: 'search' };
  if (lower.includes('bingbot')) return { isBot: true, botName: 'bingbot', category: 'search' };
  if (lower.includes('baiduspider')) return { isBot: true, botName: 'baiduspider', category: 'search' };
  if (lower.includes('duckduckbot')) return { isBot: true, botName: 'duckduckbot', category: 'search' };
  if (lower.includes('yandexbot')) return { isBot: true, botName: 'yandexbot', category: 'search' };
  if (lower.includes('sogou')) return { isBot: true, botName: 'sogou', category: 'search' };

  // 2. AI / LLM Search Indexers (GEO)
  if (lower.includes('gptbot')) return { isBot: true, botName: 'gptbot', category: 'ai' };
  if (lower.includes('chatgpt-user')) return { isBot: true, botName: 'chatgpt-user', category: 'ai' };
  if (lower.includes('perplexitybot')) return { isBot: true, botName: 'perplexitybot', category: 'ai' };
  if (lower.includes('claudebot')) return { isBot: true, botName: 'claudebot', category: 'ai' };
  if (lower.includes('amazonbot')) return { isBot: true, botName: 'amazonbot', category: 'ai' };
  if (lower.includes('applebot')) return { isBot: true, botName: 'applebot', category: 'ai' };
  if (lower.includes('bytespider')) return { isBot: true, botName: 'bytespider', category: 'ai' };
  if (lower.includes('anthropic-ai')) return { isBot: true, botName: 'anthropic-ai', category: 'ai' };

  // 3. Social Media & Community Link Previews
  if (lower.includes('twitterbot')) return { isBot: true, botName: 'twitterbot', category: 'social' };
  if (lower.includes('facebookexternalhit')) return { isBot: true, botName: 'facebookbot', category: 'social' };
  if (lower.includes('linkedinbot')) return { isBot: true, botName: 'linkedinbot', category: 'social' };
  if (lower.includes('discordbot')) return { isBot: true, botName: 'discordbot', category: 'social' };
  if (lower.includes('slackbot')) return { isBot: true, botName: 'slackbot', category: 'social' };
  if (lower.includes('telegrambot')) return { isBot: true, botName: 'telegrambot', category: 'social' };
  if (lower.includes('pinterest')) return { isBot: true, botName: 'pinterestbot', category: 'social' };

  // 4. Commercial SEO Scanners
  if (lower.includes('ahrefsbot')) return { isBot: true, botName: 'ahrefsbot', category: 'seo_tool' };
  if (lower.includes('semrushbot')) return { isBot: true, botName: 'semrushbot', category: 'seo_tool' };
  if (lower.includes('dotbot')) return { isBot: true, botName: 'dotbot', category: 'seo_tool' };

  return { isBot: false, botName: '', category: 'human' };
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const lowerPath = pathname.toLowerCase();

  // Edge Shield: Block malicious probes immediately with 404 to save server compute
  if (SCANNER_INDICATORS.some((ind) => lowerPath.includes(ind))) {
    return new Response('Not Found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  // Detect and classify bots & search crawlers
  const ua = request.headers.get('user-agent') || '';
  const botInfo = classifyUserAgent(ua);

  if (botInfo.isBot) {
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Structured logging for Vercel Log Streams / Datadog / Axiom
    console.log(
      JSON.stringify({
        level: 'info',
        type: 'bot_visit',
        bot: botInfo.botName,
        category: botInfo.category,
        path: pathname,
        ip: clientIp,
        time: new Date().toISOString(),
      })
    );
  }

  // Handle internationalization
  const intlResponse = intlMiddleware(request);

  // Attach bot metadata headers for downstream inspection/caching
  if (botInfo.isBot) {
    intlResponse.headers.set('x-bot-detected', botInfo.botName);
    intlResponse.headers.set('x-bot-category', botInfo.category);
  }

  // Extract locale from pathname
  const locale = pathname.split('/')[1];
  const isValidLocale = routing.locales.includes(locale as any);
  const pathWithoutLocale = isValidLocale
    ? pathname.slice(locale.length + 1)
    : pathname;

  // Only check authentication for admin routes
  if (
    pathWithoutLocale.startsWith('/admin') ||
    pathWithoutLocale.startsWith('/settings') ||
    pathWithoutLocale.startsWith('/activity')
  ) {
    // Check if session cookie exists
    const sessionCookie = getSessionCookie(request);

    // If no session token found, redirect to sign-in
    if (!sessionCookie) {
      const signInUrl = new URL(
        isValidLocale ? `/${locale}/sign-in` : '/sign-in',
        request.url
      );
      // Add the current path (including search params) as callback - use relative path for multi-language support
      const callbackPath = pathWithoutLocale + request.nextUrl.search;
      signInUrl.searchParams.set('callbackUrl', callbackPath);
      return NextResponse.redirect(signInUrl);
    }
  }

  intlResponse.headers.set('x-pathname', request.nextUrl.pathname);
  intlResponse.headers.set('x-url', request.url);

  // Remove Set-Cookie from public pages to allow Edge caching
  // We exclude admin, settings, activity, and auth pages from this behavior
  if (
    !pathWithoutLocale.startsWith('/admin') &&
    !pathWithoutLocale.startsWith('/settings') &&
    !pathWithoutLocale.startsWith('/activity') &&
    !pathWithoutLocale.startsWith('/sign-') &&
    !pathWithoutLocale.startsWith('/auth')
  ) {
    intlResponse.headers.delete('Set-Cookie');

    // Cache-Control header for public pages
    const cacheControl = 'public, s-maxage=3600, stale-while-revalidate=14400';

    intlResponse.headers.set('Cache-Control', cacheControl);
    intlResponse.headers.set('CDN-Cache-Control', cacheControl);
    intlResponse.headers.set('Cloudflare-CDN-Cache-Control', cacheControl);
  }

  // For all other routes (including /, /sign-in, /sign-up, /sign-out), return the intl response
  return intlResponse;
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
