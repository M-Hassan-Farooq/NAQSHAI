import { NextResponse } from 'next/server';
import { calculateAmenityScores } from '@/lib/amenityCalculator';

export const runtime = 'edge';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');
    const plotId = searchParams.get('plotId') || 'unknown';

    if (!latStr || !lngStr) {
      return NextResponse.json(
        { error: 'Query parameters lat and lng are required.' },
        { status: 400 }
      );
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return NextResponse.json(
        { error: 'Coordinates lat and lng must be valid numbers.' },
        { status: 400 }
      );
    }

    const scores = calculateAmenityScores(lat, lng);

    if (!scores) {
      return NextResponse.json(
        { error: 'Could not compute amenity score for provided coordinates.' },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        plotId,
        coordinates: { lat, lng },
        ...scores
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
        }
      }
    );
  } catch (err) {
    console.error('[api/amenities] Calculation error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to calculate amenity scores.' },
      { status: 500 }
    );
  }
}
