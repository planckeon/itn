import type { OscillationParameters } from '../physics/types';

export function convertToNuFastParams(params: OscillationParameters) {
  return {
    E: params.energy,
    L: params.L,
    s12sq: Math.pow(Math.sin(params.theta12_deg * Math.PI/180), 2),
    s13sq: Math.pow(Math.sin(params.theta13_deg * Math.PI/180), 2),
    s23sq: Math.pow(Math.sin(params.theta23_deg * Math.PI/180), 2),
    deltaCP_rad: params.deltaCP_deg * Math.PI/180,
    dm21sq: params.dm21sq_eV2,
    dm31sq: params.dm31sq_eV2,
    rho: params.rho,
    Ye: params.Ye,
    initialFlavorIndex: params.initialFlavorIndex,
    matterEffect: params.matterEffect
  };
}
import * as math from 'mathjs';

// Neutrino Oscillation Parameters
const theta12 = 33.44 * Math.PI / 180;
const theta13 = 8.57 * Math.PI / 180;
const theta23 = 49.2 * Math.PI / 180;
const dm21 = 7.42e-5; // eV^2
const dm31 = 2.517e-3; // eV^2
const c = 299792.458; // km/s

// PMNS Matrix
function getPMNS(theta13_use: number): math.Matrix {
  const c12 = Math.cos(theta12);
  const s12 = Math.sin(theta12);
  const c13 = Math.cos(theta13_use);
  const s13 = Math.sin(theta13_use);
  const c23 = Math.cos(theta23);
  const s23 = Math.sin(theta23);
  return math.matrix([
    [c12 * c13, s12 * c13, s13],
    [-s12 * c23 - c12 * s23 * s13, c12 * c23 - s12 * s23 * s13, s23 * c13],
    [s12 * s23 - c12 * c23 * s13, -c12 * s23 - s12 * c23 * s13, c23 * c13]
  ]);
}

// Oscillation Calculation
export function computeProbabilities(alpha: number, L: number, E: number, matter: boolean = false, rho: number = 2.6): number[] {
  let theta13_use = theta13;
  let dm31_use = dm31;

  if (matter) {
    const A = 7.6e-5 * rho * E; // Matter potential in eV^2
    const cos2theta = Math.cos(2 * theta13);
    const sin2theta = Math.sin(2 * theta13);
    const denom = Math.sqrt(Math.pow(cos2theta - A / dm31, 2) + Math.pow(sin2theta, 2));
    theta13_use = 0.5 * Math.asin(sin2theta / denom);
    dm31_use = dm31 * denom;
  }

  const U = getPMNS(theta13_use);
  const mSq = [0, dm21, dm31_use];
  const probs: number[] = [];

  for (let beta = 0; beta < 3; beta++) {
    let amplitude = math.complex(0, 0);
    for (let j = 0; j < 3; j++) {
      const phase = 1.267 * mSq[j] * L / E;
      const expTerm = math.exp(math.complex(0, -phase));
      const U_beta_j = U.get([beta, j]) as math.Complex;
      const U_alpha_j = U.get([alpha, j]) as math.Complex;
      const term = math.multiply(U_beta_j, math.conj(U_alpha_j), expTerm); // Corrected conjugate
      amplitude = math.add(amplitude, term);
    }
    probs[beta] = Number(math.pow(math.abs(amplitude), 2));
  }

  return probs;
}

export const LmaxSim = 3000; // km
export { c };