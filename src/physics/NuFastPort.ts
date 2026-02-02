// src/physics/NuFastPort.ts

import type {
	OscillationParameters,
	ProbabilityMatrix,
	ProbabilityVector,
} from "./types";

import { EV_SQ_KM_TO_GEV_OVER4, YerhoE2A } from "./constants";

/**
 * Converts user-facing oscillation parameters to the internal format used by NuFast calculations.
 * Moved here to avoid importing mathjs via neutrinoPhysics.ts
 */
function convertToNuFastParams(params: OscillationParameters) {
	return {
		E: params.energy,
		L: params.L,
		s12sq: Math.sin((params.theta12_deg * Math.PI) / 180) ** 2,
		s13sq: Math.sin((params.theta13_deg * Math.PI) / 180) ** 2,
		s23sq: Math.sin((params.theta23_deg * Math.PI) / 180) ** 2,
		deltaCP_rad: (params.deltaCP_deg * Math.PI) / 180,
		dm21sq: params.dm21sq_eV2,
		dm31sq: params.dm31sq_eV2,
		rho: params.rho,
		Ye: params.Ye,
		initialFlavorIndex: params.initialFlavorIndex,
		matterEffect: params.matterEffect,
	};
}

/**
 * Calculates oscillation probabilities in vacuum.
 * Based on NuFast C++ Probability_Vacuum_LBL.
 */
function _probabilityVacuumLBL(
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
	const temp_Ut2sq = s13sq * s12sq * s23sq;
	const temp_Um2sq = (1 - s12sq) * (1 - s23sq);
	const Jrr = Math.sqrt(Math.max(0, temp_Um2sq * temp_Ut2sq));
	const Um2sq = temp_Um2sq + temp_Ut2sq - 2 * Jrr * cosd;
	const Jvac = 8 * Jrr * c13sq * sind;

	// Get all elements of Usq using unitarity
	const Ue1sq = 1 - Ue3sq - Ue2sq;
	const Um1sq = 1 - Um3sq - Um2sq;

	// Get kinematic terms
	const absE = Math.abs(E);
	const Lover4E = (EV_SQ_KM_TO_GEV_OVER4 * L) / absE;
	const D21 = Dmsq21 * Lover4E;
	const D31 = Dmsq31 * Lover4E;
	const D32 = D31 - D21;

	const sinD21 = Math.sin(D21);
	const sinD31 = Math.sin(D31);
	const sinD32 = Math.sin(D32);
	const triple_sin = sinD21 * sinD31 * sinD32;

	// Use 2*sin^2(X) = 1 - cos(2X)
	const sinsqD21_2 = 2 * sinD21 * sinD21;
	const sinsqD31_2 = 2 * sinD31 * sinD31;
	const sinsqD32_2 = 2 * sinD32 * sinD32;

	// Calculate probabilities
	const Pme_CPC =
		(1 - Um3sq - Ue3sq - Um2sq * Ue1sq - Um1sq * Ue2sq) * sinsqD21_2 +
		(1 - Um2sq - Ue2sq - Um3sq * Ue1sq - Um1sq * Ue3sq) * sinsqD31_2 +
		(1 - Um1sq - Ue1sq - Um3sq * Ue2sq - Um2sq * Ue3sq) * sinsqD32_2;

	const Pme_CPV = -Jvac * triple_sin * (E >= 0 ? 1 : -1);
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

	// Build probability matrix
	const probs: ProbabilityMatrix = [
		[Pee, Pme_CPC - Pme_CPV, 1 - Pee - (Pme_CPC - Pme_CPV)],
		[Pme_CPC + Pme_CPV, Pmm, 1 - (Pme_CPC + Pme_CPV) - Pmm],
		[1 - Pee - (Pme_CPC + Pme_CPV), 1 - (Pme_CPC - Pme_CPV) - Pmm, 0],
	];

	// Clamp probabilities to [0,1]
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			probs[i][j] = Math.max(0, Math.min(1, probs[i][j]));
		}
		// Ensure row sums to 1
		const sum = probs[i].reduce((a, b) => a + b, 0);
		if (Math.abs(sum - 1) > 1e-6) {
			probs[i] = probs[i].map((v) => v / sum) as ProbabilityVector;
		}
	}

	return probs;
}

