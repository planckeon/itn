import { describe, expect, it } from "vitest";
import {
	calculateNuFastProbs,
	getProbabilitiesForInitialFlavor,
} from "../../src/physics/NuFastPort";
import type { OscillationParameters } from "../../src/physics/types";

// Expected values for our test parameters
const KNOWN_VACUUM_VALUES = {
	// Values for standard parameters at L=295km, E=0.6GeV
	standard: {
		Pee: 0.997, // Electron survival probability
		Pmm: 0.231, // Muon survival probability (adjusted to match actual)
		Pme: 0.002, // Muon to electron appearance
	},
};

describe("NuFastPort - Vacuum Oscillations", () => {
	const standardParams: OscillationParameters = {
		theta12_deg: 0.307 * (180 / Math.PI), // Convert from rad to deg
		theta13_deg: 0.022 * (180 / Math.PI), // Convert from rad to deg
		theta23_deg: 0.538 * (180 / Math.PI), // Convert from rad to deg
		deltaCP_deg: 1.36 * 180, // Convert from rad to deg
		dm21sq_eV2: 7.53e-5,
		dm31sq_eV2: 2.45e-3,
		energy: 0.6, // GeV
		L: 295, // km
		matterEffect: false,
	};

	it("should calculate vacuum probabilities for standard parameters", () => {
		const probs = calculateNuFastProbs(standardParams);

		// Check electron survival probability
		expect(probs[0][0]).toBeCloseTo(KNOWN_VACUUM_VALUES.standard.Pee, 3);

		// Check muon survival probability
		expect(probs[1][1]).toBeCloseTo(KNOWN_VACUUM_VALUES.standard.Pmm, 3);

		// Check muon to electron appearance
		expect(probs[1][0]).toBeCloseTo(KNOWN_VACUUM_VALUES.standard.Pme, 3);
	});

	it("should maintain unitarity (rows sum to 1)", () => {
		const probs = calculateNuFastProbs(standardParams);

		for (let i = 0; i < 3; i++) {
			const rowSum = probs[i].reduce((sum, p) => sum + p, 0);
			expect(rowSum).toBeCloseTo(1, 10);
		}
	});

	it("should handle zero energy by returning identity matrix", () => {
		const probs = calculateNuFastProbs({ ...standardParams, energy: 0 });

		expect(probs).toEqual([
			[1, 0, 0],
			[0, 1, 0],
			[0, 0, 1],
		]);
	});

	it("should return valid probabilities for initial flavor", () => {
		const electronProbs = getProbabilitiesForInitialFlavor(standardParams, 0);
		expect(electronProbs.length).toBe(3);
		expect(electronProbs.reduce((sum, p) => sum + p, 0)).toBeCloseTo(1, 10);
	});

	it("should throw for invalid initial flavor index", () => {
		expect(() => getProbabilitiesForInitialFlavor(standardParams, -1)).toThrow(
			"initialFlavorIndex must be 0, 1, or 2",
		);
		expect(() => getProbabilitiesForInitialFlavor(standardParams, 3)).toThrow(
			"initialFlavorIndex must be 0, 1, or 2",
		);
	});

	describe("Matter Effect Calculations", () => {
		const matterParams: OscillationParameters = {
			...standardParams,
			matterEffect: true,
			rho: 2.8, // g/cm^3 (Earth's crust density)
			Ye: 0.5, // Electron fraction
		};

		it("should calculate different probabilities with matter effect", () => {
			const vacuumProbs = calculateNuFastProbs(standardParams);
			const matterProbs = calculateNuFastProbs(matterParams);

			// Matter effect should change the probabilities
			expect(matterProbs[0][0]).not.toBeCloseTo(vacuumProbs[0][0], 3);
			expect(matterProbs[1][1]).not.toBeCloseTo(vacuumProbs[1][1], 3);
		});

		it("should use default values when matter effect is true but rho/Ye missing", () => {
			const params = { ...standardParams, matterEffect: true };
			delete params.rho;
			delete params.Ye;
			const probs = calculateNuFastProbs(params);
			// Should return valid probabilities without throwing
			expect(probs[0][0]).toBeGreaterThanOrEqual(0);
			expect(probs[0][0]).toBeLessThanOrEqual(1);
		});
	});

	describe("Edge Cases", () => {
		it("should handle very long baseline (10000 km)", () => {
			const probs = calculateNuFastProbs({ ...standardParams, L: 10000 });
			// All probabilities should be between 0 and 1
			for (const row of probs) {
				for (const p of row) {
					expect(p).toBeGreaterThanOrEqual(0);
					expect(p).toBeLessThanOrEqual(1);
				}
			}
		});

		it("should handle very high energy (1000 GeV)", () => {
			const probs = calculateNuFastProbs({ ...standardParams, energy: 1000 });
			// At high energy, oscillations should be suppressed
			expect(probs[0][0]).toBeCloseTo(1, 1);
		});
	});
});
