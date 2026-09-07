import { NextResponse } from 'next/server';
import { getUserFromRequest, getUserClient } from '@/lib/authServer';
import { computeEnvironmentalMetrics } from '@/lib/environmentalMetrics';

function parseSociety(title) {
  if (typeof title !== 'string') return '';
  const afterDash = title.split(' - ')[1];
  if (!afterDash) return '';
  return (afterDash.split(',')[0] || '').trim();
}

function isPendingOrDefault(val, defaultVal) {
  if (!val || typeof val !== 'string') return true;
  const lower = val.trim().toLowerCase();
  return lower === '' || lower.includes('pending') || lower === 'n/a' || lower === defaultVal.toLowerCase();
}

export async function GET(request) {
  try {
    const { user, token, error: authError } = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in to view your favorites.', detail: authError },
        { status: 401 }
      );
    }

    // User-scoped client: RLS ("auth.uid() = user_id") enforces that a user can
    // only ever read their own favorites, instead of relying solely on the
    // .eq('user_id', ...) filter below. Defense in depth.
    const db = getUserClient(token);

    // 1. Fetch user's favorited plot IDs
    const { data: favData, error: favError } = await db
      .from('favorites')
      .select('plot_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (favError) {
      console.warn('[api/favorites] Error loading favorites:', favError.message);
      return NextResponse.json(
        { success: false, error: 'Could not load your favorites right now.' },
        { status: 500 }
      );
    }

    const favoriteIds = (favData || []).map((row) => row.plot_id);
    if (favoriteIds.length === 0) {
      return NextResponse.json({ success: true, favorites: [], plots: [] }, { status: 200 });
    }

    // 2. Fetch full plot details for the favorited plots
    const { data: plotsData, error: plotsError } = await db
      .from('plots')
      .select(
        'id, title, city, price_pkr, size_dimensions, category, flood_risk, noise_level, elevation_profile, proximity_notes, polygon_coordinates, is_verified, created_at, sellers ( phone_number, full_name )'
      )
      .in('id', favoriteIds);

    if (plotsError) {
      console.warn('[api/favorites] Error loading plot details:', plotsError.message);
    }

    const plots = (plotsData || []).map((row) => {
      const env = computeEnvironmentalMetrics({
        id: row.id,
        title: row.title,
        society: parseSociety(row.title),
        city: row.city,
        category: row.category,
        size_dimensions: row.size_dimensions,
        proximityNotes: row.proximity_notes,
        polygonCoordinates: Array.isArray(row.polygon_coordinates) ? row.polygon_coordinates : []
      });

      const floodRisk = isPendingOrDefault(row.flood_risk, 'low hazard') ? env.floodRisk : row.flood_risk;
      const noiseLevel = isPendingOrDefault(row.noise_level, 'low (quiet zone)') ? env.noiseLevel : row.noise_level;
      const elevation = isPendingOrDefault(row.elevation_profile, 'pending survey') ? env.elevationProfile : row.elevation_profile;

      return {
        ...row,
        details: {
          size: row.size_dimensions || '—',
          category: row.category || 'Residential',
          elevation,
          floodRisk,
          noiseLevel,
          landmarks: row.proximity_notes || 'No proximity data provided.',
        },
        flood_risk: floodRisk,
        noise_level: noiseLevel,
        elevation_profile: elevation
      };
    });
    return NextResponse.json(
      {
        success: true,
        favorites: favoriteIds,
plots
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[api/favorites] GET Exception:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { user, token, error: authError } = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in to save plots to favorites.', detail: authError },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { plotId } = body || {};

    if (!plotId) {
      return NextResponse.json(
        { success: false, error: 'plotId is required.' },
        { status: 400 }
      );
    }

    // User-scoped client so RLS enforces ownership on both the read-back and the
    // insert/delete below (WITH CHECK / USING auth.uid() = user_id).
    const db = getUserClient(token);

    // 1. Check if favorite already exists
    const { data: existing, error: checkError } = await db
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('plot_id', plotId)
      .maybeSingle();

    if (checkError) {
      console.warn('[api/favorites] Check error:', checkError.message);
    }

    // 2. Toggle status
    if (existing) {
      // Remove from favorites
      const { error: deleteError } = await db
        .from('favorites')
        .delete()
        .eq('id', existing.id);

      if (deleteError) {
        throw deleteError;
      }

      return NextResponse.json(
        {
          success: true,
          isFavorite: false,
          plotId,
          message: 'Removed from favorites'
        },
        { status: 200 }
      );
    } else {
      // Insert into favorites
      const { error: insertError } = await db
        .from('favorites')
        .insert({
          user_id: user.id,
          plot_id: plotId
        });

      if (insertError) {
        throw insertError;
      }

      return NextResponse.json(
        {
          success: true,
          isFavorite: true,
          plotId,
          message: 'Added to favorites'
        },
        { status: 200 }
      );
    }
  } catch (err) {
    console.error('[api/favorites] POST Exception:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
