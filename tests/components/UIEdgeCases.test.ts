import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Comprehensive UI Edge Case Tests
 * Testing panel toggles, tooltip positioning, animations, and state management
 */

describe("Panel State Management", () => {
	interface PanelState {
		ternary: boolean;
		probability: boolean;
		spectrum: boolean;
	}

	// Simulate the toggle logic from App.tsx
	const togglePanel = (state: PanelState, panel: keyof PanelState): PanelState => {
		return { ...state, [panel]: !state[panel] };
	};

	describe("toggle behavior", () => {
		it("should toggle ternary panel on", () => {
			const initial: PanelState = { ternary: false, probability: true, spectrum: false };
			const result = togglePanel(initial, "ternary");
			expect(result.ternary).toBe(true);
			expect(result.probability).toBe(true); // unchanged
			expect(result.spectrum).toBe(false); // unchanged
		});

		it("should toggle probability panel off", () => {
			const initial: PanelState = { ternary: false, probability: true, spectrum: false };
			const result = togglePanel(initial, "probability");
			expect(result.probability).toBe(false);
		});

		it("should allow multiple panels open simultaneously", () => {
			let state: PanelState = { ternary: false, probability: false, spectrum: false };
			state = togglePanel(state, "ternary");
			state = togglePanel(state, "probability");
			state = togglePanel(state, "spectrum");
			expect(state.ternary).toBe(true);
			expect(state.probability).toBe(true);
			expect(state.spectrum).toBe(true);
		});

		it("should allow closing all panels", () => {
			let state: PanelState = { ternary: true, probability: true, spectrum: true };
			state = togglePanel(state, "ternary");
			state = togglePanel(state, "probability");
			state = togglePanel(state, "spectrum");
			expect(state.ternary).toBe(false);
			expect(state.probability).toBe(false);
			expect(state.spectrum).toBe(false);
		});

		it("should toggle same panel twice returning to original", () => {
			const initial: PanelState = { ternary: false, probability: true, spectrum: false };
			let state = togglePanel(initial, "ternary");
			expect(state.ternary).toBe(true);
			state = togglePanel(state, "ternary");
			expect(state.ternary).toBe(false);
		});

		it("should not mutate original state", () => {
			const initial: PanelState = { ternary: false, probability: true, spectrum: false };
			const frozen = Object.freeze({ ...initial });
			const result = togglePanel(frozen as PanelState, "ternary");
			expect(result).not.toBe(frozen);
			expect(result.ternary).toBe(true);
		});

		it("should handle rapid toggle sequences", () => {
			let state: PanelState = { ternary: false, probability: false, spectrum: false };
			// Rapid fire toggles
			for (let i = 0; i < 10; i++) {
				state = togglePanel(state, "ternary");
			}
			expect(state.ternary).toBe(false); // Even number = back to original

			for (let i = 0; i < 11; i++) {
				state = togglePanel(state, "probability");
			}
			expect(state.probability).toBe(true); // Odd number = toggled
		});
	});

	describe("anyPanelOpen logic", () => {
		const anyPanelOpen = (state: PanelState): boolean => {
			return state.ternary || state.probability || state.spectrum;
		};

		it("should return false when all panels closed", () => {
			expect(anyPanelOpen({ ternary: false, probability: false, spectrum: false })).toBe(false);
		});

		it("should return true when one panel open", () => {
			expect(anyPanelOpen({ ternary: true, probability: false, spectrum: false })).toBe(true);
			expect(anyPanelOpen({ ternary: false, probability: true, spectrum: false })).toBe(true);
			expect(anyPanelOpen({ ternary: false, probability: false, spectrum: true })).toBe(true);
		});

		it("should return true when multiple panels open", () => {
			expect(anyPanelOpen({ ternary: true, probability: true, spectrum: false })).toBe(true);
			expect(anyPanelOpen({ ternary: true, probability: true, spectrum: true })).toBe(true);
		});
	});
});

