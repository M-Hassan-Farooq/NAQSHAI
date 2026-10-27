'use client';

import React, { useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function AnalyticsTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPingRef = useRef('');

  useEffect(() => {
    // Only execute on browser client
    if (typeof window === 'undefined') return;

    try {
      // 1. Persistent anonymous visitor ID across visits
      let visitorId = '';
      try {
        visitorId = localStorage.getItem('nq_vid') || '';
        if (!visitorId) {
          visitorId = `nq_v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
          localStorage.setItem('nq_vid', visitorId);
        }
      } catch (_) {
        visitorId = `nq_v_temp_${Math.random().toString(36).slice(2, 10)}`;
      }

      // 2. Session ID scoped to current browser tab/session
      let sessionId = '';
      try {
        sessionId = sessionStorage.getItem('nq_sid') || '';
        if (!sessionId) {
          sessionId = `nq_s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
          sessionStorage.setItem('nq_sid', sessionId);
        }
      } catch (_) {
        sessionId = `nq_s_temp_${Math.random().toString(36).slice(2, 10)}`;
      }

      const currentPath = pathname || window.location.pathname || '/';
      const refQuery =
        searchParams?.get('ref') ||
        searchParams?.get('source') ||
        searchParams?.get('utm_source') ||
        '';

      // Deduplicate rapid duplicate pings for the same path
      const pingKey = `${currentPath}?${refQuery}`;
      if (lastPingRef.current === pingKey) return;
      lastPingRef.current = pingKey;

      const payload = JSON.stringify({
        visitorId,
        sessionId,
        path: currentPath,
        referrer: document.referrer || '',
        source: refQuery,
      });

      // Prefer non-blocking sendBeacon
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/analytics/track', blob);
      } else {
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch (_) {
      // Safe silent failure — never interrupt user navigation
    }
  }, [pathname, searchParams]);

  return null;
}

export default function SiteAnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <AnalyticsTrackerInner />
    </Suspense>
  );
}
