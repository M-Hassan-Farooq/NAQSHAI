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
import { calculateAmenityScores } from '@/lib/amenityCalculator';

// Client-side in-memory cache to guarantee 0ms instant loading for visited plots
const amenityCache = new Map();

const CATEGORY_META = {
  healthcare: {
    label: 'Healthcare',
    icon: HeartPulse,
    barColor: 'bg-emerald-600',
    bgColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  education: {
    label: 'Education',
    icon: GraduationCap,
    barColor: 'bg-teal-600',
    bgColor: 'bg-teal-50 text-teal-700 border-teal-200'
  },
  commerce: {
    label: 'Commerce & Retail',
    icon: ShoppingBag,
    barColor: 'bg-blue-600',
    bgColor: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  transit: {
    label: 'Transit & Arterials',
    icon: Bus,
    barColor: 'bg-indigo-600',
    bgColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  }
};

function getScoreColorClass(score) {
  if (score >= 80) return { text: 'text-emerald-700', stroke: '#059669', bg: 'bg-emerald-50 border-emerald-200' };
  if (score >= 60) return { text: 'text-teal-700', stroke: '#0d9488', bg: 'bg-teal-50 border-teal-200' };
  if (score >= 40) return { text: 'text-amber-700', stroke: '#d97706', bg: 'bg-amber-50 border-amber-200' };
  return { text: 'text-slate-600', stroke: '#64748b', bg: 'bg-slate-100 border-slate-200' };
}

export default function AmenityScoreCard({ plotId, lat, lng, center, className = '' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <div className={`bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            <Compass className="w-3.5 h-3.5 text-slate-400" />
            <span>Amenity Accessibility</span>
          </div>
          <span className="px-2 py-0.5 rounded-md border text-[11px] font-semibold bg-slate-100 text-slate-600 border-slate-200">
            Survey Pending
          </span>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2.5 leading-relaxed">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-slate-700">Geospatial coordinates pending</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
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
      <div className={`p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4 animate-pulse ${className}`}>
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
      <div className={`p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center gap-2 ${className}`}>
        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
        <span>Neighborhood proximity data is temporarily unavailable.</span>
      </div>
    );
  }

  const scoreMeta = getScoreColorClass(data.overallScore);
  const categories = data.categories || {};

  return (
    <div className={`bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4 ${className}`}>
      {/* Header with Title & Overall Aggregate Circular Score */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
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
            <span className="absolute text-xs font-extrabold text-slate-800">
              {data.overallScore}
            </span>
          </div>
        </div>
      </div>

      {/* Qualitative Tier Tag */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
        <span className="text-[11px] text-slate-500 font-medium">Rating Index</span>
        <span className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold ${data.rating?.badge || 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
          {data.rating?.label || 'High Accessibility'}
        </span>
      </div>

      {/* 4 Amenity Category Progress Rows */}
      <div className="space-y-3 pt-1">
        {Object.entries(CATEGORY_META).map(([key, meta]) => {
          const item = categories[key] || { score: 50, distanceKm: 2.5, nearestName: 'Regional Facility' };
          const Icon = meta.icon;

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
                  <span className="font-bold text-slate-800 text-[11px]">
                    {item.score}/100
                  </span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${meta.barColor}`}
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
