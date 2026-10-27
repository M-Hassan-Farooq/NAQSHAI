import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/authServer';
import { verifyOperatorRequest } from '@/lib/operatorRateLimiter';
import { draftTitlePreview } from '@/lib/draftProgress';
import { checkPolygonConflict } from '@/lib/polygonOverlap';
import { verifyAreaMatch } from '@/lib/areaCalculator';
import { checkRegulatoryStatus } from '@/lib/regulatoryRegistry';
import { createDocumentAccessToken } from '@/lib/documentCipher';

export const dynamic = 'force-dynamic';

const DOC_LABELS = {
  allotmentLetter: 'Allotment Letter',
  cnicFront: 'CNIC (Front)',
  cnicBack: 'CNIC (Back)',
};

// GET /api/review — operator-only. Returns every SUBMITTED listing across all users
// Protected by IP rate limiting (5 attempts / 15-minute lockout) and constant-time token comparison.
export async function GET(request) {
  try {
    const auth = verifyOperatorRequest(request);
    if (!auth.authorized) {
      return NextResponse.json(
        {
          success: false,
          error: auth.error,
          remainingAttempts: auth.remainingAttempts,
          lockoutSeconds: auth.lockoutSeconds,
        },
        {
          status: auth.status,
          headers: {
            'X-Robots-Tag': 'noindex, nofollow, noarchive',
            'Cache-Control': 'no-store, private',
          },
        }
      );
    }

    const dbAdmin = getAdminClient();

    const { data, error } = await dbAdmin
      .from('listing_drafts')
      .select('id, user_id, form_data, created_at, updated_at')
      .eq('status', 'submitted')
      .order('updated_at', { ascending: true }); // oldest first — fair review order

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const { data: verifiedRows, error: verifiedError } = await dbAdmin
      .from('plots')
      .select('id, seller_id, title, city, price_pkr, size_dimensions, category, flood_risk, noise_level, elevation_profile, polygon_coordinates, is_verified, created_at, updated_at, sellers ( phone_number, full_name )')
      .order('created_at', { ascending: false });

    if (verifiedError) {
      return NextResponse.json({ success: false, error: verifiedError.message }, { status: 500 });
    }

    const rows = data || [];

    const listings = await Promise.all(
      rows.map(async (row) => {
        const fd = row.form_data || {};
        const seller = fd.sellerInfo || {};
        const plot = fd.plotDetails || {};
        const polygon = Array.isArray(fd.polygonCoordinates) ? fd.polygonCoordinates : [];
        const uploaded = fd.uploadedFiles || {};

        // Generate tamper-proof, time-bounded backend download tokens for operators
        // Documents are decrypted in-memory through /api/documents/download
        const documents = [];
        for (const field of ['allotmentLetter', 'cnicFront', 'cnicBack']) {
          const v = uploaded[field];
          const path = typeof v === 'string' ? v : v?.path;
          const name = typeof v === 'string' ? v : v?.name;
          const sha256 = typeof v === 'object' ? v?.sha256 : null;
          const encrypted = typeof v === 'object' ? !!v?.encrypted : false;

          if (path) {
            const token = createDocumentAccessToken({
              draftId: row.id,
              field,
              isOperator: true,
              expiresInSeconds: 900, // 15-minute operator review window
            });
            const downloadUrl = `/api/documents/download?draftId=${encodeURIComponent(row.id)}&field=${encodeURIComponent(field)}&token=${encodeURIComponent(token)}`;

            documents.push({
              field,
              label: DOC_LABELS[field] || field,
              name: name || DOC_LABELS[field] || field,
              path,
              sha256,
              encrypted,
              signedUrl: downloadUrl, // maintain signedUrl property name for frontend compatibility
              downloadUrl,
            });
          }
        }

        const conflict = checkPolygonConflict(polygon, verifiedRows || []);
        const areaCheck = verifyAreaMatch(polygon, plot.sizeDimensions || '10 Marla (35x70)', 0.90, 1.10);
        const regulatory = checkRegulatoryStatus(plot.society, plot.city, polygon);

        return {
          id: row.id,
          title: draftTitlePreview(fd),
          created_at: row.created_at,
          updated_at: row.updated_at,
          seller: {
            fullName: seller.fullName || '',
            phoneNumber: seller.phoneNumber || '',
            sellerRole: seller.sellerRole || seller.role || '',
          },
          plot: {
            city: plot.city || '',
            society: plot.society || '',
            plotNumber: plot.plotNumber || '',
            pricePkr: plot.pricePkr || '',
            sizeDimensions: plot.sizeDimensions || '',
            category: plot.category || '',
          },
          polygon,
          documents,
          overlapConflict: conflict.hasConflict ? conflict.conflictingPlot : null,
          areaVerification: areaCheck,
          regulatory,
          aiVerification: fd.ai_verification_report || fd.aiVerification || null,
          ai_verification_report: fd.ai_verification_report || fd.aiVerification || null,
          authority_doc_type: fd.authority_doc_type || fd.authorityDocType || '',
          document_serial_number: fd.document_serial_number || fd.documentSerialNumber || '',
        };
      })
    );

    const verifiedPlots = (verifiedRows || []).map((row) => {
      const society = row.title?.split(' - ')[1]?.split(',')[0]?.trim() || '';
      const polygon = Array.isArray(row.polygon_coordinates) ? row.polygon_coordinates : [];
      const regulatory = checkRegulatoryStatus(society, row.city, polygon);

      return {
        id: row.id,
        title: row.title || row.id,
        isVerified: !!row.is_verified,
        city: row.city || '',
        society,
        pricePkr: row.price_pkr,
        sizeDimensions: row.size_dimensions || '',
        category: row.category || '',
        floodRisk: row.flood_risk || '',
        noiseLevel: row.noise_level || '',
        elevationProfile: row.elevation_profile || '',
        polygon,
        regulatory,
        created_at: row.created_at,
        updated_at: row.updated_at,
        seller: {
          fullName: row.sellers?.full_name || '',
          phoneNumber: row.sellers?.phone_number || '',
        },
      };
    });

    let auditLogs = [];
    try {
      const { data: logRows } = await dbAdmin
        .from('document_access_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (logRows) auditLogs = logRows;
    } catch (_) {
      auditLogs = [];
    }

    let rejectedCount = 0;
    try {
      const { count } = await dbAdmin
        .from('listing_drafts')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'rejected');
      if (count != null) rejectedCount = count;
    } catch (_) {
      rejectedCount = 0;
    }

    let visitorAnalytics = {
      totalVisitors: 0,
      totalPageviews: 0,
      totalQrScans: 0,
      liveVisitorsNow: 0,
      todayVisitors: 0,
      todayPageviews: 0,
      deviceBreakdown: { mobile: 0, desktop: 0, tablet: 0 },
      topPages: [],
      topSources: [],
      dailyTrend: [],
      recentVisits: [],
    };

    try {
      const { data: visits } = await dbAdmin
        .from('site_visits')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (visits && visits.length > 0) {
        const allVisitorIds = new Set();
        const liveVisitorIds = new Set();
        const todayVisitorIds = new Set();
        let todayPageviews = 0;
        let qrScans = 0;
        const deviceCounts = { mobile: 0, desktop: 0, tablet: 0 };
        const pageCounts = {};
        const sourceCounts = {};
        const dailyMap = {};

        const now = Date.now();
        const fiveMinAgo = now - 5 * 60 * 1000;
        const todayStr = new Date().toISOString().slice(0, 10);

        for (let i = 6; i >= 0; i--) {
          const d = new Date(now - i * 86400000).toISOString().slice(0, 10);
          dailyMap[d] = { date: d, pageviews: 0, visitors: new Set(), qrScans: 0 };
        }

        for (const v of visits) {
          allVisitorIds.add(v.visitor_id);

          const vTime = new Date(v.created_at).getTime();
          const vDateStr = new Date(v.created_at).toISOString().slice(0, 10);

          if (vTime >= fiveMinAgo) {
            liveVisitorIds.add(v.visitor_id);
          }

          if (vDateStr === todayStr) {
            todayVisitorIds.add(v.visitor_id);
            todayPageviews++;
          }

          if (v.source === 'panaflex_qr') {
            qrScans++;
          }

          const dev = v.device_type === 'mobile' ? 'mobile' : v.device_type === 'tablet' ? 'tablet' : 'desktop';
          deviceCounts[dev] = (deviceCounts[dev] || 0) + 1;

          const p = v.page_path || '/';
          pageCounts[p] = (pageCounts[p] || 0) + 1;

          const s = v.source || 'direct';
          sourceCounts[s] = (sourceCounts[s] || 0) + 1;

          if (dailyMap[vDateStr]) {
            dailyMap[vDateStr].pageviews++;
            dailyMap[vDateStr].visitors.add(v.visitor_id);
            if (v.source === 'panaflex_qr') {
              dailyMap[vDateStr].qrScans++;
            }
          }
        }

        let totalCount = visits.length;
        try {
          const { count } = await dbAdmin
            .from('site_visits')
            .select('id', { count: 'exact', head: true });
          if (count != null && count > totalCount) totalCount = count;
        } catch (_) {}

        visitorAnalytics = {
          totalVisitors: allVisitorIds.size,
          totalPageviews: totalCount,
          totalQrScans: qrScans,
          liveVisitorsNow: liveVisitorIds.size,
          todayVisitors: todayVisitorIds.size,
          todayPageviews,
          deviceBreakdown: deviceCounts,
          topPages: Object.entries(pageCounts)
            .map(([path, count]) => ({ path, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5),
          topSources: Object.entries(sourceCounts)
            .map(([source, count]) => ({ source, count }))
            .sort((a, b) => b.count - a.count),
          dailyTrend: Object.values(dailyMap).map((d) => ({
            date: d.date,
            pageviews: d.pageviews,
            visitors: d.visitors.size,
            qrScans: d.qrScans,
          })),
          recentVisits: visits.slice(0, 25),
        };
      }
    } catch (_) {
      // Graceful fallback if table is fresh
    }

    return NextResponse.json(
      {
        success: true,
        listings,
        verifiedPlots,
        auditLogs,
        visitorAnalytics,
        stats: {
          rejectedCount,
          pendingCount: listings.length,
          verifiedCount: verifiedPlots.length,
          totalVisitors: visitorAnalytics.totalVisitors,
          totalPageviews: visitorAnalytics.totalPageviews,
          totalQrScans: visitorAnalytics.totalQrScans,
          liveVisitorsNow: visitorAnalytics.liveVisitorsNow,
        },
      },
      {
        headers: {
          'X-Robots-Tag': 'noindex, nofollow, noarchive',
          'Cache-Control': 'no-store, private',
        },
      }
    );
  } catch (err) {
    return NextResponse.json({ success: false, error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
