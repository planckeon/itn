// src/physics/NuFastPort.ts

import type {
	OscillationParameters,
	ProbabilityMatrix,
	ProbabilityVector,
} from "./types";
import { YerhoE2A, EV_SQ_KM_TO_GEV_OVER4 } from "./constants";

/**
 * Calculates oscillation probabilities in vacuum.
 * Based on NuFast C++ Probability_Vacuum_LBL.
 */
function probabilityVacuumLBL(
	s12sq: number,
	s13sq: number,
	s23sq: number,
	delta: number,
	Dmsq21: number,
	Dmsq31: number,
	L: number,
	E: number,
): ProbabilityMatrix {
	// --- Pre-calculate Trig Functions and Basic Parameters ---
	const c13sq = 1 - s13sq;
	const sind = Math.sin(delta);
	const cosd = Math.cos(delta);

	// Ueisq's
	const Ue2sq = c13sq * s12sq;
	const Ue3sq = s13sq;

	// Umisq's, Utisq's and Jvac
	const Um3sq = c13sq * s23sq;
	// Temporary variables used in C++ code to calculate Jrr and Um2sq
	let temp_Ut2sq = s13sq * s12sq * s23sq;
	let temp_Um2sq = (1 - s12sq) * (1 - s23sq);

	const Jrr = Math.sqrt(Math.max(0, temp_Um2sq * temp_Ut2sq)); // Ensure non-negative argument for sqrt
	const Um2sq = temp_Um2sq + temp_Ut2sq - 2 * Jrr * cosd;
	const Jvac = 8 * Jrr * c13sq * sind; // This is the CPV term coefficient

	// --- Get all elements of Usq using unitarity ---
	const Ue1sq = 1 - Ue3sq - Ue2sq;
	const Um1sq = 1 - Um3sq - Um2sq;

	// --- Get the kinematic terms ---
	const absE = Math.abs(E); // Use absolute energy for kinematic factor
	// REMOVED unused energySign
	// const energySign = E >= 0 ? 1 : -1;

	// --- Guard against E = 0 ---
	if (absE < 1e-12) {
		console.warn(
			"Vacuum calc received E near zero. Returning identity matrix.",
		);
		// Return identity matrix for no oscillation
		return [
			[1, 0, 0],
			[0, 1, 0],
			[0, 0, 1],
		];
	}

	const Lover4E = (EV_SQ_KM_TO_GEV_OVER4 * L) / absE;
	// console.log(`vacuum Lover4E=${Lover4E}`);

	const D21 = Dmsq21 * Lover4E;
	const D31 = Dmsq31 * Lover4E;
	const D32 = D31 - D21;
	// console.log(`vacuum D21=${D21}, D31=${D31}, D32=${D32}`);

	const sinD21 = Math.sin(D21);
	const sinD31 = Math.sin(D31);
	const sinD32 = Math.sin(D32);
	// console.log(`vacuum sinD21=${sinD21}, sinD31=${sinD31}, sinD32=${sinD32}`);

	const triple_sin = sinD21 * sinD31 * sinD32;

	// Use 2*sin^2(X) = 1 - cos(2X), but NuFast uses 2*sin(X)*sin(X)
	const sinsqD21_2 = 2 * sinD21 * sinD21;
	const sinsqD31_2 = 2 * sinD31 * sinD31;
	const sinsqD32_2 = 2 * sinD32 * sinD32;

	// --- Calculate the three necessary probabilities, separating CPC and CPV ---
	// Use unitarity directly in the calculation
	const Pme_CPC =
		(1 - Um3sq - Ue3sq - Um2sq * Ue1sq - Um1sq * Ue2sq) * sinsqD21_2 +
		(1 - Um2sq - Ue2sq - Um3sq * Ue1sq - Um1sq * Ue3sq) * sinsqD31_2 +
		(1 - Um1sq - Ue1sq - Um3sq * Ue2sq - Um2sq * Ue3sq) * sinsqD32_2;

	const Pme_CPV = -Jvac * triple_sin * (E >= 0 ? 1 : -1); // Apply energy sign directly here

	const Pmm =
		1 -
		2 *
			(Um2sq * Um1sq * sinsqD21_2 +
				Um3sq * Um1sq * sinsqD31_2 +
				Um3sq * Um2sq * sinsqD32_2);

	const Pee =
		1 -
		2 *
			(Ue2sq * Ue1sq * sinsqD21_2 +
				Ue3sq * Ue1sq * sinsqD31_2 +
				Ue3sq * Ue2sq * sinsqD32_2);

	// --- Assign all the probabilities using unitarity ---
	const probs_returned: number[][] = [
		[0, 0, 0],
		[0, 0, 0],
		[0, 0, 0],
	];

	probs_returned[0][0] = Pee;
	probs_returned[0][1] = Pme_CPC - Pme_CPV; // Pem (T-conjugate flips CPV sign)
	probs_returned[0][2] = 1 - Pee - probs_returned[0][1]; // Pet

	probs_returned[1][0] = Pme_CPC + Pme_CPV; // Pme
	probs_returned[1][1] = Pmm;
	probs_returned[1][2] = 1 - probs_returned[1][0] - Pmm; // Pmt

	probs_returned[2][0] = 1 - Pee - probs_returned[1][0]; // Pte
	probs_returned[2][1] = 1 - probs_returned[0][1] - Pmm; // Ptm
	probs_returned[2][2] = 1 - probs_returned[0][2] - probs_returned[1][2]; // Ptt

	// --- Final Clamping ---
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			probs_returned[i][j] = Math.max(0, Math.min(1, probs_returned[i][j]));
		}
	}

	return probs_returned as ProbabilityMatrix;
}

