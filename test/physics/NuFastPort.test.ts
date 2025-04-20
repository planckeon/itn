import { describe, it, expect } from "vitest";
import {
	calculateNuFastProbs,
	getProbabilitiesForInitialFlavor,
} from "../../src/physics/NuFastPort";
import type { OscillationParameters } from "../../src/physics/types";
import { defaultOscParams, PI } from "../../src/physics/constants";
import { degToRad } from "../../src/utils/mathUtils";

// Helper to create full parameters object
const createFullParams = (
	overrides: Partial<
		typeof defaultOscParams & {
			L: number;
			energy: number;
			initialFlavorIndex: 0 | 1 | 2;
		}
	>,
): OscillationParameters => {
	const base = { ...defaultOscParams, ...overrides };
	return {
		...base,
		s12sq: Math.pow(Math.sin(degToRad(base.theta12_deg)), 2),
		s13sq: Math.pow(Math.sin(degToRad(base.theta13_deg)), 2),
		s23sq: Math.pow(Math.sin(degToRad(base.theta23_deg)), 2),
		deltaCP_rad: degToRad(base.deltaCP_deg),
		dm21sq: base.dm21sq_eV2,
		dm31sq: base.dm31sq_eV2,
		L: base.L ?? 0,
		E: base.energy,
		rho: base.rho, // Corrected: Use rho from base object
		Ye: base.Ye,
		matterEffect: base.matterEffect,
		initialFlavorIndex: base.initialFlavorIndex ?? 0, // Ensure initialFlavorIndex is set
		// N_Newton defaults to 0 in NuFastPort
	};
};

