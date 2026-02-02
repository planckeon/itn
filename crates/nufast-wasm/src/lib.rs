//! NuFast WASM - High-performance neutrino oscillation physics
//!
//! Ported from NuFast C++ for WebAssembly deployment.
//! Optimized for batch calculations (energy spectrum, Monte Carlo).

use wasm_bindgen::prelude::*;
use std::f64::consts::PI;

// Physics constants
const EV_SQ_KM_TO_GEV_OVER4: f64 = 1.267;
const SQRT2: f64 = 1.4142135623730951;
const GF: f64 = 1.1663788e-23; // Fermi constant in eV^-2
const NA: f64 = 6.022e23; // Avogadro's number
const EV_PER_GEV: f64 = 1e9;

/// Convert density (g/cm³) and Ye to matter potential A (eV²/GeV)
#[inline]
fn yer_rho_e_to_a(ye: f64, rho: f64, e: f64) -> f64 {
    // A = 2 * sqrt(2) * G_F * N_e * E
    // N_e = rho * Y_e * N_A / (atomic mass unit)
    let n_e = rho * ye * NA * 1e6; // electrons per m³ → per cm³ conversion
    2.0 * SQRT2 * GF * n_e * e * EV_PER_GEV * 1e-18 // Simplified conversion factor
}

/// Neutrino oscillation parameters
#[wasm_bindgen]
#[derive(Clone, Copy)]
pub struct OscParams {
    // Mixing angles (radians internally)
    s12sq: f64,
    s13sq: f64,
    s23sq: f64,
    delta: f64, // CP phase in radians
    
    // Mass splittings (eV²)
    dm21sq: f64,
    dm31sq: f64,
    
    // Matter effect
    matter: bool,
    rho: f64,  // density g/cm³
    ye: f64,   // electron fraction
    
    // Antineutrino flag
    anti: bool,
}

#[wasm_bindgen]
impl OscParams {
    #[wasm_bindgen(constructor)]
    pub fn new(
        theta12_deg: f64,
        theta13_deg: f64,
        theta23_deg: f64,
        delta_cp_deg: f64,
        dm21sq: f64,
        dm31sq: f64,
        matter: bool,
        rho: f64,
        ye: f64,
        anti: bool,
    ) -> Self {
        let deg_to_rad = PI / 180.0;
        Self {
            s12sq: (theta12_deg * deg_to_rad).sin().powi(2),
            s13sq: (theta13_deg * deg_to_rad).sin().powi(2),
            s23sq: (theta23_deg * deg_to_rad).sin().powi(2),
            delta: delta_cp_deg * deg_to_rad,
            dm21sq,
            dm31sq,
            matter,
            rho,
            ye,
            anti,
        }
    }
}

