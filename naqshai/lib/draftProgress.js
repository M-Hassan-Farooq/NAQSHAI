// Pure helpers shared by the draft hook, the drafts list API, and the dashboard
// so that "progress %" and the title preview are always computed the same way
// from the SAVED form data (never from ephemeral UI state).

const REQUIRED_CHECKS = [
  (f) => !!(f.sellerInfo?.fullName),
  (f) => !!(f.sellerInfo?.phoneNumber),
  (f) => !!(f.plotDetails?.society),
  (f) => !!(f.plotDetails?.plotNumber),
  (f) => !!(f.plotDetails?.pricePkr),
  (f) => !!(f.plotDetails?.sizeDimensions),
  (f) => Array.isArray(f.polygonCoordinates) && f.polygonCoordinates.length >= 3,
  (f) => !!(f.uploadedFiles?.allotmentLetter),
];

/**
 * Completion percentage (0-100) derived from actual saved fields.
 */
export function computeDraftProgress(formData) {
  const f = formData || {};
  const done = REQUIRED_CHECKS.reduce((n, check) => {
    let ok = false;
    try { ok = !!check(f); } catch { ok = false; }
    return n + (ok ? 1 : 0);
  }, 0);
  return Math.round((done / REQUIRED_CHECKS.length) * 100);
}

/**
 * Human-readable label for a draft card.
 */
export function draftTitlePreview(formData) {
  const p = (formData || {}).plotDetails || {};
  const num = (p.plotNumber || '').trim();
  const society = (p.society || '').trim();
  const city = (p.city || '').trim();
  if (num || society) {
    const left = num ? `Plot ${num}` : 'Plot';
    const right = [society, city].filter(Boolean).join(', ');
    return right ? `${left} — ${right}` : left;
  }
  return 'Untitled draft';
}

/**
 * Whether a brand-new draft is worth persisting yet. Prevents creating empty
 * draft rows when someone merely opens /sell (seller name/phone are prefilled
 * from the auth profile, so they do NOT count as intent on their own).
 */
export function isDraftMeaningful(formData) {
  const f = formData || {};
  const p = f.plotDetails || {};
  const docs = f.uploadedFiles || {};
  return !!(
    p.plotNumber ||
    p.pricePkr ||
    p.proximityNotes ||
    (Array.isArray(f.polygonCoordinates) && f.polygonCoordinates.length > 0) ||
    docs.allotmentLetter ||
    docs.cnicFront ||
    docs.cnicBack ||
    (f.currentStep && f.currentStep > 1)
  );
}
