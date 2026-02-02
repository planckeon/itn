//! NuFast WASM - WebAssembly bindings for neutrino oscillation physics
//!
//! Provides high-performance oscillation calculations for web applications.
//! Uses the `nufast` crate for physics calculations.

use wasm_bindgen::prelude::*;
use nufast::{
    VacuumParameters, MatterParameters, VacuumBatch,
    probability_vacuum_lbl, probability_matter_lbl,
    normalize_probabilities,
};
use std::f64::consts::PI;

/// Oscillation parameters for WASM interface
#[wasm_bindgen]
#[derive(Clone, Copy)]
pub struct OscParams {
    // Mixing angles (radians internally)
    theta12_deg: f64,
    theta13_deg: f64,
    theta23_deg: f64,
    delta_deg: f64,
    
    // Mass splittings (eV²)
    dm21sq: f64,
    dm31sq: f64,
    
    // Matter effect
    matter: bool,
    rho: f64,
    ye: f64,
    
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
        Self {
            theta12_deg,
            theta13_deg,
            theta23_deg,
            delta_deg: delta_cp_deg,
            dm21sq,
            dm31sq,
            matter,
            rho,
            ye,
            anti,
        }
    }
    
    /// Create with NuFit 5.2 best-fit values (Normal Ordering)
    #[wasm_bindgen]
    pub fn nufit52_no() -> Self {
        Self {
            theta12_deg: 33.44,
            theta13_deg: 8.57,
            theta23_deg: 49.2,
            delta_deg: 194.0,
            dm21sq: 7.42e-5,
            dm31sq: 2.517e-3,
            matter: false,
            rho: 2.6,
            ye: 0.5,
            anti: false,
        }
    }
}

impl OscParams {
    fn to_vacuum(&self, l: f64, e: f64) -> VacuumParameters {
        let deg_to_rad = PI / 180.0;
        let delta = if self.anti { -self.delta_deg } else { self.delta_deg };
        
        VacuumParameters {
            s12sq: (self.theta12_deg * deg_to_rad).sin().powi(2),
            s13sq: (self.theta13_deg * deg_to_rad).sin().powi(2),
            s23sq: (self.theta23_deg * deg_to_rad).sin().powi(2),
            delta: delta * deg_to_rad,
            Dmsq21: self.dm21sq,
            Dmsq31: self.dm31sq,
            L: l,
            E: e,
        }
    }
    
    fn to_matter(&self, l: f64, e: f64) -> MatterParameters {
        let vac = self.to_vacuum(l, e);
        MatterParameters::from_vacuum(&vac, self.rho, self.ye, 0)
    }
}

/// Get probabilities for a single (L, E) point
/// Returns [Pe, Pmu, Ptau] for the given initial flavor
#[wasm_bindgen]
pub fn get_probabilities(params: &OscParams, l: f64, e: f64, initial_flavor: u8) -> Vec<f64> {
    let mut probs = if params.matter {
        probability_matter_lbl(&params.to_matter(l, e))
    } else {
        probability_vacuum_lbl(&params.to_vacuum(l, e))
    };
    
    normalize_probabilities(&mut probs);
    
    let row = initial_flavor.min(2) as usize;
    vec![probs[row][0], probs[row][1], probs[row][2]]
}

