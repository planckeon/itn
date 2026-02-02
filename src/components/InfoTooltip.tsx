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
	const [tooltipPosition, setTooltipPosition] = useState<"top" | "bottom" | "left" | "right">("top");
	const buttonRef = useRef<HTMLButtonElement>(null);
	const tooltipRef = useRef<HTMLDivElement>(null);

	// Calculate best position to avoid viewport overflow
	useEffect(() => {
		if (!isVisible || !buttonRef.current) return;

		if (position !== "auto") {
			setTooltipPosition(position);
			return;
		}

		const button = buttonRef.current.getBoundingClientRect();
		const tooltipWidth = 256; // w-64 = 16rem = 256px
		const tooltipHeight = 120; // approximate
		const margin = 16;

		// Check available space in each direction
		const spaceTop = button.top;
		const spaceBottom = window.innerHeight - button.bottom;
		const spaceLeft = button.left;
		const spaceRight = window.innerWidth - button.right;

		// Prefer top, then bottom, then right, then left
		if (spaceTop > tooltipHeight + margin) {
			setTooltipPosition("top");
		} else if (spaceBottom > tooltipHeight + margin) {
			setTooltipPosition("bottom");
		} else if (spaceRight > tooltipWidth + margin) {
			setTooltipPosition("right");
		} else if (spaceLeft > tooltipWidth + margin) {
			setTooltipPosition("left");
		} else {
			// Default to top, will scroll if needed
			setTooltipPosition("top");
		}
	}, [isVisible, position]);

	// Get position classes based on calculated position
	const getPositionClasses = () => {
		switch (tooltipPosition) {
			case "bottom":
				return "top-full left-1/2 -translate-x-1/2 mt-2";
			case "left":
				return "right-full top-1/2 -translate-y-1/2 mr-2";
			case "right":
				return "left-full top-1/2 -translate-y-1/2 ml-2";
			case "top":
			default:
				return "bottom-full left-1/2 -translate-x-1/2 mb-2";
		}
	};

	// Get arrow position
	const getArrowStyle = (): React.CSSProperties => {
		const arrowBase = {
			position: "absolute" as const,
			width: 0,
			height: 0,
		};

		switch (tooltipPosition) {
			case "bottom":
				return {
					...arrowBase,
					bottom: "100%",
					left: "50%",
					transform: "translateX(-50%)",
					borderLeft: "6px solid transparent",
					borderRight: "6px solid transparent",
					borderBottom: "6px solid rgba(20, 20, 30, 0.95)",
				};
			case "left":
				return {
					...arrowBase,
					left: "100%",
					top: "50%",
					transform: "translateY(-50%)",
					borderTop: "6px solid transparent",
					borderBottom: "6px solid transparent",
					borderLeft: "6px solid rgba(20, 20, 30, 0.95)",
				};
			case "right":
				return {
					...arrowBase,
					right: "100%",
					top: "50%",
					transform: "translateY(-50%)",
					borderTop: "6px solid transparent",
					borderBottom: "6px solid transparent",
					borderRight: "6px solid rgba(20, 20, 30, 0.95)",
				};
			case "top":
			default:
				return {
					...arrowBase,
					top: "100%",
					left: "50%",
					transform: "translateX(-50%)",
					borderLeft: "6px solid transparent",
					borderRight: "6px solid transparent",
					borderTop: "6px solid rgba(20, 20, 30, 0.95)",
				};
		}
	};

	return (
		<div className="relative inline-block">
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
					className={`absolute z-50 w-64 max-w-[calc(100vw-2rem)] p-3 rounded-lg text-xs text-white/90 font-sans leading-relaxed ${getPositionClasses()}`}
					style={{
						background: "rgba(20, 20, 30, 0.95)",
						backdropFilter: "blur(8px)",
						border: "1px solid rgba(255, 255, 255, 0.15)",
						boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
						wordWrap: "break-word",
						overflowWrap: "break-word",
						hyphens: "auto",
					}}
				>
					<div className="whitespace-pre-wrap">{text}</div>
					{/* Arrow */}
					<div style={getArrowStyle()} />
				</div>
			)}
		</div>
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
