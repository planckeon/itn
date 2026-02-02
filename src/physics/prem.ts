/**
 * PREM (Preliminary Reference Earth Model) density profile
 * 
 * Simplified model for neutrino oscillation calculations.
 * Based on Dziewonski & Anderson (1981), Physics of the Earth and Planetary Interiors.
 * 
 * Earth radius: 6371 km
 * 
 * Layer structure (simplified 5-layer model for oscillations):
 * - Inner Core: 0-1221 km radius, ~13 g/cm³
 * - Outer Core: 1221-3480 km radius, ~10-12 g/cm³
 * - Lower Mantle: 3480-5701 km radius, ~4.4-5.6 g/cm³
 * - Upper Mantle: 5701-6346 km radius, ~3.4-4.4 g/cm³
 * - Crust: 6346-6371 km radius, ~2.6-2.9 g/cm³
 */

export const EARTH_RADIUS_KM = 6371;

/**
 * PREM layer boundaries (radius in km from center)
 */
export const PREM_LAYERS = [
  { name: 'inner_core', rMin: 0, rMax: 1221.5, rhoAvg: 13.0, Ye: 0.466 },
  { name: 'outer_core', rMin: 1221.5, rMax: 3480, rhoAvg: 11.0, Ye: 0.466 },
  { name: 'lower_mantle', rMin: 3480, rMax: 5701, rhoAvg: 4.9, Ye: 0.494 },
  { name: 'transition_zone', rMin: 5701, rMax: 5971, rhoAvg: 4.0, Ye: 0.494 },
  { name: 'upper_mantle', rMin: 5971, rMax: 6346.6, rhoAvg: 3.4, Ye: 0.494 },
  { name: 'crust', rMin: 6346.6, rMax: 6371, rhoAvg: 2.6, Ye: 0.494 },
] as const;

/**
 * Get density at a given radius from Earth's center
 * Uses polynomial fit from PREM
 */
export function getPREMDensity(radiusKm: number): number {
  const x = radiusKm / EARTH_RADIUS_KM; // Normalized radius
  
  if (radiusKm < 0) return 0;
  
  // Inner core (0 - 1221.5 km)
  if (radiusKm <= 1221.5) {
    return 13.0885 - 8.8381 * x * x;
  }
  
  // Outer core (1221.5 - 3480 km)
  if (radiusKm <= 3480) {
    return 12.5815 - 1.2638 * x - 3.6426 * x * x - 5.5281 * x * x * x;
  }
  
  // Lower mantle (3480 - 5701 km)
  if (radiusKm <= 5701) {
    return 7.9565 - 6.4761 * x + 5.5283 * x * x - 3.0807 * x * x * x;
  }
  
  // Transition zone (5701 - 5771 km)
  if (radiusKm <= 5771) {
    return 5.3197 - 1.4836 * x;
  }
  
  // Transition zone (5771 - 5971 km)
  if (radiusKm <= 5971) {
    return 11.2494 - 8.0298 * x;
  }
  
  // LVZ and LID (5971 - 6151 km)
  if (radiusKm <= 6151) {
    return 7.1089 - 3.8045 * x;
  }
  
  // Upper mantle (6151 - 6346.6 km)
  if (radiusKm <= 6346.6) {
    return 2.6910 + 0.6924 * x;
  }
  
  // Crust (6346.6 - 6371 km) - use continental crust density
  // For neutrino experiments, we're interested in rock, not ocean
  return 2.8;
}

/**
 * Calculate the path through Earth for a given baseline.
 * Returns the depth at the midpoint (deepest point) in km.
 * 
 * For a chord of length L through a sphere of radius R:
 * - Minimum radius reached: r_min = sqrt(R² - (L/2)²)
 * - Maximum depth: d_max = R - r_min
 */
export function getMaxDepth(baselineKm: number): number {
  if (baselineKm <= 0) return 0;
  if (baselineKm >= 2 * EARTH_RADIUS_KM) return EARTH_RADIUS_KM;
  
  const halfL = baselineKm / 2;
  const rMin = Math.sqrt(EARTH_RADIUS_KM * EARTH_RADIUS_KM - halfL * halfL);
  return EARTH_RADIUS_KM - rMin;
}

/**
 * Get the minimum radius (closest to Earth's center) for a given baseline
 */
