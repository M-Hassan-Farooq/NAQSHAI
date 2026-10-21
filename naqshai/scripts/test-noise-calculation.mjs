import { computeEnvironmentalMetrics } from '../lib/environmentalMetrics.js';

// Test 1: Plot right on Islamabad Expressway (near Faizabad)
const p1 = {
  id: 'Plot-Exp-1',
  title: 'Plot 101 - I-8/4, Islamabad',
  society: 'I-8',
  city: 'Islamabad',
  polygonCoordinates: [
    { lat: 33.6630, lng: 73.0855 }, // ~75 meters from Faizabad interchange
    { lat: 33.6632, lng: 73.0858 },
    { lat: 33.6628, lng: 73.0859 }
  ]
};

// Test 2: Plot in F-7/2 (deep residential street, far from highway)
const p2 = {
  id: 'Plot-F7-Quiet',
  title: 'Plot 55 - Sector F-7/2, Islamabad',
  society: 'F-7',
  city: 'Islamabad',
  proximityNotes: 'Park facing, internal street cul-de-sac',
  polygonCoordinates: [
    { lat: 33.7250, lng: 73.0520 }, // Residential street in F-7
    { lat: 33.7252, lng: 73.0523 },
    { lat: 33.7248, lng: 73.0524 }
  ]
};

// Test 3: Commercial plot in Blue Area
const p3 = {
  id: 'Plot-BlueArea-Comm',
  title: 'Commercial Plaza Plot - Blue Area, Islamabad',
  society: 'Blue Area',
  city: 'Islamabad',
  category: 'Commercial',
  polygonCoordinates: [
    { lat: 33.7120, lng: 73.0590 }, // In Blue Area
    { lat: 33.7123, lng: 73.0594 },
    { lat: 33.7118, lng: 73.0592 }
  ]
};

// Test 4: G-13 plot (moderate distance ~250m from Srinagar Highway)
const p4 = {
  id: 'Plot-G13-Mod',
  title: 'Plot 412 - Sector G-13/1, Islamabad',
  society: 'G-13',
  city: 'Islamabad',
  polygonCoordinates: [
    { lat: 33.6510, lng: 72.9660 }, // ~280m from Srinagar Highway
    { lat: 33.6513, lng: 72.9664 },
    { lat: 33.6508, lng: 72.9663 }
  ]
};

// Test 5: Fallback test without coordinates (pure text)
const p5 = {
  id: 'Plot-NoCoords',
  title: 'Plot 99 - Bahria Town, Rawalpindi',
  society: 'Bahria Town',
  city: 'Rawalpindi',
  proximityNotes: 'Near main boulevard and commercial market'
};

// Test 6: DB row shape with polygon_coordinates JSONB
const p6 = {
  id: 'Plot-DB-Raw',
  title: 'Plot 50 - Rawalpindi Cantt, Rawalpindi',
  city: 'Rawalpindi',
  polygon_coordinates: [
    { lat: 33.5950, lng: 73.0580 }, // Near Rawalpindi Saddar Railway & Murree Rd
    { lat: 33.5954, lng: 73.0584 },
    { lat: 33.5948, lng: 73.0583 }
  ]
};

console.log('--- TEST 1 (Expressway Edge) ---');
console.log(computeEnvironmentalMetrics(p1));

console.log('\n--- TEST 2 (F-7 Quiet Residential) ---');
console.log(computeEnvironmentalMetrics(p2));

console.log('\n--- TEST 3 (Blue Area Commercial) ---');
console.log(computeEnvironmentalMetrics(p3));

console.log('\n--- TEST 4 (G-13 Moderate Buffer) ---');
console.log(computeEnvironmentalMetrics(p4));

console.log('\n--- TEST 5 (No Coordinates Fallback) ---');
console.log(computeEnvironmentalMetrics(p5));

console.log('\n--- TEST 6 (DB Row polygon_coordinates shape) ---');
console.log(computeEnvironmentalMetrics(p6));
