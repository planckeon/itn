import type React from "react";
import { useMemo } from "react";
import { useSimulation } from "../context/SimulationContext";
import NeutrinoSphere from "./NeutrinoSphere";

// Flavor color mapping
const FLAVOR_CONFIG = {
	electron: { name: "Electron", symbol: "νₑ", color: "rgb(59, 130, 246)" },
	muon: { name: "Muon", symbol: "νᵤ", color: "rgb(251, 146, 60)" },
	tau: { name: "Tau", symbol: "ν_τ", color: "rgb(217, 70, 239)" },
} as const;

const VisualizationArea: React.FC = () => {
	const { state } = useSimulation();
	const { probabilityHistory, distance, initialFlavor } = state;

	// Get latest probabilities
	const latestProbs = useMemo(() => {
		if (probabilityHistory.length === 0) {
			return { Pe: 1, Pmu: 0, Ptau: 0 };
		}
		return probabilityHistory[probabilityHistory.length - 1];
	}, [probabilityHistory]);

	// Determine dominant flavor
	const dominantFlavor = useMemo(() => {
		const { Pe, Pmu, Ptau } = latestProbs;
		if (Pe >= Pmu && Pe >= Ptau) return "electron";
		if (Pmu >= Pe && Pmu >= Ptau) return "muon";
		return "tau";
	}, [latestProbs]);

	const dominantConfig = FLAVOR_CONFIG[dominantFlavor];

	return (
		<div className="relative flex flex-col items-center justify-center gap-6 pt-16">
			{/* Initial flavor indicator */}
			<div className="text-center mb-2">
				<p className="text-xs text-white/40 uppercase tracking-widest mb-1">
					Initial State
				</p>
				<p
					className="text-lg font-medium"
					style={{ color: FLAVOR_CONFIG[initialFlavor].color }}
				>
					{FLAVOR_CONFIG[initialFlavor].symbol}{" "}
					{FLAVOR_CONFIG[initialFlavor].name} Neutrino
				</p>
			</div>

			{/* Neutrino visualization */}
			<div className="relative">
				<NeutrinoSphere />
			</div>

			{/* Current state display */}
			<div className="text-center mt-4 space-y-3">
				{/* Dominant flavor */}
				<div>
					<p className="text-xs text-white/40 uppercase tracking-widest mb-1">
						Dominant Flavor
					</p>
					<p
						className="text-2xl font-light"
						style={{ color: dominantConfig.color }}
					>
						{dominantConfig.symbol} {dominantConfig.name}
					</p>
				</div>

				{/* Distance traveled */}
				<div className="bg-white/5 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/10">
					<p className="text-xs text-white/40 uppercase tracking-widest mb-1">
						Distance Traveled
					</p>
					<p className="text-3xl font-light text-white/90 tabular-nums">
						{distance.toFixed(0)}{" "}
						<span className="text-lg text-white/50">km</span>
					</p>
				</div>

				{/* Probability breakdown */}
				<div className="flex gap-4 justify-center mt-4">
					<ProbabilityBadge
						label="νₑ"
						probability={latestProbs.Pe}
						color={FLAVOR_CONFIG.electron.color}
					/>
					<ProbabilityBadge
						label="νᵤ"
						probability={latestProbs.Pmu}
						color={FLAVOR_CONFIG.muon.color}
					/>
					<ProbabilityBadge
						label="ν_τ"
						probability={latestProbs.Ptau}
						color={FLAVOR_CONFIG.tau.color}
					/>
				</div>
			</div>
		</div>
	);
};

// Probability badge component
interface ProbabilityBadgeProps {
	label: string;
	probability: number;
	color: string;
}

const ProbabilityBadge: React.FC<ProbabilityBadgeProps> = ({
	label,
	probability,
	color,
}) => {
	const percentage = (probability * 100).toFixed(1);
	return (
		<div
			className="flex flex-col items-center px-3 py-2 rounded-lg border"
			style={{
				borderColor: `${color}40`,
				backgroundColor: `${color}10`,
			}}
		>
			<span className="text-lg font-medium" style={{ color }}>
				{label}
			</span>
			<span className="text-sm text-white/70 tabular-nums">{percentage}%</span>
		</div>
	);
};

export default VisualizationArea;
