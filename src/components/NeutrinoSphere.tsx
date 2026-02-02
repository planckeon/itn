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
	const colorLight = `rgb(${Math.min(255, r + 60)}, ${Math.min(255, g + 60)}, ${Math.min(255, b + 60)})`;
	const colorBase = `rgb(${r}, ${g}, ${b})`;
	const colorDark = `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`;

	return (
		<div
			className="relative flex items-center justify-center"
			style={{ width: "120px", height: "120px" }}
		>
			{/* Simple 3D-lit sphere */}
			<div
				className="rounded-full transition-all duration-150"
				style={{
					width: "90px",
					height: "90px",
					background: `radial-gradient(circle at 35% 30%, ${colorLight}, ${colorBase} 50%, ${colorDark} 100%)`,
					boxShadow: `
						0 0 40px 10px rgba(${r}, ${g}, ${b}, 0.5),
						0 0 80px 20px rgba(${r}, ${g}, ${b}, 0.2),
						inset -8px -8px 20px rgba(0, 0, 0, 0.3),
						inset 4px 4px 15px rgba(255, 255, 255, 0.1)
					`,
				}}
			>
				{/* Specular highlight */}
				<div
					className="absolute rounded-full"
					style={{
						width: "25px",
						height: "15px",
						top: "15px",
						left: "20px",
						background:
							"radial-gradient(ellipse at center, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)",
						filter: "blur(3px)",
						transform: "rotate(-20deg)",
					}}
				/>
			</div>
		</div>
	);
};

export default NeutrinoSphere;
