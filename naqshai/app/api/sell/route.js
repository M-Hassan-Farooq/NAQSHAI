import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin, supabase } from '@/lib/supabaseClient';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const { seller, plot, polygonCoordinates, documents } = body || {};

    // 1. Inspect & validate incoming request payload
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

    // Instantiate Supabase Admin Client with Service Role Key
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    let dbClient;
    if (serviceKey && supabaseUrl) {
      dbClient = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false },
      });
    } else {
      dbClient = supabaseAdmin || supabase;
    }

    // Parse Seller details from payload
    const sellerName = (seller.fullName || seller.full_name || seller.name || '').trim();
    const sellerPhone = (seller.phoneNumber || seller.phone_number || seller.phone || '').trim();
    const sellerRole = seller.sellerRole || seller.seller_role || seller.role || 'Direct Owner';

    // 2. Create Auth User identity in auth.users FIRST (satisfies foreign key constraint on sellers.id)
    const sanitizedPhone = sellerPhone.replace(/[^0-9]/g, '') || Math.floor(Date.now() % 1000000000);
    const sellerEmail = `seller_${sanitizedPhone}_${Date.now()}@naqshai.internal`;

    let userId = null;
    try {
      const { data: authUser, error: authErr } = await dbClient.auth.admin.createUser({
        email: sellerEmail,
        email_confirm: true,
        user_metadata: { full_name: sellerName, phone_number: sellerPhone },
      });

      if (authErr) {
        console.error('Supabase Auth User Creation Error:', authErr.message || authErr);
      } else if (authUser && authUser.user) {
        userId = authUser.user.id;
      }
    } catch (authException) {
      console.error('Supabase Auth Exception:', authException.message);
    }

    // Fallback UUID if auth user creation failed
    if (!userId) {
      userId = crypto.randomUUID();
    }

    // 3. Insert seller into 'sellers' table FIRST
    const sellerRecord = {
      id: userId,
      full_name: sellerName,
      phone_number: sellerPhone,
      seller_role: sellerRole,
      is_identity_verified: false,
    };

    const { data: sellerData, error: sErr } = await dbClient
      .from('sellers')
      .insert([sellerRecord])
      .select();

    if (sErr) {
      console.error('Supabase Sellers Insert Error:', sErr.message || sErr);
      return NextResponse.json(
        {
          success: false,
          error: `Seller profile creation failed: ${sErr.message}`,
          sellerError: sErr.message,
        },
        { status: 500 }
      );
    }

    // 4. Capture generated UUID `id` returned from successful seller insertion
    const capturedSellerId = (sellerData && sellerData[0] && sellerData[0].id) ? sellerData[0].id : userId;
    console.log('Successfully created seller profile in sellers table with ID:', capturedSellerId);

    // 5. Cleanly format unique Plot ID and title
    const rawPlotNum = (plot.plotNumber || '').trim();
    let cleanPlotNum = rawPlotNum.replace(/^plot[\s-_]*/i, '');
    if (!cleanPlotNum) {
      cleanPlotNum = Math.floor(100 + Math.random() * 900).toString();
    }
    const plotId = `Plot-${cleanPlotNum}`;
    const title = `Plot ${cleanPlotNum} - ${plot.society}, ${plot.city}`;

    // 6. Pass captured `id` into seller_id when inserting into 'plots' table (NEVER NULL)
    const plotRecord = {
      id: plotId,
      seller_id: capturedSellerId,
      title: title,
      city: plot.city,
      price_pkr: Number(plot.pricePkr),
      size_dimensions: plot.sizeDimensions || '10 Marla (35x70)',
      category: plot.category || 'Residential',
      flood_risk: 'Assessment Pending',
      noise_level: 'Assessment Pending',
      elevation_profile: 'Pending Survey',
      proximity_notes: plot.proximityNotes || 'Proximity data under verification',
      polygon_coordinates: polygonCoordinates || [],
      documents: documents || [],
      is_verified: false,
    };

    const { data: plotDataResult, error: pErr } = await dbClient
      .from('plots')
      .insert([plotRecord])
      .select();

    if (pErr) {
      console.error('Supabase Plots Insert Error:', pErr.message || pErr);
      return NextResponse.json(
        {
          success: false,
          error: `Plot insert failed: ${pErr.message}`,
          plotError: pErr.message,
        },
        { status: 500 }
      );
    }

    console.log('Successfully inserted plot record, ID:', plotId, 'linked to Seller ID:', capturedSellerId);

    return NextResponse.json(
      {
        success: true,
        plotId: plotId,
        sellerId: capturedSellerId,
        message: 'Plot listing and seller profile created successfully.',
        plot: plotRecord,
        data: plotDataResult,
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
