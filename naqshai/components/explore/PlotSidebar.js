'use client';

import React from 'react';
import {
  Search,
  X,
  MapPin,
  Loader2,
  ShieldAlert,
  Heart,
  ChevronDown,
  ChevronUp,
  FlaskConical,
} from 'lucide-react';
import { floodRiskClasses } from '@/components/explore/MapPinIcons';

/**
 * Collapsible & resizable left-hand sidebar containing:
 * - Search by society, plot ID, or dimensions
 * - Width presets (S / M / L)
 * - City filter pills
 * - Grouped plot cards with expand/collapse details and "See on Map" actions
 */
export default function PlotSidebar({
  isMobile,
  isSidebarOpen,
  sidebarWidth,
  setSidebarWidth,
  isDragging,
  sidebarSearchQuery,
  setSidebarSearchQuery,
  activeCityFilter,
  setActiveCityFilter,
  plots,
  uniqueCities,
  plotsLoading,
  plotsError,
  plotsByCity,
  selectedPlot,
  expandedPlotIds,
  togglePlotDetails,
  handleSeeOnMap,
  handleRetry,
  isFavorite,
  toggleFavorite,
  mapRef,
}) {
  return (
    <aside
      style={
        isMobile
          ? { transform: isSidebarOpen ? 'translateX(0%)' : 'translateX(-100%)' }
          : {
              width: isSidebarOpen ? `${sidebarWidth}px` : '0px',
              transition: isDragging ? 'none' : 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }
      }
      className={`bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden ${
        isMobile
          ? 'absolute top-0 left-0 z-30 w-[85vw] max-w-[340px] shadow-2xl transition-transform duration-200 will-change-transform'
          : 'relative z-10 shrink-0'
      }`}
    >
      {/* Sidebar Header with Internal Filter & City Tabs */}
      <div className="p-3.5 border-b border-slate-200 space-y-3 bg-slate-50/70 shrink-0">
        {/* Search Plots Input & Width Presets */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-xs focus-within:border-emerald-500 transition">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search by society, size, or plot ID..."
              value={sidebarSearchQuery}
              onChange={(e) => setSidebarSearchQuery(e.target.value)}
              className="w-full text-xs text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
            />
            {sidebarSearchQuery && (
              <button
                type="button"
                onClick={() => setSidebarSearchQuery('')}
                aria-label="Clear search query"
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Width Preset Buttons (S / M / L) */}
          <div className="hidden sm:flex items-center gap-0.5 bg-white border border-slate-200 p-1 rounded-xl shadow-xs shrink-0">
            {[
              { label: 'S', width: 320, title: 'Compact width (320px)' },
              { label: 'M', width: 400, title: 'Default width (400px)' },
              { label: 'L', width: 520, title: 'Wide width (520px)' },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setSidebarWidth(preset.width);
                  try {
                    localStorage.setItem('naqshai_explorer_sidebar_width', String(preset.width));
                  } catch (_) {}
                  if (mapRef?.current && window.google?.maps?.event) {
                    setTimeout(() => window.google.maps.event.trigger(mapRef.current, 'resize'), 250);
                  }
                }}
                className={`w-5 h-6 flex items-center justify-center rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                  sidebarWidth === preset.width
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                }`}
                title={preset.title}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* City Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          <button
            type="button"
            onClick={() => setActiveCityFilter('ALL')}
            className={`text-[11px] font-semibold px-3 py-1 rounded-lg border transition whitespace-nowrap cursor-pointer ${
              activeCityFilter === 'ALL'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
            }`}
          >
            All Cities ({plots.length})
          </button>
          {uniqueCities.map((city) => {
            const count = plots.filter((p) => (p.city || '').trim().toLowerCase() === city.toLowerCase()).length;
            return (
              <button
                key={city}
                type="button"
                onClick={() => setActiveCityFilter(city)}
                className={`text-[11px] font-semibold px-3 py-1 rounded-lg border transition whitespace-nowrap cursor-pointer ${
                  activeCityFilter.toLowerCase() === city.toLowerCase()
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                }`}
              >
                {city} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Sidebar Scrollable Plot List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {/* Prototype Demonstration Notice */}
        <div className="p-2.5 bg-amber-50/90 border border-amber-200/90 rounded-xl flex items-start gap-2 text-amber-900 text-[11px] leading-relaxed shadow-2xs">
          <FlaskConical className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
          <span>
            <strong className="font-bold text-amber-950">Prototype Notice:</strong> Uploaded plots are verified test subjects for platform evaluation and are <em>not currently for sale</em>.
          </span>
        </div>
        {plotsLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 space-y-2.5">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
            <p className="text-xs font-medium">Loading verified properties…</p>
          </div>
        ) : plotsError ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center space-y-2">
            <ShieldAlert className="w-5 h-5 text-red-600 mx-auto" />
            <p className="text-xs text-red-700">{plotsError}</p>
            <button
              onClick={handleRetry}
              className="text-xs font-semibold text-emerald-700 underline cursor-pointer"
            >
              Retry Loading
            </button>
          </div>
        ) : Object.keys(plotsByCity).length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No matching plots found for this filter.
          </div>
        ) : (
          Object.entries(plotsByCity).map(([city, cityPlots]) => (
            <div key={city} className="space-y-2.5">
              {/* City Group Header */}
              <div className="flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs py-1 z-1 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  {city}
                </span>
                <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {cityPlots.length} {cityPlots.length === 1 ? 'plot' : 'plots'}
                </span>
              </div>

              {/* City Plot Cards */}
              <div className="space-y-2.5">
                {cityPlots.map((plot) => {
                  const isSelected = selectedPlot?.id === plot.id;
                  const floodVal = plot.details?.floodRisk || '';
                  const noiseVal = plot.details?.noiseLevel || '';
                  const elevVal = plot.details?.elevation || '';

                  const isPendingValue = (val) => {
                    if (!val || typeof val !== 'string') return true;
                    const lower = val.trim().toLowerCase();
                    return lower === '' || lower.includes('pending') || lower === 'n/a';
                  };

                  const isFloodPending = isPendingValue(floodVal);
                  const isNoisePending = isPendingValue(noiseVal);
                  const isElevPending = isPendingValue(elevVal);

                  const noiseLower = noiseVal.toLowerCase();
                  const isQuietNoise = noiseLower.includes('quiet') || noiseLower.includes('low') || noiseLower.includes('45 db');
                  const isHighNoise = noiseLower.includes('high') || noiseLower.includes('78 db');

                  const isExpanded = expandedPlotIds.has(plot.id);

                  return (
                    <div
                      key={plot.id}
                      aria-label={`${plot.name}, ${plot.price}, ${plot.city}`}
                      className={`rounded-xl border p-3.5 transition flex flex-col justify-between space-y-2.5 shadow-xs ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/20 ring-1 ring-emerald-500/30'
                          : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm'
                      }`}
                    >
                      <div>
                        {/* Top Bar: Plot ID + Price + Favorite */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                            {plot.id}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-xs font-extrabold text-emerald-700 whitespace-nowrap bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {plot.price}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(plot.id, plot);
                              }}
                              aria-label={isFavorite(plot.id) ? `Remove ${plot.name} from favorites` : `Save ${plot.name} to favorites`}
                              className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                              title={isFavorite(plot.id) ? 'Remove from favorites' : 'Save to favorites'}
                            >
                              <Heart
                                className={`w-3.5 h-3.5 transition-transform active:scale-125 ${
                                  isFavorite(plot.id)
                                    ? 'fill-rose-500 text-rose-500'
                                    : 'text-slate-400 hover:text-rose-500'
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Plot Name */}
                        <h4 className="font-bold text-xs text-slate-900 mt-1.5 leading-snug">
                          {plot.name}
                        </h4>

                        {/* Location */}
                        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>
                            {plot.society ? `${plot.society}, ` : ''}{plot.city}
                          </span>
                        </p>

                        {/* Size */}
                        <div className="mt-2 flex items-center gap-1.5 text-[10px]">
                          <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            Size: {plot.details?.size || 'Plot'}
                          </span>
                        </div>
                      </div>

                      {/* Expandable Remaining Details */}
                      {isExpanded && (
                        <div className="pt-2 border-t border-slate-100 space-y-2 animate-in fade-in duration-150">
                          {/* Verification & Regulatory Clearance */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {plot.isVerified && (
                              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                Verified
                              </span>
                            )}
                            {plot.regulatory && (
                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                                  plot.regulatory.tier === 'unauthorized'
                                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                                    : plot.regulatory.tier === 'conditional'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                }`}
                                title={`${plot.regulatory.statusLabel} (${plot.regulatory.authority})`}
                              >
                                {plot.regulatory.badgeText}
                              </span>
                            )}
                            {plot.details?.category && (
                              <span className="text-[10px] font-medium text-slate-600 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                                {plot.details.category}
                              </span>
                            )}
                          </div>

                          {/* Environmental & Risk Badges */}
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                            {!isFloodPending && (
                              <span
                                className={`px-2 py-0.5 rounded border font-medium ${floodRiskClasses(floodVal)}`}
                              >
                                Flood: {floodVal}
                              </span>
                            )}
                            {!isNoisePending && (
                              <span
                                className={`px-2 py-0.5 rounded border font-medium ${
                                  isHighNoise
                                    ? 'bg-red-50 text-red-800 border-red-200'
                                    : isQuietNoise
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}
                              >
                                Noise: {noiseVal}
                              </span>
                            )}
                            {!isElevPending && (
                              <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                Elevation: {elevVal}
                              </span>
                            )}
                            {isFloodPending && isNoisePending && isElevPending && (
                              <span className="font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                Survey Pending
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons: "See on Map" + "Show Details / Hide Details" */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleSeeOnMap(plot)}
                          aria-label={`View ${plot.name} on the map`}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{isSelected ? 'Viewing on Map' : 'See on Map'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => togglePlotDetails(plot.id)}
                          aria-expanded={isExpanded}
                          aria-label={isExpanded ? `Hide details for ${plot.name}` : `Show details for ${plot.name}`}
                          className="py-1.5 px-2.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition flex items-center gap-1 shrink-0 cursor-pointer"
                          title={isExpanded ? 'Hide details' : 'Show details'}
                        >
                          <span>{isExpanded ? 'Hide Details' : 'Show Details'}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
