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
}

// Flavor colors - vibrant and visible
const FLAVOR_COLORS = {
	electron: { r: 59, g: 130, b: 246 }, // Blue-500
	muon: { r: 251, g: 146, b: 60 }, // Orange-400
	tau: { r: 217, g: 70, b: 239 }, // Fuchsia-500
};

const NeutrinoSphere: React.FC = () => {
	const { state } = useSimulation() as { state: SimulationState };

	// Get the latest probabilities
	const latestProbabilities: ProbabilityData = useMemo(() => {
		return state.probabilityHistory.length > 0
			? state.probabilityHistory[state.probabilityHistory.length - 1]
			: { distance: 0, Pe: 1, Pmu: 0, Ptau: 0 };
	}, [state.probabilityHistory]);

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
