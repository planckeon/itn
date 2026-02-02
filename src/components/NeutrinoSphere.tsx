import type React from "react";
import { useMemo } from "react";
import { useSimulation } from "../context/SimulationContext";

interface ProbabilityData {
	distance: number;
	Pe: number;
	Pmu: number;
	Ptau: number;
}

interface SimulationState {
	probabilityHistory: ProbabilityData[];
	matter: boolean;
	density: number;
	energy: number;
	isAntineutrino: boolean;
}

// NuFit 5.2 values
const DM31_SQ = 2.517e-3; // eV²
const THETA13_DEG = 8.57;

// Flavor colors - vibrant and visible
const FLAVOR_COLORS = {
	electron: { r: 59, g: 130, b: 246 }, // Blue-500
	muon: { r: 251, g: 146, b: 60 }, // Orange-400
	tau: { r: 217, g: 70, b: 239 }, // Fuchsia-500
};

/**
 * Calculate MSW resonance energy for given matter density
 * E_res = Δm² * cos(2θ₁₃) / (2 * √2 * G_F * N_e)
 * Numerically: E_res ≈ Δm²[eV²] * cos(2θ) / (1.52e-4 * ρ * Y_e) GeV
 * where ρ is in g/cm³ and Y_e ≈ 0.5
 */
function calculateResonanceEnergy(density: number, Ye = 0.5): number {
	const cos2theta = Math.cos(2 * THETA13_DEG * Math.PI / 180);
	// MSW resonance condition: λ = Δm² * cos(2θ) / (2E)
	// E_res = Δm² * cos(2θ) / (2 * √2 * G_F * n_e)
	// Numerical approximation:
	return (DM31_SQ * cos2theta) / (1.52e-4 * density * Ye);
}

const NeutrinoSphere: React.FC = () => {
	const { state } = useSimulation() as { state: SimulationState };

	// Get the latest probabilities
	const latestProbabilities: ProbabilityData = useMemo(() => {
		return state.probabilityHistory.length > 0
			? state.probabilityHistory[state.probabilityHistory.length - 1]
			: { distance: 0, Pe: 1, Pmu: 0, Ptau: 0 };
	}, [state.probabilityHistory]);

	// Check if near MSW resonance
	const { isNearResonance, resonanceStrength } = useMemo(() => {
		if (!state.matter || state.isAntineutrino) {
			// MSW resonance only for neutrinos (not antineutrinos) in matter
			return { isNearResonance: false, resonanceStrength: 0 };
		}
		
		const E_res = calculateResonanceEnergy(state.density);
		// Calculate how close we are to resonance (within factor of 2)
		const ratio = state.energy / E_res;
		const proximity = Math.exp(-Math.pow(Math.log(ratio), 2) * 2);
		
		return {
			isNearResonance: proximity > 0.3,
			resonanceStrength: proximity,
		};
	}, [state.matter, state.density, state.energy, state.isAntineutrino]);

	// Blend colors based on probabilities
	const blendedColor = useMemo(() => {
		const { Pe, Pmu, Ptau } = latestProbabilities;
		const r = Math.round(
			FLAVOR_COLORS.electron.r * Pe +
				FLAVOR_COLORS.muon.r * Pmu +
				FLAVOR_COLORS.tau.r * Ptau,
		);
		const g = Math.round(
			FLAVOR_COLORS.electron.g * Pe +
				FLAVOR_COLORS.muon.g * Pmu +
				FLAVOR_COLORS.tau.g * Ptau,
		);
		const b = Math.round(
			FLAVOR_COLORS.electron.b * Pe +
				FLAVOR_COLORS.muon.b * Pmu +
				FLAVOR_COLORS.tau.b * Ptau,
		);
		return { r, g, b };
	}, [latestProbabilities]);

	const { r, g, b } = blendedColor;
	
	// Simple 3D shading colors - light from top-left
	const colorLight = `rgb(${Math.min(255, r + 70)}, ${Math.min(255, g + 70)}, ${Math.min(255, b + 70)})`;
	const colorBase = `rgb(${r}, ${g}, ${b})`;
	const colorDark = `rgb(${Math.max(0, r - 50)}, ${Math.max(0, g - 50)}, ${Math.max(0, b - 50)})`;

	return (
		<div
			className="relative flex items-center justify-center"
			style={{ width: "140px", height: "140px" }}
		>
			{/* MSW Resonance ring - visible when near resonance energy */}
			{isNearResonance && (
				<div
					className="absolute rounded-full"
					style={{
						width: "140px",
						height: "140px",
						border: `2px solid rgba(255, 200, 50, ${resonanceStrength * 0.8})`,
						boxShadow: `
							0 0 20px rgba(255, 200, 50, ${resonanceStrength * 0.6}),
							0 0 40px rgba(255, 200, 50, ${resonanceStrength * 0.3}),
							inset 0 0 20px rgba(255, 200, 50, ${resonanceStrength * 0.2})
						`,
						animation: "pulse 1s ease-in-out infinite",
					}}
				/>
			)}

			{/* Outer glow - pulsing */}
			<div
				className="absolute rounded-full animate-pulse"
				style={{
					width: "130px",
					height: "130px",
					background: `radial-gradient(circle, rgba(${r}, ${g}, ${b}, 0.15) 0%, transparent 70%)`,
					filter: "blur(10px)",
				}}
			/>

			{/* Main 3D-lit sphere */}
			<div
				className="rounded-full transition-colors duration-200"
				style={{
					width: "100px",
					height: "100px",
					background: `radial-gradient(circle at 30% 25%, ${colorLight}, ${colorBase} 45%, ${colorDark} 100%)`,
					boxShadow: `
						0 0 50px 15px rgba(${r}, ${g}, ${b}, 0.4),
						0 0 100px 30px rgba(${r}, ${g}, ${b}, 0.15),
						inset -12px -12px 30px rgba(0, 0, 0, 0.35),
						inset 6px 6px 20px rgba(255, 255, 255, 0.15)
					`,
				}}
			>
				{/* Primary specular highlight */}
				<div
					className="absolute rounded-full"
					style={{
						width: "30px",
						height: "18px",
						top: "16px",
						left: "18px",
						background:
							"radial-gradient(ellipse at center, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)",
						filter: "blur(3px)",
						transform: "rotate(-25deg)",
					}}
				/>

				{/* Secondary highlight */}
				<div
					className="absolute rounded-full"
					style={{
						width: "12px",
						height: "8px",
						top: "38px",
						left: "22px",
						background:
							"radial-gradient(ellipse at center, rgba(255, 255, 255, 0.3) 0%, transparent 70%)",
						filter: "blur(2px)",
						transform: "rotate(-15deg)",
					}}
				/>
			</div>
		</div>
	);
};

export default NeutrinoSphere;
