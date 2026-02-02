import { type JSAnimation, animate } from "animejs";
import type React from "react";
import { useEffect, useMemo, useRef } from "react";
import { useSimulation } from "../context/SimulationContext";

interface ProbabilityData {
	distance: number;
	Pe: number;
	Pmu: number;
	Ptau: number;
}

interface SimulationState {
	probabilityHistory: ProbabilityData[];
	distance: number;
}

// Define flavor colors - vibrant, modern palette
const FLAVOR_COLORS = {
	electron: { r: 59, g: 130, b: 246 }, // Blue-500
	muon: { r: 251, g: 146, b: 60 }, // Orange-400
	tau: { r: 217, g: 70, b: 239 }, // Fuchsia-500
};

const NeutrinoSphere: React.FC = () => {
	const sphereRef = useRef<HTMLDivElement>(null);
	const glowRef = useRef<HTMLDivElement>(null);
	const { state } = useSimulation() as { state: SimulationState };
	const animationRefs = useRef<JSAnimation[]>([]);

	// Get the latest probabilities from state.probabilityHistory
	const latestProbabilities: ProbabilityData = useMemo(() => {
		return state.probabilityHistory.length > 0
			? state.probabilityHistory[state.probabilityHistory.length - 1]
			: { distance: 0, Pe: 1, Pmu: 0, Ptau: 0 };
	}, [state.probabilityHistory]);

	// Blend colors based on probabilities
	const blendedColor = useMemo(() => {
		const { Pe, Pmu, Ptau } = latestProbabilities;
		const r = Math.round(
			FLAVOR_COLORS.electron.r * Pe +
				FLAVOR_COLORS.muon.r * Pmu +
				FLAVOR_COLORS.tau.r * Ptau,
		);
		const g = Math.round(
			FLAVOR_COLORS.electron.g * Pe +
				FLAVOR_COLORS.muon.g * Pmu +
				FLAVOR_COLORS.tau.g * Ptau,
		);
		const b = Math.round(
			FLAVOR_COLORS.electron.b * Pe +
				FLAVOR_COLORS.muon.b * Pmu +
				FLAVOR_COLORS.tau.b * Ptau,
		);
		return { r, g, b, hex: `rgb(${r}, ${g}, ${b})` };
	}, [latestProbabilities]);

	// Animate sphere color and glow
	useEffect(() => {
		if (!sphereRef.current || !glowRef.current) return;

		// Clear existing animations
		animationRefs.current.forEach((anim) => anim.pause());
		animationRefs.current = [];

		const { r, g, b, hex } = blendedColor;

		// Color transition
		animationRefs.current.push(
			animate(sphereRef.current, {
				background: `radial-gradient(circle at 30% 30%, rgb(${r + 60}, ${g + 60}, ${b + 60}), ${hex}, rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)}))`,
				duration: 400,
				ease: "outQuad",
			}),
		);

		// Glow effect
		animationRefs.current.push(
			animate(glowRef.current, {
				boxShadow: `0 0 60px 20px rgba(${r}, ${g}, ${b}, 0.5), 0 0 120px 40px rgba(${r}, ${g}, ${b}, 0.3), 0 0 200px 80px rgba(${r}, ${g}, ${b}, 0.15)`,
				duration: 400,
				ease: "outQuad",
			}),
		);

		// Pulsing animation
		animationRefs.current.push(
			animate(sphereRef.current, {
				scale: [1, 1.02, 1],
				duration: 2000,
				ease: "inOutSine",
				loop: true,
			}),
		);

		// Glow pulse
		animationRefs.current.push(
			animate(glowRef.current, {
				opacity: [0.8, 1, 0.8],
				scale: [1, 1.05, 1],
				duration: 2000,
				ease: "inOutSine",
				loop: true,
			}),
		);

		return () => {
			animationRefs.current.forEach((anim) => anim.pause());
			animationRefs.current = [];
		};
	}, [blendedColor]);

	return (
		<div className="relative flex items-center justify-center">
			{/* Outer glow layer */}
			<div
				ref={glowRef}
				className="absolute w-40 h-40 rounded-full"
				style={{
					boxShadow: `0 0 60px 20px rgba(${blendedColor.r}, ${blendedColor.g}, ${blendedColor.b}, 0.5)`,
				}}
			/>
			{/* Main sphere with gradient */}
			<div
				ref={sphereRef}
				className="relative w-36 h-36 rounded-full"
				style={{
					background: `radial-gradient(circle at 30% 30%, rgb(${blendedColor.r + 60}, ${blendedColor.g + 60}, ${blendedColor.b + 60}), ${blendedColor.hex}, rgb(${Math.max(0, blendedColor.r - 40)}, ${Math.max(0, blendedColor.g - 40)}, ${Math.max(0, blendedColor.b - 40)}))`,
					boxShadow:
						"inset 0 -10px 30px rgba(0,0,0,0.3), inset 0 10px 30px rgba(255,255,255,0.1)",
				}}
			/>
		</div>
	);
};

export default NeutrinoSphere;
