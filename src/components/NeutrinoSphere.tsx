import { type JSAnimation, animate } from "animejs";
import type React from "react";
import { useEffect, useRef } from "react";
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

// Define flavor colors in hex
const electronColor = "#0000FF"; // Blue
const muonColor = "#FFA500"; // Orange
const tauColor = "#EE82EE"; // Magenta (Violet is often used, but magenta is close)

const NeutrinoSphere: React.FC = () => {
	const sphereRef = useRef<HTMLDivElement>(null);
	const { state } = useSimulation() as { state: SimulationState };
	const animationRefs = useRef<JSAnimation[]>([]);

	// Get the latest probabilities from state.probabilityHistory
	const latestProbabilities: ProbabilityData =
		state.probabilityHistory.length > 0
			? state.probabilityHistory[state.probabilityHistory.length - 1]
			: { distance: 0, Pe: 1, Pmu: 0, Ptau: 0 };

	// Helper function to blend hex colors based on probabilities
	const blendColors = (pe: number, pmu: number, ptau: number): string => {
		// Convert hex to RGB
		const hexToRgb = (hex: string) => {
			const bigint = Number.parseInt(hex.slice(1), 16);
			const r = (bigint >> 16) & 255;
			const g = (bigint >> 8) & 255;
			const b = bigint & 255;
			return [r, g, b];
		};

		const rgbElectron = hexToRgb(electronColor);
		const rgbMuon = hexToRgb(muonColor);
		const rgbTau = hexToRgb(tauColor);

		// Blend RGB values based on probabilities
		const r = Math.round(
			rgbElectron[0] * pe + rgbMuon[0] * pmu + rgbTau[0] * ptau,
		);
		const g = Math.round(
			rgbElectron[1] * pe + rgbMuon[1] * pmu + rgbTau[1] * ptau,
		);
		const b = Math.round(
			rgbElectron[2] * pe + rgbMuon[2] * pmu + rgbTau[2] * ptau,
		);

		// Convert blended RGB back to hex
		const rgbToHex = (r: number, g: number, b: number) => {
			const hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
			return "#" + "0".repeat(6 - hex.length) + hex; // Pad with leading zeros if needed
		};

		return rgbToHex(r, g, b);
	};

	useEffect(() => {
		if (sphereRef.current) {
			// Calculate blended color
			const blendedColor = blendColors(
				latestProbabilities.Pe,
				latestProbabilities.Pmu,
				latestProbabilities.Ptau,
			);

			// Clear any existing animations
			animationRefs.current.forEach((anim) => anim.pause());
			animationRefs.current = [];

			// Create color transition animation
			animationRefs.current.push(
				animate(sphereRef.current, {
					backgroundColor: blendedColor,
					duration: 500,
					ease: "inOutQuad",
				}),
			);

			// Create pulsing animation
			animationRefs.current.push(
				animate(sphereRef.current, {
					scale: [1, 1.008, 1],
					duration: 2000,
					ease: "inOutSine",
					loop: true,
					delay: 500, // Start after color transition
				}),
			);
		}

		// Cleanup animations on component unmount
		return () => {
			animationRefs.current.forEach((anim) => {
				anim.pause();
			});
			animationRefs.current = [];
		};
	}, [latestProbabilities]); // Re-run effect when probabilities change

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "100%",
			}}
		>
			<div
				ref={sphereRef}
				style={{
					width: "150px", // Increased size for better visibility
					height: "150px",
					borderRadius: "50%",
					backgroundColor: blendColors(
						latestProbabilities.Pe,
						latestProbabilities.Pmu,
						latestProbabilities.Ptau,
					),
				}}
			></div>
		</div>
	);
};

export default NeutrinoSphere;
