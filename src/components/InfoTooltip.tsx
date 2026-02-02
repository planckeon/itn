import type React from "react";
import { useState } from "react";

interface InfoTooltipProps {
	text: string;
	children?: React.ReactNode;
}

/**
 * Small info button that shows a tooltip with physics explanations
 */
const InfoTooltip: React.FC<InfoTooltipProps> = ({ text, children }) => {
	const [isVisible, setIsVisible] = useState(false);

	return (
		<div className="relative inline-block">
			<button
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
					className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-lg text-xs text-white/90 font-sans leading-relaxed"
					style={{
						background: "rgba(20, 20, 30, 0.95)",
						backdropFilter: "blur(8px)",
						border: "1px solid rgba(255, 255, 255, 0.15)",
						boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
					}}
				>
					{text}
					{/* Arrow */}
					<div
						className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
						style={{
							borderLeft: "6px solid transparent",
							borderRight: "6px solid transparent",
							borderTop: "6px solid rgba(20, 20, 30, 0.95)",
						}}
					/>
				</div>
			)}
		</div>
	);
};

// Pre-defined physics explanations
export const PHYSICS_INFO = {
	deltaCP: `δCP (delta-CP) is the CP violation phase in the neutrino mixing matrix. 
It determines whether neutrinos and antineutrinos oscillate differently.
If δCP ≠ 0° or 180°, CP symmetry is violated - this could help explain why there's more matter than antimatter in the universe.`,

	massOrdering: `Mass Ordering determines which neutrino mass state is heaviest.
• Normal (NO): m₁ < m₂ < m₃ (m₃ is heaviest)
• Inverted (IO): m₃ < m₁ < m₂ (m₃ is lightest)
This is one of the biggest unknowns in neutrino physics!`,

	matterEffect: `The MSW (Mikheyev-Smirnov-Wolfenstein) effect describes how neutrino oscillations change when passing through matter.
Electron neutrinos interact with electrons in matter, creating an effective potential that modifies oscillation patterns.
This effect is crucial for understanding solar neutrinos.`,

	antineutrino: `Antineutrinos (ν̄) are the antiparticles of neutrinos.
In oscillations, they behave differently due to:
• Sign flip of δCP (CP conjugation)
• Opposite sign of matter potential
Comparing ν and ν̄ oscillations reveals CP violation.`,

	oscillationLength: `The oscillation length L_osc is the distance over which a neutrino completes one full oscillation cycle.
L_osc = 4πE/Δm² ≈ 2.48 × E[GeV] / Δm²[eV²] km
Higher energy = longer oscillation length.`,

	ternaryPlot: `The ternary plot shows the neutrino's position in "flavor space".
Each corner represents 100% probability of one flavor.
The trajectory traces how the neutrino changes flavor over time.
For CP violation (δCP ≠ 0), neutrino and antineutrino trace different paths!`,
};

export default InfoTooltip;
