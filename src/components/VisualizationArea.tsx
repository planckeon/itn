import type React from "react";
import { useSimulation } from "../context/SimulationContext";
import FlavorLabel from "./FlavorLabel";
import NeutrinoSphere from "./NeutrinoSphere";
import ProbabilityPlot from "./ProbabilityPlot";
import Starfield from "./Starfield";

const VisualizationArea: React.FC = () => {
	const { state } = useSimulation();
	const { probabilityHistory } = state;

	// Flavor colors matching the reference as CSS strings
	const flavorColors = {
		electron: "rgb(80, 180, 255)", // Blue
		muon: "rgb(255, 140, 40)", // Orange
		tau: "rgb(220, 60, 255)", // Magenta
	};

	// Format probability data for ProbabilityPlot
	const probabilityData = probabilityHistory.map((entry) => ({
		distance: entry.distance,
		probabilities: {
			electron: entry.Pe,
			muon: entry.Pmu,
			tau: entry.Ptau,
		},
	}));

	return (
		<div className="relative w-full h-full">
			<Starfield />
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<FlavorLabel />
				<NeutrinoSphere />
			</div>
			<ProbabilityPlot
				data={probabilityData}
				flavors={["electron", "muon", "tau"]}
				flavorColors={flavorColors}
				width={500}
				height={120}
				distanceLabel="Distance (km)"
				probabilityLabel="Probability"
			/>
		</div>
	);
};

export default VisualizationArea;
