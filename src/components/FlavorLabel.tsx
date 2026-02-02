import type React from "react";
import { useSimulation } from "../context/SimulationContext"; // Assuming SimulationContext is in ../context/SimulationContext

const FlavorLabel: React.FC = () => {
	const { state } = useSimulation();

	// Get the latest probabilities from state.probabilityHistory
	const latestProbabilities =
		state.probabilityHistory.length > 0
			? state.probabilityHistory[state.probabilityHistory.length - 1]
			: { distance: 0, Pe: 1, Pmu: 0, Ptau: 0 }; // Default to electron at distance 0 if no history

	// Determine the dominant flavor
	let dominantFlavor = "Unknown";
	const { Pe, Pmu, Ptau } = latestProbabilities;

	if (Pe > Pmu && Pe > Ptau) {
		dominantFlavor = "Electron";
	} else if (Pmu > Pe && Pmu > Ptau) {
		dominantFlavor = "Muon";
	} else if (Ptau > Pe && Ptau > Pmu) {
		dominantFlavor = "Tau";
	} else if (Pe === Pmu && Pe > Ptau) {
		// Handle ties
		dominantFlavor = "Electron/Muon";
	} else if (Pe === Ptau && Pe > Pmu) {
		dominantFlavor = "Electron/Tau";
	} else if (Pmu === Ptau && Pmu > Pe) {
		dominantFlavor = "Muon/Tau";
	} else if (Pe === Pmu && Pe === Ptau) {
		dominantFlavor = "Electron/Muon/Tau";
	}

	return (
		<div
			style={{
				position: "absolute", // Position relative to the container (assuming a positioned parent)
				top: "20px", // Adjust positioning as needed
				left: "50%",
				transform: "translateX(-50%)", // Center the text
				color: "white", // Make the text visible against a potentially dark background
				fontSize: "1.2em",
				fontWeight: "bold",
				zIndex: 10, // Ensure the label is above the sphere
			}}
		>
			Dominant Flavor: {dominantFlavor}
		</div>
	);
};

export default FlavorLabel;
