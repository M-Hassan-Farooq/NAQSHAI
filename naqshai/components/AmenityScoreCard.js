'use client';

import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  GraduationCap, 
  ShoppingBag, 
  Bus, 
  Compass, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { calculateAmenityScores, getAmenityRating } from '@/lib/amenityCalculator';

// Client-side in-memory cache to guarantee 0ms instant loading for visited plots
const amenityCache = new Map();

const CATEGORY_META = {
  healthcare: {
    label: 'Healthcare',
    icon: HeartPulse,
    bgColor: 'bg-action-soft text-action-hover border-border'
  },
  education: {
    label: 'Education',
    icon: GraduationCap,
    bgColor: 'bg-surface-subtle text-ink border-border'
  },
  commerce: {
    label: 'Commerce & Retail',
    icon: ShoppingBag,
    bgColor: 'bg-action-soft text-action-hover border-border'
  },
  transit: {
    label: 'Transit & Arterials',
    icon: Bus,
    bgColor: 'bg-surface-subtle text-ink border-border'
  }
};

function getScoreColorClass(score) {
  if (score >= 70) return { text: 'text-action-hover', stroke: '#08785d', bg: 'ui-badge-success', bar: 'bg-action' };
  if (score >= 50) return { text: 'text-amber-800', stroke: '#ca8a04', bg: 'bg-amber-50 text-amber-800 border border-amber-200', bar: 'bg-yellow-500' };
  if (score >= 35) return { text: 'text-orange-800', stroke: '#ea580c', bg: 'bg-orange-50 text-orange-800 border border-orange-200', bar: 'bg-orange-500' };
  return { text: 'text-danger', stroke: '#b4232f', bg: 'ui-badge-danger', bar: 'bg-danger' };
}