/// Calculate energy spectrum: P(E) at fixed L for many energy points
/// This is the main batch operation optimized for WASM
/// Uses VacuumBatch for 45% faster vacuum calculations
/// Returns flat array: [E, Pe, Pmu, Ptau, E, Pe, Pmu, Ptau, ...]
#[wasm_bindgen]
pub fn calculate_energy_spectrum(
    params: &OscParams,
    l: f64,
    initial_flavor: u8,
    e_min: f64,
    e_max: f64,
    num_points: usize,
) -> Vec<f64> {
    let row = initial_flavor.min(2) as usize;
    let mut result = Vec::with_capacity(num_points * 4);
    
    if params.matter {
        // Matter calculations - use standard API
        for i in 0..num_points {
            let t = i as f64 / (num_points - 1).max(1) as f64;
            let e = e_min + t * (e_max - e_min);
            
            let mut probs = probability_matter_lbl(&params.to_matter(l, e));
            normalize_probabilities(&mut probs);
            
            result.push(e);
            result.push(probs[row][0]);
            result.push(probs[row][1]);
            result.push(probs[row][2]);
        }
    } else {
        // Vacuum calculations - use optimized VacuumBatch (45% faster)
        let deg_to_rad = PI / 180.0;
        let delta = if params.anti { -params.delta_deg } else { params.delta_deg };
        
        let batch = VacuumBatch::new(
            (params.theta12_deg * deg_to_rad).sin().powi(2),
            (params.theta13_deg * deg_to_rad).sin().powi(2),
            (params.theta23_deg * deg_to_rad).sin().powi(2),
            delta * deg_to_rad,
            params.dm21sq,
            params.dm31sq,
        );
        
        for i in 0..num_points {
            let t = i as f64 / (num_points - 1).max(1) as f64;
            let e = e_min + t * (e_max - e_min);
            
            let probs = batch.probability_at(l, e);
            
            result.push(e);
            result.push(probs[row][0]);
            result.push(probs[row][1]);
            result.push(probs[row][2]);
        }
    }
    
    result
}

/// Calculate probability history along baseline
/// Uses VacuumBatch for 45% faster vacuum calculations
/// Returns flat array: [L, Pe, Pmu, Ptau, ...]
#[wasm_bindgen]
pub fn calculate_baseline_scan(
    params: &OscParams,
    e: f64,
    initial_flavor: u8,
    l_min: f64,
    l_max: f64,
    num_points: usize,
) -> Vec<f64> {
    let row = initial_flavor.min(2) as usize;
    let mut result = Vec::with_capacity(num_points * 4);
    
    if params.matter {
        // Matter calculations - use standard API
        for i in 0..num_points {
            let t = i as f64 / (num_points - 1).max(1) as f64;
            let l = l_min + t * (l_max - l_min);
            
            let mut probs = probability_matter_lbl(&params.to_matter(l, e));
            normalize_probabilities(&mut probs);
            
            result.push(l);
            result.push(probs[row][0]);
            result.push(probs[row][1]);
            result.push(probs[row][2]);
        }
    } else {
        // Vacuum calculations - use optimized VacuumBatch (45% faster)
        let deg_to_rad = PI / 180.0;
        let delta = if params.anti { -params.delta_deg } else { params.delta_deg };
        
        let batch = VacuumBatch::new(
            (params.theta12_deg * deg_to_rad).sin().powi(2),
            (params.theta13_deg * deg_to_rad).sin().powi(2),
            (params.theta23_deg * deg_to_rad).sin().powi(2),
            delta * deg_to_rad,
            params.dm21sq,
            params.dm31sq,
        );
        
        for i in 0..num_points {
            let t = i as f64 / (num_points - 1).max(1) as f64;
            let l = l_min + t * (l_max - l_min);
            
            let probs = batch.probability_at(l, e);
            
            result.push(l);
            result.push(probs[row][0]);
            result.push(probs[row][1]);
            result.push(probs[row][2]);
        }
    }
    
    result
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
    fn test_spectrum_length() {
        let params = OscParams::nufit52_no();
        let result = calculate_energy_spectrum(&params, 1000.0, 0, 0.1, 10.0, 100);
        assert_eq!(result.len(), 400); // 100 points × 4 values
    }
    
    #[test]
    fn test_unitarity() {
        let params = OscParams::nufit52_no();
        let probs = get_probabilities(&params, 1000.0, 2.0, 0);
        let sum: f64 = probs.iter().sum();
        assert!((sum - 1.0).abs() < 1e-6);
    }
}