/**
 * Calculates oscillation probabilities in matter.
 * Based on NuFast C++ Probability_Matter_LBL.
 */
function _probabilityMatterLBL(
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
): ProbabilityMatrix {
	// --- Pre-calculate Basic Parameters ---
	const c13sq = 1 - s13sq;

	// Matter Potential
	const Amatter = Ye * rho * E * YerhoE2A;
	const Dmsqee = Dmsq31 - s12sq * Dmsq21;

	// Avoid division by zero if Dmsqee is zero when matter potential is non-zero
	const Dmsqee_safe =
		Math.abs(Amatter) > 1e-30 && Math.abs(Dmsqee) < 1e-30
			? (Dmsqee >= 0 ? 1 : -1) * 1e-30
			: Dmsqee;

	// Calculate effective mixing parameters in matter
	const alpha = Dmsq21 / Dmsqee_safe;
	const a = Amatter / Dmsqee_safe;

	// Convert mixing angles to radians for calculations
	const theta12 = Math.asin(Math.sqrt(s12sq));
	const theta13 = Math.asin(Math.sqrt(s13sq));

	// Effective mixing angles in matter
	const s12sq_m =
		(s12sq * Math.pow(Math.cos(2 * theta13) - a / c13sq, 2)) /
		(Math.pow(Math.cos(2 * theta12) - a / c13sq, 2) +
			alpha * alpha * s12sq * s12sq);
	const s13sq_m = s13sq * (1 + a / (Dmsqee_safe * c13sq));
	const delta_m =
		delta +
		Math.atan((alpha * s12sq * s12sq) / (Math.cos(2 * theta12) - a / c13sq));

	// Calculate and return probabilities with matter effects
	return _probabilityVacuumLBL(
		s12sq_m,
		s13sq_m,
		s23sq,
		delta_m,
		Dmsq21,
		Dmsq31,
		L,
		E,
	);
}

/**
 * Main entry point for neutrino oscillation calculations
 */
export function calculateNuFastProbs(
	params: OscillationParameters,
): ProbabilityMatrix {
	const {
		s12sq,
		s13sq,
		s23sq,
		deltaCP_rad: delta,
		dm21sq: Dmsq21,
		dm31sq: Dmsq31,
		E,
		L,
		rho = 0,
		Ye = 0,
		matterEffect = false,
	} = convertToNuFastParams(params);

	if (matterEffect && (rho === undefined || Ye === undefined)) {
		throw new Error("Matter effect requires both rho and Ye parameters");
	}

	if (Math.abs(E) < 1e-12) {
		return [
			[1, 0, 0],
			[0, 1, 0],
			[0, 0, 1],
		];
	}

	if (!matterEffect || Math.abs(rho) < 1e-9) {
		return _probabilityVacuumLBL(
			s12sq,
			s13sq,
			s23sq,
			delta,
			Dmsq21,
			Dmsq31,
			L,
			E,
		);
	}

	return _probabilityMatterLBL(
		s12sq,
		s13sq,
		s23sq,
		delta,
		Dmsq21,
		Dmsq31,
		L,
		E,
		rho,
		Ye,
	);
}

/**
 * Gets probabilities for specific initial flavor
 */
export function getProbabilitiesForInitialFlavor(
	params: OscillationParameters,
	initialFlavorIndex = 0,
): ProbabilityVector {
	if (initialFlavorIndex < 0 || initialFlavorIndex > 2) {
		throw new Error("initialFlavorIndex must be 0, 1, or 2");
	}

	const probMatrix = calculateNuFastProbs(params);
	return probMatrix[initialFlavorIndex];
}
