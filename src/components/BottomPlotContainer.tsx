import type React from "react";
import { useMemo } from "react";
import { useSimulation } from "../context/SimulationContext";
import ProbabilityPlot from "./ProbabilityPlot";

// Flavor color mapping
const FLAVOR_COLORS = {
	electron: "rgb(59, 130, 246)",
	muon: "rgb(251, 146, 60)",
	tau: "rgb(217, 70, 239)",
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
		<div className="fixed bottom-4 left-1/2 z-20 -translate-x-1/2 w-[90vw] max-w-2xl">
			<div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl px-6 py-4 border border-white/10">
				{/* Legend */}
				<div className="flex items-center justify-center gap-6 mb-3">
					<span className="text-[10px] uppercase tracking-widest text-white/60">
						Oscillation Probabilities
					</span>
					<div className="flex gap-4">
						<div className="flex items-center gap-1.5">
							<div
								className="w-3 h-3 rounded-full"
								style={{ backgroundColor: FLAVOR_COLORS.electron }}
							/>
							<span className="text-xs text-white/60">P(νₑ)</span>
						</div>
						<div className="flex items-center gap-1.5">
							<div
								className="w-3 h-3 rounded-full"
								style={{ backgroundColor: FLAVOR_COLORS.muon }}
							/>
							<span className="text-xs text-white/60">P(νμ)</span>
						</div>
						<div className="flex items-center gap-1.5">
							<div
								className="w-3 h-3 rounded-full"
								style={{ backgroundColor: FLAVOR_COLORS.tau }}
							/>
							<span className="text-xs text-white/60">P(ντ)</span>
						</div>
					</div>
				</div>

				{/* Plot */}
				<ProbabilityPlot
					data={probabilityData}
					flavors={FLAVORS}
					flavorColors={FLAVOR_COLORS}
					height={160}
					distanceLabel="Distance (km)"
					probabilityLabel="Probability"
				/>
			</div>
		</div>
	);
};

export default BottomPlotContainer;
