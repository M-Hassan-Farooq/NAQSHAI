/**
 * NAQSHAI Geospatial Polygon Overlap & Conflict Engine
 *
 * Provides 2D ray-casting point-in-polygon tests, line-segment intersection,
 * and comprehensive polygon-polygon collision detection to prevent overlapping
 * plots on the map.
 */

/**
 * Normalizes varied coordinate representations into standard [{ lat, lng }, ...]
 */
export function normalizePolygon(coords) {
  if (!Array.isArray(coords)) return [];
  const normalized = [];
  for (const item of coords) {
    if (!item) continue;
    let lat, lng;
    if (typeof item.lat === 'number' && typeof item.lng === 'number') {
      lat = item.lat;
      lng = item.lng;
    } else if (Array.isArray(item) && item.length >= 2) {
      lat = Number(item[0]);
      lng = Number(item[1]);
    } else if (typeof item === 'object') {
      lat = Number(item.lat);
      lng = Number(item.lng);
    }
    if (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      !Number.isNaN(lat) &&
      !Number.isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    ) {
      normalized.push({ lat, lng });
    }
  }
  return normalized;
}

/**
 * Checks if a 2D point is strictly inside or on the boundary of a polygon (Ray Casting algorithm).
 * @param {{ lat: number, lng: number }} point
 * @param {Array<{ lat: number, lng: number }>} polygon
 * @returns {boolean}
 */
export function isPointInPolygon(point, polygon) {
  const poly = normalizePolygon(polygon);
  if (!point || poly.length < 3) return false;
  const x = Number(point.lng);
  const y = Number(point.lat);
  if (Number.isNaN(x) || Number.isNaN(y)) return false;

  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].lng;
    const yi = poly[i].lat;
    const xj = poly[j].lng;
    const yj = poly[j].lat;

    // Check if point is directly on an edge
    const cross = (y - yi) * (xj - xi) - (x - xi) * (yj - yi);
    if (Math.abs(cross) < 1e-10) {
      if (
        x >= Math.min(xi, xj) - 1e-9 &&
        x <= Math.max(xi, xj) + 1e-9 &&
        y >= Math.min(yi, yj) - 1e-9 &&
        y <= Math.max(yi, yj) + 1e-9
      ) {
        return true;
      }
    }

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * 2D Counter-Clockwise orientation test for three points
 */
function ccw(a, b, c) {
  return (c.lat - a.lat) * (b.lng - a.lng) - (b.lat - a.lat) * (c.lng - a.lng);
}

/**
 * Checks if point p lies on segment ab (assuming collinear)
 */
function isPointOnSegment(p, a, b) {
  const EPSILON = 1e-9;
  return (
    p.lng >= Math.min(a.lng, b.lng) - EPSILON &&
    p.lng <= Math.max(a.lng, b.lng) + EPSILON &&
    p.lat >= Math.min(a.lat, b.lat) - EPSILON &&
    p.lat <= Math.max(a.lat, b.lat) + EPSILON
  );
}

/**
 * Determines whether two 2D line segments intersect.
 * @param {{ lat: number, lng: number }} p1 Segment 1 Start
 * @param {{ lat: number, lng: number }} p2 Segment 1 End
 * @param {{ lat: number, lng: number }} q1 Segment 2 Start
 * @param {{ lat: number, lng: number }} q2 Segment 2 End
 * @returns {boolean}
 */
export function doSegmentsIntersect(p1, p2, q1, q2) {
  const o1 = ccw(p1, p2, q1);
  const o2 = ccw(p1, p2, q2);
  const o3 = ccw(q1, q2, p1);
  const o4 = ccw(q1, q2, p2);

  // General case: segments straddle each other
  if (((o1 > 0 && o2 < 0) || (o1 < 0 && o2 > 0)) &&
      ((o3 > 0 && o4 < 0) || (o3 < 0 && o4 > 0))) {
    return true;
  }

  // Collinear and endpoint cases
  const EPSILON = 1e-9;
  if (Math.abs(o1) < EPSILON && isPointOnSegment(q1, p1, p2)) return true;
  if (Math.abs(o2) < EPSILON && isPointOnSegment(q2, p1, p2)) return true;
  if (Math.abs(o3) < EPSILON && isPointOnSegment(p1, q1, q2)) return true;
  if (Math.abs(o4) < EPSILON && isPointOnSegment(p2, q1, q2)) return true;

  return false;
}

/**
 * Returns Axis-Aligned Bounding Box for polygon points
 */
function getBoundingBox(poly) {
  let minLat = Infinity,
    maxLat = -Infinity,
    minLng = Infinity,
    maxLng = -Infinity;
  for (const pt of poly) {
    if (pt.lat < minLat) minLat = pt.lat;
    if (pt.lat > maxLat) maxLat = pt.lat;
    if (pt.lng < minLng) minLng = pt.lng;
    if (pt.lng > maxLng) maxLng = pt.lng;
  }
  return { minLat, maxLat, minLng, maxLng };
}

/**
 * Checks if two bounding boxes overlap
 */
function doBoxesOverlap(b1, b2) {
  return !(
    b1.maxLat < b2.minLat ||
    b1.minLat > b2.maxLat ||
    b1.maxLng < b2.minLng ||
    b1.minLng > b2.maxLng
  );
}

