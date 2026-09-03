// Shared logic to turn a completed listing into rows in public.sellers + public.plots.
// Used by BOTH the hardened /api/sell route and the draft submit route so the two
// paths stay identical and secure. `uid` here is ALWAYS a server-verified user id.

/**
 * Flatten the wizard's uploadedFiles object into the JSONB documents array that
 * public.plots.documents expects (an array of storage paths). Tolerates the
 * legacy shape where values were plain filename strings.
 */
export function normalizeDocuments(uploadedFiles) {
  const src = uploadedFiles || {};
  const out = [];
  for (const key of ['allotmentLetter', 'cnicFront', 'cnicBack']) {
    const v = src[key];
    if (!v) continue;
    if (typeof v === 'string') out.push(v);
    else if (v.path) out.push(v.path);
  }
  return out;
}

async function insertPlotWithUniqueId(dbAdmin, baseRecord, plotId) {
  let record = { ...baseRecord, id: plotId };
  let { data, error } = await dbAdmin.from('plots').insert([record]).select();

  // If the derived human-readable id collides (another listing already uses that
  // plot number), retry once with a disambiguating suffix. We deliberately do NOT
  // upsert, so one user can never overwrite another user's existing plot.
  const isDuplicate =
    error && (error.code === '23505' || /duplicate key/i.test(error.message || ''));
  if (isDuplicate) {
    record = { ...baseRecord, id: `${plotId}-${Date.now().toString().slice(-4)}` };
    ({ data, error } = await dbAdmin.from('plots').insert([record]).select());
  }
  return { data, error, plotId: record.id };
}

/**
 * Upsert the seller profile (keyed to the verified user id) and insert the plot.
 * @returns {Promise<{ success: boolean, plotId?: string, sellerId?: string, plot?: object, error?: string }>}
 */
export async function persistListing(dbAdmin, { uid, seller = {}, plot = {}, polygonCoordinates = [], documents = [] }) {
  const sellerName = (seller.fullName || seller.full_name || seller.name || '').trim();
  const sellerPhone = (seller.phoneNumber || seller.phone_number || seller.phone || '').trim();
  const sellerRole = seller.sellerRole || seller.seller_role || seller.role || 'Direct Owner';

  // 1. Seller profile, keyed to the authenticated user id (never a client value)
  const sellerRecord = {
    id: uid,
    full_name: sellerName,
    phone_number: sellerPhone,
    seller_role: sellerRole,
    is_identity_verified: false,
  };
  const { data: sellerData, error: sErr } = await dbAdmin
    .from('sellers')
    .upsert([sellerRecord], { onConflict: 'id' })
    .select();

  if (sErr) {
    return { success: false, error: `Seller profile creation failed: ${sErr.message}` };
  }
  const capturedSellerId = sellerData?.[0]?.id || uid;

  // 2. Build the plot id/title from the plot number
  const rawPlotNum = (plot.plotNumber || '').trim();
  let cleanPlotNum = rawPlotNum.replace(/^plot[\s-_]*/i, '');
  if (!cleanPlotNum) {
    cleanPlotNum = Math.floor(100 + Math.random() * 900).toString();
  }
  const basePlotId = `Plot-${cleanPlotNum}`;
  const title = `Plot ${cleanPlotNum} - ${plot.society}, ${plot.city}`;

  const plotRecord = {
    seller_id: capturedSellerId,
    title,
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

  const { data: plotData, error: pErr, plotId } = await insertPlotWithUniqueId(
    dbAdmin,
    plotRecord,
    basePlotId
  );

  if (pErr) {
    return { success: false, error: `Plot insert failed: ${pErr.message}` };
  }

  return {
    success: true,
    plotId,
    sellerId: capturedSellerId,
    plot: (plotData && plotData[0]) || { ...plotRecord, id: plotId },
  };
}