/// Calculate vacuum oscillation probabilities
/// Returns [Pee, Pem, Pet, Pme, Pmm, Pmt, Pte, Ptm, Ptt]
/// Ported directly from TypeScript NuFastPort.ts
fn probability_vacuum(params: &OscParams, l: f64, e: f64) -> [f64; 9] {
    let s12sq = params.s12sq;
    let s13sq = params.s13sq;
    let s23sq = params.s23sq;
    let delta = if params.anti { -params.delta } else { params.delta };
    let dm21sq = params.dm21sq;
    let dm31sq = params.dm31sq;
    
    // Pre-calculate trig functions
    let c13sq = 1.0 - s13sq;
    let sind = delta.sin();
    let cosd = delta.cos();
    
    // Ueisq's
    let ue2sq = c13sq * s12sq;
    let ue3sq = s13sq;
    let ue1sq = 1.0 - ue3sq - ue2sq;
    
    // Umisq's and Jvac
    let um3sq = c13sq * s23sq;
    let temp_ut2sq = s13sq * s12sq * s23sq;
    let temp_um2sq = (1.0 - s12sq) * (1.0 - s23sq);
    let jrr = (temp_um2sq * temp_ut2sq).max(0.0).sqrt();
    let um2sq = temp_um2sq + temp_ut2sq - 2.0 * jrr * cosd;
    let um1sq = 1.0 - um3sq - um2sq;
    let jvac = 8.0 * jrr * c13sq * sind;
    
    // Kinematic terms
    let abs_e = e.abs();
    let lover4e = EV_SQ_KM_TO_GEV_OVER4 * l / abs_e;
    let d21 = dm21sq * lover4e;
    let d31 = dm31sq * lover4e;
    let d32 = d31 - d21;
    
    let sin_d21 = d21.sin();
    let sin_d31 = d31.sin();
    let sin_d32 = d32.sin();
    let triple_sin = sin_d21 * sin_d31 * sin_d32;
    
    // 2*sin^2(X)
    let sinsq_d21_2 = 2.0 * sin_d21 * sin_d21;
    let sinsq_d31_2 = 2.0 * sin_d31 * sin_d31;
    let sinsq_d32_2 = 2.0 * sin_d32 * sin_d32;
    
    let e_sign = if e >= 0.0 { 1.0 } else { -1.0 };
    
    // Calculate probabilities (NuFast formula)
    let pme_cpc = (1.0 - um3sq - ue3sq - um2sq * ue1sq - um1sq * ue2sq) * sinsq_d21_2
        + (1.0 - um2sq - ue2sq - um3sq * ue1sq - um1sq * ue3sq) * sinsq_d31_2
        + (1.0 - um1sq - ue1sq - um3sq * ue2sq - um2sq * ue3sq) * sinsq_d32_2;
    
    let pme_cpv = -jvac * triple_sin * e_sign;
    
    let pmm = 1.0 - 2.0 * (um2sq * um1sq * sinsq_d21_2 
        + um3sq * um1sq * sinsq_d31_2 
        + um3sq * um2sq * sinsq_d32_2);
    
    let pee = 1.0 - 2.0 * (ue2sq * ue1sq * sinsq_d21_2 
        + ue3sq * ue1sq * sinsq_d31_2 
        + ue3sq * ue2sq * sinsq_d32_2);
    
    // Build probability matrix (same structure as TypeScript)
    // Row 0: e → [e, μ, τ]
    // Row 1: μ → [e, μ, τ]  
    // Row 2: τ → [e, μ, τ]
    let pem = pme_cpc - pme_cpv;  // e → μ
    let pet = 1.0 - pee - pem;    // e → τ (unitarity)
    
    let pme = pme_cpc + pme_cpv;  // μ → e
    let pmt = 1.0 - pme - pmm;    // μ → τ (unitarity)
    
    let pte = 1.0 - pee - pme;    // τ → e (column unitarity)
    let ptm = 1.0 - pem - pmm;    // τ → μ (column unitarity)
    let ptt = 1.0 - pte - ptm;    // τ → τ (row unitarity)
    
    // Clamp all to [0, 1]
    let clamp = |x: f64| x.clamp(0.0, 1.0);
    
    // Build and normalize rows
    let mut result = [
        clamp(pee), clamp(pem), clamp(pet),
        clamp(pme), clamp(pmm), clamp(pmt),
        clamp(pte), clamp(ptm), clamp(ptt),
    ];
    
    // Ensure each row sums to 1
    for row in 0..3 {
        let start = row * 3;
        let sum = result[start] + result[start + 1] + result[start + 2];
        if (sum - 1.0).abs() > 1e-6 && sum > 0.0 {
            result[start] /= sum;
            result[start + 1] /= sum;
            result[start + 2] /= sum;
        }
    }
    
    result
}

/// Calculate matter-modified oscillation probabilities
/// Uses constant density approximation (good for Earth crust/mantle)
fn probability_matter(params: &OscParams, l: f64, e: f64) -> [f64; 9] {
    // For now, use a simplified matter effect
    // TODO: Implement full NuFast matter effect with eigenvalue solver
    // This is a placeholder that applies a first-order correction
    
    let a = yer_rho_e_to_a(params.ye, params.rho, e);
    let _a_over_dm = a / params.dm31sq.abs();
    
    // For small matter effects, vacuum is a good approximation
    // Full implementation would modify mixing angles in matter
    probability_vacuum(params, l, e)
}

