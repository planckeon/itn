/**
 * NuFast WASM - Three-flavor neutrino oscillation probabilities
 * Works in both Node.js and browser environments.
 */

/** Probability matrix indices */
export const ProbIndex = {
  Pee: 0, Pem: 1, Pet: 2,
  Pme: 3, Pmm: 4, Pmt: 5,
  Pte: 6, Ptm: 7, Ptt: 8,
};

/** NuFIT 5.2 default parameters */
export const DEFAULT_PARAMS = {
  s12sq: 0.307,
  s13sq: 0.022,
  s23sq: 0.546,
  delta: -0.7 * Math.PI,
  Dmsq21: 7.53e-5,
  Dmsq31: 2.453e-3,
  antineutrino: false,
};

/** DUNE-like matter parameters */
export const DUNE_MATTER = {
  rho: 2.848,
  Ye: 0.5,
  nNewton: 0,
};

/**
 * High-level NuFast wrapper with ergonomic API
 */
export class NuFast {
  constructor(wasmExports) {
    this.wasm = wasmExports;
    this.maxBatchSize = wasmExports.get_max_batch_size();
  }

  /** Set vacuum oscillation parameters */
  setVacuumParams(params) {
    this.wasm.set_vacuum_params(
      params.s12sq,
      params.s13sq,
      params.s23sq,
      params.delta,
      params.Dmsq21,
      params.Dmsq31,
      params.antineutrino ?? false
    );
  }

  /** Alias for setVacuumParams - sets oscillation parameters */
  setParams(params) {
    this.setVacuumParams(params);
  }

  /** Set to NuFIT 5.2 default parameters */
  setDefaultParams() {
    this.wasm.set_default_params();
  }

  /** Set matter parameters (call setVacuumParams first) */
  setMatterParams(params) {
    this.wasm.set_matter_params(
      params.rho,
      params.Ye ?? 0.5,
      params.nNewton ?? 0,
      params.antineutrino ?? false
    );
  }

  /**
   * Calculate vacuum oscillation probability matrix
   * @param {number} L Baseline in km
   * @param {number} E Energy in GeV
   * @returns {number[][]} 3×3 probability matrix
   */
  vacuumProbability(L, E) {
    const ptr = this.wasm.vacuum_probability(L, E);
    return this.readMatrix(ptr);
  }

  /**
   * Calculate matter oscillation probability matrix
   * @param {number} L Baseline in km
   * @param {number} E Energy in GeV
   * @returns {number[][]} 3×3 probability matrix
   */
  matterProbability(L, E) {
    const ptr = this.wasm.matter_probability(L, E);
    return this.readMatrix(ptr);
  }

  /**
   * Quick P(νμ → νe) with default parameters
   * @param {number} L Baseline in km
   * @param {number} E Energy in GeV
   * @returns {number} Probability
   */
  vacuumPmeDefault(L, E) {
    return this.wasm.vacuum_Pme_default(L, E);
  }

  /**
   * Quick P(νμ → νe) in matter with default parameters
   * @param {number} L Baseline in km
   * @param {number} E Energy in GeV
   * @param {number} rho Matter density in g/cm³
   * @returns {number} Probability
   */
  matterPmeDefault(L, E, rho) {
    return this.wasm.matter_Pme_default(L, E, rho);
  }

  /** Initialize vacuum batch calculator */
  initVacuumBatch() {
    this.wasm.init_vacuum_batch();
  }

  /** Initialize matter batch calculator */
  initMatterBatch() {
    this.wasm.init_matter_batch();
  }

  /**
   * Calculate P(νμ → νe) for multiple energies (vacuum)
   * @param {number} L Baseline in km
   * @param {Float64Array|number[]} energies Array of energies in GeV
   * @returns {Float64Array} Array of P(νμ → νe) values
   */
  vacuumBatchPme(L, energies) {
    const count = Math.min(energies.length, this.maxBatchSize);
    const energiesPtr = this.wasm.get_energies_ptr();
    const energiesView = new Float64Array(this.wasm.memory.buffer, energiesPtr, count);
    for (let i = 0; i < count; i++) {
      energiesView[i] = energies[i];
    }
    const outputPtr = this.wasm.vacuum_batch_Pme(L, count);
    const output = new Float64Array(this.wasm.memory.buffer, outputPtr, count);
    return new Float64Array(output);
  }

