/**
 * Dual-Touch Attribution Engine (First Touch + Last Touch)
 * Adapted and enhanced from APIVALE for Next.js 16 SaaS.
 * 
 * Captures:
 * 1. Explicit marketing tags: utm_source, utm_medium, utm_campaign, utm_term, utm_content, ref, aff, channel
 * 2. Organic Search Engine Referrers: Google, Bing, DuckDuckGo, Baidu, Yandex, Yahoo
 * 3. Social & Community Referrers: Reddit, Twitter/X, Pinterest, YouTube, TikTok, Facebook, Instagram, GitHub, Discord
 * 4. AI & SaaS Directories: Toolify, TAAFT (theresanaiforthat), Product Hunt, Futurepedia
 * 5. Direct access fallback
 * 
 * Storage:
 * - First Touch: Cookie (attr_ft, 365 days) + LocalStorage (attr_first_touch)
 * - Last Touch: Cookie (attr_lt, 30 days) + LocalStorage (attr_last_touch)
 * - Legacy: Cookie (utm_source) for backward compatibility
 */

import { getCookie, setCookie } from '@/shared/lib/cookie';

export interface TouchAttribution {
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
  referrer: string;
  landing: string;
  timestamp: number;
}

export interface AttributionPayload {
  first_source?: string;
  first_medium?: string;
  first_campaign?: string;
  first_referrer?: string;
  first_landing?: string;
  first_touch_at?: number;

  last_source?: string;
  last_medium?: string;
  last_campaign?: string;

  register_lang?: string;
}

export const COOKIE_FT_KEY = 'attr_ft';
export const COOKIE_LT_KEY = 'attr_lt';
export const STORAGE_FT_KEY = 'attr_first_touch';
export const STORAGE_LT_KEY = 'attr_last_touch';
export const LEGACY_UTM_COOKIE = 'utm_source';

export const FT_MAX_DAYS = 365; // 1 year
export const LT_MAX_DAYS = 30;  // 30 days

/**
 * Parses current visitor's traffic source from URL params and document.referrer
 */
export function parseTrafficSource(): {
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
  referrer: string;
  hasExplicitMarketing: boolean;
} {
  if (typeof window === 'undefined') {
    return {
      source: '',
      medium: '',
      campaign: '',
      referrer: '',
      hasExplicitMarketing: false,
    };
  }

  const urlParams = new URLSearchParams(window.location.search);

  // 1. Check explicit UTM and custom referral parameters
  const utmSource = urlParams.get('utm_source')?.trim();
  const utmMedium = urlParams.get('utm_medium')?.trim();
  const utmCampaign = urlParams.get('utm_campaign')?.trim();
  const utmTerm = urlParams.get('utm_term')?.trim();
  const utmContent = urlParams.get('utm_content')?.trim();

  const refParam = urlParams.get('ref')?.trim();
  const fParam = urlParams.get('f')?.trim();
  const channelParam = urlParams.get('channel')?.trim();
  const affParam = urlParams.get('aff')?.trim();

  let source = utmSource || channelParam || refParam || fParam || '';
  let medium = utmMedium || '';
  const campaign = utmCampaign || '';
  let hasExplicitMarketing = false;

  if (affParam) {
    if (!source) {
      source = `aff_${affParam}`;
      medium = 'referral';
    }
  }

  if (source || medium || campaign) {
    hasExplicitMarketing = true;
    if (!medium) medium = 'campaign';
    return {
      source: sanitizeTag(source, 64),
      medium: sanitizeTag(medium, 64),
      campaign: sanitizeTag(campaign, 128),
      term: utmTerm ? sanitizeTag(utmTerm, 64) : undefined,
      content: utmContent ? sanitizeTag(utmContent, 64) : undefined,
      referrer: document.referrer ? document.referrer.slice(0, 255) : '',
      hasExplicitMarketing,
    };
  }

  // 2. Parse Document Referrer
  const rawReferrer = document.referrer ? document.referrer.trim() : '';
  if (!rawReferrer) {
    return {
      source: 'direct',
      medium: 'none',
      campaign: '',
      referrer: '',
      hasExplicitMarketing: false,
    };
  }

  try {
    const refUrl = new URL(rawReferrer);
    const currentHost = window.location.hostname;

    // Internal navigation - do not treat as external source
    if (refUrl.hostname === currentHost || refUrl.hostname.endsWith(`.${currentHost}`)) {
      return {
        source: '',
        medium: '',
        campaign: '',
        referrer: rawReferrer.slice(0, 255),
        hasExplicitMarketing: false,
      };
    }

    const host = refUrl.hostname.toLowerCase();

    // Organic Search Engines
    if (host.includes('google.')) {
      source = 'google';
      medium = 'organic';
    } else if (host.includes('bing.')) {
      source = 'bing';
      medium = 'organic';
    } else if (host.includes('baidu.')) {
      source = 'baidu';
      medium = 'organic';
    } else if (host.includes('duckduckgo.')) {
      source = 'duckduckgo';
      medium = 'organic';
    } else if (host.includes('yandex.')) {
      source = 'yandex';
      medium = 'organic';
    } else if (host.includes('yahoo.')) {
      source = 'yahoo';
      medium = 'organic';
    }
    // Social / Communities / Creative Platforms
    else if (host.includes('reddit.')) {
      source = 'reddit';
      medium = 'social';
    } else if (host.includes('t.co') || host.includes('twitter.') || host.includes('x.com')) {
      source = 'twitter';
      medium = 'social';
    } else if (host.includes('pinterest.')) {
      source = 'pinterest';
      medium = 'social';
    } else if (host.includes('youtube.') || host.includes('youtu.be')) {
      source = 'youtube';
      medium = 'social';
    } else if (host.includes('facebook.') || host.includes('fb.com')) {
      source = 'facebook';
      medium = 'social';
    } else if (host.includes('instagram.')) {
      source = 'instagram';
      medium = 'social';
    } else if (host.includes('tiktok.')) {
      source = 'tiktok';
      medium = 'social';
    } else if (host.includes('github.')) {
      source = 'github';
      medium = 'social';
    } else if (host.includes('discord.')) {
      source = 'discord';
      medium = 'community';
    }
    // AI & Tool Directories
    else if (host.includes('producthunt.')) {
      source = 'producthunt';
      medium = 'discovery';
    } else if (host.includes('toolify.')) {
      source = 'toolify';
      medium = 'directory';
    } else if (host.includes('theresanaiforthat.')) {
      source = 'taaft';
      medium = 'directory';
    } else if (host.includes('futurepedia.')) {
      source = 'futurepedia';
      medium = 'directory';
    } else {
      source = refUrl.hostname;
      medium = 'referral';
    }

    return {
      source: sanitizeTag(source, 64),
      medium: sanitizeTag(medium, 64),
      campaign: '',
      referrer: rawReferrer.slice(0, 255),
      hasExplicitMarketing: true,
    };
  } catch {
    return {
      source: 'referral',
      medium: 'referral',
      campaign: '',
      referrer: rawReferrer.slice(0, 255),
      hasExplicitMarketing: true,
    };
  }
}

