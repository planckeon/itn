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
	const containerRef = useRef<HTMLDivElement>(null);
	const coreRef = useRef<HTMLDivElement>(null);
	const innerGlowRef = useRef<HTMLDivElement>(null);
	const midGlowRef = useRef<HTMLDivElement>(null);
	const outerGlowRef = useRef<HTMLDivElement>(null);
	const atmosphereRef = useRef<HTMLDivElement>(null);
	const ringsRef = useRef<HTMLDivElement>(null);
	const particlesRef = useRef<HTMLDivElement>(null);
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
		return { r, g, b };
	}, [latestProbabilities]);

	// Animate all layers with color and effects
	useEffect(() => {
		// Clear existing animations
		for (const anim of animationRefs.current) {
			anim.pause();
		}
		animationRefs.current = [];

		const { r, g, b } = blendedColor;

		// Brighter core colors
		const coreLight = `rgb(${Math.min(255, r + 100)}, ${Math.min(255, g + 100)}, ${Math.min(255, b + 100)})`;
		const coreMid = `rgb(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)})`;
		const coreBase = `rgb(${r}, ${g}, ${b})`;
		const coreDark = `rgb(${Math.max(0, r - 60)}, ${Math.max(0, g - 60)}, ${Math.max(0, b - 60)})`;

		// Core sphere gradient animation
		if (coreRef.current) {
			animationRefs.current.push(
				animate(coreRef.current, {
					background: `radial-gradient(circle at 35% 25%, ${coreLight}, ${coreMid} 30%, ${coreBase} 60%, ${coreDark} 100%)`,
					duration: 600,
					ease: "outQuad",
				}),
			);

			// Core pulse - subtle breathing
			animationRefs.current.push(
				animate(coreRef.current, {
					scale: [1, 1.03, 1],
					duration: 3000,
					ease: "inOutSine",
					loop: true,
				}),
			);
		}

		// Inner glow - tight bright halo
		if (innerGlowRef.current) {
			animationRefs.current.push(
				animate(innerGlowRef.current, {
					boxShadow: `
						0 0 20px 5px rgba(${r}, ${g}, ${b}, 0.8),
						0 0 40px 10px rgba(${r}, ${g}, ${b}, 0.5),
						inset 0 0 30px 10px rgba(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)}, 0.3)
					`,
					duration: 600,
					ease: "outQuad",
				}),
			);

			// Inner glow pulse
			animationRefs.current.push(
				animate(innerGlowRef.current, {
					opacity: [0.9, 1, 0.9],
					scale: [1, 1.02, 1],
					duration: 2500,
					ease: "inOutSine",
					loop: true,
				}),
			);
		}

		// Mid glow - medium spread
		if (midGlowRef.current) {
			animationRefs.current.push(
				animate(midGlowRef.current, {
					background: `radial-gradient(circle, rgba(${r}, ${g}, ${b}, 0.4) 0%, rgba(${r}, ${g}, ${b}, 0.15) 40%, transparent 70%)`,
					duration: 600,
					ease: "outQuad",
				}),
			);

			// Mid glow pulse - offset timing
			animationRefs.current.push(
				animate(midGlowRef.current, {
					opacity: [0.7, 1, 0.7],
					scale: [1, 1.08, 1],
					duration: 3500,
					ease: "inOutSine",
					loop: true,
				}),
			);
		}

		// Outer glow - large ethereal spread
		if (outerGlowRef.current) {
			animationRefs.current.push(
				animate(outerGlowRef.current, {
					background: `radial-gradient(circle, rgba(${r}, ${g}, ${b}, 0.2) 0%, rgba(${r}, ${g}, ${b}, 0.08) 30%, rgba(${r}, ${g}, ${b}, 0.02) 60%, transparent 80%)`,
					duration: 600,
					ease: "outQuad",
				}),
			);

			// Outer glow pulse - slow ethereal breathing
			animationRefs.current.push(
				animate(outerGlowRef.current, {
					opacity: [0.5, 0.8, 0.5],
					scale: [1, 1.1, 1],
					duration: 4000,
					ease: "inOutSine",
					loop: true,
				}),
			);
		}

		// Atmosphere layer - subtle color shift aura
		if (atmosphereRef.current) {
			animationRefs.current.push(
				animate(atmosphereRef.current, {
					borderColor: `rgba(${r}, ${g}, ${b}, 0.3)`,
					boxShadow: `0 0 60px 20px rgba(${r}, ${g}, ${b}, 0.15)`,
					duration: 600,
					ease: "outQuad",
				}),
			);

			// Atmosphere rotation for depth
			animationRefs.current.push(
				animate(atmosphereRef.current, {
					rotate: [0, 360],
					duration: 20000,
					ease: "linear",
					loop: true,
				}),
			);
		}

		// Orbital rings
		if (ringsRef.current) {
			animationRefs.current.push(
				animate(ringsRef.current, {
					borderColor: `rgba(${r}, ${g}, ${b}, 0.25)`,
					duration: 600,
					ease: "outQuad",
				}),
			);

			// Rings rotation
			animationRefs.current.push(
				animate(ringsRef.current, {
					rotate: [0, -360],
					duration: 15000,
					ease: "linear",
					loop: true,
				}),
			);
		}

		// Particles shimmer
		if (particlesRef.current) {
			animationRefs.current.push(
				animate(particlesRef.current, {
					opacity: [0.3, 0.7, 0.3],
					rotate: [0, 360],
					duration: 8000,
					ease: "linear",
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
	const coreLight = `rgb(${Math.min(255, r + 100)}, ${Math.min(255, g + 100)}, ${Math.min(255, b + 100)})`;
	const coreMid = `rgb(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)})`;
	const coreBase = `rgb(${r}, ${g}, ${b})`;
	const coreDark = `rgb(${Math.max(0, r - 60)}, ${Math.max(0, g - 60)}, ${Math.max(0, b - 60)})`;

	return (
		<div
			ref={containerRef}
			className="relative flex items-center justify-center"
			style={{ width: "280px", height: "280px" }}
		>
			{/* Outermost ethereal glow */}
			<div
				ref={outerGlowRef}
				className="absolute rounded-full"
				style={{
					width: "260px",
					height: "260px",
					background: `radial-gradient(circle, rgba(${r}, ${g}, ${b}, 0.2) 0%, rgba(${r}, ${g}, ${b}, 0.08) 30%, rgba(${r}, ${g}, ${b}, 0.02) 60%, transparent 80%)`,
					filter: "blur(8px)",
				}}
			/>

			{/* Orbital ring 1 - tilted ellipse */}
			<div
				ref={ringsRef}
				className="absolute rounded-full pointer-events-none"
				style={{
					width: "200px",
					height: "200px",
					border: `1px solid rgba(${r}, ${g}, ${b}, 0.25)`,
					transform: "rotateX(75deg) rotateZ(15deg)",
					boxShadow: `0 0 10px rgba(${r}, ${g}, ${b}, 0.2)`,
				}}
			/>

			{/* Orbital ring 2 - opposite tilt */}
			<div
				className="absolute rounded-full pointer-events-none"
				style={{
					width: "180px",
					height: "180px",
					border: `1px solid rgba(${r}, ${g}, ${b}, 0.15)`,
					transform: "rotateX(75deg) rotateZ(-30deg)",
					animation: "spin-reverse 12s linear infinite",
				}}
			/>

			{/* Atmosphere layer */}
			<div
				ref={atmosphereRef}
				className="absolute rounded-full"
				style={{
					width: "170px",
					height: "170px",
					border: `2px solid rgba(${r}, ${g}, ${b}, 0.3)`,
					boxShadow: `0 0 60px 20px rgba(${r}, ${g}, ${b}, 0.15)`,
					background: `radial-gradient(circle at 30% 30%, transparent 50%, rgba(${r}, ${g}, ${b}, 0.05) 100%)`,
				}}
			/>

			{/* Mid glow layer */}
			<div
				ref={midGlowRef}
				className="absolute rounded-full"
				style={{
					width: "160px",
					height: "160px",
					background: `radial-gradient(circle, rgba(${r}, ${g}, ${b}, 0.4) 0%, rgba(${r}, ${g}, ${b}, 0.15) 40%, transparent 70%)`,
					filter: "blur(4px)",
				}}
			/>

			{/* Particle/shimmer layer */}
			<div
				ref={particlesRef}
				className="absolute rounded-full pointer-events-none"
				style={{
					width: "140px",
					height: "140px",
					background: `
						radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 8%),
						radial-gradient(circle at 70% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 6%),
						radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.25) 0%, transparent 5%),
						radial-gradient(circle at 30% 80%, rgba(255, 255, 255, 0.2) 0%, transparent 7%),
						radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 4%)
					`,
				}}
			/>

			{/* Inner glow - tight halo around core */}
			<div
				ref={innerGlowRef}
				className="absolute rounded-full"
				style={{
					width: "130px",
					height: "130px",
					background: `radial-gradient(circle, rgba(${r}, ${g}, ${b}, 0.5) 0%, transparent 70%)`,
					boxShadow: `
						0 0 20px 5px rgba(${r}, ${g}, ${b}, 0.8),
						0 0 40px 10px rgba(${r}, ${g}, ${b}, 0.5),
						inset 0 0 30px 10px rgba(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)}, 0.3)
					`,
				}}
			/>

			{/* Main core sphere */}
			<div
				ref={coreRef}
				className="relative rounded-full"
				style={{
					width: "100px",
					height: "100px",
					background: `radial-gradient(circle at 35% 25%, ${coreLight}, ${coreMid} 30%, ${coreBase} 60%, ${coreDark} 100%)`,
					boxShadow: `
						inset -8px -8px 20px rgba(0, 0, 0, 0.4),
						inset 4px 4px 15px rgba(255, 255, 255, 0.15),
						0 0 30px 5px rgba(${r}, ${g}, ${b}, 0.6)
					`,
				}}
			>
				{/* Highlight specular reflection */}
				<div
					className="absolute rounded-full"
					style={{
						width: "35px",
						height: "25px",
						top: "12px",
						left: "18px",
						background:
							"radial-gradient(ellipse at center, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)",
						filter: "blur(3px)",
						transform: "rotate(-20deg)",
					}}
				/>

				{/* Secondary smaller highlight */}
				<div
					className="absolute rounded-full"
					style={{
						width: "12px",
						height: "8px",
						top: "40px",
						left: "14px",
						background:
							"radial-gradient(ellipse at center, rgba(255, 255, 255, 0.4) 0%, transparent 70%)",
						filter: "blur(2px)",
						transform: "rotate(-15deg)",
					}}
				/>

				{/* Inner core glow - the "heart" */}
				<div
					className="absolute rounded-full"
					style={{
						width: "30px",
						height: "30px",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						background: `radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(${r}, ${g}, ${b}, 0.6) 40%, transparent 70%)`,
						filter: "blur(5px)",
					}}
				/>
			</div>

			{/* CSS for reverse spin animation */}
			<style>{`
				@keyframes spin-reverse {
					from { transform: rotateX(75deg) rotateZ(-30deg); }
					to { transform: rotateX(75deg) rotateZ(330deg); }
				}
			`}</style>
		</div>
	);
};

export default NeutrinoSphere;
