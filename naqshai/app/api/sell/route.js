import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/authServer';

// POST /api/sell — legacy direct-publish endpoint.
// Canonical plots are created only by /api/drafts/[id]/approve after operator
// review. Keeping this route explicit prevents older clients from bypassing that
// lifecycle instead of silently creating an unreviewed public plot.
export async function POST(request) {
  try {
    const { user, error: authError } = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in to list a plot.', detail: authError || undefined },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Direct publishing is disabled. Create a draft, submit it for verification, and wait for approval.',
      },
      { status: 410 }
    );
  } catch (error) {
    console.error('API Error in deprecated /api/sell/route.js:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
