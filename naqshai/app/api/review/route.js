import { NextResponse } from 'next/server';
import { getBearerToken, isOperatorToken, getAdminClient } from '@/lib/authServer';
import { draftTitlePreview } from '@/lib/draftProgress';

export const dynamic = 'force-dynamic';

const DOC_LABELS = {
  allotmentLetter: 'Allotment Letter',
  cnicFront: 'CNIC (Front)',
  cnicBack: 'CNIC (Back)',
};

// GET /api/review — operator-only. Returns every SUBMITTED listing across all users
// as a review queue, so an operator can inspect and approve/reject them.
//
// Owner-scoped RLS makes a cross-user read impossible from a normal user client, so
// this uses the privileged admin client (service role). That same client is what
// lets us mint short-lived signed URLs for the private plot-documents bucket, whose
// owner-scoped storage policy would otherwise hide each file from anyone but its
// uploader. The service-role key stays server-side; the browser only ever holds the
// operator passphrase and the temporary signed URLs.
export async function GET(request) {
  try {
    if (!isOperatorToken(getBearerToken(request))) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
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
      .select('id, seller_id, title, city, price_pkr, size_dimensions, category, flood_risk, noise_level, elevation_profile, proximity_notes, polygon_coordinates, is_verified, created_at, updated_at, sellers ( phone_number, full_name )')
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

        // Collect stored document paths (tolerating the legacy string shape), then
        // sign them together. A missing/failed signature yields a null url rather
        // than failing the whole queue.
        const docEntries = [];
        for (const field of ['allotmentLetter', 'cnicFront', 'cnicBack']) {
          const v = uploaded[field];
          const path = typeof v === 'string' ? v : v?.path;
          const name = typeof v === 'string' ? v : v?.name;
          if (path) {
            docEntries.push({ field, label: DOC_LABELS[field] || field, name: name || DOC_LABELS[field] || field, path });
          }
        }

        let documents = [];
        if (docEntries.length) {
          const { data: signed } = await dbAdmin
            .storage
            .from('plot-documents')
            .createSignedUrls(docEntries.map((d) => d.path), 60 * 60); // valid ~1 hour
          documents = docEntries.map((d, i) => ({
            field: d.field,
            label: d.label,
            name: d.name,
            signedUrl: signed?.[i]?.signedUrl || signed?.[i]?.signedURL || null,
          }));
        }

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
            proximityNotes: plot.proximityNotes || '',
          },
          polygon,
          documents,
        };
      })
    );

    const verifiedPlots = (verifiedRows || []).map((row) => ({
      id: row.id,
      title: row.title || row.id,
      isVerified: !!row.is_verified,
      city: row.city || '',
      society: row.title?.split(' - ')[1]?.split(',')[0]?.trim() || '',
      pricePkr: row.price_pkr,
      sizeDimensions: row.size_dimensions || '',
      category: row.category || '',
      floodRisk: row.flood_risk || '',
      noiseLevel: row.noise_level || '',
      elevationProfile: row.elevation_profile || '',
      proximityNotes: row.proximity_notes || '',
      polygon: Array.isArray(row.polygon_coordinates) ? row.polygon_coordinates : [],
      created_at: row.created_at,
      updated_at: row.updated_at,
      seller: {
        fullName: row.sellers?.full_name || '',
        phoneNumber: row.sellers?.phone_number || '',
      },
    }));

    return NextResponse.json({ success: true, listings, verifiedPlots });
  } catch (err) {
    return NextResponse.json({ success: false, error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
