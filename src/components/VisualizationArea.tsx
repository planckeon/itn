import type React from "react";
import { useMemo } from "react";
import { useSimulation } from "../context/SimulationContext";
import NeutrinoSphere from "./NeutrinoSphere";

// NuFit 5.2 values for MSW calculation
const DM31_SQ = 2.517e-3; // eV²
const THETA13_DEG = 8.57;

// Flavor configuration with consistent styling
// Using ν with subscript notation for all flavors
const FLAVOR_CONFIG = {
	electron: { symbol: "e", label: "Electron", color: "rgb(59, 130, 246)" },
	muon: { symbol: "μ", label: "Muon", color: "rgb(251, 146, 60)" },
	tau: { symbol: "τ", label: "Tau", color: "rgb(217, 70, 239)" },
} as const;

/**
 * Calculate MSW resonance energy
 */
function calculateResonanceEnergy(density: number, Ye = 0.5): number {
	const cos2theta = Math.cos(2 * THETA13_DEG * Math.PI / 180);
	return (DM31_SQ * cos2theta) / (1.52e-4 * density * Ye);
}

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
	const { probabilityHistory, distance, initialFlavor, matter, density, energy, isAntineutrino } = state;

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

	// Check if near MSW resonance
	const isNearResonance = useMemo(() => {
		if (!matter || isAntineutrino) {
			return false;
		}
		
		const E_res = calculateResonanceEnergy(density);
		const ratio = energy / E_res;
		const proximity = Math.exp(-Math.pow(Math.log(ratio), 2) * 2);
		
		return proximity > 0.3;
	}, [matter, density, energy, isAntineutrino]);

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

				{/* MSW Resonance indicator */}
				{isNearResonance && (
					<div 
						className="mt-3 px-2 py-1 rounded-full text-xs font-mono animate-pulse"
						style={{
							background: "rgba(255, 200, 50, 0.2)",
							border: "1px solid rgba(255, 200, 50, 0.5)",
							color: "rgb(255, 200, 50)",
						}}
					>
						MSW Resonance
					</div>
				)}
			</div>
		</div>
	);
};

export default VisualizationArea;
