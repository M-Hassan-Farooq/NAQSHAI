// Programmatically generated green "availability" pin (SVG data URI — no image asset).
export function availabilityPinDataUri() {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52">' +
    '<path d="M20 1C9.5 1 1 9.5 1 20c0 13.5 19 31 19 31s19-17.5 19-31C39 9.5 30.5 1 20 1z" fill="#059669" stroke="#ffffff" stroke-width="2.5"/>' +
    '<circle cx="20" cy="20" r="7.5" fill="#ffffff"/>' +
    '<circle cx="20" cy="20" r="3.5" fill="#059669"/>' +
    '</svg>';
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

// Green cluster bubble; the plot count is drawn as the marker label on top.
export function clusterBubbleDataUri(size) {
  const c = size / 2;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    `<circle cx="${c}" cy="${c}" r="${c - 2}" fill="#059669" fill-opacity="0.22"/>` +
    `<circle cx="${c}" cy="${c}" r="${c - 9}" fill="#059669" stroke="#ffffff" stroke-width="3"/>` +
    '</svg>';
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

export function floodRiskClasses(value) {
  const risk = String(value || '').split('(')[0].trim().toLowerCase();
  if (/\b(high|severe|very high)\b/.test(risk)) {
    return 'bg-danger-soft text-danger border-danger/20';
  }
  if (/\b(elevated|significant)\b/.test(risk)) {
    return 'bg-orange-50 text-orange-800 border-orange-200';
  }
  if (/\b(moderate|medium)\b/.test(risk)) {
    return 'bg-caution-soft text-caution border-caution/20';
  }
  if (/\b(low|minimal)\b/.test(risk)) {
    return 'bg-action-soft text-action-hover border-action/20';
  }
  return 'bg-surface-subtle text-muted border-border';
}
