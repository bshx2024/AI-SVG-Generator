'use client';

import { useEffect } from 'react';

import { initAttributionTracker } from '@/shared/lib/attribution';

/**
 * Capture dual-touch channel attribution (First Touch + Last Touch)
 * from landing URL parameters and document.referrer.
 * Persists in both Cookies and LocalStorage for user signup and checkout.
 */
export function UtmCapture() {
  useEffect(() => {
    initAttributionTracker();
  }, []);

  return null;
}