/**
 * Calculates oscillation probabilities in matter.
 * Based on NuFast C++ Probability_Matter_LBL.
 */
function probabilityMatterLBL(
	s12sq: number,
	s13sq: number,
	s23sq: number,
	delta: number,
	Dmsq21: number,
	Dmsq31: number,
	L: number,
	E: number,
	rho: number,
	Ye: number,
	N_Newton: number,
): ProbabilityMatrix {
	const absE = Math.abs(E);
	// REMOVED unused energySign
	// const energySign = E >= 0 ? 1 : -1;

	// --- Guard against E = 0 ---
	if (absE < 1e-12) {
		console.warn(
			"Matter calc received E near zero. Returning identity matrix.",
		);
		// Return identity matrix for no oscillation
		return [
			[1, 0, 0],
			[0, 1, 0],
			[0, 0, 1],
		];
	}

	// --- Pre-calculate Trig Functions and Basic Parameters ---
	const c13sq = 1 - s13sq;
	const sind = Math.sin(delta);
	const cosd = Math.cos(delta);

	// Vacuum Ueisq's needed for intermediate calcs
	const Ue2sq_vac = c13sq * s12sq;
	const Ue3sq_vac = s13sq;
	const Ue1sq_vac = 1 - Ue3sq_vac - Ue2sq_vac; // c12sq * c13sq

	// Vacuum Umisq's, Utisq's needed for intermediate calcs
	const Um3sq_vac = c13sq * s23sq;
	const temp_Ut2sq_for_Jrr = s13sq * s12sq * s23sq;
	const temp_Um2sq_for_Jrr = (1 - s12sq) * (1 - s23sq);
	const Jrr = Math.sqrt(Math.max(0, temp_Um2sq_for_Jrr * temp_Ut2sq_for_Jrr));
	const Um2sq_vac = temp_Um2sq_for_Jrr + temp_Ut2sq_for_Jrr - 2 * Jrr * cosd;

	// Base Jarlskog factor used in Jmatter calculation
	const Jvac_factor = 8 * Jrr * c13sq * sind; // Matter Potential
	const Amatter = Ye * rho * E * YerhoE2A; // E includes sign for nu/anti-nu
	const Dmsqee = Dmsq31 - s12sq * Dmsq21;

	// Avoid division by zero if Dmsqee is zero when matter potential is non-zero
	const Dmsqee_safe =
		Math.abs(Amatter) > 1e-30 && Math.abs(Dmsqee) < 1e-30
			? (Dmsqee >= 0 ? 1 : -1) * 1e-30
			: Dmsqee;

	// --- Calculate Coefficients of Characteristic Equation ---
	const A_coeff = Dmsq21 + Dmsq31 + Amatter;
	const See = Dmsq21 * (1 - Ue2sq_vac) + Dmsq31 * (1 - Ue3sq_vac); // Saa for a=e
	const Tmm_vac_part = Dmsq21 * Dmsq31;
	const Tee = Tmm_vac_part * Ue1sq_vac; // Taa for a=e
	const C_coeff = Amatter * Tee;
	const B_coeff = Tmm_vac_part + Amatter * See; // B coefficient

	// --- Calculate Eigenvalues lambda_i ---
	let lambda3: number;
	if (Math.abs(Dmsqee_safe) < 1e-30) {
		lambda3 = Dmsq31 + 0.5 * Amatter;
		// console.warn("Dmsqee is near zero, lambda3 approximation fallback used.");
	} else {
		const xmat = Amatter / Dmsqee_safe;
		const tmp_sqrt_arg = (1 - xmat) * (1 - xmat) + 4 * s13sq * xmat;
		// console.log(`matter xmat=${xmat}, tmp_sqrt_arg=${tmp_sqrt_arg}`);
		const tmp_sqrt =
			tmp_sqrt_arg < -1e-12 ? 0 : Math.sqrt(Math.max(0, tmp_sqrt_arg)); // Allow tiny negative due to float errors
		lambda3 = Dmsq31 + 0.5 * Dmsqee_safe * (xmat - 1 + tmp_sqrt);
	}
	// console.log(`matter initial lambda3=${lambda3}`);
	// Newton-Raphson refinement
	for (let i = 0; i < N_Newton; i++) {
		const lambda3_sq = lambda3 * lambda3;
		const X_lambda3 =
			lambda3_sq * lambda3 - A_coeff * lambda3_sq + B_coeff * lambda3 - C_coeff;
		const Xprime_lambda3 = 3 * lambda3_sq - 2 * A_coeff * lambda3 + B_coeff;
		if (Math.abs(Xprime_lambda3) < 1e-40) {
			break;
		}
		lambda3 = lambda3 - X_lambda3 / Xprime_lambda3;
	}
	// console.log(`matter refined lambda3=${lambda3}`);

	const tmp_A_l3 = A_coeff - lambda3;
	const lambda3_safe =
		Math.abs(lambda3) < 1e-40 ? (lambda3 >= 0 ? 1 : -1) * 1e-40 : lambda3;
	const Dlambda21_sq_arg = tmp_A_l3 * tmp_A_l3 - (4 * C_coeff) / lambda3_safe;
	// console.log(`matter Dlambda21_sq_arg=${Dlambda21_sq_arg}`);
	const Dlambda21 =
		Dlambda21_sq_arg < -1e-12 ? 0 : Math.sqrt(Math.max(0, Dlambda21_sq_arg)); // Allow tiny negative
	const lambda2 = 0.5 * (tmp_A_l3 + Dlambda21);
	const lambda1 = 0.5 * (tmp_A_l3 - Dlambda21);
	const Dlambda31 = lambda3 - lambda1;
	const Dlambda32 = lambda3 - lambda2;
	// console.log(`matter lambda1=${lambda1}, lambda2=${lambda2}, lambda3=${lambda3}`);
	// console.log(`matter Dlambda21=${Dlambda21}, Dlambda31=${Dlambda31}, Dlambda32=${Dlambda32}`);

	// --- Calculate Effective Mixing |V_ai|^2 (Rosetta for 4 elements + Unitarity) ---
	const PiDlambdaInv_denom = Dlambda31 * Dlambda32 * Dlambda21;
	// console.log(`matter PiDlambdaInv_denom=${PiDlambdaInv_denom}`);
	const PiDlambdaInv =
		Math.abs(PiDlambdaInv_denom) < 1e-40 ? 0 : 1.0 / PiDlambdaInv_denom;
	const Xp3 = PiDlambdaInv * Dlambda21;
	const Xp2 = -PiDlambdaInv * Dlambda31;

	// Calculate Smm, Tmm needed for Um*sq Rosetta
	const Smm = Dmsq21 * (1 - Um2sq_vac) + Dmsq31 * (1 - Um3sq_vac) + Amatter;
	const Tmm =
		Tmm_vac_part * (1 - Um3sq_vac - Um2sq_vac) +
		Amatter * (See + Smm - A_coeff);

	// Calculate 4 elements using Rosetta
	let Ve3sq = (lambda3 * (lambda3 - See) + Tee) * Xp3;
	let Ve2sq = (lambda2 * (lambda2 - See) + Tee) * Xp2;
	let Um3sq = (lambda3 * (lambda3 - Smm) + Tmm) * Xp3;
	let Um2sq = (lambda2 * (lambda2 - Smm) + Tmm) * Xp2;

	// Clamp these 4 values *before* using them in unitarity
	Ve3sq = Math.max(0, Math.min(1, Ve3sq));
	Ve2sq = Math.max(0, Math.min(1, Ve2sq));
	Um3sq = Math.max(0, Math.min(1, Um3sq));
	Um2sq = Math.max(0, Math.min(1, Um2sq));

	// Calculate Remaining 5 Effective Mixing Elements using Unitarity
	const Ve1sq = Math.max(0, 1 - Ve3sq - Ve2sq); // Clamp intermediate results
	const Um1sq = Math.max(0, 1 - Um3sq - Um2sq);
	const Vt3sq = Math.max(0, 1 - Um3sq - Ve3sq);
	const Vt2sq = Math.max(0, 1 - Um2sq - Ve2sq);
	const Vt1sq = Math.max(0, 1 - Um1sq - Ve1sq);

	// --- Calculate Jarlskog Invariant in Matter (J_mat) using NHS Identity ---
	const Dm32sq = Dmsq31 - Dmsq21;
	const Jmatter = Jvac_factor * Dmsq21 * Dmsq31 * Dm32sq * PiDlambdaInv;

	// --- Calculate Kinematic Phases & Sin Terms ---
	const Lover4E = (EV_SQ_KM_TO_GEV_OVER4 * L) / absE; // Use absolute E here
	const D21 = Dlambda21 * Lover4E;
	const D31 = Dlambda31 * Lover4E;
	const D32 = Dlambda32 * Lover4E;

	const sinD21 = Math.sin(D21);
	const sinD31 = Math.sin(D31);
	const sinD32 = Math.sin(D32);

	const sinsqD21_2 = 2 * sinD21 * sinD21;
	const sinsqD31_2 = 2 * sinD31 * sinD31;
	const sinsqD32_2 = 2 * sinD32 * sinD32;

	const triple_sin = sinD21 * sinD31 * sinD32; // --- Calculate 4 Key Probabilities using Matter Effective Quantities ---
	const Pme_CPC =
		(Vt3sq - Um2sq * Ve1sq - Um1sq * Ve2sq) * sinsqD21_2 +
		(Vt2sq - Um3sq * Ve1sq - Um1sq * Ve3sq) * sinsqD31_2 +
		(Vt1sq - Um3sq * Ve2sq - Um2sq * Ve3sq) * sinsqD32_2;
	const Pme_CPV = -Jmatter * triple_sin; // CPV term (sign included in Jmatter via Jvac_factor)

	const Pmm =
		1 -
		2 *
			(Um1sq * Um2sq * sinsqD21_2 +
				Um1sq * Um3sq * sinsqD31_2 +
				Um2sq * Um3sq * sinsqD32_2);
	const Pee =
		1 -
		2 *
			(Ve1sq * Ve2sq * sinsqD21_2 +
				Ve1sq * Ve3sq * sinsqD31_2 +
				Ve2sq * Ve3sq * sinsqD32_2);

	// --- Construct Final Probability Matrix using unitarity ---
	const probs_returned: number[][] = [
		[0, 0, 0],
		[0, 0, 0],
		[0, 0, 0],
	];

	probs_returned[0][0] = Pee;
	probs_returned[0][1] = Pme_CPC - Pme_CPV; // Pem (T-conjugate flips CPV sign)
	probs_returned[0][2] = 1 - Pee - probs_returned[0][1]; // Pet

	probs_returned[1][0] = Pme_CPC + Pme_CPV; // Pme
	probs_returned[1][1] = Pmm;
	probs_returned[1][2] = 1 - probs_returned[1][0] - Pmm; // Pmt

	probs_returned[2][0] = 1 - Pee - probs_returned[1][0]; // Pte
	probs_returned[2][1] = 1 - probs_returned[0][1] - Pmm; // Ptm
	probs_returned[2][2] = 1 - probs_returned[0][2] - probs_returned[1][2]; // Ptt

	// --- Final Clamping & Normalization ---
	for (let i = 0; i < 3; i++) {
		let rowSumCheck = 0;
		for (let j = 0; j < 3; j++) {
			probs_returned[i][j] = Math.max(0, Math.min(1, probs_returned[i][j]));
			rowSumCheck += probs_returned[i][j];
		}
		// Normalize row if sum is slightly off and non-zero
		if (rowSumCheck > 1e-9 && Math.abs(rowSumCheck - 1.0) > 1e-9) {
			// console.warn(`Row ${i} sum after clamp: ${rowSumCheck}, normalizing.`);
			for (let j = 0; j < 3; j++) {
				probs_returned[i][j] /= rowSumCheck;
			}
		} else if (rowSumCheck <= 1e-9) {
			// Prevent any row from having all zero probabilities
			// Default to diagonal element being 1 if everything sums to ~0
			probs_returned[i][i] = 1.0;
			for (let j = 0; j < 3; j++) {
				if (i !== j) probs_returned[i][j] = 0.0;
			}
		}
	}

	return probs_returned as ProbabilityMatrix;
}

