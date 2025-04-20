import { describe, it, expect } from "vitest";
import {
	blendNeutrinoColors,
	rgbToString,
	rgbToHex,
	getDominantFlavor,
} from "../../src/utils/colorUtils";
import { ProbabilityVector } from "../../src/physics/types";

describe("colorUtils", () => {
	describe("blendNeutrinoColors", () => {
		it("should blend colors based on probability vector", () => {
			// Pure electron neutrino (100% electron flavor)
			const electronProbs: ProbabilityVector = [1, 0, 0];
			const electronColor = blendNeutrinoColors(electronProbs);
			expect(electronColor.r).toBe(30);
			expect(electronColor.g).toBe(144);
			expect(electronColor.b).toBe(255);

			// Pure muon neutrino (100% muon flavor)
			const muonProbs: ProbabilityVector = [0, 1, 0];
			const muonColor = blendNeutrinoColors(muonProbs);
			expect(muonColor.r).toBe(255);
			expect(muonColor.g).toBe(140);
			expect(muonColor.b).toBe(0);

			// Pure tau neutrino (100% tau flavor)
			const tauProbs: ProbabilityVector = [0, 0, 1];
			const tauColor = blendNeutrinoColors(tauProbs);
			expect(tauColor.r).toBe(255);
			expect(tauColor.g).toBe(0);
			expect(tauColor.b).toBe(255);

			// 50% electron, 50% muon
			const mixedProbs: ProbabilityVector = [0.5, 0.5, 0];
			const mixedColor = blendNeutrinoColors(mixedProbs);
			expect(mixedColor.r).toBe(Math.round(0.5 * 30 + 0.5 * 255));
			expect(mixedColor.g).toBe(Math.round(0.5 * 144 + 0.5 * 140));
			expect(mixedColor.b).toBe(Math.round(0.5 * 255 + 0.5 * 0));
		});

		it("should normalize probabilities that do not sum to 1", () => {
			// Probabilities summing to 0.9
			const lowProbs: ProbabilityVector = [0.3, 0.3, 0.3];
			const lowColor = blendNeutrinoColors(lowProbs);

			// Should be the same as normalized probabilities [1/3, 1/3, 1/3]
			const normalizedProbs: ProbabilityVector = [1 / 3, 1 / 3, 1 / 3];
			const normalizedColor = blendNeutrinoColors(normalizedProbs);

			expect(lowColor.r).toBe(normalizedColor.r);
			expect(lowColor.g).toBe(normalizedColor.g);
			expect(lowColor.b).toBe(normalizedColor.b);
		});
	});

	describe("rgbToString", () => {
		it("should convert RGB color to CSS color string", () => {
			const color = { r: 100, g: 150, b: 200 };
			const result = rgbToString(color);
			expect(result).toBe("rgb(100, 150, 200)");
		});
	});

	describe("rgbToHex", () => {
		it("should convert RGB color to hexadecimal color string", () => {
			const color = { r: 100, g: 150, b: 200 };
			const result = rgbToHex(color);
			expect(result).toBe("#6496c8");

			// Test with single-digit hex values
			const color2 = { r: 10, g: 15, b: 5 };
			const result2 = rgbToHex(color2);
			expect(result2).toBe("#0a0f05");
		});
	});

	describe("getDominantFlavor", () => {
		it("should return electron for highest electron probability", () => {
			const probs: ProbabilityVector = [0.5, 0.3, 0.2];
			const result = getDominantFlavor(probs);
			expect(result).toBe("electron");
		});

		it("should return muon for highest muon probability", () => {
			const probs: ProbabilityVector = [0.3, 0.5, 0.2];
			const result = getDominantFlavor(probs);
			expect(result).toBe("muon");
		});

		it("should return tau for highest tau probability", () => {
			const probs: ProbabilityVector = [0.2, 0.3, 0.5];
			const result = getDominantFlavor(probs);
			expect(result).toBe("tau");
		});

		it("should handle ties by preferring earlier flavors", () => {
			const probs1: ProbabilityVector = [0.4, 0.4, 0.2];
			const result1 = getDominantFlavor(probs1);
			expect(result1).toBe("electron");

			const probs2: ProbabilityVector = [0.3, 0.35, 0.35];
			const result2 = getDominantFlavor(probs2);
			expect(result2).toBe("muon");
		});
	});
});
