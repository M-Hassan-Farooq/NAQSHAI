import { NextResponse } from 'next/server';
import { supabaseAdmin, supabase } from '@/lib/supabaseClient';

// Always read fresh data from the database (never statically cached).
export const dynamic = 'force-dynamic';

// Format a raw PKR number into a friendly display string (e.g. "1.85 Crore").
function formatPkr(num) {
  const val = Number(num);
  if (!val || Number.isNaN(val)) return 'Price on request';
  if (val >= 10000000) return `${(val / 10000000).toFixed(2)} Crore`;
  if (val >= 100000) return `${(val / 100000).toFixed(2)} Lakh`;
  return `PKR ${val.toLocaleString('en-PK')}`;
}

// Validate + normalize polygon coordinates coming from the JSONB column.
// Returns only well-formed {lat, lng} points so one bad record can't crash the map.
function normalizePaths(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((pt) => {
      if (!pt || typeof pt !== 'object') return null;
      const lat = Number(pt.lat);
      const lng = Number(pt.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
      return { lat, lng };
    })
    .filter(Boolean);
}

// Centroid of a set of points, used for the marker + pan-to target.
function centroid(paths) {
  if (!paths.length) return null;
  const sum = paths.reduce(
    (acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }),
    { lat: 0, lng: 0 }
  );
  return { lat: sum.lat / paths.length, lng: sum.lng / paths.length };
}

// Society isn't a dedicated column; the sell flow bakes it into the title as
// "Plot 101 - Gulberg Greens, Islamabad". Parse it back out, best-effort.
function parseSociety(title) {
  if (typeof title !== 'string') return '';
  const afterDash = title.split(' - ')[1];
  if (!afterDash) return '';
  return (afterDash.split(',')[0] || '').trim();
}

export async function GET() {
  try {
    const db = supabaseAdmin || supabase;

    // Single query. Registered = the row exists in `plots`. Seller phone is
    // embedded via the plots.seller_id -> sellers.id foreign key for the
    // existing "Contact Owner via WhatsApp" action.
    const { data, error } = await db
      .from('plots')
      .select(
        'id, title, city, price_pkr, size_dimensions, category, flood_risk, noise_level, elevation_profile, proximity_notes, polygon_coordinates, is_verified, created_at, sellers ( phone_number, full_name )'
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching plots:', error.message || error);
      return NextResponse.json({ error: 'Failed to load plots.' }, { status: 500 });
    }

    const plots = (data || []).map((row) => {
      const paths = normalizePaths(row.polygon_coordinates);
      const hasGeometry = paths.length >= 3;

      if (!hasGeometry && process.env.NODE_ENV !== 'production') {
        console.warn(
          `[api/plots] Plot "${row.id}" has no renderable boundary (${paths.length} valid point(s)); it will load without map geometry.`
        );
      }

      const seller = row.sellers || null;

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
          elevation: row.elevation_profile || 'Pending Survey',
          floodRisk: row.flood_risk || 'Assessment Pending',
          noiseLevel: row.noise_level || 'Assessment Pending',
          landmarks: row.proximity_notes || 'No proximity data provided.',
        },
        ownerContact: seller && seller.phone_number ? seller.phone_number : '',
        isVerified: !!row.is_verified,
      };
    });

    return NextResponse.json({ plots }, { status: 200 });
  } catch (err) {
    console.error('API Error in /api/plots:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
