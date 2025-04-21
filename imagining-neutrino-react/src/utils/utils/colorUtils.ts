/**
 * Color utilities for the neutrino oscillation visualization.
 * These functions handle the blending of neutrino flavor colors based on probabilities.
 */

import type { ProbabilityVector } from "../physics/types";

// RGB color values for each neutrino flavor
export const FLAVOR_COLORS = {
	// Blue for electron neutrino
	electron: { r: 0, g: 0, b: 255 }, // Updated to pure blue
	// Green for muon neutrino
	muon: { r: 0, g: 255, b: 0 }, // Updated to pure green
	// Red for tau neutrino
	tau: { r: 255, g: 0, b: 0 }, // Updated to pure red
};

/**
 * Simple RGB color representation
 */
export interface RGBColor {
	r: number;
	g: number;
	b: number;
}

/**
 * Blend multiple colors according to their weights (probabilities)
 *
 * @param probabilities - Vector of 3 probabilities [P_e, P_μ, P_τ]
 * @returns RGB color object for the blended color
 */
export function blendNeutrinoColors(
	probabilities: ProbabilityVector,
): RGBColor {
	// Extract individual flavor probabilities
	const [p_e, p_mu, p_tau] = probabilities;

	// Ensure probabilities sum to 1 (within numerical precision)
	const sum = p_e + p_mu + p_tau;
	const normalizedProbs =
		sum > 0.999 && sum < 1.001
			? probabilities
			: [p_e / sum, p_mu / sum, p_tau / sum];

	// Calculate the weighted average of each RGB component
	const r = Math.round(
		normalizedProbs[0] * FLAVOR_COLORS.electron.r +
			normalizedProbs[1] * FLAVOR_COLORS.muon.r +
			normalizedProbs[2] * FLAVOR_COLORS.tau.r,
	);

	const g = Math.round(
		normalizedProbs[0] * FLAVOR_COLORS.electron.g +
			normalizedProbs[1] * FLAVOR_COLORS.muon.g +
			normalizedProbs[2] * FLAVOR_COLORS.tau.g,
	);

	const b = Math.round(
		normalizedProbs[0] * FLAVOR_COLORS.electron.b +
			normalizedProbs[1] * FLAVOR_COLORS.muon.b +
			normalizedProbs[2] * FLAVOR_COLORS.tau.b,
	);

	return { r, g, b };
}

/**
 * Convert a RGB color to a CSS color string
 *
 * @param color - RGB color object
 * @returns CSS color string (e.g., 'rgb(255, 0, 0)')
 */
export function rgbToString(color: RGBColor): string {
	return `rgb(${color.r}, ${color.g}, ${color.b})`;
}

/**
 * Convert a RGB color to a hexadecimal color string
 *
 * @param color - RGB color object
 * @returns Hexadecimal color string (e.g., '#ff0000')
 */
export function rgbToHex(color: RGBColor): string {
	const toHex = (value: number) => {
		const hex = Math.round(value).toString(16);
		return hex.length === 1 ? `0${hex}` : hex;
	};

	return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}

/**
 * Determine which neutrino flavor has the highest probability
 *
 * @param probabilities - Vector of 3 probabilities [P_e, P_μ, P_τ]
 * @returns The name of the dominant flavor ('electron', 'muon', or 'tau')
 */
export function getDominantFlavor(
	probabilities: ProbabilityVector,
): "electron" | "muon" | "tau" {
	const [p_e, p_mu, p_tau] = probabilities;

	if (p_e >= p_mu && p_e >= p_tau) {
		return "electron";
	} else if (p_mu >= p_e && p_mu >= p_tau) {
		return "muon";
	} else {
		return "tau";
	}
}
