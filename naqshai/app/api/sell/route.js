import { NextResponse } from 'next/server';
import { getUserFromRequest, getAdminClient } from '@/lib/authServer';
import { persistListing, normalizeDocuments } from '@/lib/publishListing';

// POST /api/sell — create a listing directly (single-shot, without the draft flow).
// SECURITY: the owner is derived ONLY from the verified session token. A client
// can no longer supply its own owner id in the body to forge a listing.
export async function POST(request) {
  try {
    // 1. Verify the caller's session server-side.
    const { user, error: authError } = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in to list a plot.', detail: authError || undefined },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { seller, plot, polygonCoordinates, documents } = body || {};

    // 2. Validate incoming payload.
    if (!plot || !plot.city || !plot.society || !plot.pricePkr) {
      return NextResponse.json(
        { success: false, error: 'Missing required plot details (City, Society, and Price PKR).' },
        { status: 400 }
      );
    }
    if (!seller || (!seller.fullName && !seller.full_name)) {
      return NextResponse.json(
        { success: false, error: 'Missing seller full name.' },
        { status: 400 }
      );
    }

    // 3. Publish using the verified user id. `documents` may arrive as an array
    //    (already flattened) or as the wizard's uploadedFiles object.
    const dbAdmin = getAdminClient();
    const docs = Array.isArray(documents) ? documents : normalizeDocuments(documents || {});

    const result = await persistListing(dbAdmin, {
      uid: user.id,
      seller,
      plot,
      polygonCoordinates: polygonCoordinates || [],
      documents: docs,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        plotId: result.plotId,
        sellerId: result.sellerId,
        message: 'Plot listing and seller profile created successfully.',
        plot: result.plot,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('API Error in /api/sell/route.js:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
