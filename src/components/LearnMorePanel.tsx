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
		content: `Neutrinos are among the most abundant particles in the universe, yet incredibly elusive. Every second, about 100 trillion neutrinos pass through your body — but they rarely interact with matter.

**Key facts:**
• Nearly massless (but not quite zero!)
• Electrically neutral
• Comes in three "flavors": electron, muon, and tau
$$\\nu_e \\quad \\nu_\\mu \\quad \\nu_\\tau$$
• Produced in nuclear reactions: the Sun, reactors, cosmic rays
• Can travel through entire planets without stopping`,
	},
	{
		id: "what-is-oscillation",
		title: "What is Neutrino Oscillation?",
		content: `Neutrino oscillation is the quantum phenomenon where neutrinos change flavor as they travel.

A neutrino created as an electron neutrino can later be detected as a muon or tau neutrino!

**The key insight:** Flavor states are quantum superpositions of mass states:
$$|\\nu_\\alpha\\rangle = \\sum_{i=1}^{3} U_{\\alpha i} \\, |\\nu_i\\rangle$$

**How it works:**
• Flavor states (e, μ, τ) are mixtures of mass states (1, 2, 3)
• Mass states travel at slightly different speeds
• This creates quantum interference → flavor oscillates
• Depends on: energy, distance, and mixing parameters`,
	},
	{
		id: "pmns-matrix",
		title: "The PMNS Matrix",
		content: `The Pontecorvo-Maki-Nakagawa-Sakata (PMNS) matrix describes the mixing between flavor and mass states.

**The mixing matrix:**
$$U = \\begin{pmatrix} U_{e1} & U_{e2} & U_{e3} \\\\ U_{\\mu 1} & U_{\\mu 2} & U_{\\mu 3} \\\\ U_{\\tau 1} & U_{\\tau 2} & U_{\\tau 3} \\end{pmatrix}$$

**Parameters (from NuFit 5.2):**
$$\\theta_{12} \\approx 33.4° \\quad \\theta_{13} \\approx 8.6° \\quad \\theta_{23} \\approx 49°$$
$$\\delta_{CP} = \\text{unknown (key target!)}$$

**Mass splittings:**
$$\\Delta m^2_{21} = 7.42 \\times 10^{-5} \\text{ eV}^2$$
$$|\\Delta m^2_{31}| \\approx 2.5 \\times 10^{-3} \\text{ eV}^2$$`,
	},
	{
		id: "oscillation-formula",
		title: "Oscillation Probability",
		content: `The probability of flavor change (two-flavor approximation):

$$P(\\nu_\\alpha \\to \\nu_\\beta) = \\sin^2(2\\theta) \\, \\sin^2\\!\\left(\\frac{\\Delta m^2 L}{4E}\\right)$$

**Where:**
$$\\begin{aligned} \\theta &= \\text{mixing angle} \\\\ \\Delta m^2 &= \\text{mass-squared difference (eV}^2\\text{)} \\\\ L &= \\text{baseline distance (km)} \\\\ E &= \\text{neutrino energy (GeV)} \\end{aligned}$$

**Oscillation length** (one full cycle):
$$L_{\\text{osc}} = \\frac{4\\pi E}{\\Delta m^2} \\approx 2.48 \\, \\frac{E \\text{ [GeV]}}{\\Delta m^2 \\text{ [eV}^2\\text{]}} \\text{ km}$$`,
	},
	{
		id: "cp-violation",
		title: "CP Violation",
		content: `CP violation means neutrinos and antineutrinos behave differently.

**The asymmetry:**
$$P(\\nu_\\mu \\to \\nu_e) \\neq P(\\bar{\\nu}_\\mu \\to \\bar{\\nu}_e)$$

This occurs when the CP phase is non-trivial:
$$\\delta_{CP} \\neq 0° \\text{ and } \\delta_{CP} \\neq 180°$$

**Why it matters:**
The universe has more matter than antimatter. CP violation in neutrinos could help explain this cosmic mystery — the "baryon asymmetry problem."

Current hints suggest maximal CP violation around:
$$\\delta_{CP} \\sim -90° \\text{ (or } 270°\\text{)}$$`,
	},
	{
		id: "msw-effect",
		title: "MSW Matter Effect",
		content: `When neutrinos travel through matter, oscillations are modified by the MSW (Mikheyev-Smirnov-Wolfenstein) effect.

**Matter potential** from electron scattering:
$$V = \\sqrt{2} \\, G_F \\, N_e$$

**Modified mixing in matter:**
$$\\sin^2(2\\theta_m) = \\frac{\\sin^2(2\\theta)}{\\sin^2(2\\theta) + \\left(\\cos 2\\theta - \\frac{2EV}{\\Delta m^2}\\right)^2}$$

**Resonance condition** (MSW resonance):
$$E_{\\text{res}} = \\frac{\\Delta m^2 \\cos 2\\theta}{2\\sqrt{2} \\, G_F \\, N_e}$$

At resonance, even tiny vacuum mixing becomes maximal!`,
	},
	{
		id: "mass-ordering",
		title: "Mass Ordering",
		content: `We know neutrinos have mass, but not which arrangement:

**Normal Ordering (NO):**
$$m_1 < m_2 \\ll m_3$$
• The third mass state is heaviest
• Solar pair at bottom

**Inverted Ordering (IO):**
$$m_3 \\ll m_1 < m_2$$
• The third mass state is lightest  
• Solar pair at top

**What we know:**
$$\\Delta m^2_{21} > 0 \\quad \\text{(solar splitting)}$$
$$\\Delta m^2_{31} \\gtrless 0 \\quad \\text{(unknown sign!)}$$

JUNO, DUNE, and atmospheric measurements aim to resolve this.`,
	},
	{
		id: "experiments",
		title: "Neutrino Experiments",
		content: `**Accelerator experiments** (muon neutrino beams):
• T2K (Japan): L = 295 km, first CP hints
• NOvA (USA): L = 810 km, complementary
• DUNE (future): L = 1300 km, precision era
• Hyper-Kamiokande: next-generation

**Reactor experiments** (electron antineutrinos):
• Daya Bay, RENO: measured θ₁₃
• KamLAND: confirmed solar oscillations  
• JUNO: will determine mass ordering

**Natural sources:**
• Super-K, IceCube: atmospheric neutrinos
• SNO, Borexino: solar neutrinos
• IceCube: astrophysical neutrinos`,
	},
];

