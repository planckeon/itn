import type React from "react";
import { useState, useRef, useEffect } from "react";

interface InfoTooltipProps {
	text: string;
	children?: React.ReactNode;
	position?: "auto" | "top" | "bottom" | "left" | "right";
}

/**
 * Small info button that shows a tooltip with physics explanations
 * Automatically positions to avoid viewport overflow
 */
const InfoTooltip: React.FC<InfoTooltipProps> = ({ text, children, position = "auto" }) => {
	const [isVisible, setIsVisible] = useState(false);
	const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
	const buttonRef = useRef<HTMLButtonElement>(null);
	const tooltipRef = useRef<HTMLDivElement>(null);

	// Calculate position dynamically to always stay in viewport
	useEffect(() => {
		if (!isVisible || !buttonRef.current) return;

		const button = buttonRef.current.getBoundingClientRect();
		const tooltipWidth = 256;
		const tooltipHeight = 140;
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

		if (position !== "auto") {
			finalPosition = position;
		} else {
			// Determine best position based on available space
			// Priority: bottom > top > right > left (bottom is usually safest)
			if (spaceBottom >= tooltipHeight + margin + arrowSize) {
				finalPosition = "bottom";
			} else if (spaceTop >= tooltipHeight + margin + arrowSize) {
				finalPosition = "top";
			} else if (spaceRight >= tooltipWidth + margin + arrowSize) {
				finalPosition = "right";
			} else if (spaceLeft >= tooltipWidth + margin + arrowSize) {
				finalPosition = "left";
			} else {
				// Not enough space anywhere - use bottom and let it scroll
				finalPosition = "bottom";
			}
		}

		// Calculate style based on position
		const style: React.CSSProperties = {
			position: "fixed",
			zIndex: 9999,
			width: tooltipWidth,
			maxWidth: `calc(100vw - ${margin * 2}px)`,
			background: "rgba(20, 20, 30, 0.98)",
			backdropFilter: "blur(8px)",
			border: "1px solid rgba(255, 255, 255, 0.15)",
			boxShadow: "0 4px 20px rgba(0, 0, 0, 0.6)",
			borderRadius: 8,
			padding: 12,
		};

		const buttonCenterX = button.left + button.width / 2;
		const buttonCenterY = button.top + button.height / 2;

		switch (finalPosition) {
			case "bottom":
				style.top = button.bottom + arrowSize;
				style.left = Math.max(margin, Math.min(buttonCenterX - tooltipWidth / 2, viewportWidth - tooltipWidth - margin));
				break;
			case "top":
				style.bottom = viewportHeight - button.top + arrowSize;
				style.left = Math.max(margin, Math.min(buttonCenterX - tooltipWidth / 2, viewportWidth - tooltipWidth - margin));
				break;
			case "right":
				style.left = button.right + arrowSize;
				style.top = Math.max(margin, Math.min(buttonCenterY - tooltipHeight / 2, viewportHeight - tooltipHeight - margin));
				break;
			case "left":
				style.right = viewportWidth - button.left + arrowSize;
				style.top = Math.max(margin, Math.min(buttonCenterY - tooltipHeight / 2, viewportHeight - tooltipHeight - margin));
				break;
		}

		setTooltipStyle(style);
	}, [isVisible, position]);

	return (
		<>
			<button
				ref={buttonRef}
				type="button"
				className="w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white/90 text-[10px] font-bold transition-colors flex items-center justify-center"
				onMouseEnter={() => setIsVisible(true)}
				onMouseLeave={() => setIsVisible(false)}
				onClick={() => setIsVisible(!isVisible)}
				aria-label="More information"
			>
				{children || "?"}
			</button>
			
			{isVisible && (
				<div
					ref={tooltipRef}
					className="text-xs text-white/90 font-sans leading-relaxed"
					style={tooltipStyle}
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
