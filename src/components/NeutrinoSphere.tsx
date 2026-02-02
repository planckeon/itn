import type React from "react";
import { useRef, useEffect, useMemo } from "react";
import { useSimulation } from "../context/SimulationContext";

interface ProbabilityData {
	distance: number;
	Pe: number;
	Pmu: number;
	Ptau: number;
}

interface SimulationState {
	probabilityHistory: ProbabilityData[];
	matter: boolean;
	density: number;
	energy: number;
	isAntineutrino: boolean;
}

// NuFit 5.2 values
const DM31_SQ = 2.517e-3; // eV²
const THETA13_DEG = 8.57;

// Flavor colors - vibrant and visible
const FLAVOR_COLORS = {
	electron: { r: 96, g: 165, b: 250 },  // Blue-400
	muon: { r: 251, g: 146, b: 60 },      // Orange-400
	tau: { r: 232, g: 121, b: 249 },      // Fuchsia-400
};

/**
 * Calculate MSW resonance energy for given matter density
 */
function calculateResonanceEnergy(density: number, Ye = 0.5): number {
	const cos2theta = Math.cos(2 * THETA13_DEG * Math.PI / 180);
	return (DM31_SQ * cos2theta) / (1.52e-4 * density * Ye);
}

/**
 * Lerp between colors
 */
function lerpColor(c1: {r: number, g: number, b: number}, c2: {r: number, g: number, b: number}, t: number) {
	return {
		r: Math.round(c1.r + (c2.r - c1.r) * t),
		g: Math.round(c1.g + (c2.g - c1.g) * t),
		b: Math.round(c1.b + (c2.b - c1.b) * t),
	};
}