describe("NuFastPort Physics Calculations", () => {
	describe("calculateNuFastProbs", () => {
		it("should return identity matrix for L=0", () => {
			const params = createFullParams({ L: 0 });
			const result = calculateNuFastProbs(params);
			expect(result[0][0]).toBeCloseTo(1.0, 6);
			expect(result[1][1]).toBeCloseTo(1.0, 6);
			expect(result[2][2]).toBeCloseTo(1.0, 6);
			expect(result[0][1]).toBeCloseTo(0.0, 6);
			expect(result[0][2]).toBeCloseTo(0.0, 6);
			expect(result[1][0]).toBeCloseTo(0.0, 6);
			expect(result[1][2]).toBeCloseTo(0.0, 6);
			expect(result[2][0]).toBeCloseTo(0.0, 6);
			expect(result[2][1]).toBeCloseTo(0.0, 6);
		});

		it("should return identity matrix for E=0", () => {
			const params = createFullParams({ L: 1000, energy: 0 });
			const result = calculateNuFastProbs(params);
			expect(result[0][0]).toBeCloseTo(1.0, 6);
			expect(result[1][1]).toBeCloseTo(1.0, 6);
			expect(result[2][2]).toBeCloseTo(1.0, 6);
		});

		it("should satisfy unitarity (rows sum to 1)", () => {
			const params = createFullParams({ L: 1300, energy: 2.5 }); // Example DUNE params
			const result = calculateNuFastProbs(params);
			for (let i = 0; i < 3; i++) {
				const rowSum = result[i][0] + result[i][1] + result[i][2];
				expect(rowSum).toBeCloseTo(1.0, 6);
			}
		});

		it("should satisfy unitarity (columns sum to 1)", () => {
			const params = createFullParams({ L: 1300, energy: 2.5 });
			const result = calculateNuFastProbs(params);
			for (let j = 0; j < 3; j++) {
				const colSum = result[0][j] + result[1][j] + result[2][j];
				expect(colSum).toBeCloseTo(1.0, 6);
			}
		});

		it("should show vacuum oscillations (Pme > 0 for L > 0)", () => {
			const params = createFullParams({
				L: 500,
				energy: 1.0,
				matterEffect: false,
				initialFlavorIndex: 1,
			}); // Muon start
			const result = calculateNuFastProbs(params);
			expect(result[1][0]).toBeGreaterThan(1e-6); // P(mu -> e) should be non-zero
		});

		it("should show matter effects (Vacuum != Matter)", () => {
			const vacParams = createFullParams({
				L: 2000,
				energy: 3.0,
				matterEffect: false,
			});
			const matParams = createFullParams({
				L: 2000,
				energy: 3.0,
				matterEffect: true,
				rho: 2.8,
			}); // Corrected: Use rho
			const vacResult = calculateNuFastProbs(vacParams);
			const matResult = calculateNuFastProbs(matParams);
			expect(vacResult[0][0]).not.toBeCloseTo(matResult[0][0], 3);
		});

		it("should handle antineutrinos (E < 0) differently from neutrinos (E > 0) with CPV and Matter", () => {
			const nuParams = createFullParams({
				L: 1300,
				energy: 2.5,
				matterEffect: true,
				rho: 2.8,
				deltaCP_deg: 270,
			}); // Corrected: Use rho
			const antiNuParams = createFullParams({
				L: 1300,
				energy: -2.5,
				matterEffect: true,
				rho: 2.8,
				deltaCP_deg: 270,
			}); // Corrected: Use rho
			const nuResult = calculateNuFastProbs(nuParams);
			const antiNuResult = calculateNuFastProbs(antiNuParams);
			expect(nuResult[1][0]).not.toBeCloseTo(antiNuResult[1][0], 3);
		});

		it("should handle NO vs IO (different dm31sq sign)", () => {
			const noParams = createFullParams({
				L: 1300,
				energy: 2.5,
				matterEffect: true,
				rho: 2.8,
				dm31sq_eV2: 2.507e-3,
			}); // Corrected: Use rho
			const ioParams = createFullParams({
				L: 1300,
				energy: 2.5,
				matterEffect: true,
				rho: 2.8,
				dm31sq_eV2: -2.487e-3,
			}); // Corrected: Use rho
			const noResult = calculateNuFastProbs(noParams);
			const ioResult = calculateNuFastProbs(ioParams);
			expect(noResult[0][0]).not.toBeCloseTo(ioResult[0][0], 3);
		});

		// Re-enable the benchmark test and add plausible range checks
		it("should produce plausible value for T2K-like Pme max", () => {
			// Parameters for T2K approx max Pme
			const t2kParams = createFullParams({
				L: 295,
				energy: 0.6,
				matterEffect: false, // Vacuum approx
				initialFlavorIndex: 1, // Muon start
				// Using default mixing params defined in the test file's helper
			});
			const result = calculateNuFastProbs(t2kParams);
			const Pme = result[1][0]; // P(mu -> e)

			// Check if the result is physically plausible (small, non-zero)
			// The exact max value depends heavily on precise params, esp. deltaCP
			// We expect something roughly around 0.05 based on approximations
			expect(Pme).toBeGreaterThan(0.01); // Should be clearly non-zero
			expect(Pme).toBeLessThan(0.1); // Should not be excessively large
			console.log(
				`Calculated T2K-like P(mu->e) at E=0.6GeV, L=295km (vacuum): ${Pme.toFixed(4)}`,
			);
		});
	});

	describe("getProbabilitiesForInitialFlavor", () => {
		it("should return the correct row from the matrix", () => {
			const params = createFullParams({
				L: 1000,
				energy: 1.0,
				initialFlavorIndex: 1,
			}); // Muon start
			const matrix = calculateNuFastProbs(params);
			// Pass the single params object
			const vector = getProbabilitiesForInitialFlavor(params);
			expect(vector[0]).toBeCloseTo(matrix[1][0], 8);
			expect(vector[1]).toBeCloseTo(matrix[1][1], 8);
			expect(vector[2]).toBeCloseTo(matrix[1][2], 8);
		});

		it("should return vector summing to 1", () => {
			const params = createFullParams({
				L: 1000,
				energy: 1.0,
				initialFlavorIndex: 0,
			}); // Electron start
			// Pass the single params object
			const vector = getProbabilitiesForInitialFlavor(params);
			const sum = vector[0] + vector[1] + vector[2];
			expect(sum).toBeCloseTo(1.0, 6);
		});
	});
});
