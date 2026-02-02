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
	electron: { r: 96, g: 165, b: 250 },  // Blue-400 (brighter)
	muon: { r: 251, g: 146, b: 60 },      // Orange-400
	tau: { r: 232, g: 121, b: 249 },      // Fuchsia-400 (brighter)
};

/**
 * Calculate MSW resonance energy for given matter density
 */
function calculateResonanceEnergy(density: number, Ye = 0.5): number {
	const cos2theta = Math.cos(2 * THETA13_DEG * Math.PI / 180);
	return (DM31_SQ * cos2theta) / (1.52e-4 * density * Ye);
}

const NeutrinoSphere: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animationRef = useRef<number>(0);
	const timeRef = useRef<number>(0);
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
		const baseRadius = 45;

		const { r, g, b } = blendedColor;

		const render = () => {
			timeRef.current += 0.02;
			ctx.clearRect(0, 0, size, size);

			// Breathing animation - subtle size pulsation
			const breathe = 1 + 0.03 * Math.sin(timeRef.current * 1.5);
			const radius = baseRadius * breathe;

			// === Outer glow (quantum probability cloud) ===
			const glowRadius = radius * 1.8;
			const glowGradient = ctx.createRadialGradient(
				centerX, centerY, radius * 0.5,
				centerX, centerY, glowRadius
			);
			glowGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.4)`);
			glowGradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, 0.15)`);
			glowGradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, 0.05)`);
			glowGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

			ctx.beginPath();
			ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
			ctx.fillStyle = glowGradient;
			ctx.fill();

			// === Main sphere with 3D shading ===
			// Light source from top-left
			const lightOffsetX = -radius * 0.3;
			const lightOffsetY = -radius * 0.3;

			// Base sphere gradient (3D effect)
			const sphereGradient = ctx.createRadialGradient(
				centerX + lightOffsetX, centerY + lightOffsetY, 0,
				centerX, centerY, radius
			);
			
			// Brighter highlight, smooth falloff to edge
			const highlight = { 
				r: Math.min(255, r + 80), 
				g: Math.min(255, g + 80), 
				b: Math.min(255, b + 80) 
			};
			const shadow = { 
				r: Math.max(0, r - 40), 
				g: Math.max(0, g - 40), 
				b: Math.max(0, b - 40) 
			};

			sphereGradient.addColorStop(0, `rgb(${highlight.r}, ${highlight.g}, ${highlight.b})`);
			sphereGradient.addColorStop(0.5, `rgb(${r}, ${g}, ${b})`);
			sphereGradient.addColorStop(1, `rgb(${shadow.r}, ${shadow.g}, ${shadow.b})`);

			ctx.beginPath();
			ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
			ctx.fillStyle = sphereGradient;
			ctx.fill();

			// === Specular highlight (glossy reflection) ===
			const specularGradient = ctx.createRadialGradient(
				centerX + lightOffsetX * 0.8, centerY + lightOffsetY * 0.8, 0,
				centerX + lightOffsetX * 0.5, centerY + lightOffsetY * 0.5, radius * 0.5
			);
			specularGradient.addColorStop(0, "rgba(255, 255, 255, 0.6)");
			specularGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.1)");
			specularGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

			ctx.beginPath();
			ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
			ctx.fillStyle = specularGradient;
			ctx.fill();

			// === MSW Resonance ring ===
			if (isNearResonance) {
				const ringRadius = radius + 12;
				const ringPulse = 1 + 0.1 * Math.sin(timeRef.current * 3);
				
				ctx.beginPath();
				ctx.arc(centerX, centerY, ringRadius * ringPulse, 0, Math.PI * 2);
				ctx.strokeStyle = `rgba(255, 200, 50, ${resonanceStrength * 0.8})`;
				ctx.lineWidth = 2;
				ctx.stroke();

				// Ring glow
				const ringGlow = ctx.createRadialGradient(
					centerX, centerY, ringRadius - 5,
					centerX, centerY, ringRadius + 15
				);
				ringGlow.addColorStop(0, `rgba(255, 200, 50, 0)`);
				ringGlow.addColorStop(0.5, `rgba(255, 200, 50, ${resonanceStrength * 0.3})`);
				ringGlow.addColorStop(1, `rgba(255, 200, 50, 0)`);

				ctx.beginPath();
				ctx.arc(centerX, centerY, ringRadius + 10, 0, Math.PI * 2);
				ctx.fillStyle = ringGlow;
				ctx.fill();
			}

			animationRef.current = requestAnimationFrame(render);
		};

		render();

		return () => {
			cancelAnimationFrame(animationRef.current);
		};
	}, [blendedColor, isNearResonance, resonanceStrength]);

	return (
		<canvas
			ref={canvasRef}
			style={{ width: "160px", height: "160px" }}
			className="pointer-events-none"
		/>
	);
};

export default NeutrinoSphere;
