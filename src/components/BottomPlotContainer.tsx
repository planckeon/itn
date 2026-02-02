// BottomPlotContainer.tsx
import type React from "react";
import { useMemo } from "react";
import { useSimulation } from "../context/SimulationContext";
import ProbabilityPlot from "./ProbabilityPlot";

// Helper to convert [r,g,b] to CSS rgb string
const flavorColorStrings = {
	electron: "rgb(80,180,255)",
	muon: "rgb(255,140,40)",
	tau: "rgb(220,60,255)",
};

const FLAVORS = ["electron", "muon", "tau"];

const BottomPlotContainer: React.FC = () => {
	const { state } = useSimulation();
	const { probabilityHistory } = state;

	// Generate probability data for the plot
	const probabilityData = useMemo(() => {
		return probabilityHistory.map((item) => ({
			distance: item.distance,
			probabilities: {
				electron: item.Pe,
				muon: item.Pmu,
				tau: item.Ptau,
			},
		}));
	}, [probabilityHistory]);

	return (
		<div className="fixed bottom-4 left-1/2 z-20 -translate-x-1/2 bg-neutral-900/95 rounded-lg shadow-xl px-6 py-3 flex items-center justify-center border border-neutral-800 min-w-[320px] max-w-xl w-full backdrop-blur-sm">
			<ProbabilityPlot
				data={probabilityData}
				flavors={FLAVORS}
				flavorColors={flavorColorStrings}
				width={520}
				height={200}
				distanceLabel="Distance (km)"
				probabilityLabel="Probability"
			/>
		</div>
	);
};

export default BottomPlotContainer;
