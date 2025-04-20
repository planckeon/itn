/**
 * General math utility functions for the neutrino oscillation visualization.
 */

import { DEG_TO_RAD, RAD_TO_DEG } from "../physics/constants";

/**
 * Convert degrees to radians
 *
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
export function degToRad(degrees: number): number {
	return degrees * DEG_TO_RAD;
}

/**
 * Convert radians to degrees
 *
 * @param radians - Angle in radians
 * @returns Angle in degrees
 */
export function radToDeg(radians: number): number {
	return radians * RAD_TO_DEG;
}

/**
 * Linearly interpolate between two values
 *
 * @param a - Start value
 * @param b - End value
 * @param t - Interpolation factor (0-1)
 * @returns Interpolated value
 */
export function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

/**
 * Clamp a value between min and max
 *
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

/**
 * Format a number with a specific number of decimal places
 *
 * @param value - Number to format
 * @param decimals - Number of decimal places
 * @returns Formatted number as a string
 */
export function formatNumber(value: number, decimals: number = 2): string {
	return value.toFixed(decimals);
}

/**
 * Format a large number using scientific notation if needed
 *
 * @param value - Number to format
 * @param decimals - Number of decimal places
 * @param threshold - Threshold to switch to scientific notation
 * @returns Formatted number as a string
 */
export function formatScientific(
	value: number,
	decimals: number = 2,
	threshold: number = 1e4,
): string {
	// Use scientific notation if >= threshold OR > 0 and < a small fixed threshold (e.g., 1e-3)
	const smallThreshold = 1e-3;
	if (
		Math.abs(value) >= threshold ||
		(Math.abs(value) > 0 && Math.abs(value) < smallThreshold)
	) {
		return value.toExponential(decimals);
	}
	return value.toFixed(decimals);
}

/**
 * Create a sequence of evenly spaced values
 *
 * @param start - Start value (inclusive)
 * @param stop - End value (inclusive)
 * @param num - Number of values to generate
 * @returns Array of evenly spaced values
 */
export function linspace(start: number, stop: number, num: number): number[] {
	if (num <= 0) {
		return [];
	}
	// Handle single point case to avoid division by zero
	if (num === 1) {
		return [start];
	}
	const step = (stop - start) / (num - 1);
	return Array.from({ length: num }, (_, i) => start + step * i);
}
