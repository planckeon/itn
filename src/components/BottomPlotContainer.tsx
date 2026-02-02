import type React from "react";
import { useMemo } from "react";
import { useSimulation } from "../context/SimulationContext";
import ProbabilityPlot from "./ProbabilityPlot";

// Flavor color mapping - vibrant colors with good contrast
const FLAVOR_COLORS = {
	electron: "rgb(96, 165, 250)", // Brighter blue
	muon: "rgb(251, 146, 60)", // Warm orange
	tau: "rgb(232, 121, 249)", // Brighter fuchsia
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
		<div className="w-full h-full px-4 md:px-8">
			{/* Glass-morphism container with subtle glow - full width */}
			<div
				className="relative rounded-2xl overflow-hidden h-full max-w-5xl mx-auto"
				style={{
					background:
						"linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.85) 100%)",
					boxShadow:
						"0 -10px 40px -10px rgba(0, 0, 0, 0.5), 0 0 60px rgba(96, 165, 250, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
				}}
			>
				{/* Subtle top highlight */}
				<div
					className="absolute inset-x-0 top-0 h-px"
					style={{
						background:
							"linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
					}}
				/>

				<div className="backdrop-blur-xl px-6 py-4 border border-white/10 rounded-2xl h-full flex flex-col">
					{/* Header with title and legend */}
					<div className="flex items-center justify-between mb-3">
						{/* Title */}
						<h3 className="text-xs font-semibold uppercase tracking-wider text-white/70">
							Oscillation Probabilities
						</h3>

						{/* Legend */}
						<div className="flex items-center gap-5">
							<div className="flex items-center gap-2">
								<div
									className="w-3 h-3 rounded-full shadow-lg"
									style={{
										backgroundColor: FLAVOR_COLORS.electron,
										boxShadow: `0 0 10px ${FLAVOR_COLORS.electron}`,
									}}
								/>
								<span className="text-sm font-medium text-white/80">P(νₑ)</span>
							</div>
							<div className="flex items-center gap-2">
								<div
									className="w-3 h-3 rounded-full shadow-lg"
									style={{
										backgroundColor: FLAVOR_COLORS.muon,
										boxShadow: `0 0 10px ${FLAVOR_COLORS.muon}`,
									}}
								/>
								<span className="text-sm font-medium text-white/80">P(νμ)</span>
							</div>
							<div className="flex items-center gap-2">
								<div
									className="w-3 h-3 rounded-full shadow-lg"
									style={{
										backgroundColor: FLAVOR_COLORS.tau,
										boxShadow: `0 0 10px ${FLAVOR_COLORS.tau}`,
									}}
								/>
								<span className="text-sm font-medium text-white/80">P(ντ)</span>
							</div>
						</div>
					</div>

					{/* Plot - takes remaining space */}
					<div className="flex-1 min-h-0">
						<ProbabilityPlot
							data={probabilityData}
							flavors={FLAVORS}
							flavorColors={FLAVOR_COLORS}
							height={200}
							distanceLabel="Distance (km)"
							probabilityLabel="Probability"
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default BottomPlotContainer;
