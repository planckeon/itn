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
}

// Flavor colors - vibrant and visible
const FLAVOR_COLORS = {
	electron: { r: 59, g: 130, b: 246 }, // Blue-500
	muon: { r: 251, g: 146, b: 60 }, // Orange-400
	tau: { r: 217, g: 70, b: 239 }, // Fuchsia-500
};

const NeutrinoSphere: React.FC = () => {
	const sphereRef = useRef<HTMLDivElement>(null);
	const glowRef = useRef<HTMLDivElement>(null);
	const outerGlowRef = useRef<HTMLDivElement>(null);
	const { state } = useSimulation() as { state: SimulationState };
	const animationRefs = useRef<JSAnimation[]>([]);

	// Get the latest probabilities
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
		return { r, g, b };
	}, [latestProbabilities]);

	// Animate color and glow
	useEffect(() => {
		// Clear existing animations
		for (const anim of animationRefs.current) {
			anim.pause();
		}
		animationRefs.current = [];

		const { r, g, b } = blendedColor;
		const colorLight = `rgb(${Math.min(255, r + 80)}, ${Math.min(255, g + 80)}, ${Math.min(255, b + 80)})`;
		const colorBase = `rgb(${r}, ${g}, ${b})`;
		const colorDark = `rgb(${Math.max(0, r - 50)}, ${Math.max(0, g - 50)}, ${Math.max(0, b - 50)})`;

		// Main sphere gradient animation
		if (sphereRef.current) {
			animationRefs.current.push(
				animate(sphereRef.current, {
					background: `radial-gradient(circle at 35% 30%, ${colorLight}, ${colorBase} 50%, ${colorDark} 100%)`,
					boxShadow: `
						0 0 60px 20px rgba(${r}, ${g}, ${b}, 0.6),
						0 0 100px 40px rgba(${r}, ${g}, ${b}, 0.3),
						inset -10px -10px 30px rgba(0, 0, 0, 0.4),
						inset 5px 5px 20px rgba(255, 255, 255, 0.1)
					`,
					duration: 500,
					ease: "outQuad",
				}),
			);

			// Subtle pulsing animation
			animationRefs.current.push(
				animate(sphereRef.current, {
					scale: [1, 1.02, 1],
					duration: 2500,
					ease: "inOutSine",
					loop: true,
				}),
			);
		}

		// Inner glow layer
		if (glowRef.current) {
			animationRefs.current.push(
				animate(glowRef.current, {
					background: `radial-gradient(circle, rgba(${r}, ${g}, ${b}, 0.5) 0%, rgba(${r}, ${g}, ${b}, 0.2) 50%, transparent 70%)`,
					duration: 500,
					ease: "outQuad",
				}),
			);

			animationRefs.current.push(
				animate(glowRef.current, {
					opacity: [0.7, 1, 0.7],
					scale: [1, 1.05, 1],
					duration: 3000,
					ease: "inOutSine",
					loop: true,
				}),
			);
		}

		// Outer ethereal glow
		if (outerGlowRef.current) {
			animationRefs.current.push(
				animate(outerGlowRef.current, {
					background: `radial-gradient(circle, rgba(${r}, ${g}, ${b}, 0.15) 0%, rgba(${r}, ${g}, ${b}, 0.05) 40%, transparent 70%)`,
					duration: 500,
					ease: "outQuad",
				}),
			);

			animationRefs.current.push(
				animate(outerGlowRef.current, {
					opacity: [0.5, 0.9, 0.5],
					scale: [1, 1.1, 1],
					duration: 4000,
					ease: "inOutSine",
					loop: true,
				}),
			);
		}

		return () => {
			for (const anim of animationRefs.current) {
				anim.pause();
			}
			animationRefs.current = [];
		};
	}, [blendedColor]);

	const { r, g, b } = blendedColor;
	const colorLight = `rgb(${Math.min(255, r + 80)}, ${Math.min(255, g + 80)}, ${Math.min(255, b + 80)})`;
	const colorBase = `rgb(${r}, ${g}, ${b})`;
	const colorDark = `rgb(${Math.max(0, r - 50)}, ${Math.max(0, g - 50)}, ${Math.max(0, b - 50)})`;

	return (
		<div
			className="relative flex items-center justify-center"
			style={{ width: "300px", height: "300px" }}
		>
			{/* Outer ethereal glow - creates the "flying through space" energy feel */}
			<div
				ref={outerGlowRef}
				className="absolute rounded-full pointer-events-none"
				style={{
					width: "280px",
					height: "280px",
					background: `radial-gradient(circle, rgba(${r}, ${g}, ${b}, 0.15) 0%, rgba(${r}, ${g}, ${b}, 0.05) 40%, transparent 70%)`,
					filter: "blur(10px)",
				}}
			/>

			{/* Inner glow layer */}
			<div
				ref={glowRef}
				className="absolute rounded-full pointer-events-none"
				style={{
					width: "200px",
					height: "200px",
					background: `radial-gradient(circle, rgba(${r}, ${g}, ${b}, 0.5) 0%, rgba(${r}, ${g}, ${b}, 0.2) 50%, transparent 70%)`,
				}}
			/>

			{/* Main neutrino sphere - prominent and glowing */}
			<div
				ref={sphereRef}
				className="relative rounded-full"
				style={{
					width: "150px",
					height: "150px",
					background: `radial-gradient(circle at 35% 30%, ${colorLight}, ${colorBase} 50%, ${colorDark} 100%)`,
					boxShadow: `
						0 0 60px 20px rgba(${r}, ${g}, ${b}, 0.6),
						0 0 100px 40px rgba(${r}, ${g}, ${b}, 0.3),
						inset -10px -10px 30px rgba(0, 0, 0, 0.4),
						inset 5px 5px 20px rgba(255, 255, 255, 0.1)
					`,
				}}
			>
				{/* Specular highlight */}
				<div
					className="absolute rounded-full"
					style={{
						width: "40px",
						height: "25px",
						top: "20px",
						left: "25px",
						background:
							"radial-gradient(ellipse at center, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)",
						filter: "blur(4px)",
						transform: "rotate(-20deg)",
					}}
				/>

				{/* Secondary highlight */}
				<div
					className="absolute rounded-full"
					style={{
						width: "15px",
						height: "10px",
						top: "50px",
						left: "20px",
						background:
							"radial-gradient(ellipse at center, rgba(255, 255, 255, 0.35) 0%, transparent 70%)",
						filter: "blur(2px)",
					}}
				/>
			</div>
		</div>
	);
};

export default NeutrinoSphere;