interface LearnMorePanelProps {
	isOpen?: boolean;
	onClose?: () => void;
}

const LearnMorePanel: React.FC<LearnMorePanelProps> = ({
	isOpen: controlledOpen,
	onClose,
}) => {
	const [internalOpen, setInternalOpen] = useState(false);
	const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
	const [expandedSection, setExpandedSection] = useState<string | null>(null);
	const { t } = useI18n();

	const handleClose = () => {
		if (onClose) onClose();
		else setInternalOpen(false);
	};

	if (!isOpen) {
		if (controlledOpen !== undefined) return null; // Controlled mode - don't show button
		return (
			<button
				type="button"
				onClick={() => setInternalOpen(true)}
				className="fixed top-[88px] left-4 z-10 px-2 py-1 rounded-md text-xs font-medium transition-all hover:scale-105"
				style={{
					background: "rgba(20, 20, 30, 0.9)",
					border: "1px solid rgba(255, 255, 255, 0.1)",
					color: "rgba(255, 255, 255, 0.8)",
					backdropFilter: "blur(8px)",
				}}
			>
				📚 {t.learnMore}
			</button>
		);
	}

	return (
		<div
			className="fixed top-16 left-4 z-40 w-[480px] max-w-[94vw] max-h-[82vh] overflow-hidden rounded-xl flex flex-col"
			style={{
				background: "rgba(10, 10, 18, 0.97)",
				border: "1px solid rgba(255, 255, 255, 0.1)",
				backdropFilter: "blur(20px)",
				boxShadow: "0 16px 64px rgba(0, 0, 0, 0.7)",
			}}
		>
			{/* Header */}
			<div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
				<h2 className="text-base font-semibold text-white">📚 {t.learnMore}</h2>
				<button
					type="button"
					onClick={handleClose}
					className="text-white/50 hover:text-white transition-colors text-lg"
				>
					✕
				</button>
			</div>

			{/* Scrollable content */}
			<div className="flex-1 overflow-y-auto p-3 scrollbar-hide">
				{SECTIONS.map((section) => (
					<div key={section.id} className="mb-1.5">
						<button
							type="button"
							onClick={() =>
								setExpandedSection(
									expandedSection === section.id ? null : section.id,
								)
							}
							className="w-full text-left px-4 py-3 rounded-lg text-[15px] text-white/85 hover:bg-white/5 transition-colors flex items-center justify-between"
						>
							<span>{section.title}</span>
							<span className="text-white/40 text-sm">
								{expandedSection === section.id ? "▼" : "▶"}
							</span>
						</button>

						{expandedSection === section.id && (
							<div
								className="px-4 py-5 text-[14px] text-white/80 leading-[1.8] rounded-lg mx-1 mt-1"
								style={{ background: "rgba(255, 255, 255, 0.02)" }}
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
