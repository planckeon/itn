/**
 * NuFast WASM Wrapper
 * 
 * Provides high-performance neutrino oscillation calculations via WebAssembly.
 * Falls back to TypeScript implementation if WASM fails to load.
 */

// WASM module types
interface WasmModule {
  OscParams: new (
    theta12_deg: number,
    theta13_deg: number,
    theta23_deg: number,
    delta_cp_deg: number,
    dm21sq: number,
    dm31sq: number,
    matter: boolean,
    rho: number,
    ye: number,
    anti: boolean,
  ) => WasmOscParams;
  get_probabilities: (params: WasmOscParams, l: number, e: number, initial_flavor: number) => Float64Array;
  calculate_energy_spectrum: (
    params: WasmOscParams,
    l: number,
    initial_flavor: number,
    e_min: number,
    e_max: number,
    num_points: number,
  ) => Float64Array;
  calculate_baseline_scan: (
    params: WasmOscParams,
    e: number,
    initial_flavor: number,
    l_min: number,
    l_max: number,
    num_points: number,
  ) => Float64Array;
  default: (url: string) => Promise<void>;
}

interface WasmOscParams {
  free(): void;
}

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

let wasmModule: WasmModule | null = null;
let wasmLoadPromise: Promise<WasmModule | null> | null = null;
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
    wasmLoadCallbacks = wasmLoadCallbacks.filter(cb => cb !== callback);
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
  if (wasmModule) return true;
  if (wasmLoadState === 'failed') return false;
  
  if (!wasmLoadPromise) {
    setWasmState('loading');
    wasmLoadPromise = loadWasmModule();
  }
  
  wasmModule = await wasmLoadPromise;
  return wasmModule !== null;
}

async function loadWasmModule(): Promise<WasmModule | null> {
  try {
    // Fetch the JS glue code
    const response = await fetch('/wasm/nufast_wasm.js');
    const jsCode = await response.text();
    
    // Create a blob URL and import it
    const blob = new Blob([jsCode], { type: 'application/javascript' });
    const blobUrl = URL.createObjectURL(blob);
    
    const wasmJs = await import(/* @vite-ignore */ blobUrl) as WasmModule;
    URL.revokeObjectURL(blobUrl);
    
    // Initialize the WASM module
    await wasmJs.default('/wasm/nufast_wasm_bg.wasm');
    
    console.log('✅ NuFast WASM loaded successfully');
    setWasmState('ready');
    return wasmJs;
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
  return wasmModule !== null;
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
  if (!wasmModule) {
    throw new Error('WASM not loaded');
  }
  
  const oscParams = new wasmModule.OscParams(
    params.theta12_deg,
    params.theta13_deg,
    params.theta23_deg,
    params.deltaCP_deg,
    params.dm21sq_eV2,
    params.dm31sq_eV2,
    params.matterEffect,
    params.rho,
    params.Ye,
    params.isAntineutrino,
  );
  
  try {
    const result = wasmModule.calculate_energy_spectrum(
      oscParams,
      distance,
      params.initialFlavorIndex,
      eMin,
      eMax,
      numPoints,
    );
    
    // Parse flat array: [E, Pe, Pmu, Ptau, E, Pe, Pmu, Ptau, ...]
    const points: { energy: number; Pe: number; Pmu: number; Ptau: number }[] = [];
    for (let i = 0; i < result.length; i += 4) {
      points.push({
        energy: result[i],
        Pe: result[i + 1],
        Pmu: result[i + 2],
        Ptau: result[i + 3],
      });
    }
    return points;
  } finally {
    oscParams.free();
  }
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
  if (!wasmModule) {
    throw new Error('WASM not loaded');
  }
  
  const oscParams = new wasmModule.OscParams(
    params.theta12_deg,
    params.theta13_deg,
    params.theta23_deg,
    params.deltaCP_deg,
    params.dm21sq_eV2,
    params.dm31sq_eV2,
    params.matterEffect,
    params.rho,
    params.Ye,
    params.isAntineutrino,
  );
  
  try {
    const result = wasmModule.calculate_baseline_scan(
      oscParams,
      energy,
      params.initialFlavorIndex,
      lMin,
      lMax,
      numPoints,
    );
    
    // Parse flat array: [L, Pe, Pmu, Ptau, L, Pe, Pmu, Ptau, ...]
    const points: { distance: number; Pe: number; Pmu: number; Ptau: number }[] = [];
    for (let i = 0; i < result.length; i += 4) {
      points.push({
        distance: result[i],
        Pe: result[i + 1],
        Pmu: result[i + 2],
        Ptau: result[i + 3],
      });
    }
    return points;
  } finally {
    oscParams.free();
  }
}
