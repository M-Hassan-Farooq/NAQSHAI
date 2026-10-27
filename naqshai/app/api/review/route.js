import { NextResponse } from 'next/server';
import { getBearerToken, isOperatorToken, getAdminClient } from '@/lib/authServer';
import { draftTitlePreview } from '@/lib/draftProgress';
import { checkPolygonConflict } from '@/lib/polygonOverlap';
import { verifyAreaMatch } from '@/lib/areaCalculator';
import { checkRegulatoryStatus } from '@/lib/regulatoryRegistry';
import { createDocumentAccessToken } from '@/lib/documentCipher';

export const dynamic = 'force-dynamic';

const DOC_LABELS = {
  allotmentLetter: 'Allotment Letter',
  cnicFront: 'CNIC (Front)',
  cnicBack: 'CNIC (Back)',
};

// GET /api/review — operator-only. Returns every SUBMITTED listing across all users
// as a review queue, so an operator can inspect and approve/reject them.
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
      .select('id, seller_id, title, city, price_pkr, size_dimensions, category, flood_risk, noise_level, elevation_profile, polygon_coordinates, is_verified, created_at, updated_at, sellers ( phone_number, full_name )')
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

        // Generate tamper-proof, time-bounded backend download tokens for operators
        // Documents are decrypted in-memory through /api/documents/download
        const documents = [];
        for (const field of ['allotmentLetter', 'cnicFront', 'cnicBack']) {
          const v = uploaded[field];
          const path = typeof v === 'string' ? v : v?.path;
          const name = typeof v === 'string' ? v : v?.name;
          const sha256 = typeof v === 'object' ? v?.sha256 : null;
          const encrypted = typeof v === 'object' ? !!v?.encrypted : false;

          if (path) {
            const token = createDocumentAccessToken({
              draftId: row.id,
              field,
              isOperator: true,
              expiresInSeconds: 900, // 15-minute operator review window
            });
            const downloadUrl = `/api/documents/download?draftId=${encodeURIComponent(row.id)}&field=${encodeURIComponent(field)}&token=${encodeURIComponent(token)}`;

            documents.push({
              field,
              label: DOC_LABELS[field] || field,
              name: name || DOC_LABELS[field] || field,
              path,
              sha256,
              encrypted,
              signedUrl: downloadUrl, // maintain signedUrl property name for frontend compatibility
              downloadUrl,
            });
          }
        }

        const conflict = checkPolygonConflict(polygon, verifiedRows || []);
        const areaCheck = verifyAreaMatch(polygon, plot.sizeDimensions || '10 Marla (35x70)', 0.90, 1.10);
        const regulatory = checkRegulatoryStatus(plot.society, plot.city, polygon);

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
          },
          polygon,
          documents,
          overlapConflict: conflict.hasConflict ? conflict.conflictingPlot : null,
          areaVerification: areaCheck,
          regulatory,
          aiVerification: fd.ai_verification_report || fd.aiVerification || null,
          ai_verification_report: fd.ai_verification_report || fd.aiVerification || null,
          authority_doc_type: fd.authority_doc_type || fd.authorityDocType || '',
          document_serial_number: fd.document_serial_number || fd.documentSerialNumber || '',
        };
      })
    );

    const verifiedPlots = (verifiedRows || []).map((row) => {
      const society = row.title?.split(' - ')[1]?.split(',')[0]?.trim() || '';
      const polygon = Array.isArray(row.polygon_coordinates) ? row.polygon_coordinates : [];
      const regulatory = checkRegulatoryStatus(society, row.city, polygon);

      return {
        id: row.id,
        title: row.title || row.id,
        isVerified: !!row.is_verified,
        city: row.city || '',
        society,
        pricePkr: row.price_pkr,
        sizeDimensions: row.size_dimensions || '',
        category: row.category || '',
        floodRisk: row.flood_risk || '',
        noiseLevel: row.noise_level || '',
        elevationProfile: row.elevation_profile || '',
        polygon,
        regulatory,
        created_at: row.created_at,
        updated_at: row.updated_at,
        seller: {
          fullName: row.sellers?.full_name || '',
          phoneNumber: row.sellers?.phone_number || '',
        },
      };
    });

    return NextResponse.json({ success: true, listings, verifiedPlots });
  } catch (err) {
    return NextResponse.json({ success: false, error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
