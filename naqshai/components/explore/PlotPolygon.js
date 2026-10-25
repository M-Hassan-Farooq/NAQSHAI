'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Polygon } from '@react-google-maps/api';

/**
 * One plot boundary polygon.
 * Memoized and manages its own hover state so moving the cursor across the map
 * restyles only THIS polygon instead of re-rendering the parent Explore view.
 */
export const PlotPolygon = React.memo(function PlotPolygon({ plot, isSelected, onSelect }) {
  const [isHovered, setIsHovered] = useState(false);

  const options = useMemo(
    () => ({
      strokeColor: isSelected ? '#047857' : '#059669',
      strokeOpacity: 0.95,
      strokeWeight: isSelected ? 3 : 2,
      fillColor: isSelected ? '#059669' : '#10b981',
      fillOpacity: isSelected ? 0.45 : isHovered ? 0.35 : 0.22,
      clickable: true,
      zIndex: isSelected ? 100 : isHovered ? 50 : 1,
    }),
    [isSelected, isHovered]
  );

  const handleClick = useCallback(() => onSelect(plot), [onSelect, plot]);
  const handleMouseOver = useCallback(() => setIsHovered(true), []);
  const handleMouseOut = useCallback(() => setIsHovered(false), []);

  return (
    <Polygon
      paths={plot.paths}
      options={options}
      onClick={handleClick}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    />
  );
});

export default PlotPolygon;