export function getMinRadius(baselineKm: number): number {
  if (baselineKm <= 0) return EARTH_RADIUS_KM;
  if (baselineKm >= 2 * EARTH_RADIUS_KM) return 0;
  
  const halfL = baselineKm / 2;
  return Math.sqrt(EARTH_RADIUS_KM * EARTH_RADIUS_KM - halfL * halfL);
}

/**
 * Calculate average density along a chord through Earth.
 * Integrates along the path using trapezoidal rule.
 * 
 * @param baselineKm - Chord length in km
 * @param numSamples - Number of integration points (default 100)
 */
export function getAverageDensity(baselineKm: number, numSamples = 100): number {
  if (baselineKm <= 0) return 2.6; // Surface density
  if (baselineKm >= 2 * EARTH_RADIUS_KM) baselineKm = 2 * EARTH_RADIUS_KM - 1;
  
  const halfL = baselineKm / 2;
  const rMin = Math.sqrt(EARTH_RADIUS_KM * EARTH_RADIUS_KM - halfL * halfL);
  
  // Parametric position along chord: -halfL to +halfL
  // At position s along chord, radius r = sqrt(rMin² + s²)
  let sum = 0;
  const ds = baselineKm / numSamples;
  
  for (let i = 0; i <= numSamples; i++) {
    const s = -halfL + i * ds;
    const r = Math.sqrt(rMin * rMin + s * s);
    const rho = getPREMDensity(r);
    
    // Trapezoidal weight
    const weight = (i === 0 || i === numSamples) ? 0.5 : 1.0;
    sum += weight * rho;
  }
  
  return sum / numSamples;
}

/**
 * Get which layers a neutrino path crosses for a given baseline.
 * Useful for visualization.
 */
export function getCrossedLayers(baselineKm: number): string[] {
  const minRadius = getMinRadius(baselineKm);
  const layers: string[] = [];
  
  for (const layer of PREM_LAYERS) {
    // A layer is crossed if minRadius < layer.rMax
    if (minRadius < layer.rMax) {
      layers.push(layer.name);
    }
  }
  
  return layers;
}

/**
 * Get Y_e (electron fraction) along the path.
 * Core has lower Y_e (~0.466) due to iron, mantle has higher (~0.494).
 */
export function getAverageYe(baselineKm: number): number {
  const minRadius = getMinRadius(baselineKm);
  
  // If path goes through core, use weighted average
  if (minRadius < 3480) {
    // Core-crossing: weight by path length in each region
    // Simplified: if crosses core, use intermediate value
    return 0.48;
  }
  
  // Mantle only
  return 0.494;
}

/**
 * Standard experiment baselines for reference
 */
export const EXPERIMENT_BASELINES = {
  'T2K': 295,        // Tokai to Kamioka
  'NOvA': 810,       // Fermilab to Ash River
  'DUNE': 1300,      // Fermilab to SURF
  'T2HK': 295,       // Tokai to Hyper-K
  'ESSnuSB': 540,    // ESS to far detector
  'JUNO': 53,        // Reactor experiment
  'KamLAND': 180,    // Reactor experiment (average)
  'Atmospheric_vertical': 12742,  // Diameter of Earth
  'Atmospheric_horizontal': 500,  // Typical horizontal
} as const;

/**
 * Get a human-readable description of the Earth layers crossed
 */
export function describeBaseline(baselineKm: number): string {
  const maxDepth = getMaxDepth(baselineKm);
  const avgRho = getAverageDensity(baselineKm, 50);
  
  if (maxDepth < 25) {
    return `Surface path (${maxDepth.toFixed(0)} km depth, ρ = ${avgRho.toFixed(1)} g/cm³)`;
  } else if (maxDepth < 400) {
    return `Crust/upper mantle (${maxDepth.toFixed(0)} km depth, ρ = ${avgRho.toFixed(1)} g/cm³)`;
  } else if (maxDepth < 2900) {
    return `Through mantle (${maxDepth.toFixed(0)} km depth, ρ = ${avgRho.toFixed(1)} g/cm³)`;
  } else {
    return `Core-crossing (${maxDepth.toFixed(0)} km depth, ρ = ${avgRho.toFixed(1)} g/cm³)`;
  }
}
