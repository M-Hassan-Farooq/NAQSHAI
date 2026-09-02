import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin, supabase } from '@/lib/supabaseClient';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const { seller, plot, polygonCoordinates, documents } = body || {};

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

    // Dynamically instantiate Supabase client with latest environment variables
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    let dbClient;
    if (serviceKey && supabaseUrl) {
      dbClient = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false },
      });
    } else {
      dbClient = supabaseAdmin || supabase;
    }

    // 1. Cleanly format unique Plot ID (avoiding "Plot-Plot-295")
    const rawPlotNum = (plot.plotNumber || '').trim();
    let cleanPlotNum = rawPlotNum.replace(/^plot[\s-_]*/i, '');
    if (!cleanPlotNum) {
      cleanPlotNum = Math.floor(100 + Math.random() * 900).toString();
    }
    const plotId = `Plot-${cleanPlotNum}`;

    // Construct full display title
    const title = `Plot ${cleanPlotNum} - ${plot.society}, ${plot.city}`;

    // 2. Insert into Supabase `sellers` table
    let sellerId = null;
    let sellerError = null;

    const sellerName = (seller.fullName || seller.full_name || seller.name || '').trim();
    const sellerPhone = (seller.phoneNumber || seller.phone_number || seller.phone || '').trim();
    const sellerRole = seller.sellerRole || seller.seller_role || seller.role || 'Direct Owner';

    // Attempt insertion into Supabase `sellers` table
    const sellerRecord = {
      full_name: sellerName,
      phone_number: sellerPhone,
      seller_role: sellerRole,
      is_identity_verified: false,
    };

    try {
      const { data: sellerData, error: sErr } = await dbClient
        .from('sellers')
        .insert([sellerRecord])
        .select();

      if (sErr) {
        console.warn('Supabase Sellers Insert Warning:', sErr.message);
        sellerError = `${sErr.message}${sErr.details ? ` (${sErr.details})` : ''}`;
      } else if (sellerData && sellerData.length > 0) {
        sellerId = sellerData[0].id;
      }
    } catch (sCatchedErr) {
      console.warn('Sellers table insertion exception:', sCatchedErr.message);
      sellerError = sCatchedErr.message;
    }

    // 3. Prepare plot payload with seller_id (or null if seller creation failed due to FK/schema constraints)
    const plotRecord = {
      id: plotId,
      seller_id: sellerId || null,
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

    // 4. Insert into Supabase `plots` table
    let dbInserted = false;
    let plotError = null;
    let plotDataResult = null;

    try {
      const { data: pData, error: pErr } = await dbClient
        .from('plots')
        .insert([plotRecord])
        .select();

      if (pErr) {
        console.error('Supabase Plots Insert Error:', pErr);
        plotError = pErr.message;
      } else {
        dbInserted = true;
        plotDataResult = pData;
        console.log('Successfully inserted plot record, ID:', plotId, 'with Seller ID:', sellerId);
      }
    } catch (pCatchedErr) {
      console.error('Plots table insertion exception:', pCatchedErr.message);
      plotError = pCatchedErr.message;
    }

    // If plot database insertion failed, return detailed error message
    if (!dbInserted && plotError) {
      return NextResponse.json(
        {
          success: false,
          error: `Plot insert failed: ${plotError}${sellerError ? ` (Seller error: ${sellerError})` : ''}`,
          dbInserted: false,
          plotId: plotId,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        plotId: plotId,
        sellerId: sellerId,
        message: 'Plot listing and seller profile created successfully.',
        dbInserted: dbInserted,
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
