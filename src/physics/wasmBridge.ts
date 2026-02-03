/**
 * NuFast WASM Wrapper (Zig implementation)
 *
 * Provides high-performance neutrino oscillation calculations via WebAssembly.
 * Falls back to TypeScript implementation if WASM fails to load.
 */

import type { NuFast, VacuumParams, MatterParams, ProbabilityMatrix } from './nufast';
import { loadNuFast } from './nufast';

// Oscillation parameters interface (simplified for WASM)
interface WasmOscillationParams {
  theta12_deg: number;
  theta13_deg: number;
  theta23_deg: number;
  deltaCP_deg: number;
  dm21sq_eV2: number;
  dm31sq_eV2: number;
  matterEffect: boolean;
  rho: number;
  Ye: number;
  initialFlavorIndex: number;
  isAntineutrino: boolean;
}

// Loading state
type WasmLoadingState = 'idle' | 'loading' | 'ready' | 'failed';

let nufast: NuFast | null = null;
let wasmLoadPromise: Promise<NuFast | null> | null = null;
let wasmLoadState: WasmLoadingState = 'idle';
let wasmLoadCallbacks: ((state: WasmLoadingState) => void)[] = [];

/**
 * Subscribe to WASM loading state changes
 */
export function onWasmStateChange(callback: (state: WasmLoadingState) => void): () => void {
  wasmLoadCallbacks.push(callback);
  // Immediately call with current state
  callback(wasmLoadState);
  return () => {
    wasmLoadCallbacks = wasmLoadCallbacks.filter((cb) => cb !== callback);
  };
}

function setWasmState(state: WasmLoadingState) {
  wasmLoadState = state;
  for (const cb of wasmLoadCallbacks) {
    cb(state);
  }
}

/**
 * Get current WASM loading state
 */
export function getWasmLoadingState(): WasmLoadingState {
  return wasmLoadState;
}

/**
 * Initialize WASM module (call once at app startup)
 */
export async function initWasm(): Promise<boolean> {
  if (nufast) return true;
  if (wasmLoadState === 'failed') return false;

  if (!wasmLoadPromise) {
    setWasmState('loading');
    wasmLoadPromise = loadWasmModule();
  }

  nufast = await wasmLoadPromise;
  return nufast !== null;
}

async function loadWasmModule(): Promise<NuFast | null> {
  try {
    // Load the Zig WASM using the provided loader
    const instance = await loadNuFast('/wasm/nufast.wasm');

    console.log('✅ NuFast WASM (Zig) loaded successfully');
    setWasmState('ready');
    return instance;
  } catch (error) {
    console.warn('⚠️ WASM load failed, using TypeScript fallback:', error);
    setWasmState('failed');
    return null;
  }
}

/**
 * Check if WASM is available
 */
export function isWasmReady(): boolean {
  return nufast !== null;
}

/**
 * Convert degrees to radians
 */
function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Convert WasmOscillationParams to VacuumParams
 */
function toVacuumParams(params: WasmOscillationParams): VacuumParams {
  const theta12 = degToRad(params.theta12_deg);
  const theta13 = degToRad(params.theta13_deg);
  const theta23 = degToRad(params.theta23_deg);
  // Negate delta for antineutrino
  const delta = degToRad(params.isAntineutrino ? -params.deltaCP_deg : params.deltaCP_deg);

  return {
    s12sq: Math.sin(theta12) ** 2,
    s13sq: Math.sin(theta13) ** 2,
    s23sq: Math.sin(theta23) ** 2,
    delta,
    Dmsq21: params.dm21sq_eV2,
    Dmsq31: params.dm31sq_eV2,
    antineutrino: params.isAntineutrino,
  };
}

/**
 * Convert WasmOscillationParams to MatterParams
 */
function toMatterParams(params: WasmOscillationParams): MatterParams {
  return {
    rho: params.rho,
    Ye: params.Ye,
    nNewton: 0,
    antineutrino: params.isAntineutrino,
  };
}

/**
 * Extract probabilities for a given initial flavor from the 3x3 matrix
 */
function extractRow(
  matrix: ProbabilityMatrix,
  initialFlavorIndex: number,
): { Pe: number; Pmu: number; Ptau: number } {
  const row = initialFlavorIndex;
  return {
    Pe: matrix[row][0],
    Pmu: matrix[row][1],
    Ptau: matrix[row][2],
  };
}

/**
 * Calculate energy spectrum using WASM - the main batch operation
 */
export function wasmCalculateEnergySpectrum(
  params: WasmOscillationParams,
  distance: number,
  eMin: number,
  eMax: number,
  numPoints: number,
): { energy: number; Pe: number; Pmu: number; Ptau: number }[] {
  if (!nufast) {
    throw new Error('WASM not loaded');
  }

  // Set parameters
  nufast.setVacuumParams(toVacuumParams(params));

  if (params.matterEffect) {
    nufast.setMatterParams(toMatterParams(params));
  }

  // Generate energy array
  const energies = new Float64Array(numPoints);
  for (let i = 0; i < numPoints; i++) {
    const t = i / Math.max(numPoints - 1, 1);
    energies[i] = eMin + t * (eMax - eMin);
  }

  // Use batch calculation for better performance
  if (params.matterEffect) {
    nufast.initMatterBatch();
  } else {
    nufast.initVacuumBatch();
  }

  // Calculate full matrices in batch
  const matrices = nufast.vacuumBatchFull(distance, energies);

  // Extract results for the requested initial flavor
  const points: { energy: number; Pe: number; Pmu: number; Ptau: number }[] = [];
  for (let i = 0; i < numPoints; i++) {
    let matrix: ProbabilityMatrix;

    if (params.matterEffect) {
      // For matter, calculate individually (batch full not available for matter)
      matrix = nufast.matterProbability(distance, energies[i]);
    } else {
      matrix = matrices[i];
    }

    const probs = extractRow(matrix, params.initialFlavorIndex);
    points.push({
      energy: energies[i],
      ...probs,
    });
  }

  return points;
}

/**
 * Calculate baseline scan using WASM - P(L) at fixed E
 */
export function wasmCalculateBaselineScan(
  params: WasmOscillationParams,
  energy: number,
  lMin: number,
  lMax: number,
  numPoints: number,
): { distance: number; Pe: number; Pmu: number; Ptau: number }[] {
  if (!nufast) {
    throw new Error('WASM not loaded');
  }

  // Set parameters
  nufast.setVacuumParams(toVacuumParams(params));

  if (params.matterEffect) {
    nufast.setMatterParams(toMatterParams(params));
  }

  const points: { distance: number; Pe: number; Pmu: number; Ptau: number }[] = [];

  for (let i = 0; i < numPoints; i++) {
    const t = i / Math.max(numPoints - 1, 1);
    const distance = lMin + t * (lMax - lMin);

    const matrix = params.matterEffect
      ? nufast.matterProbability(distance, energy)
      : nufast.vacuumProbability(distance, energy);

    const probs = extractRow(matrix, params.initialFlavorIndex);
    points.push({
      distance,
      ...probs,
    });
  }

  return points;
}