/**
 * Full geometric overlap check between two polygons:
 * 1. Bounding box intersection check (fast rejection)
 * 2. Any boundary edge of A intersects any boundary edge of B
 * 3. Any vertex of A is inside B
 * 4. Any vertex of B is inside A (enclosure)
 * 5. Centroid inclusion check
 *
 * @param {Array<{ lat: number, lng: number }>} polyA
 * @param {Array<{ lat: number, lng: number }>} polyB
 * @returns {boolean}
 */
export function doPolygonsOverlap(polyA, polyB) {
  const normA = normalizePolygon(polyA);
  const normB = normalizePolygon(polyB);

  if (normA.length < 3 || normB.length < 3) return false;

  const boxA = getBoundingBox(normA);
  const boxB = getBoundingBox(normB);
  if (!doBoxesOverlap(boxA, boxB)) return false;

  // 1. Edge-edge intersection test
  for (let i = 0; i < normA.length; i++) {
    const a1 = normA[i];
    const a2 = normA[(i + 1) % normA.length];
    for (let j = 0; j < normB.length; j++) {
      const b1 = normB[j];
      const b2 = normB[(j + 1) % normB.length];
      if (doSegmentsIntersect(a1, a2, b1, b2)) {
        return true;
      }
    }
  }

  // 2. Any vertex of A inside B
  for (const pt of normA) {
    if (isPointInPolygon(pt, normB)) {
      return true;
    }
  }

  // 3. Any vertex of B inside A (covers complete enclosure)
  for (const pt of normB) {
    if (isPointInPolygon(pt, normA)) {
      return true;
    }
  }

  // 4. Centroid test
  const centroidA = {
    lat: normA.reduce((sum, p) => sum + p.lat, 0) / normA.length,
    lng: normA.reduce((sum, p) => sum + p.lng, 0) / normA.length,
  };
  if (isPointInPolygon(centroidA, normB)) return true;

  const centroidB = {
    lat: normB.reduce((sum, p) => sum + p.lat, 0) / normB.length,
    lng: normB.reduce((sum, p) => sum + p.lng, 0) / normB.length,
  };
  if (isPointInPolygon(centroidB, normA)) return true;

  return false;
}

/**
 * Checks if a candidate polygon conflicts/overlaps with any existing plot in a registry.
 *
 * @param {Array<{ lat: number, lng: number }>} candidatePolygon
 * @param {Array<object>} existingPlots List of plots with polygon coordinates
 * @param {string} [excludePlotId] Optional plot ID to exclude (e.g. self when editing)
 * @returns {{ hasConflict: boolean, conflictingPlot?: object, reason?: string }}
 */
export function checkPolygonConflict(candidatePolygon, existingPlots = [], excludePlotId = null) {
  const candidate = normalizePolygon(candidatePolygon);
  if (candidate.length < 3) return { hasConflict: false };

  for (const plot of existingPlots) {
    if (!plot) continue;
    const plotId = plot.id || plot.plot_id || plot.plotId;
    if (excludePlotId && String(plotId) === String(excludePlotId)) continue;

    const plotCoords =
      plot.paths ||
      plot.polygon_coordinates ||
      plot.polygonCoordinates ||
      plot.polygon;
    const existingPoly = normalizePolygon(plotCoords);
    if (existingPoly.length < 3) continue;

    if (doPolygonsOverlap(candidate, existingPoly)) {
      return {
        hasConflict: true,
        conflictingPlot: {
          id: plotId || 'plot',
          title: plot.name || plot.title || `Plot #${plotId || 'existing'}`,
          paths: existingPoly,
          society: plot.society || '',
          city: plot.city || '',
        },
        reason: 'overlap',
      };
    }
  }

  return { hasConflict: false };
}

/**
 * Checks if a single point (e.g., clicked coordinate) falls inside any existing plot polygon.
 * Used to immediately reject map clicks on already claimed / registered land.
 *
 * @param {{ lat: number, lng: number }} point
 * @param {Array<object>} existingPlots
 * @param {string} [excludePlotId]
 * @returns {object|null} The conflicting plot, or null if unclaimed.
 */
export function isPointInsideAnyPlot(point, existingPlots = [], excludePlotId = null) {
  if (!point || typeof point.lat !== 'number' || typeof point.lng !== 'number') return null;

  for (const plot of existingPlots) {
    if (!plot) continue;
    const plotId = plot.id || plot.plot_id || plot.plotId;
    if (excludePlotId && String(plotId) === String(excludePlotId)) continue;

    const plotCoords =
      plot.paths ||
      plot.polygon_coordinates ||
      plot.polygonCoordinates ||
      plot.polygon;
    const existingPoly = normalizePolygon(plotCoords);
    if (existingPoly.length < 3) continue;

    if (isPointInPolygon(point, existingPoly)) {
      return {
        id: plotId || 'plot',
        title: plot.name || plot.title || `Plot #${plotId || 'existing'}`,
        paths: existingPoly,
        society: plot.society || '',
        city: plot.city || '',
      };
    }
  }
  return null;
}
