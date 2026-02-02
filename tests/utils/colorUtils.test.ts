import { describe, expect, it } from "vitest";
import type { ProbabilityVector } from "../../src/physics/types";
import {
	FLAVOR_COLORS,
	blendNeutrinoColors,
	getDominantFlavor,
	rgbToHex,
	rgbToString,
} from "../../src/utils/colorUtils";

describe("colorUtils", () => {
	describe("blendNeutrinoColors", () => {
		it("should blend colors correctly for pure electron neutrino", () => {
			const probs: ProbabilityVector = [1, 0, 0];
			const result = blendNeutrinoColors(probs);
			expect(result).toEqual(FLAVOR_COLORS.electron);
		});

		it("should blend colors correctly for pure muon neutrino", () => {
			const probs: ProbabilityVector = [0, 1, 0];
			const result = blendNeutrinoColors(probs);
			expect(result).toEqual(FLAVOR_COLORS.muon);
		});

		it("should blend colors correctly for pure tau neutrino", () => {
			const probs: ProbabilityVector = [0, 0, 1];
			const result = blendNeutrinoColors(probs);
			expect(result).toEqual(FLAVOR_COLORS.tau);
		});

		it("should blend colors correctly for equal probabilities", () => {
			const probs: ProbabilityVector = [0.33, 0.33, 0.34];
			const result = blendNeutrinoColors(probs);
			expect(result).toEqual({
				r: Math.round(0.33 * 0 + 0.33 * 0 + 0.34 * 255),
				g: Math.round(0.33 * 255 + 0.33 * 0 + 0.34 * 0),
				b: Math.round(0.33 * 0 + 0.33 * 255 + 0.34 * 0),
			});
		});

		it("should normalize probabilities that don't sum to 1", () => {
			const probs: ProbabilityVector = [0.5, 0.3, 0.1];
			const result = blendNeutrinoColors(probs);
			const sum = 0.5 + 0.3 + 0.1;
			expect(result).toEqual({
				r: Math.round((0.5 / sum) * 0 + (0.3 / sum) * 0 + (0.1 / sum) * 255),
				g: Math.round((0.5 / sum) * 0 + (0.3 / sum) * 255 + (0.1 / sum) * 0),
				b: Math.round((0.5 / sum) * 255 + (0.3 / sum) * 0 + (0.1 / sum) * 0),
			});
		});
	});

	describe("rgbToString", () => {
		it("should convert RGB to CSS string", () => {
			expect(rgbToString({ r: 255, g: 0, b: 0 })).toBe("rgb(255, 0, 0)");
			expect(rgbToString({ r: 0, g: 255, b: 0 })).toBe("rgb(0, 255, 0)");
			expect(rgbToString({ r: 0, g: 0, b: 255 })).toBe("rgb(0, 0, 255)");
		});
	});

	describe("rgbToHex", () => {
		it("should convert RGB to hex string", () => {
			expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe("#ff0000");
			expect(rgbToHex({ r: 0, g: 255, b: 0 })).toBe("#00ff00");
			expect(rgbToHex({ r: 0, g: 0, b: 255 })).toBe("#0000ff");
			expect(rgbToHex({ r: 17, g: 170, b: 187 })).toBe("#11aabb");
		});
	});

	describe("getDominantFlavor", () => {
		it("should identify electron as dominant", () => {
			expect(getDominantFlavor([0.6, 0.3, 0.1])).toBe("electron");
			expect(getDominantFlavor([0.4, 0.3, 0.3])).toBe("electron");
		});

		it("should identify muon as dominant", () => {
			expect(getDominantFlavor([0.3, 0.6, 0.1])).toBe("muon");
			expect(getDominantFlavor([0.3, 0.4, 0.3])).toBe("muon");
		});

		it("should identify tau as dominant", () => {
			expect(getDominantFlavor([0.1, 0.3, 0.6])).toBe("tau");
			expect(getDominantFlavor([0.3, 0.3, 0.4])).toBe("tau");
		});

		it("should return first flavor when probabilities are equal", () => {
			expect(getDominantFlavor([0.33, 0.33, 0.34])).toBe("tau");
			expect(getDominantFlavor([0.5, 0.5, 0])).toBe("electron");
		});
	});
});
