/**
 * Physical constants and default parameters for neutrino oscillation calculations.
 * Based on the NuFast paper (arXiv:2405.02400) and PDG 2020 values.
 */

/**
 * Mathematical constants
 */
export const PI = Math.PI;
export const DEG_TO_RAD = PI / 180.0;
export const RAD_TO_DEG = 180.0 / PI;

/**
 * Physical constants for neutrino oscillation calculations
 */

/** 
 * Conversion factor for matter potential
 * A_matter = Ye * rho * E * YerhoE2A (in eV^2)
 */
export const YerhoE2A = 1.52588e-4; // From NuFast paper

/**
 * Conversion factor for kinematic phase
 * Delta_jk = Delta lambda_jk * L / (4E) * EV_SQ_KM_TO_GEV_OVER4
 */
export const EV_SQ_KM_TO_GEV_OVER4 = 1.26693; // From NuFast paper

/**
 * Default oscillation parameters (NuFit 5.2 values, Normal Ordering)
 */
export const defaultOscParams = {
  // Mixing angles in degrees
  theta12_deg: 33.4,
  theta13_deg: 8.6,
  theta23_deg: 42.8,
  deltaCP_deg: 222,
  
  // Mass-squared differences in eV^2
  dm21sq_eV2: 7.4e-5,
  dm31sq_eV2: 2.5e-3,
  
  // Default energy in GeV (positive for neutrino, negative for antineutrino)
  energy: 1.0,
  
  // Matter density in g/cm^3 (average Earth crust)
  rho: 2.6,
  
  // Electron fraction (typical matter)
  Ye: 0.5,
  
  // Include matter effects by default
  matterEffect: true,
  
  // Default initial flavor (electron neutrino)
  initialFlavorIndex: 0,
  
  // Number of Newton-Raphson iterations for the eigenvalue calculation
  N_Newton: 0 // Use 0 for best performance as specified in the prompt
};

/**
 * Matter density presets in g/cm^3
 */
export const matterDensityPresets = {
  vacuum: 0,
  earthCrust: 2.8,
  earthMantle: 4.5,
  earthCore: 11.5,
  sunCore: 150,
};

/**
 * Color values for neutrino flavors (RGB)
 */
export const flavorColors = {
  electron: [80, 180, 255],   // Blue
  muon: [255, 140, 40],       // Orange
  tau: [220, 60, 255],        // Magenta
};

// Constants related to the simulation/UI
export const ANIMATION_DURATION_SECONDS = 20; // Time to traverse MAX_PLOT_L at speed 1x
export const MAX_PLOT_L_DEFAULT = 1300; // km (e.g., DUNE)
