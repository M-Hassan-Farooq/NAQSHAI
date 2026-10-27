import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/authServer.js';

export const dynamic = 'force-dynamic';

function parseDevice(userAgent) {
  if (!userAgent) return 'desktop';
  const ua = userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

function parseBrowser(userAgent) {
  if (!userAgent) return 'unknown';
  const ua = userAgent.toLowerCase();
  if (ua.includes('edg/')) return 'Edge';
  if (ua.includes('chrome/') && !ua.includes('chromium/')) return 'Chrome';
  if (ua.includes('safari/') && !ua.includes('chrome/')) return 'Safari';
  if (ua.includes('firefox/')) return 'Firefox';
  if (ua.includes('opr/') || ua.includes('opera/')) return 'Opera';
  return 'Browser';
}

function resolveSource(querySource, referrer) {
  const q = (querySource || '').toLowerCase();
  if (q.includes('panaflex') || q.includes('qr') || q.includes('banner')) {
    return 'panaflex_qr';
  }
  if (q.includes('whatsapp') || q.includes('wa')) {
    return 'whatsapp';
  }
  if (q.includes('facebook') || q.includes('fb') || q.includes('ig') || q.includes('instagram')) {
    return 'social';
  }

  const ref = (referrer || '').toLowerCase();
  if (ref.includes('whatsapp') || ref.includes('wa.me')) return 'whatsapp';
  if (ref.includes('google.')) return 'google';
  if (ref.includes('facebook.') || ref.includes('instagram.') || ref.includes('t.co')) return 'social';
  if (ref && !ref.includes('localhost') && !ref.includes('naqshai')) return 'referral';

  return 'direct';
}

// In-memory anti-spam bucket (max 120 tracking events/min per IP)
const ipTrackerCache = new Map();

export async function POST(request) {
  try {
    const ua = request.headers.get('user-agent') || '';
    const xForwardedFor = request.headers.get('x-forwarded-for') || '';
    const clientIp = xForwardedFor.split(',')[0].trim() || '127.0.0.1';

    // Anti-spam throttling
    const now = Date.now();
    const windowStart = now - 60000;
    const ipHits = ipTrackerCache.get(clientIp) || [];
    const recentHits = ipHits.filter((t) => t > windowStart);
    if (recentHits.length >= 120) {
      return NextResponse.json({ success: true, throttled: true });
    }
    recentHits.push(now);
    ipTrackerCache.set(clientIp, recentHits);

    const body = await request.json().catch(() => ({}));
    const visitorId = String(body.visitorId || '').trim();
    const sessionId = String(body.sessionId || '').trim();
    const pagePath = String(body.path || '/').slice(0, 255);
    const rawReferrer = String(body.referrer || '').slice(0, 500);
    const rawQuerySource = String(body.source || '').slice(0, 100);

    // Filter out internal bot crawlers or health checks
    if (!visitorId || !sessionId || ua.includes('Googlebot') || ua.includes('bingbot')) {
      return NextResponse.json({ success: true, ignored: true });
    }

    const deviceType = parseDevice(ua);
    const browser = parseBrowser(ua);
    const source = resolveSource(rawQuerySource, rawReferrer);

    const dbAdmin = getAdminClient();
    if (dbAdmin && dbAdmin.from) {
      await dbAdmin.from('site_visits').insert({
        visitor_id: visitorId,
        session_id: sessionId,
        page_path: pagePath,
        referrer: rawReferrer,
        source,
        device_type: deviceType,
        browser,
      }).catch((err) => {
        // Graceful non-blocking error logging
        console.warn('[SiteAnalytics] Warning inserting visit:', err?.message || err);
      });
    }

    return NextResponse.json(
      { success: true, recorded: true },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, private',
        },
      }
    );
  } catch (err) {
    return NextResponse.json({ success: false, error: err?.message || 'Error tracking visit' }, { status: 500 });
  }
}