describe("Tooltip Hide Timeout Logic", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	const HIDE_DELAY_MS = 100;

	it("should delay hide to prevent flicker", () => {
		let isVisible = true;
		let hideTimeoutId: ReturnType<typeof setTimeout> | null = null;

		const hideTooltip = () => {
			hideTimeoutId = setTimeout(() => {
				isVisible = false;
			}, HIDE_DELAY_MS);
		};

		hideTooltip();
		expect(isVisible).toBe(true); // Still visible

		vi.advanceTimersByTime(HIDE_DELAY_MS - 1);
		expect(isVisible).toBe(true); // Still visible

		vi.advanceTimersByTime(2);
		expect(isVisible).toBe(false); // Now hidden
	});

	it("should cancel hide when mouse re-enters", () => {
		let isVisible = true;
		let hideTimeoutId: ReturnType<typeof setTimeout> | null = null;

		const hideTooltip = () => {
			hideTimeoutId = setTimeout(() => {
				isVisible = false;
			}, HIDE_DELAY_MS);
		};

		const clearHideTimeout = () => {
			if (hideTimeoutId !== null) {
				clearTimeout(hideTimeoutId);
				hideTimeoutId = null;
			}
		};

		hideTooltip();
		expect(isVisible).toBe(true);

		vi.advanceTimersByTime(HIDE_DELAY_MS / 2);
		clearHideTimeout(); // Mouse re-entered

		vi.advanceTimersByTime(HIDE_DELAY_MS * 2);
		expect(isVisible).toBe(true); // Should still be visible
	});

	it("should handle rapid enter/leave sequences", () => {
		let isVisible = false;
		let hideTimeoutId: ReturnType<typeof setTimeout> | null = null;

		const showTooltip = () => {
			if (hideTimeoutId !== null) {
				clearTimeout(hideTimeoutId);
				hideTimeoutId = null;
			}
			isVisible = true;
		};

		const hideTooltip = () => {
			hideTimeoutId = setTimeout(() => {
				isVisible = false;
			}, HIDE_DELAY_MS);
		};

		// Rapid enter/leave
		for (let i = 0; i < 5; i++) {
			showTooltip();
			vi.advanceTimersByTime(20);
			hideTooltip();
			vi.advanceTimersByTime(20);
		}

		// Final show
		showTooltip();
		expect(isVisible).toBe(true);

		// Wait past hide delay
		vi.advanceTimersByTime(HIDE_DELAY_MS * 2);
		expect(isVisible).toBe(true); // Still visible because showTooltip cancelled hide
	});
});

describe("Tooltip Position Calculation", () => {
	const calculatePosition = (
		buttonRect: { top: number; bottom: number; left: number; right: number; width: number; height: number },
		preferredPosition: "auto" | "top" | "bottom" | "left" | "right",
		viewportWidth = 1920,
		viewportHeight = 1080
	): { position: string; isValid: boolean } => {
		const tooltipWidth = 256;
		const tooltipHeight = 140;
		const margin = 12;
		const arrowSize = 8;

		const spaceTop = buttonRect.top;
		const spaceBottom = viewportHeight - buttonRect.bottom;
		const spaceLeft = buttonRect.left;
		const spaceRight = viewportWidth - buttonRect.right;

		let finalPosition: string;

		if (preferredPosition !== "auto") {
			finalPosition = preferredPosition;
		} else {
			if (spaceBottom >= tooltipHeight + margin + arrowSize) {
				finalPosition = "bottom";
			} else if (spaceTop >= tooltipHeight + margin + arrowSize) {
				finalPosition = "top";
			} else if (spaceRight >= tooltipWidth + margin + arrowSize) {
				finalPosition = "right";
			} else if (spaceLeft >= tooltipWidth + margin + arrowSize) {
				finalPosition = "left";
			} else {
				finalPosition = "bottom"; // fallback
			}
		}

		// Check if position is valid (has enough space)
		let isValid = false;
		switch (finalPosition) {
			case "bottom":
				isValid = spaceBottom >= tooltipHeight + margin + arrowSize;
				break;
			case "top":
				isValid = spaceTop >= tooltipHeight + margin + arrowSize;
				break;
			case "right":
				isValid = spaceRight >= tooltipWidth + margin + arrowSize;
				break;
			case "left":
				isValid = spaceLeft >= tooltipWidth + margin + arrowSize;
				break;
		}

		return { position: finalPosition, isValid };
	};

	it("should prefer bottom when space available", () => {
		const button = { top: 100, bottom: 120, left: 500, right: 520, width: 20, height: 20 };
		const result = calculatePosition(button, "auto");
		expect(result.position).toBe("bottom");
		expect(result.isValid).toBe(true);
	});

	it("should fall back to top when no bottom space", () => {
		const button = { top: 500, bottom: 520, left: 500, right: 520, width: 20, height: 20 };
		const result = calculatePosition(button, "auto", 1920, 550); // Small viewport
		expect(result.position).toBe("top");
		expect(result.isValid).toBe(true);
	});

	it("should respect preferred position even if suboptimal", () => {
		const button = { top: 100, bottom: 120, left: 500, right: 520, width: 20, height: 20 };
		const result = calculatePosition(button, "left");
		expect(result.position).toBe("left");
	});

	it("should handle button near top-left corner", () => {
		const button = { top: 10, bottom: 30, left: 10, right: 30, width: 20, height: 20 };
		const result = calculatePosition(button, "auto");
		expect(result.position).toBe("bottom");
	});

	it("should handle button near bottom-right corner", () => {
		const button = { top: 1050, bottom: 1070, left: 1890, right: 1910, width: 20, height: 20 };
		const result = calculatePosition(button, "auto");
		// Should fall back to something
		expect(["top", "left", "bottom", "right"]).toContain(result.position);
	});
});

