/**
 * Physics constants for neutrino oscillation calculations
 */

export const MAX_PLOT_L_DEFAULT = 1000; // km
export const ANIMATION_DURATION_SECONDS = 20;
export const YerhoE2A = 7.6e-5; // Conversion factor for matter potential
export const EV_SQ_KM_TO_GEV_OVER4 = 1.267; // Conversion factor for L/E

// Default oscillation parameters (NuFit 5.2 values)
export const defaultOscParams = {
	theta12_deg: 33.41,
	theta13_deg: 8.58,
	theta23_deg: 49.1,
	deltaCP_deg: 197,
	dm21sq_eV2: 7.41e-5,
	dm31sq_eV2: 2.511e-3,
	energy: 1.0, // GeV
	maxL: MAX_PLOT_L_DEFAULT,
	rho: 3.0, // g/cm³
	Ye: 0.5,
	matterEffect: true,
	initialFlavorIndex: 0 as const,
};