/**
 * Main exported function. Calls the appropriate vacuum or matter calculation.
 *
 * @param params - Object containing all necessary oscillation parameters.
 * @returns A 3x3 matrix where ProbabilityMatrix[alpha][beta] = P(nu_alpha -> nu_beta).
 */
export function calculateNuFastProbs(
	params: Readonly<OscillationParameters>,
): ProbabilityMatrix {
	// --- Input Validation ---
	// Check for NaN or invalid parameters *including calculated ones*
	const isValid =
		!isNaN(params.E) &&
		Math.abs(params.E) > 1e-12 && // Check E is valid and non-zero
		!isNaN(params.L) &&
		params.L >= 0 &&
		!isNaN(params.s12sq) &&
		params.s12sq >= 0 &&
		params.s12sq <= 1 &&
		!isNaN(params.s13sq) &&
		params.s13sq >= 0 &&
		params.s13sq <= 1 &&
		!isNaN(params.s23sq) &&
		params.s23sq >= 0 &&
		params.s23sq <= 1 &&
		!isNaN(params.dm21sq) &&
		!isNaN(params.dm31sq) &&
		!isNaN(params.deltaCP_rad) &&
		(!params.matterEffect || (!isNaN(params.rho) && !isNaN(params.Ye)));

	if (!isValid) {
		// console.warn("calculateNuFastProbs received invalid parameters. Returning identity matrix.", JSON.stringify(params));
		return [
			[1, 0, 0],
			[0, 1, 0],
			[0, 0, 1],
		];
	}

	if (!params.matterEffect || Math.abs(params.rho) < 1e-9) {
		// --- Call Vacuum Calculation ---
		// Parameters are already validated
		return probabilityVacuumLBL(
			params.s12sq,
			params.s13sq,
			params.s23sq,
			params.deltaCP_rad,
			params.dm21sq,
			params.dm31sq,
			params.L,
			params.E,
		);
	} else {
		// --- Call Matter Calculation ---
		// Parameters are already validated
		return probabilityMatterLBL(
			params.s12sq,
			params.s13sq,
			params.s23sq,
			params.deltaCP_rad,
			params.dm21sq,
			params.dm31sq,
			params.L,
			params.E,
			params.rho,
			params.Ye,
			params.N_Newton ?? 0, // Provide default value 0 if undefined
		);
	}
}