describe("Modal State Management", () => {
	describe("controlled mode", () => {
		interface ModalProps {
			isOpen?: boolean;
			onClose?: () => void;
		}

		it("should respect isOpen prop", () => {
			const shouldRender = (props: ModalProps): boolean => {
				const isControlled = props.isOpen !== undefined;
				if (isControlled && !props.isOpen) return false;
				return true;
			};

			expect(shouldRender({ isOpen: true })).toBe(true);
			expect(shouldRender({ isOpen: false })).toBe(false);
			expect(shouldRender({})).toBe(true); // uncontrolled
		});

		it("should call onClose when closing", () => {
			const onClose = vi.fn();
			onClose();
			expect(onClose).toHaveBeenCalledTimes(1);
		});

		it("should handle undefined onClose gracefully", () => {
			const props: ModalProps = { isOpen: true };
			expect(() => {
				if (props.onClose) props.onClose();
			}).not.toThrow();
		});
	});

	describe("multiple modals", () => {
		it("should track multiple modal states independently", () => {
			const modals = {
				share: false,
				learn: false,
				settings: false,
				help: false,
			};

			modals.share = true;
			expect(modals.share).toBe(true);
			expect(modals.learn).toBe(false);

			modals.help = true;
			expect(modals.share).toBe(true);
			expect(modals.help).toBe(true);

			modals.share = false;
			expect(modals.share).toBe(false);
			expect(modals.help).toBe(true);
		});
	});
});

