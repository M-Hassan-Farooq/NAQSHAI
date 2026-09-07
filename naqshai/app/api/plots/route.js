import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { formatPlot } from '@/lib/formatPlot';
import { computeEnvironmentalMetrics } from '@/lib/environmentalMetrics';

// Public map feed. Plot data only changes on operator approve/delete, so instead
// of re-querying + re-sorting the table on every single visitor's page load, serve
// a short-lived shared (CDN/edge) cache with stale-while-revalidate. This is the
// highest-traffic endpoint in the app; caching it cuts DB load and TTFB at scale.
const CACHE_CONTROL = 'public, s-maxage=30, stale-while-revalidate=300';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedPage = Number.parseInt(searchParams.get('page') || '1', 10);
    const requestedLimit = Number.parseInt(searchParams.get('limit') || '100', 10);
    const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const limit = Number.isInteger(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, 100)
      : 100;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    // Public map feed: read as anon so the public-read RLS on `plots` and
    // `sellers` applies. No service role here — this endpoint exposes only
    // already-public data, and dropping the privileged client means a future
    // filter/policy regression can't leak anything RLS would otherwise hide.
    const db = supabase;

    // Single query. Registered = the row exists in `plots`. Seller phone is
    // embedded via the plots.seller_id -> sellers.id foreign key for the
    // existing "Contact Owner via WhatsApp" action.
    const { data, error } = await db
      .from('plots')
      .select(
        'id, title, city, price_pkr, size_dimensions, category, flood_risk, noise_level, elevation_profile, proximity_notes, polygon_coordinates, is_verified, created_at, sellers ( phone_number, full_name )'
      )
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching plots:', error.message || error);
      return NextResponse.json({ error: 'Failed to load plots.' }, { status: 500 });
    }

    const plots = (data || []).map((row) => {
      const plot = formatPlot(row);
      if (!plot.hasGeometry && process.env.NODE_ENV !== 'production') {
        console.warn(
          `[api/plots] Plot "${row.id}" has no renderable boundary (${plot.paths.length} valid point(s)); it will load without map geometry.`
        );
      }
      const seller = row.sellers || null;

      const env = computeEnvironmentalMetrics({
        id: row.id,
        title: row.title,
        society: parseSociety(row.title),
        city: row.city,
        category: row.category,
        size_dimensions: row.size_dimensions,
        proximityNotes: row.proximity_notes,
        polygonCoordinates: paths
      });

      const isPendingOrDefault = (val, defaultVal) => {
        if (!val || typeof val !== 'string') return true;
        const lower = val.trim().toLowerCase();
        return lower === '' || lower.includes('pending') || lower === 'n/a' || lower === defaultVal.toLowerCase();
      };

      const floodRisk = isPendingOrDefault(row.flood_risk, 'low hazard') ? env.floodRisk : row.flood_risk;
      const noiseLevel = isPendingOrDefault(row.noise_level, 'low (quiet zone)') ? env.noiseLevel : row.noise_level;
      const elevation = isPendingOrDefault(row.elevation_profile, 'pending survey') ? env.elevationProfile : row.elevation_profile;

      return {
        id: row.id,
        name: row.title || row.id,
        society: parseSociety(row.title),
        city: row.city || '',
        price: formatPkr(row.price_pkr),
        priceValue: Number(row.price_pkr) || 0,
        center: centroid(paths),
        paths,
        hasGeometry,
        details: {
          size: row.size_dimensions || '—',
          category: row.category || 'Residential',
          elevation,
          floodRisk,
          noiseLevel,
          landmarks: row.proximity_notes || 'No proximity data provided.',
        },
        ownerContact: seller && seller.phone_number ? seller.phone_number : '',
        isVerified: !!row.is_verified,
      };
    });

    return NextResponse.json({
      plots,
      pagination: { page, limit, returned: plots.length, hasMore: plots.length === limit },
    }, { status: 200, headers: { 'Cache-Control': CACHE_CONTROL } });
  } catch (err) {
    console.error('API Error in /api/plots:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
