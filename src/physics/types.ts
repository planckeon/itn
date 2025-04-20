/**
 * Types for the neutrino oscillation physics calculations.
 */

/**
 * Matrix representing oscillation probabilities.
 * ProbabilityMatrix[alpha][beta] = P(nu_alpha -> nu_beta)
 * Indices: 0=e, 1=mu, 2=tau
 */
export type ProbabilityMatrix = number[][];

/**
 * Vector of probabilities for a specific initial flavor.
 * [P(alpha->e), P(alpha->mu), P(alpha->tau)]
 */
import type p5 from 'p5';

export type ProbabilityVector = [number, number, number];

/**
 * Extended p5 instance with custom methods for neutrino visualization
 */
export interface P5SketchInstance extends p5 {
    setPlaying?: (isPlaying: boolean) => void;
    setSimSpeed?: (speed: number) => void;
    updateSimParams?: (simParams: OscillationParameters) => void;
    resetSimulation?: () => void;
}

/**
 * Neutrino flavor enumeration.
 */
export enum NeutrinoFlavor {
  Electron = 0,
  Muon = 1,
  Tau = 2
}

/**
 * Parameters required for oscillation calculations and UI binding.
 * Includes both calculation-ready values (sines squared, radians)
 * and UI-friendly values (degrees).
 */
export interface OscillationParameters {
  // Calculation parameters
  s12sq: number;
  s13sq: number;
  s23sq: number;
  deltaCP_rad: number;
  dm21sq: number; // eV^2 - used directly in NuFastPort
  dm31sq: number; // eV^2 - used directly in NuFastPort
  L: number;      // km
  E: number;      // GeV
  rho: number;    // g/cm^3
  Ye: number;
  matterEffect: boolean;
  N_Newton?: number;
  initialFlavorIndex: 0 | 1 | 2; // Use union type for clarity

  // UI parameters (degrees, different units for mass sq diff)
  theta12_deg: number;
  theta13_deg: number;
  theta23_deg: number;
  deltaCP_deg: number;
  dm21sq_eV2: number; // For UI binding
  dm31sq_eV2: number; // For UI binding
  energy: number; // Redundant with E, but often used in UI bindings
  maxL: number; // Add maxL for plot range control
}

/**
 * Parameters specifically required by the NuFastPort calculation functions.
 */
export interface NuFastParameters {
  s12sq: number;
  s13sq: number;
  s23sq: number;
  deltaCP_rad: number;
  dm21sq: number;
  dm31sq: number;
  L: number;
  E: number;
  rho: number;
  Ye: number;
  matterEffect: boolean;
  N_Newton?: number;
  initialFlavorIndex: 0 | 1 | 2;
}

/**
 * Animation state for the visualization.
 */
export interface AnimationState {
  /** Whether the animation is playing */
  isPlaying: boolean;
  /** Current distance (L) in km */
  currentL: number;
  /** Animation speed multiplier */
  simSpeed: number;
  /** Timestamp of the last frame for delta time calculation */
  lastTimestamp?: number; // Optional, managed internally by sketch/manager
}

/**
 * Parameters for the probability plot.
 */
export interface PlotParameters {
  /** Maximum distance (L) to plot in km */
  maxL: number;
  /** Number of points to calculate for the plot */
  numPoints?: number;
}

/**
 * State for tooltip visibility.
 */
export interface TooltipState {
  [key: string]: boolean;
}

/**
 * Type for the physics engine module/object for easier injection/mocking
 */
export interface PhysicsEngine {
    calculateNuFastProbs(params: Readonly<OscillationParameters>): ProbabilityMatrix;
    // Corrected signature to match implementation (takes one params object)
    getProbabilitiesForInitialFlavor(params: Readonly<OscillationParameters>): ProbabilityVector;
}
