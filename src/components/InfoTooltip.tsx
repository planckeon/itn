import type React from "react";
import { useState, useRef, useLayoutEffect, useCallback } from "react";

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

/**
 * Calculate tooltip position synchronously to avoid flicker
 */
function calculatePosition(
	button: DOMRect,
	preferredPosition: "auto" | "top" | "bottom" | "left" | "right",
	tooltipWidth: number,
	tooltipHeight: number
): TooltipPosition {
	const margin = 12;
	const arrowSize = 8;
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
		if (spaceBottom >= tooltipHeight + margin + arrowSize) {
			finalPosition = "bottom";
		} else if (spaceTop >= tooltipHeight + margin + arrowSize) {
			finalPosition = "top";
		} else if (spaceRight >= tooltipWidth + margin + arrowSize) {
			finalPosition = "right";
		} else if (spaceLeft >= tooltipWidth + margin + arrowSize) {
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
				top: button.bottom + arrowSize,
				left: Math.max(margin, Math.min(buttonCenterX - tooltipWidth / 2, viewportWidth - tooltipWidth - margin)),
			};
		case "top":
			return {
				bottom: viewportHeight - button.top + arrowSize,
				left: Math.max(margin, Math.min(buttonCenterX - tooltipWidth / 2, viewportWidth - tooltipWidth - margin)),
			};
		case "right":
			return {
				left: button.right + arrowSize,
				top: Math.max(margin, Math.min(buttonCenterY - tooltipHeight / 2, viewportHeight - tooltipHeight - margin)),
			};
		case "left":
			return {
				right: viewportWidth - button.left + arrowSize,
				top: Math.max(margin, Math.min(buttonCenterY - tooltipHeight / 2, viewportHeight - tooltipHeight - margin)),
			};
	}
}

/**
 * Small info button that shows a tooltip with physics explanations
 * Positions synchronously to avoid flicker on hover
 */
const InfoTooltip: React.FC<InfoTooltipProps> = ({ text, children, position = "auto" }) => {
	const [isVisible, setIsVisible] = useState(false);
	const [tooltipPos, setTooltipPos] = useState<TooltipPosition | null>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const hideTimeoutRef = useRef<number | null>(null);

	const tooltipWidth = 256;
	const tooltipHeight = 140;

	// Clear any pending hide timeout
	const clearHideTimeout = useCallback(() => {
		if (hideTimeoutRef.current !== null) {
			window.clearTimeout(hideTimeoutRef.current);
			hideTimeoutRef.current = null;
		}
	}, []);

	const showTooltip = useCallback(() => {
		clearHideTimeout();
		if (buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect();
			const pos = calculatePosition(rect, position, tooltipWidth, tooltipHeight);
			setTooltipPos(pos);
			setIsVisible(true);
		}
	}, [position, clearHideTimeout]);

	const hideTooltip = useCallback(() => {
		clearHideTimeout();
		// Small delay to prevent flicker when moving between button and tooltip
		hideTimeoutRef.current = window.setTimeout(() => {
			setIsVisible(false);
			setTooltipPos(null);
		}, 50);
	}, [clearHideTimeout]);

	// Recalculate position on scroll/resize while visible
	useLayoutEffect(() => {
		if (!isVisible || !buttonRef.current) return;

		const updatePosition = () => {
			if (buttonRef.current) {
				const rect = buttonRef.current.getBoundingClientRect();
				const pos = calculatePosition(rect, position, tooltipWidth, tooltipHeight);
				setTooltipPos(pos);
			}
		};

		window.addEventListener("scroll", updatePosition, true);
		window.addEventListener("resize", updatePosition);

		return () => {
			window.removeEventListener("scroll", updatePosition, true);
			window.removeEventListener("resize", updatePosition);
		};
	}, [isVisible, position]);

	// Cleanup timeout on unmount
	useLayoutEffect(() => {
		return () => clearHideTimeout();
	}, [clearHideTimeout]);

	return (
		<>
			<button
				ref={buttonRef}
				type="button"
				className="w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white/90 text-[10px] font-bold transition-colors flex items-center justify-center"
				onMouseEnter={showTooltip}
				onMouseLeave={hideTooltip}
				onFocus={showTooltip}
				onBlur={hideTooltip}
				aria-label="More information"
			>
				{children || "?"}
			</button>
			
			{isVisible && tooltipPos && (
				<div
					className="text-xs text-white/90 font-sans leading-relaxed"
					style={{
						position: "fixed",
						zIndex: 9999,
						width: tooltipWidth,
						maxWidth: "calc(100vw - 24px)",
						background: "rgba(20, 20, 30, 0.98)",
						backdropFilter: "blur(8px)",
						border: "1px solid rgba(255, 255, 255, 0.15)",
						boxShadow: "0 4px 20px rgba(0, 0, 0, 0.6)",
						borderRadius: 8,
						padding: 12,
						...tooltipPos,
					}}
					onMouseEnter={clearHideTimeout}
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