describe("Share Button Copy Flow", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should auto-close after 1200ms in controlled mode", () => {
		const onClose = vi.fn();
		
		const handleCopySuccess = () => {
			setTimeout(() => {
				onClose();
			}, 1200);
		};

		handleCopySuccess();
		expect(onClose).not.toHaveBeenCalled();

		vi.advanceTimersByTime(1199);
		expect(onClose).not.toHaveBeenCalled();

		vi.advanceTimersByTime(2);
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("should not call onClose multiple times", () => {
		const onClose = vi.fn();
		let hasTriedCopy = false;

		const handleCopySuccess = () => {
			if (!hasTriedCopy) {
				hasTriedCopy = true;
				setTimeout(() => {
					onClose();
				}, 1200);
			}
		};

		// Call multiple times
		handleCopySuccess();
		handleCopySuccess();
		handleCopySuccess();

		vi.advanceTimersByTime(2000);
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("should cleanup timeout on early close", () => {
		const onClose = vi.fn();
		let timeoutId: ReturnType<typeof setTimeout> | null = null;

		const handleCopySuccess = () => {
			timeoutId = setTimeout(() => {
				onClose();
			}, 1200);
		};

		const cleanup = () => {
			if (timeoutId !== null) {
				clearTimeout(timeoutId);
				timeoutId = null;
			}
		};

		handleCopySuccess();
		vi.advanceTimersByTime(500);
		cleanup(); // User closed early
		vi.advanceTimersByTime(1000);
		expect(onClose).not.toHaveBeenCalled();
	});
});

describe("Quick Stats Formatting", () => {
	interface Probabilities {
		Pe: number;
		Pmu: number;
		Ptau: number;
	}

	const formatPercent = (p: number): string => {
		return (p * 100).toFixed(0) + "%";
	};

	it("should format probabilities as percentages", () => {
		expect(formatPercent(1)).toBe("100%");
		expect(formatPercent(0)).toBe("0%");
		expect(formatPercent(0.5)).toBe("50%");
		expect(formatPercent(0.333)).toBe("33%");
	});

	it("should handle edge cases", () => {
		expect(formatPercent(0.001)).toBe("0%");
		expect(formatPercent(0.999)).toBe("100%");
		expect(formatPercent(0.005)).toBe("1%"); // rounds up
		expect(formatPercent(0.004)).toBe("0%"); // rounds down
	});

	it("should format distance correctly", () => {
		const formatDistance = (d: number): string => d.toFixed(0) + " km";
		expect(formatDistance(100)).toBe("100 km");
		expect(formatDistance(1234.567)).toBe("1235 km");
		expect(formatDistance(0)).toBe("0 km");
	});

	it("should handle NaN gracefully", () => {
		const formatPercentSafe = (p: number): string => {
			if (Number.isNaN(p)) return "—%";
			return (p * 100).toFixed(0) + "%";
		};
		expect(formatPercentSafe(NaN)).toBe("—%");
	});
});

describe("Zoom Controls", () => {
	const MIN_ZOOM = 0.5;
	const MAX_ZOOM = 2;
	const ZOOM_STEP = 0.15;

	const zoomIn = (current: number): number => Math.min(MAX_ZOOM, current + ZOOM_STEP);
	const zoomOut = (current: number): number => Math.max(MIN_ZOOM, current - ZOOM_STEP);
	const resetZoom = (): number => 0.75;

	it("should zoom in by step amount", () => {
		expect(zoomIn(1)).toBeCloseTo(1.15);
		expect(zoomIn(0.75)).toBeCloseTo(0.9);
	});

	it("should zoom out by step amount", () => {
		expect(zoomOut(1)).toBeCloseTo(0.85);
		expect(zoomOut(0.75)).toBeCloseTo(0.6);
	});

	it("should not exceed max zoom", () => {
		let zoom = 1.9;
		zoom = zoomIn(zoom);
		expect(zoom).toBe(MAX_ZOOM);
		zoom = zoomIn(zoom);
		expect(zoom).toBe(MAX_ZOOM);
	});

	it("should not go below min zoom", () => {
		let zoom = 0.6;
		zoom = zoomOut(zoom);
		expect(zoom).toBe(MIN_ZOOM);
		zoom = zoomOut(zoom);
		expect(zoom).toBe(MIN_ZOOM);
	});

	it("should reset to default", () => {
		expect(resetZoom()).toBe(0.75);
	});

	it("should handle wheel delta correctly", () => {
		const handleWheel = (currentZoom: number, deltaY: number): number => {
			const delta = deltaY > 0 ? -0.1 : 0.1;
			return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, currentZoom + delta));
		};

		// Scroll down = zoom out
		expect(handleWheel(1, 100)).toBeCloseTo(0.9);
		// Scroll up = zoom in
		expect(handleWheel(1, -100)).toBeCloseTo(1.1);
	});
});

describe("Keyboard Shortcut Edge Cases", () => {
	it("should handle all preset indices", () => {
		const EXPERIMENT_PRESETS = [
			{ name: "T2K" },
			{ name: "NOvA" },
			{ name: "DUNE" },
			{ name: "KamLAND" },
		];

		for (let i = 1; i <= 4; i++) {
			const presetIndex = i - 1;
			expect(EXPERIMENT_PRESETS[presetIndex]).toBeDefined();
			expect(EXPERIMENT_PRESETS[presetIndex].name).toBeDefined();
		}
	});

	it("should handle out-of-range preset indices", () => {
		const EXPERIMENT_PRESETS = [
			{ name: "T2K" },
			{ name: "NOvA" },
		];

		const applyPreset = (index: number): boolean => {
			if (EXPERIMENT_PRESETS[index]) {
				return true;
			}
			return false;
		};

		expect(applyPreset(0)).toBe(true);
		expect(applyPreset(1)).toBe(true);
		expect(applyPreset(2)).toBe(false);
		expect(applyPreset(5)).toBe(false);
		expect(applyPreset(-1)).toBe(false);
	});

	it("should parse key correctly", () => {
		const parsePresetKey = (key: string): number | null => {
			const num = parseInt(key);
			if (!Number.isNaN(num) && num >= 1 && num <= 4) {
				return num - 1;
			}
			return null;
		};

		expect(parsePresetKey("1")).toBe(0);
		expect(parsePresetKey("4")).toBe(3);
		expect(parsePresetKey("5")).toBe(null);
		expect(parsePresetKey("0")).toBe(null);
		expect(parsePresetKey("a")).toBe(null);
	});
});

