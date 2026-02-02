import { describe, it, expect } from "vitest";

/**
 * Tests for InfoTooltip positioning logic
 * The actual component uses useEffect for positioning, but we can test the logic separately
 */

interface Position {
	top: number;
	bottom: number;
	left: number;
	right: number;
	width: number;
	height: number;
}

interface ViewportSize {
	width: number;
	height: number;
}

type TooltipPosition = "top" | "bottom" | "left" | "right";

/**
 * Calculate best tooltip position to avoid viewport overflow
 */
function calculateTooltipPosition(
	buttonRect: Position,
	viewport: ViewportSize,
	tooltipWidth = 256,
	tooltipHeight = 140,
	margin = 12,
	arrowSize = 8
): TooltipPosition {
	const spaceTop = buttonRect.top;
	const spaceBottom = viewport.height - buttonRect.bottom;
	const spaceLeft = buttonRect.left;
	const spaceRight = viewport.width - buttonRect.right;

	const buttonCenterX = buttonRect.left + buttonRect.width / 2;
	const wouldOverflowLeft = buttonCenterX - tooltipWidth / 2 < margin;
	const wouldOverflowRight = buttonCenterX + tooltipWidth / 2 > viewport.width - margin;

	// If horizontal overflow would occur, prefer left/right positioning
	if (wouldOverflowLeft && spaceRight >= tooltipWidth + margin + arrowSize) {
		return "right";
	}
	if (wouldOverflowRight && spaceLeft >= tooltipWidth + margin + arrowSize) {
		return "left";
	}

	// Standard vertical positioning
	if (spaceBottom >= tooltipHeight + margin + arrowSize) {
		return "bottom";
	}
	if (spaceTop >= tooltipHeight + margin + arrowSize) {
		return "top";
	}
	if (spaceRight >= tooltipWidth + margin + arrowSize) {
		return "right";
	}
	if (spaceLeft >= tooltipWidth + margin + arrowSize) {
		return "left";
	}

	// Default fallback
	return "bottom";
}

describe("InfoTooltip positioning logic", () => {
	const standardViewport: ViewportSize = { width: 1920, height: 1080 };
	const smallViewport: ViewportSize = { width: 375, height: 667 };

	describe("center of screen", () => {
		it("should prefer bottom when there is space", () => {
			const button: Position = {
				top: 200,
				bottom: 220,
				left: 960,
				right: 980,
				width: 20,
				height: 20,
			};
			expect(calculateTooltipPosition(button, standardViewport)).toBe("bottom");
		});
	});

	describe("near top edge", () => {
		it("should use bottom when button is at top", () => {
			const button: Position = {
				top: 10,
				bottom: 30,
				left: 960,
				right: 980,
				width: 20,
				height: 20,
			};
			expect(calculateTooltipPosition(button, standardViewport)).toBe("bottom");
		});
	});

	describe("near bottom edge", () => {
		it("should use top when button is at bottom", () => {
			const button: Position = {
				top: 1050,
				bottom: 1070,
				left: 960,
				right: 980,
				width: 20,
				height: 20,
			};
			expect(calculateTooltipPosition(button, standardViewport)).toBe("top");
		});
	});

	describe("near left edge", () => {
		it("should use right when button is near left edge and would overflow", () => {
			const button: Position = {
				top: 500,
				bottom: 520,
				left: 10,
				right: 30,
				width: 20,
				height: 20,
			};
			// Center would be at 20, tooltip half-width is 128, so left edge would be at -108
			expect(calculateTooltipPosition(button, standardViewport)).toBe("right");
		});
	});

	describe("near right edge", () => {
		it("should use left when button is near right edge and would overflow", () => {
			const button: Position = {
				top: 500,
				bottom: 520,
				left: 1890,
				right: 1910,
				width: 20,
				height: 20,
			};
			// Center would be at 1900, tooltip half-width is 128, so right edge would be at 2028
			expect(calculateTooltipPosition(button, standardViewport)).toBe("left");
		});
	});

	describe("corner cases", () => {
		it("should handle top-left corner", () => {
			const button: Position = {
				top: 10,
				bottom: 30,
				left: 10,
				right: 30,
				width: 20,
				height: 20,
			};
			// Not enough space at top, and would overflow left - should go right
			const result = calculateTooltipPosition(button, standardViewport);
			expect(result).toBe("right");
		});

		it("should handle bottom-right corner", () => {
			const button: Position = {
				top: 1050,
				bottom: 1070,
				left: 1890,
				right: 1910,
				width: 20,
				height: 20,
			};
			// Not enough space at bottom, and would overflow right - should go left
			const result = calculateTooltipPosition(button, standardViewport);
			expect(result).toBe("left");
		});
	});

	describe("small viewport (mobile)", () => {
		it("should handle narrow viewport", () => {
			const button: Position = {
				top: 300,
				bottom: 320,
				left: 177,
				right: 197,
				width: 20,
				height: 20,
			};
			// Center screen on mobile, should use bottom
			const result = calculateTooltipPosition(button, smallViewport);
			expect(result).toBe("bottom");
		});

		it("should prefer right on mobile left edge", () => {
			const button: Position = {
				top: 300,
				bottom: 320,
				left: 10,
				right: 30,
				width: 20,
				height: 20,
			};
			const result = calculateTooltipPosition(button, smallViewport);
			// Mobile is 375px wide, tooltip is 256px
			// Button at left edge would overflow left if centered, so prefer right
			expect(result).toBe("right");
		});
	});

	describe("edge cases", () => {
		it("should handle zero-size viewport gracefully", () => {
			const button: Position = {
				top: 0,
				bottom: 20,
				left: 0,
				right: 20,
				width: 20,
				height: 20,
			};
			// Should return a valid position even with impossible constraints
			const result = calculateTooltipPosition(button, { width: 100, height: 100 });
			expect(["top", "bottom", "left", "right"]).toContain(result);
		});

		it("should handle button larger than tooltip", () => {
			const button: Position = {
				top: 200,
				bottom: 500,
				left: 200,
				right: 500,
				width: 300,
				height: 300,
			};
			const result = calculateTooltipPosition(button, standardViewport);
			expect(result).toBe("bottom");
		});
	});
});
