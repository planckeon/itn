import type React from "react";
import { useState, useRef, useLayoutEffect, useCallback, useEffect } from "react";

interface InfoTooltipProps {
	text: string;
	children?: React.ReactNode;
	position?: "auto" | "top" | "bottom" | "left" | "right";
}

interface TooltipPosition {
	top?: number;
	bottom?: number;
	left?: number;
	right?: number;
}

const TOOLTIP_WIDTH = 256;
const TOOLTIP_HEIGHT = 140;
const MARGIN = 12;
const ARROW_SIZE = 8;
const HIDE_DELAY_MS = 100; // Increased for smoother UX

/**
 * Calculate tooltip position synchronously to avoid flicker
 */
function calculatePosition(
	button: DOMRect,
	preferredPosition: "auto" | "top" | "bottom" | "left" | "right"
): TooltipPosition {
	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;

	// Calculate available space
	const spaceTop = button.top;
	const spaceBottom = viewportHeight - button.bottom;
	const spaceLeft = button.left;
	const spaceRight = viewportWidth - button.right;

	let finalPosition: "top" | "bottom" | "left" | "right";

	if (preferredPosition !== "auto") {
		finalPosition = preferredPosition;
	} else {
		// Priority: bottom > top > right > left
		if (spaceBottom >= TOOLTIP_HEIGHT + MARGIN + ARROW_SIZE) {
			finalPosition = "bottom";
		} else if (spaceTop >= TOOLTIP_HEIGHT + MARGIN + ARROW_SIZE) {
			finalPosition = "top";
		} else if (spaceRight >= TOOLTIP_WIDTH + MARGIN + ARROW_SIZE) {
			finalPosition = "right";
		} else if (spaceLeft >= TOOLTIP_WIDTH + MARGIN + ARROW_SIZE) {
			finalPosition = "left";
		} else {
			finalPosition = "bottom";
		}
	}

	const buttonCenterX = button.left + button.width / 2;
	const buttonCenterY = button.top + button.height / 2;

	switch (finalPosition) {
		case "bottom":
			return {
				top: button.bottom + ARROW_SIZE,
				left: Math.max(MARGIN, Math.min(buttonCenterX - TOOLTIP_WIDTH / 2, viewportWidth - TOOLTIP_WIDTH - MARGIN)),
			};
		case "top":
			return {
				bottom: viewportHeight - button.top + ARROW_SIZE,
				left: Math.max(MARGIN, Math.min(buttonCenterX - TOOLTIP_WIDTH / 2, viewportWidth - TOOLTIP_WIDTH - MARGIN)),
			};
		case "right":
			return {
				left: button.right + ARROW_SIZE,
				top: Math.max(MARGIN, Math.min(buttonCenterY - TOOLTIP_HEIGHT / 2, viewportHeight - TOOLTIP_HEIGHT - MARGIN)),
			};
		case "left":
			return {
				right: viewportWidth - button.left + ARROW_SIZE,
				top: Math.max(MARGIN, Math.min(buttonCenterY - TOOLTIP_HEIGHT / 2, viewportHeight - TOOLTIP_HEIGHT - MARGIN)),
			};
	}
}

/**
 * Small info button that shows a tooltip with physics explanations
 * Positions synchronously to avoid flicker on hover
 */
