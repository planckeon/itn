import type React from "react";
import { useState } from "react";
import { useI18n } from "../i18n";

interface Section {
	id: string;
	title: string;
	content: string;
}

const SECTIONS: Section[] = [
	{
		id: "what-is-neutrino",
		title: "What is a Neutrino?",
		content: `Neutrinos are among the most abundant particles in the universe, yet incredibly elusive. 
Every second, about 100 trillion neutrinos pass through your body — but they rarely interact with matter.

**Key facts:**
• Nearly massless (but not quite zero!)
• Electrically neutral
• Comes in three "flavors": electron (νe), muon (νμ), tau (ντ)
• Produced in nuclear reactions: the Sun, reactors, cosmic rays
• Can travel through entire planets without stopping`,
	},
	{
		id: "what-is-oscillation",
		title: "What is Neutrino Oscillation?",
		content: `Neutrino oscillation is the quantum phenomenon where neutrinos change their flavor as they travel.

A neutrino created as an electron neutrino (νe) can later be detected as a muon neutrino (νμ) or tau neutrino (ντ)!

**How it works:**
• Flavor states (νe, νμ, ντ) are mixtures of mass states (ν1, ν2, ν3)
• Mass states travel at slightly different speeds
• This creates interference, causing the flavor to oscillate
• The oscillation depends on: energy, distance, and mixing parameters`,
	},
	{
		id: "pmns-matrix",
		title: "The PMNS Matrix",
		content: `The Pontecorvo-Maki-Nakagawa-Sakata (PMNS) matrix describes how flavor and mass states are related.

|νe⟩ = Ue1|ν1⟩ + Ue2|ν2⟩ + Ue3|ν3⟩

**Parameters:**
• Three mixing angles: θ12 ≈ 33°, θ13 ≈ 8.5°, θ23 ≈ 49°
• One CP-violating phase: δCP (unknown, key target!)
• Two mass-squared differences: Δm²21, Δm²31

The matrix elements |Uαi|² give the probability of finding mass state i in flavor state α.`,
	},
	{
		id: "cp-violation",
		title: "CP Violation & Matter-Antimatter",
		content: `CP violation means particles and antiparticles behave differently.

If δCP ≠ 0° or 180°:
• P(νμ → νe) ≠ P(ν̄μ → ν̄e)
• Neutrinos and antineutrinos oscillate at different rates!

**Why it matters:**
The universe has more matter than antimatter. CP violation in neutrinos could help explain this cosmic mystery — the "baryon asymmetry problem."

Experiments like T2K, NOvA, and DUNE are racing to measure δCP!`,
	},
	{
		id: "msw-effect",
		title: "The MSW Matter Effect",
		content: `When neutrinos travel through matter (like the Sun or Earth), their oscillations change.

**The mechanism:**
• Electron neutrinos can scatter off electrons in matter
• This creates an "effective potential" that modifies mixing
• Named after Mikheyev, Smirnov, and Wolfenstein

**Applications:**
• Explains the "solar neutrino problem"
• Helps determine the mass ordering
• Larger effect at higher densities and lower energies`,
	},
	{
		id: "mass-ordering",
		title: "Mass Ordering Mystery",
		content: `We know neutrinos have mass, but we don't know which arrangement is correct:

**Normal Ordering (NO):** m1 < m2 << m3
• ν3 is the heaviest
• Similar to quarks (top is heaviest)

**Inverted Ordering (IO):** m3 << m1 < m2
• ν3 is the lightest
• Would be unexpected!

**How to determine it:**
• Compare νμ → νe vs ν̄μ → ν̄e in matter
• Study atmospheric neutrinos at different angles
• JUNO reactor experiment (precision measurement)`,
	},
	{
		id: "experiments",
		title: "Neutrino Experiments",
		content: `**Accelerator experiments** (νμ beams):
• T2K (Japan, 295 km): First hints of CP violation
• NOvA (USA, 810 km): Complementary measurements
• DUNE (USA, 1300 km): Future high-precision experiment
• Hyper-Kamiokande (Japan): Next-generation detector

**Reactor experiments** (ν̄e disappearance):
• Daya Bay, Double Chooz, RENO: Measured θ13
• KamLAND: Confirmed solar oscillations
• JUNO: Will determine mass ordering

**Others:**
• Super-Kamiokande, IceCube: Atmospheric neutrinos
• SNO, Borexino: Solar neutrinos`,
	},
];

const LearnMorePanel: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [expandedSection, setExpandedSection] = useState<string | null>(null);
	const { t } = useI18n();

	if (!isOpen) {
		return (
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className="fixed top-[100px] left-4 z-10 px-3 py-1.5 rounded-lg text-xs font-mono transition-all hover:scale-105"
				style={{
					background: "rgba(20, 20, 30, 0.85)",
					border: "1px solid rgba(255, 255, 255, 0.1)",
					color: "rgba(255, 255, 255, 0.7)",
					backdropFilter: "blur(8px)",
				}}
			>
				📚 {t.learnMore}
			</button>
		);
	}

	return (
		<div
			className="fixed top-16 left-4 z-40 w-80 max-h-[70vh] overflow-hidden rounded-xl flex flex-col"
			style={{
				background: "rgba(15, 15, 25, 0.95)",
				border: "1px solid rgba(255, 255, 255, 0.15)",
				backdropFilter: "blur(16px)",
				boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
			}}
		>
			{/* Header */}
			<div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
				<h2 className="text-sm font-semibold text-white">📚 {t.learnMore}</h2>
				<button
					type="button"
					onClick={() => setIsOpen(false)}
					className="text-white/50 hover:text-white transition-colors"
				>
					✕
				</button>
			</div>

			{/* Scrollable content - hidden scrollbar */}
			<div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
				{SECTIONS.map((section) => (
					<div key={section.id} className="mb-1">
						<button
							type="button"
							onClick={() => setExpandedSection(
								expandedSection === section.id ? null : section.id
							)}
							className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/5 transition-colors flex items-center justify-between"
						>
							<span>{section.title}</span>
							<span className="text-white/40">
								{expandedSection === section.id ? "▼" : "▶"}
							</span>
						</button>
						
						{expandedSection === section.id && (
							<div 
								className="px-3 py-2 text-xs text-white/70 leading-relaxed whitespace-pre-wrap"
								style={{ background: "rgba(255, 255, 255, 0.02)" }}
							>
								{section.content}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
};

export default LearnMorePanel;
