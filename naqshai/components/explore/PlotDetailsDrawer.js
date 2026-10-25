'use client';

import React from 'react';
import {
  Minimize2,
  Heart,
  X,
  MapPin,
  Eye,
  ChevronDown,
  Phone,
  MessageSquare,
} from 'lucide-react';
import AmenityScoreCard from '@/components/AmenityScoreCard';
import { formatWhatsAppUrl } from '@/lib/formatPlot';
import { floodRiskClasses } from '@/components/explore/MapPinIcons';

/**
 * Slide-out inspector drawer presenting comprehensive plot intelligence:
 * identity, 3D walkthrough toggle, environmental hazards, CDA/RDA clearance,
 * nearby amenities, and owner contact.
 */
export default function PlotDetailsDrawer({
  selectedPlot,
  isInspectorMinimized,
  setIsInspectorMinimized,
  is3DMode,
  handleToggle3D,
  handleExit3D,
  handleClosePlot,
  isFavorite,
  toggleFavorite,
  onDiscussWithAi,
}) {
  if (!selectedPlot) return null;

  return (
    <>
      {/* Inspector identity header */}
      <div className="p-4 border-b border-border flex justify-between items-center bg-surface-subtle/80">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono bg-surface px-2 py-1 rounded-control border border-border text-ink text-xs font-bold truncate">
            {selectedPlot.id}
          </span>
          <span className="text-sm font-bold text-action-hover bg-action-soft px-2.5 py-1.5 rounded-control whitespace-nowrap">
            {selectedPlot.price}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsInspectorMinimized(true)}
            aria-label="Minimize plot details to view map"
            title="Minimize details to view map"
            className="min-h-9 min-w-9 flex items-center justify-center hover:bg-slate-200/60 rounded-control text-muted transition cursor-pointer ui-focus-ring"
          >
            <Minimize2 className="w-4 h-4 text-slate-500" />
          </button>
          <button
            type="button"
            onClick={() => toggleFavorite(selectedPlot.id, selectedPlot)}
            className="min-h-9 min-w-9 flex items-center justify-center hover:bg-rose-50 rounded-control text-muted hover:text-rose-500 transition cursor-pointer ui-focus-ring"
            title={isFavorite(selectedPlot.id) ? 'Remove from favorites' : 'Save to favorites'}
            aria-label={isFavorite(selectedPlot.id) ? 'Remove from favorites' : 'Save to favorites'}
          >
            <Heart
              className={`w-4 h-4 transition-transform active:scale-125 ${
                isFavorite(selectedPlot.id)
                  ? 'fill-rose-500 text-rose-500'
                  : 'text-slate-400'
              }`}
            />
          </button>
          <button
            type="button"
            onClick={handleClosePlot}
            aria-label="Close plot details panel"
            className="min-h-9 min-w-9 flex items-center justify-center hover:bg-slate-200/60 rounded-control text-muted transition cursor-pointer ui-focus-ring"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Plot identity and details */}
      <div className="p-5 flex-1 overflow-y-auto space-y-5 text-ink">
        {/* Active 3D Walkthrough Live Banner */}
        {is3DMode && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="truncate">3D Walkthrough is live on the map</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsInspectorMinimized(true)}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-white hover:bg-emerald-100/60 px-2.5 py-1.5 rounded-lg border border-emerald-300 shadow-xs transition"
              >
                View 3D
              </button>
              <button
                type="button"
                onClick={handleExit3D}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-2 py-1.5 rounded-lg border border-slate-200 shadow-xs transition"
                title="Exit 3D view"
              >
                Exit
              </button>
            </div>
          </div>
        )}

        <section aria-labelledby="selected-plot-title">
          <h2 id="selected-plot-title" className="text-lg font-bold text-ink leading-snug">
            {selectedPlot.name}
          </h2>
          <p className="text-sm text-muted mt-1 flex items-start gap-2">
            <MapPin className="w-4 h-4 text-action shrink-0 mt-0.5" />
            <span>{[selectedPlot.society, selectedPlot.city].filter(Boolean).join(', ') || 'Location not provided'}</span>
          </p>
        </section>

        <button
          type="button"
          onClick={handleToggle3D}
          disabled={!selectedPlot.center}
          className="w-full flex items-center justify-center gap-2 bg-surface-subtle hover:bg-action-soft disabled:opacity-50 disabled:cursor-not-allowed text-ink font-medium py-2.5 px-4 rounded-control border border-border transition text-sm ui-focus-ring"
        >
          <Eye className="w-4 h-4 text-action" />
          <span>
            {!selectedPlot.center
              ? 'Walkthrough unavailable (no map location)'
              : is3DMode
              ? 'Exit 3D walkthrough'
              : 'Launch 3D walkthrough'}
          </span>
        </button>

        <details className="group rounded-card border border-border">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3 text-sm font-semibold text-ink ui-focus-ring [&::-webkit-details-marker]:hidden">
            <span>Property details</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
          </summary>
          <dl className="divide-y divide-border border-t border-border px-3 text-sm">
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-muted">Plot size</dt>
              <dd className="font-semibold text-right">{selectedPlot.details?.size || 'Not provided'}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-muted">Property type</dt>
              <dd className="font-semibold text-right">{selectedPlot.details?.category || 'Not provided'}</dd>
            </div>
          </dl>
        </details>

        {/* Environmental indicators */}
        {(() => {
          const floodVal = selectedPlot.details?.floodRisk || '';
          const noiseVal = selectedPlot.details?.noiseLevel || '';
          const elevVal = selectedPlot.details?.elevation || '';

          const isPendingValue = (val) => {
            if (!val || typeof val !== 'string') return true;
            const lower = val.trim().toLowerCase();
            return lower === '' || lower.includes('pending') || lower === 'n/a';
          };

          const isFloodPending = isPendingValue(floodVal);
          const isNoisePending = isPendingValue(noiseVal);
          const isElevPending = isPendingValue(elevVal);
          const allPending = isFloodPending && isNoisePending && isElevPending;

          const noiseLower = noiseVal.toLowerCase();
          const isQuietNoise = noiseLower.includes('quiet') || noiseLower.includes('low') || noiseLower.includes('45 db');
          const isHighNoise = noiseLower.includes('high') || noiseLower.includes('78 db');

          return (
            <details className="group rounded-card border border-border">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3 text-sm font-semibold text-ink ui-focus-ring [&::-webkit-details-marker]:hidden">
                <span>Environmental indicators</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
              </summary>
              <div className="space-y-2 border-t border-border p-3">
                <p className="text-xs text-muted">Screening information only; not a site inspection or safety guarantee.</p>
                {allPending ? (
                  <div className="rounded-card border border-border bg-surface-subtle px-3 py-2.5 text-sm text-muted">
                    No environmental indicators are available for this listing.
                  </div>
                ) : (
                  <dl className="divide-y divide-border rounded-card border-y border-border text-sm">
                    {!isFloodPending && (
                      <div className="flex justify-between gap-4 py-2.5">
                        <dt className="text-muted">Flood indicator</dt>
                        <dd className={`inline-flex max-w-[65%] rounded-control border px-2 py-1 text-right text-xs font-medium ${floodRiskClasses(floodVal)}`}>{floodVal}</dd>
                      </div>
                    )}
                    {!isNoisePending && (
                      <div className="flex justify-between gap-4 py-2.5">
                        <dt className="text-muted">Noise indicator</dt>
                        <dd className={`inline-flex max-w-[65%] rounded-control border px-2 py-1 text-right text-xs font-medium ${isHighNoise ? 'bg-danger-soft text-danger border-danger/20' : isQuietNoise ? 'bg-action-soft text-action-hover border-action/20' : 'bg-caution-soft text-caution border-caution/20'}`}>{noiseVal}</dd>
                      </div>
                    )}
                    {!isElevPending && (
                      <div className="flex justify-between gap-4 py-2.5">
                        <dt className="text-muted">Elevation</dt>
                        <dd className="inline-flex max-w-[65%] rounded-control border border-border bg-surface-subtle px-2 py-1 text-right text-xs font-medium text-ink">{elevVal}</dd>
                      </div>
                    )}
                  </dl>
                )}
                <p className="text-xs text-muted">
                  Source and assessment date are not provided in the public plot data.
                </p>
              </div>
            </details>
          );
        })()}

        {/* Society-level regulatory registry lookup */}
        {selectedPlot.regulatory && (
          <details className="group rounded-card border border-border">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3 text-sm font-semibold text-ink ui-focus-ring [&::-webkit-details-marker]:hidden">
              <span className="min-w-0 flex-1">Housing scheme status</span>
              <span className="flex shrink-0 items-center gap-2">
                <span className={`ui-badge whitespace-nowrap ${selectedPlot.regulatory.tier === 'approved' || selectedPlot.regulatory.tier === 'government' ? 'ui-badge-success' : 'ui-badge-caution'}`}>
                  {selectedPlot.regulatory.badgeText}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
              </span>
            </summary>
            <div className="space-y-3 border-t border-border p-3">
              <p className="text-sm text-muted leading-relaxed">
                {selectedPlot.regulatory.summary}
              </p>
              <dl className="divide-y divide-border rounded-card border-y border-border text-xs">
                <div className="flex justify-between gap-3 py-2">
                  <dt className="text-muted">Authority</dt>
                  <dd className="font-medium text-right text-ink">{selectedPlot.regulatory.authority || 'Not provided'}</dd>
                </div>
                <div className="flex justify-between gap-3 py-2">
                  <dt className="text-muted">Jurisdiction</dt>
                  <dd className="font-medium text-right text-ink">{selectedPlot.regulatory.jurisdiction || 'Not provided'}</dd>
                </div>
                <div className="flex justify-between gap-3 py-2">
                  <dt className="text-muted">Registry NOC reference</dt>
                  <dd className="max-w-[65%] font-medium text-right text-ink">{selectedPlot.regulatory.nocNumber || 'Not provided'}</dd>
                </div>
                <div className="flex justify-between gap-3 py-2">
                  <dt className="text-muted">Layout-plan status</dt>
                  <dd className="max-w-[65%] font-medium text-right text-ink">{selectedPlot.regulatory.lopStatus || 'Not provided'}</dd>
                </div>
              </dl>
              <p className="text-xs text-muted">
                NAQSHAI registry lookup; currentness date not provided. This is a society/sector-level match, not confirmation of this plot’s NOC, ownership, title, or transfer eligibility.
              </p>
              {(selectedPlot.regulatory.warning || selectedPlot.regulatory.officialVerificationUrl) && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {selectedPlot.regulatory.warning && (
                    <p className="text-xs leading-relaxed text-caution">
                      {selectedPlot.regulatory.warning}
                    </p>
                  )}
                  {selectedPlot.regulatory.officialVerificationUrl && (
                    <a
                      href={selectedPlot.regulatory.officialVerificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-action-hover hover:text-action underline inline-flex items-center gap-1 ui-focus-ring"
                    >
                      Check with {selectedPlot.regulatory.authority}
                      <span aria-hidden="true">→</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </details>
        )}

        {/* Nearby Amenities */}
        <details className="group rounded-card border border-border">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3 text-sm font-semibold text-ink ui-focus-ring [&::-webkit-details-marker]:hidden">
            <span>Nearby amenities and distances</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
          </summary>
          <div className="border-t border-border p-2">
            <AmenityScoreCard
              plotId={selectedPlot.id}
              lat={selectedPlot.center?.lat}
              lng={selectedPlot.center?.lng}
            />
          </div>
        </details>

        {/* WhatsApp Secondary Link */}
        <details className="group rounded-card border border-border">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3 text-sm font-semibold text-ink ui-focus-ring [&::-webkit-details-marker]:hidden">
            <span>Owner contact</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
          </summary>
          <div className="border-t border-border p-3">
            {formatWhatsAppUrl(selectedPlot.ownerContact) ? (
              <a
                href={formatWhatsAppUrl(selectedPlot.ownerContact, `Hi, I am interested in ${selectedPlot.name} listed on NAQSHAI.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold py-2.5 px-4 rounded-xl transition text-sm ui-focus-ring cursor-pointer shadow-xs"
              >
                <Phone className="w-4 h-4 text-emerald-700" />
                <span>Contact owner via WhatsApp</span>
              </a>
            ) : (
              <div className="w-full text-center text-sm text-muted bg-surface-subtle border border-border rounded-control py-2.5">
                Owner contact not available
              </div>
            )}
          </div>
        </details>
      </div>

      {/* Sidebar Footer / CTA */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <button
          onClick={onDiscussWithAi}
          className="bg-emerald-700 hover:bg-emerald-600 text-white w-full py-3 rounded-xl font-semibold flex justify-center items-center gap-2 text-sm shadow-xs transition cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Discuss with AI</span>
        </button>
      </div>
    </>
  );
}