/**
 * Initializes attribution tracker on client load.
 * Called inside UtmCapture / Root Layout.
 */
export function initAttributionTracker(): void {
  if (typeof window === 'undefined') return;

  try {
    const traffic = parseTrafficSource();
    const now = Math.floor(Date.now() / 1000);
    const landing = `${window.location.pathname}${window.location.search}`.slice(0, 255);

    // 1. First Touch Handling
    const existingFT = getStoredTouch(STORAGE_FT_KEY, COOKIE_FT_KEY);
    if (!existingFT && traffic.source) {
      const ft: TouchAttribution = {
        source: traffic.source,
        medium: traffic.medium,
        campaign: traffic.campaign,
        term: traffic.term,
        content: traffic.content,
        referrer: traffic.referrer,
        landing,
        timestamp: now,
      };
      saveTouch(STORAGE_FT_KEY, COOKIE_FT_KEY, ft, FT_MAX_DAYS);

      // Also set legacy utm_source cookie for backward compatibility
      setCookie(LEGACY_UTM_COOKIE, encodeURIComponent(traffic.source), FT_MAX_DAYS);
    }

    // 2. Last Touch Handling (updated on any explicit marketing or new external traffic)
    if (traffic.hasExplicitMarketing && traffic.source) {
      const lt: TouchAttribution = {
        source: traffic.source,
        medium: traffic.medium,
        campaign: traffic.campaign,
        term: traffic.term,
        content: traffic.content,
        referrer: traffic.referrer,
        landing,
        timestamp: now,
      };
      saveTouch(STORAGE_LT_KEY, COOKIE_LT_KEY, lt, LT_MAX_DAYS);
    }
  } catch (err) {
    // Fail silently to never interrupt user experience
    console.warn('Attribution tracker error:', err);
  }
}

/**
 * Helper to save touch data into both localStorage and Cookie
 */
function saveTouch(
  storageKey: string,
  cookieKey: string,
  data: TouchAttribution,
  days: number
): void {
  try {
    const serialized = JSON.stringify(data);
    window.localStorage.setItem(storageKey, serialized);
    setCookie(cookieKey, encodeURIComponent(serialized), days);
  } catch {
    // ignore quota/private browsing errors
  }
}

/**
 * Helper to read touch data with LocalStorage -> Cookie fallback
 */
export function getStoredTouch(
  storageKey: string,
  cookieKey: string
): TouchAttribution | null {
  if (typeof window === 'undefined') return null;

  try {
    const fromStorage = window.localStorage.getItem(storageKey);
    if (fromStorage) {
      return JSON.parse(fromStorage);
    }
    const fromCookie = getCookie(cookieKey);
    if (fromCookie) {
      return JSON.parse(decodeURIComponent(fromCookie));
    }
  } catch {
    // ignore parsing errors
  }
  return null;
}

/**
 * Returns full attribution payload ready for registration or checkout
 */
export function getAttributionPayload(): AttributionPayload {
  if (typeof window === 'undefined') return {};

  const ft = getStoredTouch(STORAGE_FT_KEY, COOKIE_FT_KEY);
  const lt = getStoredTouch(STORAGE_LT_KEY, COOKIE_LT_KEY) || ft;

  const payload: AttributionPayload = {};

  if (ft) {
    payload.first_source = ft.source;
    payload.first_medium = ft.medium;
    payload.first_campaign = ft.campaign;
    payload.first_referrer = ft.referrer;
    payload.first_landing = ft.landing;
    payload.first_touch_at = ft.timestamp;
  }

  if (lt) {
    payload.last_source = lt.source;
    payload.last_medium = lt.medium;
    payload.last_campaign = lt.campaign;
  }

  if (typeof navigator !== 'undefined' && navigator.language) {
    payload.register_lang = navigator.language;
  }

  return payload;
}

function sanitizeTag(val: string, maxLen = 64): string {
  return val
    .trim()
    .replace(/[^\w\-.:/]/g, '')
    .slice(0, maxLen);
}