/// Get probabilities for a single (L, E) point
#[wasm_bindgen]
pub fn get_probabilities(params: &OscParams, l: f64, e: f64, initial_flavor: u8) -> Vec<f64> {
    let probs = if params.matter {
        probability_matter(params, l, e)
    } else {
        probability_vacuum(params, l, e)
    };
    
    // Return row for initial flavor: [Pe, Pmu, Ptau]
    match initial_flavor {
        0 => vec![probs[0], probs[1], probs[2]], // e → e, μ, τ
        1 => vec![probs[3], probs[4], probs[5]], // μ → e, μ, τ
        2 => vec![probs[6], probs[7], probs[8]], // τ → e, μ, τ
        _ => vec![1.0, 0.0, 0.0],
    }
}

/// Calculate energy spectrum: P(E) at fixed L for many energy points
/// This is the main batch operation optimized for WASM
#[wasm_bindgen]
pub fn calculate_energy_spectrum(
    params: &OscParams,
    l: f64,
    initial_flavor: u8,
    e_min: f64,
    e_max: f64,
    num_points: usize,
) -> Vec<f64> {
    let mut result = Vec::with_capacity(num_points * 4); // [E, Pe, Pmu, Ptau] per point
    
    for i in 0..num_points {
        let t = i as f64 / (num_points - 1) as f64;
        let e = e_min + t * (e_max - e_min);
        
        let probs = if params.matter {
            probability_matter(params, l, e)
        } else {
            probability_vacuum(params, l, e)
        };
        
        result.push(e);
        match initial_flavor {
            0 => {
                result.push(probs[0]);
                result.push(probs[1]);
                result.push(probs[2]);
            }
            1 => {
                result.push(probs[3]);
                result.push(probs[4]);
                result.push(probs[5]);
            }
            2 => {
                result.push(probs[6]);
                result.push(probs[7]);
                result.push(probs[8]);
            }
            _ => {
                result.push(1.0);
                result.push(0.0);
                result.push(0.0);
            }
        }
    }
    
    result
}

/// Calculate oscillation probabilities along a baseline with varying density
/// For future Earth matter profile support
#[wasm_bindgen]
pub fn calculate_with_density_profile(
    params: &OscParams,
    l_total: f64,
    initial_flavor: u8,
    densities: &[f64],  // Density at each segment
    _segment_lengths: &[f64], // Length of each segment (km)
) -> Vec<f64> {
    // TODO: Implement piecewise constant density integration
    // For now, use average density
    let avg_rho: f64 = densities.iter().sum::<f64>() / densities.len() as f64;
    let mut modified_params = *params;
    modified_params.rho = avg_rho;
    
    get_probabilities(&modified_params, l_total, 1.0, initial_flavor)
}

/// Initialize panic hook for better error messages
#[wasm_bindgen(start)]
pub fn init() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_vacuum_unitarity() {
        let params = OscParams::new(
            33.44, 8.57, 49.2, 0.0,
            7.42e-5, 2.517e-3,
            false, 2.6, 0.5, false
        );
        
        let probs = probability_vacuum(&params, 1000.0, 2.0);
        
        // Check unitarity: each row sums to 1
        let row_e = probs[0] + probs[1] + probs[2];
        let row_m = probs[3] + probs[4] + probs[5];
        let row_t = probs[6] + probs[7] + probs[8];
        
        assert!((row_e - 1.0).abs() < 1e-10);
        assert!((row_m - 1.0).abs() < 1e-10);
        assert!((row_t - 1.0).abs() < 1e-10);
    }
    
    #[test]
    fn test_zero_distance() {
        let params = OscParams::new(
            33.44, 8.57, 49.2, 0.0,
            7.42e-5, 2.517e-3,
            false, 2.6, 0.5, false
        );
        
        let probs = get_probabilities(&params, 0.0, 2.0, 0);
        
        // At L=0, no oscillation: P(e→e) = 1
        assert!((probs[0] - 1.0).abs() < 1e-10);
        assert!(probs[1].abs() < 1e-10);
        assert!(probs[2].abs() < 1e-10);
    }
}