  /**
   * Calculate P(νμ → νe) for multiple energies (matter)
   * @param {number} L Baseline in km
   * @param {Float64Array|number[]} energies Array of energies in GeV
   * @returns {Float64Array} Array of P(νμ → νe) values
   */
  matterBatchPme(L, energies) {
    const count = Math.min(energies.length, this.maxBatchSize);
    const energiesPtr = this.wasm.get_energies_ptr();
    const energiesView = new Float64Array(this.wasm.memory.buffer, energiesPtr, count);
    for (let i = 0; i < count; i++) {
      energiesView[i] = energies[i];
    }
    const outputPtr = this.wasm.matter_batch_Pme(L, count);
    const output = new Float64Array(this.wasm.memory.buffer, outputPtr, count);
    return new Float64Array(output);
  }

  /**
   * Calculate full probability matrices for multiple energies (vacuum)
   * @param {number} L Baseline in km
   * @param {Float64Array|number[]} energies Array of energies in GeV
   * @returns {number[][][]} Array of 3×3 probability matrices
   */
  vacuumBatchFull(L, energies) {
    const count = Math.min(energies.length, this.maxBatchSize);
    const energiesPtr = this.wasm.get_energies_ptr();
    const energiesView = new Float64Array(this.wasm.memory.buffer, energiesPtr, count);
    for (let i = 0; i < count; i++) {
      energiesView[i] = energies[i];
    }
    const outputPtr = this.wasm.vacuum_batch_full(L, count);
    const output = new Float64Array(this.wasm.memory.buffer, outputPtr, count * 9);
    const matrices = [];
    for (let i = 0; i < count; i++) {
      const base = i * 9;
      matrices.push([
        [output[base + 0], output[base + 1], output[base + 2]],
        [output[base + 3], output[base + 4], output[base + 5]],
        [output[base + 6], output[base + 7], output[base + 8]],
      ]);
    }
    return matrices;
  }

  /** Maximum batch size (1024) */
  getMaxBatchSize() {
    return this.maxBatchSize;
  }

  readMatrix(ptr) {
    const view = new Float64Array(this.wasm.memory.buffer, ptr, 9);
    return [
      [view[0], view[1], view[2]],
      [view[3], view[4], view[5]],
      [view[6], view[7], view[8]],
    ];
  }
}

// Singleton instance for simple usage
let _instance = null;

/**
 * Initialize NuFast module. Works in both Node.js and browser.
 * @param {string} [wasmPath] Path to nufast.wasm (optional in Node.js)
 * @returns {Promise<NuFast>} Initialized NuFast instance
 */
export async function init(wasmPath) {
  if (_instance) return _instance;
  
  let bytes;
  
  // Detect environment and load WASM accordingly
  if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
    // Browser environment
    const path = wasmPath || 'nufast.wasm';
    const response = await fetch(path);
    bytes = await response.arrayBuffer();
  } else {
    // Node.js / Bun environment
    const { readFile } = await import('fs/promises');
    const { fileURLToPath } = await import('url');
    const { dirname, join } = await import('path');
    
    let path = wasmPath;
    if (!path) {
      // Default: look for wasm file next to this module
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      path = join(__dirname, 'nufast.wasm');
    }
    bytes = await readFile(path);
  }
  
  const { instance } = await WebAssembly.instantiate(bytes, { env: {} });
  const wasm = instance.exports;
  
  _instance = new NuFast(wasm);
  _instance.setDefaultParams();
  _instance.initVacuumBatch();
  
  return _instance;
}

/**
 * Load NuFast WASM module (browser-friendly)
 * @param {string} [wasmPath='nufast.wasm'] Path to nufast.wasm file
 * @returns {Promise<NuFast>} Initialized NuFast instance
 */
export async function loadNuFast(wasmPath = 'nufast.wasm') {
  const response = await fetch(wasmPath);
  const bytes = await response.arrayBuffer();
  const { instance } = await WebAssembly.instantiate(bytes, { env: {} });
  const wasm = instance.exports;
  
  const nufast = new NuFast(wasm);
  nufast.setDefaultParams();
  nufast.initVacuumBatch();
  
  return nufast;
}

/**
 * Load NuFast WASM module from bytes (Node.js / Bun)
 * @param {ArrayBuffer} wasmBytes WASM binary data
 * @returns {Promise<NuFast>} Initialized NuFast instance
 */
export async function loadNuFastFromBytes(wasmBytes) {
  const { instance } = await WebAssembly.instantiate(wasmBytes, { env: {} });
  const wasm = instance.exports;
  
  const nufast = new NuFast(wasm);
  nufast.setDefaultParams();
  nufast.initVacuumBatch();
  
  return nufast;
}

// Re-export for CommonJS-style default usage
export default { init, loadNuFast, loadNuFastFromBytes, NuFast, DEFAULT_PARAMS, DUNE_MATTER, ProbIndex };