const InfoTooltip: React.FC<InfoTooltipProps> = ({ text, children, position = "auto" }) => {
	const [hoverState, setHoverState] = useState<"hidden" | "showing" | "visible">("hidden");
	const [tooltipPos, setTooltipPos] = useState<TooltipPosition | null>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const hideTimeoutRef = useRef<number | null>(null);
	const showTimeoutRef = useRef<number | null>(null);

	// Clear all timeouts
	const clearAllTimeouts = useCallback(() => {
		if (hideTimeoutRef.current !== null) {
			window.clearTimeout(hideTimeoutRef.current);
			hideTimeoutRef.current = null;
		}
		if (showTimeoutRef.current !== null) {
			window.clearTimeout(showTimeoutRef.current);
			showTimeoutRef.current = null;
		}
	}, []);

	const showTooltip = useCallback(() => {
		clearAllTimeouts();
		if (buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect();
			const pos = calculatePosition(rect, position);
			setTooltipPos(pos);
			setHoverState("visible");
		}
	}, [position, clearAllTimeouts]);

	const hideTooltip = useCallback(() => {
		clearAllTimeouts();
		// Delay hide to prevent flicker when moving between button and tooltip
		hideTimeoutRef.current = window.setTimeout(() => {
			setHoverState("hidden");
			setTooltipPos(null);
		}, HIDE_DELAY_MS);
	}, [clearAllTimeouts]);

	const cancelHide = useCallback(() => {
		if (hideTimeoutRef.current !== null) {
			window.clearTimeout(hideTimeoutRef.current);
			hideTimeoutRef.current = null;
		}
	}, []);

	// Recalculate position on scroll/resize while visible
	useLayoutEffect(() => {
		if (hoverState !== "visible" || !buttonRef.current) return;

		const updatePosition = () => {
			if (buttonRef.current) {
				const rect = buttonRef.current.getBoundingClientRect();
				const pos = calculatePosition(rect, position);
				setTooltipPos(pos);
			}
		};

		window.addEventListener("scroll", updatePosition, true);
		window.addEventListener("resize", updatePosition);

		return () => {
			window.removeEventListener("scroll", updatePosition, true);
			window.removeEventListener("resize", updatePosition);
		};
	}, [hoverState, position]);

	// Cleanup timeouts on unmount
	useEffect(() => {
		return () => clearAllTimeouts();
	}, [clearAllTimeouts]);

	const isVisible = hoverState === "visible" && tooltipPos !== null;

	return (
		<>
			<button
				ref={buttonRef}
				type="button"
				className="w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white/90 text-[10px] font-bold flex items-center justify-center"
				onMouseEnter={showTooltip}
				onMouseLeave={hideTooltip}
				onFocus={showTooltip}
				onBlur={hideTooltip}
				aria-label="More information"
			>
				{children || "?"}
			</button>
			
			{isVisible && (
				<div
					className="text-xs text-white/90 font-sans leading-relaxed"
					style={{
						position: "fixed",
						zIndex: 9999,
						width: TOOLTIP_WIDTH,
						maxWidth: "calc(100vw - 24px)",
						background: "rgba(20, 20, 30, 0.98)",
						backdropFilter: "blur(8px)",
						border: "1px solid rgba(255, 255, 255, 0.15)",
						boxShadow: "0 4px 20px rgba(0, 0, 0, 0.6)",
						borderRadius: 8,
						padding: 12,
						...tooltipPos,
					}}
					onMouseEnter={cancelHide}
					onMouseLeave={hideTooltip}
				>
					<div className="whitespace-pre-wrap">{text}</div>
				</div>
			)}
		</>
	);
};

// Pre-defined physics explanations (shortened for better fit)
export const PHYSICS_INFO = {
	deltaCP: `δCP is the CP violation phase (0-360°).

If δCP ≠ 0° or 180°, neutrinos and antineutrinos oscillate differently — this could explain the matter-antimatter asymmetry in the universe.`,

	massOrdering: `Mass Ordering: which mass state is heaviest?

• Normal (NO): m₁ < m₂ < m₃
• Inverted (IO): m₃ < m₁ < m₂

One of the biggest unknowns in neutrino physics!`,

	matterEffect: `MSW Effect: oscillations change in matter.

Electron neutrinos interact with electrons, modifying oscillation patterns. Crucial for understanding solar neutrinos.`,

	antineutrino: `Antineutrinos (ν̄) oscillate differently:

• δCP sign flips (CP conjugation)
• Matter potential sign flips

Comparing ν and ν̄ reveals CP violation.`,

	oscillationLength: `Oscillation length: distance for one full cycle.

L_osc ≈ 2.48 × E[GeV] / Δm²[eV²] km

Higher energy → longer oscillation length.`,

	ternaryPlot: `Flavor space triangle: each corner = 100% of one flavor.

The dot traces how flavor changes over distance. With CP violation, ν and ν̄ trace different paths!`,
};

export default InfoTooltip;
