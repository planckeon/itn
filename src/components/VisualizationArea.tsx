import type React from "react";
import { useMemo } from "react";
import { useSimulation } from "../context/SimulationContext";
import NeutrinoSphere from "./NeutrinoSphere";

// Flavor configuration
const FLAVOR_CONFIG = {
	electron: { symbol: "νₑ", name: "Electron", color: "rgb(59, 130, 246)" },
	muon: { symbol: "νμ", name: "Muon", color: "rgb(251, 146, 60)" },
	tau: { symbol: "ντ", name: "Tau", color: "rgb(217, 70, 239)" },
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
		<div className="relative flex flex-col items-center justify-center">
			{/* The neutrino sphere - the star of the show */}
			<NeutrinoSphere />

			{/* Minimal label below sphere - transparent background */}
			<div className="mt-6 text-center">
				{/* Current dominant flavor */}
				<p
					className="text-3xl font-light tracking-wide"
					style={{ color: dominantConfig.color }}
				>
					{dominantConfig.symbol}
				</p>

				{/* Distance traveled */}
				<p className="text-sm text-white/50 mt-2 tabular-nums">
					{distance.toFixed(0)} km
				</p>

				{/* Starting flavor (subtle) */}
				<p className="text-xs text-white/30 mt-1">
					from {FLAVOR_CONFIG[initialFlavor].symbol}
				</p>
			</div>
		</div>
	);
};

export default VisualizationArea;
