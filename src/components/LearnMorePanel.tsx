import type React from "react";
import { useState } from "react";
import { useI18n } from "../i18n";
import RichText from "./RichText";

interface Section {
	id: string;
	title: string;
	content: string;
}

const SECTIONS: Section[] = [
	{
		id: "what-is-neutrino",
		title: "What is a Neutrino?",
		content: `Neutrinos are among the most abundant particles in the universe, yet incredibly elusive. Every second, about $10^{14}$ neutrinos pass through your body — but they rarely interact with matter.

**Key facts:**
• Nearly massless (but not quite zero!)
• Electrically neutral
• Comes in three "flavors": electron ($\\nu_e$), muon ($\\nu_\\mu$), tau ($\\nu_\\tau$)
• Produced in nuclear reactions: the Sun, reactors, cosmic rays
• Can travel through entire planets without stopping`,
	},
	{
		id: "what-is-oscillation",
		title: "What is Neutrino Oscillation?",
		content: `Neutrino oscillation is the quantum phenomenon where neutrinos change their flavor as they travel.

A neutrino created as $\\nu_e$ can later be detected as $\\nu_\\mu$ or $\\nu_\\tau$!

**How it works:**
• Flavor states ($\\nu_e, \\nu_\\mu, \\nu_\\tau$) are mixtures of mass states ($\\nu_1, \\nu_2, \\nu_3$)
• Mass states travel at slightly different speeds
• This creates interference, causing the flavor to oscillate
• The oscillation probability depends on energy $E$, distance $L$, and mixing parameters`,
	},
	{
		id: "pmns-matrix",
		title: "The PMNS Matrix",
		content: `The Pontecorvo-Maki-Nakagawa-Sakata (PMNS) matrix describes how flavor and mass states are related:

$$|\\nu_\\alpha\\rangle = \\sum_i U_{\\alpha i} |\\nu_i\\rangle$$

**Parameters:**
• Three mixing angles: $\\theta_{12} \\approx 33°$, $\\theta_{13} \\approx 8.5°$, $\\theta_{23} \\approx 49°$
• One CP-violating phase: $\\delta_{CP}$ (key measurement target!)
• Two mass-squared differences: $\\Delta m^2_{21}$, $\\Delta m^2_{31}$

The matrix elements $|U_{\\alpha i}|^2$ give the probability of finding mass state $i$ in flavor state $\\alpha$.`,
	},
	{
		id: "oscillation-formula",
		title: "Oscillation Formula",
		content: `The probability of $\\nu_\\alpha \\to \\nu_\\beta$ oscillation in vacuum (two-flavor approximation):

$$P(\\nu_\\alpha \\to \\nu_\\beta) = \\sin^2(2\\theta) \\sin^2\\left(\\frac{\\Delta m^2 L}{4E}\\right)$$

**Key dependencies:**
• $\\sin^2(2\\theta)$ — mixing strength (amplitude)
• $\\Delta m^2$ — mass-squared difference (in $\\text{eV}^2$)
• $L$ — distance traveled (in km)
• $E$ — neutrino energy (in GeV)

The oscillation length is:
$$L_{\\text{osc}} = \\frac{4\\pi E}{\\Delta m^2} \\approx 2.48 \\times \\frac{E[\\text{GeV}]}{\\Delta m^2[\\text{eV}^2]} \\text{ km}$$`,
	},
	{
		id: "cp-violation",
		title: "CP Violation & Matter-Antimatter",
		content: `CP violation means particles and antiparticles behave differently.

If $\\delta_{CP} \\neq 0°$ or $180°$:
$$P(\\nu_\\mu \\to \\nu_e) \\neq P(\\bar{\\nu}_\\mu \\to \\bar{\\nu}_e)$$

Neutrinos and antineutrinos oscillate at different rates!

**Why it matters:**
The universe has more matter than antimatter. CP violation in neutrinos could help explain this cosmic mystery — the "baryon asymmetry problem."

Experiments like T2K, NOvA, and DUNE are racing to measure $\\delta_{CP}$!`,
	},
	{
		id: "msw-effect",
		title: "The MSW Matter Effect",
		content: `When neutrinos travel through matter (like the Sun or Earth), their oscillations change.

**The mechanism:**
• $\\nu_e$ can scatter off electrons via charged current
• This creates an effective potential: $V = \\sqrt{2} G_F N_e$
• The mixing angle in matter differs from vacuum

**Matter-modified mixing:**
$$\\sin^2(2\\theta_m) = \\frac{\\sin^2(2\\theta)}{\\sin^2(2\\theta) + (\\cos(2\\theta) - V/\\Delta)^2}$$

**Resonance condition (MSW):**
$$E_{\\text{res}} = \\frac{\\Delta m^2 \\cos(2\\theta)}{2\\sqrt{2} G_F N_e}$$

At resonance, even small vacuum mixing can become maximal!`,
	},
	{
		id: "mass-ordering",
		title: "Mass Ordering Mystery",
		content: `We know neutrinos have mass, but we don't know which arrangement is correct:

**Normal Ordering (NO):** $m_1 < m_2 \\ll m_3$
• $\\nu_3$ is the heaviest
• $\\Delta m^2_{31} > 0$

**Inverted Ordering (IO):** $m_3 \\ll m_1 < m_2$
• $\\nu_3$ is the lightest
• $\\Delta m^2_{31} < 0$

**Current values (NuFit 5.2):**
• $\\Delta m^2_{21} = 7.42 \\times 10^{-5}$ eV²
• $|\\Delta m^2_{31}| \\approx 2.5 \\times 10^{-3}$ eV²`,
	},
	{
		id: "experiments",
		title: "Neutrino Experiments",
		content: `**Accelerator experiments** ($\\nu_\\mu$ beams):
• T2K (Japan, 295 km): First hints of CP violation
• NOvA (USA, 810 km): Complementary measurements
• DUNE (USA, 1300 km): Future high-precision
• Hyper-Kamiokande: Next-generation detector

**Reactor experiments** ($\\bar{\\nu}_e$ disappearance):
• Daya Bay, Double Chooz, RENO: Measured $\\theta_{13}$
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
			className="fixed top-16 left-4 z-40 w-96 max-w-[90vw] max-h-[75vh] overflow-hidden rounded-xl flex flex-col"
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
								className="px-3 py-3 text-xs text-white/70 leading-relaxed rounded-lg mx-1"
								style={{ background: "rgba(255, 255, 255, 0.03)" }}
							>
								<RichText>{section.content}</RichText>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
};

export default LearnMorePanel;
