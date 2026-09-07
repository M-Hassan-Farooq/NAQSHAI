// Shared formatter that turns a raw `plots` table row (with its embedded
// `sellers` join) into the public plot shape consumed by the 3D map, the
// favorites list and the AI tools.
//
// Both /api/plots (public feed) and /api/favorites (saved plots) previously
// shaped their own response, which drifted: /api/plots returned this trimmed,
// formatted object while /api/favorites leaked raw DB rows (incl. seller
// full_name and full polygon coords). Clients then had to defensively handle
// two different shapes. Routing both endpoints through this single formatter
// keeps the payload consistent and minimal.
//
// Dependency-free and side-effect free, so it is safe to import from both Node
// and Edge route handlers.

// Format a raw PKR number into a friendly display string (e.g. "1.85 Crore").
export function formatPkr(num) {
  const val = Number(num);
  if (!val || Number.isNaN(val)) return 'Price on request';
  if (val >= 10000000) return `${(val / 10000000).toFixed(2)} Crore`;
  if (val >= 100000) return `${(val / 100000).toFixed(2)} Lakh`;
  return `PKR ${val.toLocaleString('en-PK')}`;
}

// Validate + normalize polygon coordinates coming from the JSONB column.
// Returns only well-formed {lat, lng} points so one bad record can't crash the map.
export function normalizePaths(raw) {
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
export function centroid(paths) {
  if (!paths.length) return null;
  const sum = paths.reduce(
    (acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }),
    { lat: 0, lng: 0 }
  );
  return { lat: sum.lat / paths.length, lng: sum.lng / paths.length };
}

// Society isn't a dedicated column; the sell flow bakes it into the title as
// "Plot 101 - Gulberg Greens, Islamabad". Parse it back out, best-effort.
export function parseSociety(title) {
  if (typeof title !== 'string') return '';
  const afterDash = title.split(' - ')[1];
  if (!afterDash) return '';
  return (afterDash.split(',')[0] || '').trim();
}

// The canonical public plot shape. `row` is a `plots` record optionally joined
// with its `sellers` record ({ phone_number, full_name }).
export function formatPlot(row) {
  const paths = normalizePaths(row.polygon_coordinates);
  const hasGeometry = paths.length >= 3;
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
}