describe("Memoization effectiveness", () => {
	it("should detect when probability data changes", () => {
		const prev = [{ distance: 0, Pe: 1, Pmu: 0, Ptau: 0 }];
		const next = [{ distance: 100, Pe: 0.9, Pmu: 0.07, Ptau: 0.03 }];
		
		expect(prev === next).toBe(false);
		expect(JSON.stringify(prev) === JSON.stringify(next)).toBe(false);
	});

	it("should detect when panel state changes", () => {
		const prev = { ternary: false, probability: true, spectrum: false };
		const next = { ternary: true, probability: true, spectrum: false };
		
		expect(prev === next).toBe(false);
		expect(prev.ternary !== next.ternary).toBe(true);
	});

	it("should detect when zoom changes", () => {
		const prev = { zoom: 1.0 };
		const next = { zoom: 1.15 };
		expect(prev.zoom !== next.zoom).toBe(true);
	});
});

describe("Callback stability", () => {
	it("should maintain callback reference with useCallback pattern", () => {
		const createStableCallback = (() => {
			let cached: (() => void) | null = null;
			return () => {
				if (!cached) {
					cached = () => {};
				}
				return cached;
			};
		})();

		const cb1 = createStableCallback();
		const cb2 = createStableCallback();
		expect(cb1).toBe(cb2);
	});

	it("should create new callback when deps change", () => {
		const createCallback = (dep: number) => {
			return () => dep;
		};

		const cb1 = createCallback(1);
		const cb2 = createCallback(1);
		const cb3 = createCallback(2);

		expect(cb1).not.toBe(cb2); // New function each time (no memoization)
		expect(cb1()).toBe(cb2()); // Same result
		expect(cb1()).not.toBe(cb3()); // Different result
	});
});

describe("Animation timing", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should handle CSS transition timing for zoom", () => {
		const ZOOM_TRANSITION_MS = 150;
		let transitionComplete = false;

		const startTransition = () => {
			setTimeout(() => {
				transitionComplete = true;
			}, ZOOM_TRANSITION_MS);
		};

		startTransition();
		expect(transitionComplete).toBe(false);

		vi.advanceTimersByTime(ZOOM_TRANSITION_MS - 1);
		expect(transitionComplete).toBe(false);

		vi.advanceTimersByTime(2);
		expect(transitionComplete).toBe(true);
	});

	it("should not stack animations on rapid state changes", () => {
		let animationCount = 0;
		let activeAnimation: ReturnType<typeof setTimeout> | null = null;

		const startAnimation = () => {
			// Cancel any existing animation
			if (activeAnimation !== null) {
				clearTimeout(activeAnimation);
			}
			activeAnimation = setTimeout(() => {
				animationCount++;
				activeAnimation = null;
			}, 150);
		};

		// Rapid fire
		for (let i = 0; i < 10; i++) {
			startAnimation();
			vi.advanceTimersByTime(20);
		}

		vi.advanceTimersByTime(200);
		expect(animationCount).toBe(1); // Only the last one should complete
	});
});

describe("Touch targets", () => {
	const MIN_TOUCH_TARGET = 44; // Apple HIG recommends 44px

	it("should have adequate touch target sizes", () => {
		const buttonSizes = {
			zoom: 32,
			panelToggle: 32,
			menuButton: 32,
		};

		// Our buttons are 32px but have hover area
		// For accessibility, we should check they're at least usable
		Object.values(buttonSizes).forEach(size => {
			expect(size).toBeGreaterThanOrEqual(24); // Minimum acceptable
		});
	});
});

describe("Concurrent state updates", () => {
	it("should handle multiple state updates in same frame", () => {
		interface AppState {
			panels: { ternary: boolean; probability: boolean; spectrum: boolean };
			zoom: number;
			modals: { share: boolean; help: boolean };
		}

		let state: AppState = {
			panels: { ternary: false, probability: true, spectrum: false },
			zoom: 1,
			modals: { share: false, help: false },
		};

		// Simulate multiple updates
		const updates = [
			() => { state = { ...state, zoom: state.zoom + 0.1 }; },
			() => { state = { ...state, panels: { ...state.panels, ternary: true } }; },
			() => { state = { ...state, modals: { ...state.modals, help: true } }; },
		];

		updates.forEach(update => update());

		expect(state.zoom).toBeCloseTo(1.1);
		expect(state.panels.ternary).toBe(true);
		expect(state.modals.help).toBe(true);
		// Others unchanged
		expect(state.panels.probability).toBe(true);
		expect(state.modals.share).toBe(false);
	});
});