const NeutrinoSphere: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animationRef = useRef<number>(0);
	const timeRef = useRef<number>(0);
	const prevColorRef = useRef<{r: number, g: number, b: number} | null>(null);
	const colorTransitionRef = useRef<number>(1);
	const { state } = useSimulation() as { state: SimulationState };

	// Get the latest probabilities
	const latestProbabilities: ProbabilityData = useMemo(() => {
		return state.probabilityHistory.length > 0
			? state.probabilityHistory[state.probabilityHistory.length - 1]
			: { distance: 0, Pe: 1, Pmu: 0, Ptau: 0 };
	}, [state.probabilityHistory]);

	// Check if near MSW resonance
	const { isNearResonance, resonanceStrength } = useMemo(() => {
		if (!state.matter || state.isAntineutrino) {
			return { isNearResonance: false, resonanceStrength: 0 };
		}
		
		const E_res = calculateResonanceEnergy(state.density);
		const ratio = state.energy / E_res;
		const proximity = Math.exp(-Math.pow(Math.log(ratio), 2) * 2);
		
		return {
			isNearResonance: proximity > 0.3,
			resonanceStrength: proximity,
		};
	}, [state.matter, state.density, state.energy, state.isAntineutrino]);

	// Blend colors based on probabilities
	const targetColor = useMemo(() => {
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

	// Get individual flavor colors for particles
	const flavorParticleColors = useMemo(() => {
		const { Pe, Pmu, Ptau } = latestProbabilities;
		return { Pe, Pmu, Ptau };
	}, [latestProbabilities]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const dpr = window.devicePixelRatio || 1;
		const size = 160;
		canvas.width = size * dpr;
		canvas.height = size * dpr;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		const centerX = size / 2;
		const centerY = size / 2;
		const baseRadius = 42;

		// Initialize previous color
		if (!prevColorRef.current) {
			prevColorRef.current = { ...targetColor };
		}

		const render = () => {
			timeRef.current += 0.016;
			
			// Smooth color transition
			if (colorTransitionRef.current < 1) {
				colorTransitionRef.current = Math.min(1, colorTransitionRef.current + 0.05);
			}
			
			// Check if target color changed significantly
			const colorDiff = Math.abs(targetColor.r - (prevColorRef.current?.r || 0)) +
				Math.abs(targetColor.g - (prevColorRef.current?.g || 0)) +
				Math.abs(targetColor.b - (prevColorRef.current?.b || 0));
			
			if (colorDiff > 20 && colorTransitionRef.current >= 1) {
				colorTransitionRef.current = 0;
			}
			
			// Interpolate color for smooth transitions
			const displayColor = prevColorRef.current && colorTransitionRef.current < 1
				? lerpColor(prevColorRef.current, targetColor, colorTransitionRef.current)
				: targetColor;
			
			if (colorTransitionRef.current >= 1) {
				prevColorRef.current = { ...targetColor };
			}

			const { r, g, b } = displayColor;
			const { Pe, Pmu, Ptau } = flavorParticleColors;

			ctx.clearRect(0, 0, size, size);

			// Breathing animation
			const breathe = 1 + 0.02 * Math.sin(timeRef.current * 1.2);
			const radius = baseRadius * breathe;

			// Matter effect: particles orbit faster in matter
			const matterSpeedMult = state.matter ? 1.5 : 1;
			const matterWobbleMult = state.matter ? 1.3 : 1;

			// === Outer glow (quantum probability cloud) ===
			const glowRadius = radius * 1.9;
			const glowGradient = ctx.createRadialGradient(
				centerX, centerY, radius * 0.4,
				centerX, centerY, glowRadius
			);
			glowGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.35)`);
			glowGradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, 0.15)`);
			glowGradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, 0.05)`);
			glowGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

			ctx.beginPath();
			ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
			ctx.fillStyle = glowGradient;
			ctx.fill();

			// === Wavefunction surface particles ===
			// Particle count based on total probability variance (more mixing = more particles)
			const mixing = 1 - Math.max(Pe, Pmu, Ptau); // 0 = pure, ~0.67 = max mixing
			const baseParticles = 40;
			const numParticles = Math.floor(baseParticles + mixing * 30);

			for (let i = 0; i < numParticles; i++) {
				// Determine particle flavor based on probability distribution
				const flavorRand = (i * 0.618033988749895) % 1;
				let particleColor: {r: number, g: number, b: number};
				if (flavorRand < Pe) {
					particleColor = FLAVOR_COLORS.electron;
				} else if (flavorRand < Pe + Pmu) {
					particleColor = FLAVOR_COLORS.muon;
				} else {
					particleColor = FLAVOR_COLORS.tau;
				}

				// Golden ratio distribution on sphere
				const theta = (i / numParticles) * Math.PI * 2 + timeRef.current * 0.4 * matterSpeedMult;
				const phi = Math.acos(1 - 2 * ((i * 0.618033988749895) % 1));
				
				// Animated wobble
				const wobble = 0.12 * matterWobbleMult * Math.sin(timeRef.current * 2.5 + i * 0.7);
				const particleRadius = radius * (1.08 + wobble + 0.1 * Math.sin(theta * 2 + timeRef.current * 1.5));
				
				const px = centerX + particleRadius * Math.sin(phi) * Math.cos(theta);
				const py = centerY + particleRadius * Math.cos(phi) * 0.85;
				
				// Depth-based rendering
				const depth = Math.sin(phi) * Math.sin(theta);
				const opacity = 0.25 + 0.45 * (0.5 + 0.5 * depth);
				const particleSize = 1.5 + 2 * (0.5 + 0.5 * depth);
				
				// Bright particle with slight glow
				ctx.beginPath();
				ctx.arc(px, py, particleSize, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(${Math.min(255, particleColor.r + 40)}, ${Math.min(255, particleColor.g + 40)}, ${Math.min(255, particleColor.b + 40)}, ${opacity})`;
				ctx.fill();
			}

			// === Main sphere with 3D shading ===
			const lightOffsetX = -radius * 0.35;
			const lightOffsetY = -radius * 0.35;

			const sphereGradient = ctx.createRadialGradient(
				centerX + lightOffsetX, centerY + lightOffsetY, 0,
				centerX, centerY, radius
			);
			
			const highlight = { 
				r: Math.min(255, r + 70), 
				g: Math.min(255, g + 70), 
				b: Math.min(255, b + 70) 
			};
			const shadow = { 
				r: Math.max(0, r - 50), 
				g: Math.max(0, g - 50), 
				b: Math.max(0, b - 50) 
			};

			sphereGradient.addColorStop(0, `rgb(${highlight.r}, ${highlight.g}, ${highlight.b})`);
			sphereGradient.addColorStop(0.4, `rgb(${r}, ${g}, ${b})`);
			sphereGradient.addColorStop(1, `rgb(${shadow.r}, ${shadow.g}, ${shadow.b})`);

			ctx.beginPath();
			ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
			ctx.fillStyle = sphereGradient;
			ctx.fill();

			// === Specular highlight ===
			const specularGradient = ctx.createRadialGradient(
				centerX + lightOffsetX * 0.7, centerY + lightOffsetY * 0.7, 0,
				centerX + lightOffsetX * 0.4, centerY + lightOffsetY * 0.4, radius * 0.45
			);
			specularGradient.addColorStop(0, "rgba(255, 255, 255, 0.55)");
			specularGradient.addColorStop(0.6, "rgba(255, 255, 255, 0.08)");
			specularGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

			ctx.beginPath();
			ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
			ctx.fillStyle = specularGradient;
			ctx.fill();

			// === MSW Resonance effect ===
			if (isNearResonance) {
				const ringRadius = radius + 10 + 3 * Math.sin(timeRef.current * 4);
				const pulseAlpha = 0.6 + 0.4 * Math.sin(timeRef.current * 5);
				
				// Multiple rings for dramatic effect
				for (let ring = 0; ring < 3; ring++) {
					const ringR = ringRadius + ring * 6;
					const ringAlpha = resonanceStrength * pulseAlpha * (1 - ring * 0.3);
					
					ctx.beginPath();
					ctx.arc(centerX, centerY, ringR, 0, Math.PI * 2);
					ctx.strokeStyle = `rgba(255, 200, 50, ${ringAlpha})`;
					ctx.lineWidth = 2 - ring * 0.5;
					ctx.stroke();
				}

				// Golden glow
				const ringGlow = ctx.createRadialGradient(
					centerX, centerY, ringRadius - 8,
					centerX, centerY, ringRadius + 25
				);
				ringGlow.addColorStop(0, `rgba(255, 200, 50, 0)`);
				ringGlow.addColorStop(0.4, `rgba(255, 200, 50, ${resonanceStrength * 0.25})`);
				ringGlow.addColorStop(1, `rgba(255, 200, 50, 0)`);

				ctx.beginPath();
				ctx.arc(centerX, centerY, ringRadius + 20, 0, Math.PI * 2);
				ctx.fillStyle = ringGlow;
				ctx.fill();
			}

			animationRef.current = requestAnimationFrame(render);
		};

		render();

		return () => {
			cancelAnimationFrame(animationRef.current);
		};
	}, [targetColor, flavorParticleColors, isNearResonance, resonanceStrength, state.matter]);

	return (
		<canvas
			ref={canvasRef}
			style={{ width: "160px", height: "160px" }}
			className="pointer-events-none"
		/>
	);
};

export default NeutrinoSphere;
