import { describe, it, expect } from "vitest";
import {
	degToRad,
	radToDeg,
	lerp,
	clamp,
	formatNumber,
	formatScientific,
	linspace,
} from "../../src/utils/mathUtils";

describe("mathUtils", () => {
	describe("degToRad", () => {
		it("should convert degrees to radians", () => {
			expect(degToRad(0)).toBeCloseTo(0);
			expect(degToRad(90)).toBeCloseTo(Math.PI / 2);
			expect(degToRad(180)).toBeCloseTo(Math.PI);
			expect(degToRad(360)).toBeCloseTo(2 * Math.PI);
			expect(degToRad(-90)).toBeCloseTo(-Math.PI / 2);
		});
	});

	describe("radToDeg", () => {
		it("should convert radians to degrees", () => {
			expect(radToDeg(0)).toBeCloseTo(0);
			expect(radToDeg(Math.PI / 2)).toBeCloseTo(90);
			expect(radToDeg(Math.PI)).toBeCloseTo(180);
			expect(radToDeg(2 * Math.PI)).toBeCloseTo(360);
			expect(radToDeg(-Math.PI / 2)).toBeCloseTo(-90);
		});
	});

	describe("lerp", () => {
		it("should linearly interpolate between two values", () => {
			expect(lerp(0, 10, 0)).toBe(0);
			expect(lerp(0, 10, 1)).toBe(10);
			expect(lerp(0, 10, 0.5)).toBe(5);
			expect(lerp(10, 20, 0.25)).toBe(12.5);
			expect(lerp(-10, 10, 0.5)).toBe(0);
		});

		it("should handle t values outside the range [0, 1]", () => {
			expect(lerp(0, 10, -1)).toBe(-10);
			expect(lerp(0, 10, 2)).toBe(20);
		});
	});

	describe("clamp", () => {
		it("should limit a value between min and max", () => {
			expect(clamp(5, 0, 10)).toBe(5);
			expect(clamp(-5, 0, 10)).toBe(0);
			expect(clamp(15, 0, 10)).toBe(10);
			expect(clamp(0, 0, 10)).toBe(0);
			expect(clamp(10, 0, 10)).toBe(10);
		});
	});

	describe("formatNumber", () => {
		it("should format a number with the specified number of decimal places", () => {
			expect(formatNumber(12.3456)).toBe("12.35");
			expect(formatNumber(12.3456, 3)).toBe("12.346");
			expect(formatNumber(12, 2)).toBe("12.00");
			expect(formatNumber(-5.678, 1)).toBe("-5.7");
		});
	});

	describe("formatScientific", () => {
		it("should format large numbers in scientific notation", () => {
			expect(formatScientific(12345, 2, 1e4)).toBe("1.23e+4");
			// Corrected expectation: 9876 is < 1e4, so it should use toFixed()
			expect(formatScientific(9876, 2, 1e4)).toBe("9876.00");
		});

		it("should format small numbers in scientific notation", () => {
			expect(formatScientific(0.0001, 2)).toBe("1.00e-4");
			expect(formatScientific(0.000567, 2)).toMatch(/5.67e-4/);
		});

		it("should format numbers within threshold range normally", () => {
			expect(formatScientific(123.456, 2, 1e4)).toBe("123.46");
			expect(formatScientific(0.123, 2, 1e4)).toBe("0.12");
		});
	});

	describe("linspace", () => {
		it("should create an array of evenly spaced values", () => {
			const result1 = linspace(0, 10, 11);
			expect(result1.length).toBe(11);
			expect(result1[0]).toBe(0);
			expect(result1[10]).toBe(10);
			expect(result1[5]).toBe(5);

			const result2 = linspace(-1, 1, 5);
			expect(result2.length).toBe(5);
			expect(result2[0]).toBe(-1);
			expect(result2[4]).toBe(1);
			expect(result2[2]).toBe(0);
		});

		it("should handle single point case", () => {
			const result = linspace(5, 5, 1);
			expect(result.length).toBe(1);
			expect(result[0]).toBe(5);
		});
	});
});