export default function AmenityScoreCard({ plotId, lat, lng, center, className = '' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState(() => Object.keys(CATEGORY_META));

  const resolvedLat = lat !== undefined && lat !== null ? Number(lat) : center?.lat;
  const resolvedLng = lng !== undefined && lng !== null ? Number(lng) : center?.lng;
  const hasValidCoordinates =
    typeof resolvedLat === 'number' &&
    typeof resolvedLng === 'number' &&
    !Number.isNaN(resolvedLat) &&
    !Number.isNaN(resolvedLng) &&
    resolvedLat >= -90 &&
    resolvedLat <= 90 &&
    resolvedLng >= -180 &&
    resolvedLng <= 180;

  useEffect(() => {
    if (!hasValidCoordinates) {
      setData(null);
      setLoading(false);
      return;
    }

    const cacheKey = plotId ? `${plotId}_${resolvedLat}_${resolvedLng}` : `${resolvedLat}_${resolvedLng}`;

    // 1. Instant Cache Hit
    if (amenityCache.has(cacheKey)) {
      setData(amenityCache.get(cacheKey));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Fast local calculation with graceful fallback
    try {
      const localResult = calculateAmenityScores(resolvedLat, resolvedLng);
      if (localResult) {
        amenityCache.set(cacheKey, localResult);
        setData(localResult);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('[AmenityScoreCard] Local evaluation notice, attempting API fetch:', err);
    }

    // Secondary lazy API fetch if needed
    let isMounted = true;
    async function fetchScores() {
      try {
        const res = await fetch(`/api/amenities?lat=${resolvedLat}&lng=${resolvedLng}&plotId=${plotId || 'plot'}`);
        if (!res.ok) throw new Error('Failed to load amenity ratings');
        const resData = await res.json();
        if (isMounted) {
          amenityCache.set(cacheKey, resData);
          setData(resData);
        }
      } catch (e) {
        if (isMounted) setError('Unable to compute neighborhood proximity.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchScores();

    return () => {
      isMounted = false;
    };
  }, [plotId, resolvedLat, resolvedLng, hasValidCoordinates]);

  // Graceful Fallback Card if coordinates are absent or unmapped
  if (!hasValidCoordinates) {
    return (
      <div className={`ui-panel p-4 space-y-3 ${className}`}>
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-ui-caption font-bold uppercase tracking-wider text-muted">
            <Compass className="w-3.5 h-3.5 text-slate-400" />
            <span>Amenity Accessibility</span>
          </div>
          <span className="ui-badge-neutral">
            Survey Pending
          </span>
        </div>
        <div className="ui-alert-caution flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-caution shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-ink">Geospatial coordinates pending</p>
            <p className="text-ui-caption text-muted mt-0.5">
              Boundary survey for this plot is being finalized. Proximity scores for healthcare, education, transit, and commerce will display once coordinates are recorded.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Shimmering Skeleton Loader while fetching/calculating
  if (loading) {
    return (
      <div className={`ui-panel p-4 space-y-4 animate-pulse ${className}`} role="status" aria-label="Loading amenity accessibility scores">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-slate-200 rounded w-44"></div>
          <div className="h-7 w-16 bg-slate-200 rounded-lg"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between">
                <div className="h-3.5 bg-slate-200 rounded w-28"></div>
                <div className="h-3.5 bg-slate-200 rounded w-12"></div>
              </div>
              <div className="h-2 bg-slate-100 rounded-full w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`ui-alert-info flex items-center gap-2 ${className}`} role="status">
        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
        <span>Neighborhood proximity data is temporarily unavailable.</span>
      </div>
    );
  }

  const categories = data.categories || {};
  const selectedWeight = selectedCategories.reduce(
    (total, key) => total + (categories[key]?.weightPercentage ?? 0),
    0
  );
  const selectedScore = selectedCategories.length === Object.keys(CATEGORY_META).length
    ? data.overallScore
    : selectedWeight
      ? Math.round(selectedCategories.reduce(
        (total, key) => total + (categories[key]?.score ?? 0) * (categories[key]?.weightPercentage ?? 0),
        0
      ) / selectedWeight)
      : 0;
  const scoreMeta = getScoreColorClass(selectedScore);
  const rating = getAmenityRating(selectedScore);

  return (
    <div className={`ui-panel p-4 space-y-4 ${className}`}>
      {/* Header with Title & Overall Aggregate Circular Score */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-ui-caption font-bold uppercase tracking-wider text-muted">
            <Compass className="w-3.5 h-3.5 text-emerald-700" />
            <span>Amenity Accessibility</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Normalized proximity to Islamabad/Rawalpindi hubs
          </p>
        </div>

        {/* Circular Progress Gauge / Score Pill */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex items-center justify-center w-11 h-11">
            <svg className="w-11 h-11 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                stroke={scoreMeta.stroke}
                strokeWidth="3.5"
                strokeDasharray={`${Math.max(5, data.overallScore)}, 100`}
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className={`absolute text-xs font-extrabold ${scoreMeta.text}`}>
              {selectedScore}
            </span>
          </div>
        </div>
      </div>

      {/* Qualitative Tier Tag */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
        <span className="text-[11px] text-slate-500 font-medium">Rating Index</span>
        <span className={scoreMeta.bg}>
          {rating.label}
        </span>
      </div>
      <p className="text-xs text-muted">Calculated using radial distance.</p>

      <details className="border-y border-border py-2">
        <summary className="cursor-pointer text-sm font-semibold text-ink ui-focus-ring">
          Customize rating
          <span className="ml-2 text-xs font-normal text-muted">
            {selectedCategories.length} of {Object.keys(CATEGORY_META).length} categories
          </span>
        </summary>
        <fieldset className="mt-3 space-y-2">
          <legend className="mb-2 text-xs text-muted">
            Choose which amenity categories contribute to the overall score. Select at least one.
          </legend>
          {Object.entries(CATEGORY_META).map(([key, meta]) => (
            <label key={key} className="flex min-h-9 items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={selectedCategories.includes(key)}
                disabled={selectedCategories.length === 1 && selectedCategories.includes(key)}
                onChange={(event) => {
                  setSelectedCategories((current) => (
                    event.target.checked
                      ? [...current, key]
                      : current.filter((selectedKey) => selectedKey !== key)
                  ));
                }}
                className="h-4 w-4 accent-action"
              />
              {meta.label}
            </label>
          ))}
        </fieldset>
      </details>

      {/* 4 Amenity Category Progress Rows */}
      <div className="space-y-3 pt-1">
        {Object.entries(CATEGORY_META).map(([key, meta]) => {
          const item = categories[key];
          const Icon = meta.icon;
          if (!item) return null;
          const itemScoreMeta = getScoreColorClass(item.score);

          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <span className={`p-1 rounded-md border ${meta.bgColor}`}>
                    <Icon className="w-3 h-3" />
                  </span>
                  <span>{meta.label}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-[11px] text-slate-400 font-sans">
                    {item.distanceKm} km
                  </span>
                  <span className={`rounded-control px-1.5 py-0.5 font-bold text-[11px] ${itemScoreMeta.bg}`}>
                    {item.score}/100
                  </span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${itemScoreMeta.bar}`}
                  style={{ width: `${Math.max(5, item.score)}%` }}
                />
              </div>

              {/* Nearest Facility Distance Label */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 truncate pl-6">
                <span className="truncate max-w-[240px]" title={item.nearestName}>
                  {item.nearestName}
                </span>
                <span className="shrink-0 text-slate-400 font-medium">
                  {item.distanceKm <= 1.5 ? 'Nearby (<1.5km)' : `${item.distanceKm}km away`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
