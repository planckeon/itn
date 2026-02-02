import type React from "react";
import { useMemo } from "react";
import { useSimulation } from "../context/SimulationContext";
import NeutrinoSphere from "./NeutrinoSphere";

// Flavor configuration with consistent styling
// Using ν with subscript notation for all flavors
const FLAVOR_CONFIG = {
	electron: { symbol: "e", label: "Electron", color: "rgb(59, 130, 246)" },
	muon: { symbol: "μ", label: "Muon", color: "rgb(251, 146, 60)" },
	tau: { symbol: "τ", label: "Tau", color: "rgb(217, 70, 239)" },
} as const;

// Component for consistent neutrino symbol rendering
const NeutrinoSymbol: React.FC<{ flavor: keyof typeof FLAVOR_CONFIG; className?: string }> = ({ 
	flavor, 
	className = "" 
}) => {
	const config = FLAVOR_CONFIG[flavor];
	return (
		<span className={className} style={{ color: config.color }}>
			ν<sub>{config.symbol}</sub>
		</span>
	);
};

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

	return (
		<div className="relative flex flex-col items-center justify-center">
			{/* The neutrino sphere - the star of the show */}
			<NeutrinoSphere />

			{/* Minimal label below sphere */}
			<div className="mt-6 text-center">
				{/* Current dominant flavor - large */}
				<div className="text-3xl font-light tracking-wide">
					<NeutrinoSymbol flavor={dominantFlavor} />
				</div>

				{/* Distance traveled */}
				<p className="text-sm text-white/50 mt-2 tabular-nums">
					{distance.toFixed(0)} km
				</p>

				{/* Starting flavor (subtle) */}
				<p className="text-xs text-white/30 mt-1">
					from <NeutrinoSymbol flavor={initialFlavor} className="text-white/40" />
				</p>
			</div>
		</div>
	);
};

export default VisualizationArea;
