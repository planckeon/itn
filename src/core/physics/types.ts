/**
 * Type definitions for neutrino physics calculations
 */

/**
 * Probability vector for neutrino flavors [P_e, P_μ, P_τ]
 */
export type ProbabilityVector = [number, number, number];

/**
 * 3x3 probability matrix for neutrino oscillations
 */
export type ProbabilityMatrix = [
    ProbabilityVector,
    ProbabilityVector, 
    ProbabilityVector
];

/**
 * Parameters for oscillation calculations
 */
export interface OscillationParameters {
    theta12_deg: number;
    theta13_deg: number;
    theta23_deg: number;
    deltaCP_deg: number;
    dm21sq_eV2: number;
    dm31sq_eV2: number;
    energy: number;
    maxL: number;
    rho: number;
    Ye: number;
    matterEffect: boolean;
    initialFlavorIndex: 0 | 1 | 2;
    s12sq: number;
    s13sq: number;
    s23sq: number;
    deltaCP_rad: number;
    dm21sq: number;
    dm31sq: number;
    L: number;
    E: number;
    N_Newton: number;
}

/**
 * Animation state interface
 */
export interface AnimationState {
    isPlaying: boolean;
    currentL: number;
    simSpeed: number;
    lastTimestamp: number;
}

/**
 * Tooltip visibility state
 */
export interface TooltipState {
    [key: string]: boolean;
}

/**
 * Plot parameters
 */
export interface PlotParameters {
    maxL: number;
    numPoints: number;
}

/**
 * Neutrino flavor type
 */
export type NeutrinoFlavor = 0 | 1 | 2; // 0: electron, 1: muon, 2: tau