/**
 * Extracts the relevant row from the full probability matrix for a given initial flavor.
 *
 * @param params - Object containing all necessary oscillation parameters, including initialFlavorIndex.
 * @returns A 3-element array representing [P(alpha->e), P(alpha->mu), P(alpha->tau)].
 */
export function getProbabilitiesForInitialFlavor(
	params: Readonly<OscillationParameters>,
): ProbabilityVector {
	// --- Guard against E near zero ---
	if (Math.abs(params.E) < 1e-9) {
		// console.warn("Energy is near zero (< 1e-9), returning default probabilities based on initial flavor.");
		const defaultProbs: ProbabilityVector = [0, 0, 0];
		if (params.initialFlavorIndex >= 0 && params.initialFlavorIndex <= 2) {
			defaultProbs[params.initialFlavorIndex] = 1.0;
		}
		return defaultProbs;
	}

	// Calculate the full 3x3 probability matrix
	const probMatrix = calculateNuFastProbs(params);

	// Extract the row corresponding to the initial flavor
	const initialFlavorIndex = params.initialFlavorIndex;
	if (initialFlavorIndex < 0 || initialFlavorIndex > 2) {
		console.error(`Invalid initialFlavorIndex: ${initialFlavorIndex}`);
		return [NaN, NaN, NaN]; // Return NaN if index is invalid
	}

	// Return the specific row as a ProbabilityVector
	return probMatrix[initialFlavorIndex] as ProbabilityVector;
}
