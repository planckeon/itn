import { describe, expect, it } from "vitest";
import {
	clamp,
	degToRad,
	formatNumber,
	formatScientific,
	lerp,
	linspace,
	radToDeg,
} from "../../src/utils/mathUtils";

describe("mathUtils", () => {
	describe("degToRad", () => {
		it("should convert degrees to radians", () => {
			expect(degToRad(0)).toBe(0);
			expect(degToRad(90)).toBeCloseTo(Math.PI / 2);
			expect(degToRad(180)).toBeCloseTo(Math.PI);
			expect(degToRad(360)).toBeCloseTo(2 * Math.PI);
		});
	});

	describe("radToDeg", () => {
		it("should convert radians to degrees", () => {
			expect(radToDeg(0)).toBe(0);
			expect(radToDeg(Math.PI / 2)).toBeCloseTo(90);
			expect(radToDeg(Math.PI)).toBeCloseTo(180);
			expect(radToDeg(2 * Math.PI)).toBeCloseTo(360);
		});
	});

	describe("lerp", () => {
		it("should linearly interpolate between values", () => {
			expect(lerp(0, 10, 0)).toBe(0);
			expect(lerp(0, 10, 0.5)).toBe(5);
			expect(lerp(0, 10, 1)).toBe(10);
			expect(lerp(10, 20, 0.25)).toBe(12.5);
		});

		it("should handle t values outside 0-1 range", () => {
			expect(lerp(0, 10, -0.5)).toBe(-5);
			expect(lerp(0, 10, 1.5)).toBe(15);
		});
	});

	describe("clamp", () => {
		it("should clamp values within range", () => {
			expect(clamp(5, 0, 10)).toBe(5);
			expect(clamp(-1, 0, 10)).toBe(0);
			expect(clamp(11, 0, 10)).toBe(10);
		});

		it("should handle inverted min/max by using them as bounds", () => {
			expect(clamp(5, 10, 0)).toBe(10); // 5 is clamped to upper bound 10
			expect(clamp(-1, 10, 0)).toBe(10); // -1 is clamped to upper bound 10
			expect(clamp(11, 10, 0)).toBe(10); // 11 is clamped to upper bound 10
		});
	});

	describe("formatNumber", () => {
		it("should format numbers with specified decimals", () => {
			expect(formatNumber(1.23456)).toBe("1.23");
			expect(formatNumber(1.23456, 0)).toBe("1");
			expect(formatNumber(1.23456, 4)).toBe("1.2346");
			expect(formatNumber(123.456)).toBe("123.46");
		});

		it("should handle edge cases", () => {
			expect(formatNumber(0)).toBe("0.00");
			expect(formatNumber(Number.NaN)).toBe("NaN");
			expect(formatNumber(Number.POSITIVE_INFINITY)).toBe("Infinity");
		});
	});

	describe("formatScientific", () => {
		it("should use standard notation for normal numbers", () => {
			expect(formatScientific(123.456)).toBe("123.46");
			expect(formatScientific(0.123)).toBe("0.12");
		});

		it("should use scientific notation for large numbers", () => {
			expect(formatScientific(123456)).toBe("1.23e+5");
			expect(formatScientific(0.000123)).toBe("1.23e-4");
		});

		it("should respect custom threshold", () => {
			expect(formatScientific(500, 2, 1000)).toBe("500.00");
			expect(formatScientific(5000, 2, 1000)).toBe("5.00e+3");
		});
	});

	describe("linspace", () => {
		it("should generate evenly spaced numbers", () => {
			expect(linspace(0, 10, 5)).toEqual([0, 2.5, 5, 7.5, 10]);
			expect(linspace(1, 2, 3)).toEqual([1, 1.5, 2]);
		});

		it("should handle single point", () => {
			expect(linspace(5, 5, 1)).toEqual([5]);
		});

		it("should return empty array for invalid num", () => {
			expect(linspace(0, 10, 0)).toEqual([]);
			expect(linspace(0, 10, -1)).toEqual([]);
		});
	});
});
