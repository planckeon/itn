/* tslint:disable */
/* eslint-disable */

/**
 * Oscillation parameters for WASM interface
 */
export class OscParams {
    free(): void;
    [Symbol.dispose](): void;
    constructor(theta12_deg: number, theta13_deg: number, theta23_deg: number, delta_cp_deg: number, dm21sq: number, dm31sq: number, matter: boolean, rho: number, ye: number, anti: boolean);
    /**
     * Create with NuFit 5.2 best-fit values (Normal Ordering)
     */
    static nufit52_no(): OscParams;
}

/**
 * Calculate probability history along baseline
 * Returns flat array: [L, Pe, Pmu, Ptau, ...]
 */
export function calculate_baseline_scan(params: OscParams, e: number, initial_flavor: number, l_min: number, l_max: number, num_points: number): Float64Array;

/**
 * Calculate energy spectrum: P(E) at fixed L for many energy points
 * This is the main batch operation optimized for WASM
 * Returns flat array: [E, Pe, Pmu, Ptau, E, Pe, Pmu, Ptau, ...]
 */
export function calculate_energy_spectrum(params: OscParams, l: number, initial_flavor: number, e_min: number, e_max: number, num_points: number): Float64Array;

/**
 * Get probabilities for a single (L, E) point
 * Returns [Pe, Pmu, Ptau] for the given initial flavor
 */
export function get_probabilities(params: OscParams, l: number, e: number, initial_flavor: number): Float64Array;

/**
 * Initialize panic hook for better error messages
 */
export function init(): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_oscparams_free: (a: number, b: number) => void;
    readonly calculate_baseline_scan: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number];
    readonly calculate_energy_spectrum: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number];
    readonly get_probabilities: (a: number, b: number, c: number, d: number) => [number, number];
    readonly oscparams_new: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => number;
    readonly oscparams_nufit52_no: () => number;
    readonly init: () => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
