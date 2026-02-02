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
	electron: { r: 59, g: 130, b: 246 }, // Blue-500
	muon: { r: 251, g: 146, b: 60 }, // Orange-400
	tau: { r: 217, g: 70, b: 239 }, // Fuchsia-500
};

/**
 * Calculate MSW resonance energy for given matter density
 */
function calculateResonanceEnergy(density: number, Ye = 0.5): number {
	const cos2theta = Math.cos(2 * THETA13_DEG * Math.PI / 180);
	return (DM31_SQ * cos2theta) / (1.52e-4 * density * Ye);
}

/**
 * Neutrino wavefunction probability density
 * Using a Gaussian-like envelope to represent the delocalized nature
 * |ψ|² ~ exp(-r²/(2σ²)) with oscillations
 */
function wavefunctionDensity(r: number, maxR: number, time: number): number {
	const sigma = maxR * 0.35; // Width of the wave packet
	const gaussian = Math.exp(-((r - maxR * 0.3) ** 2) / (2 * sigma ** 2));
	
	// Add wave-like oscillations at the edge (de Broglie wavelength effect)
	const k = 8; // Wave number for visual effect
	const oscillation = 0.5 + 0.5 * Math.cos(k * r / maxR - time * 2);
	
	// Combine: strong core, oscillating fade at edges
	if (r < maxR * 0.4) {
		return 1; // Solid core
	}
	return gaussian * oscillation;
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
		const size = 140;
		canvas.width = size * dpr;
		canvas.height = size * dpr;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		const centerX = size / 2;
		const centerY = size / 2;
		const maxRadius = size / 2 - 5;

		const { r, g, b } = blendedColor;

		const render = () => {
			timeRef.current += 0.016; // ~60fps
			ctx.clearRect(0, 0, size, size);

			// Draw the wavefunction-style sphere
			const imageData = ctx.createImageData(size, size);
			const data = imageData.data;

			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const dx = x - centerX;
					const dy = y - centerY;
					const distance = Math.sqrt(dx * dx + dy * dy);

					if (distance <= maxRadius) {
						// Calculate wavefunction density
						const density = wavefunctionDensity(distance, maxRadius, timeRef.current);

						// 3D shading: light from top-left
						const normalX = dx / maxRadius;
						const normalY = dy / maxRadius;
						const normalZ = Math.sqrt(Math.max(0, 1 - normalX * normalX - normalY * normalY));
						
						// Light direction (top-left-front)
						const lightX = -0.4;
						const lightY = -0.5;
						const lightZ = 0.7;
						const lightMag = Math.sqrt(lightX * lightX + lightY * lightY + lightZ * lightZ);
						
						// Diffuse lighting
						const diffuse = Math.max(0, (normalX * lightX + normalY * lightY + normalZ * lightZ) / lightMag);
						
						// Specular highlight
						const reflectZ = 2 * normalZ * normalZ - 1;
						const specular = Math.pow(Math.max(0, reflectZ), 32) * 0.5;

						// Combine lighting
						const shade = 0.4 + diffuse * 0.5 + specular;
						
						// Apply color with wavefunction density as alpha
						const pixelIndex = (y * size + x) * 4;
						const alpha = density * 255;
						
						data[pixelIndex] = Math.min(255, r * shade + specular * 200);
						data[pixelIndex + 1] = Math.min(255, g * shade + specular * 200);
						data[pixelIndex + 2] = Math.min(255, b * shade + specular * 200);
						data[pixelIndex + 3] = alpha;
					}
				}
			}

			ctx.putImageData(imageData, 0, 0);

			// Outer glow
			const glowGradient = ctx.createRadialGradient(
				centerX, centerY, maxRadius * 0.6,
				centerX, centerY, maxRadius * 1.2
			);
			glowGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
			glowGradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.15)`);
			glowGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

			ctx.globalCompositeOperation = "screen";
			ctx.beginPath();
			ctx.arc(centerX, centerY, maxRadius * 1.2, 0, Math.PI * 2);
			ctx.fillStyle = glowGradient;
			ctx.fill();
			ctx.globalCompositeOperation = "source-over";

			// MSW Resonance ring
			if (isNearResonance) {
				ctx.beginPath();
				ctx.arc(centerX, centerY, maxRadius + 8, 0, Math.PI * 2);
				ctx.strokeStyle = `rgba(255, 200, 50, ${resonanceStrength * 0.7})`;
				ctx.lineWidth = 2;
				ctx.stroke();

				// Glow effect for resonance
				ctx.shadowColor = `rgba(255, 200, 50, ${resonanceStrength})`;
				ctx.shadowBlur = 15;
				ctx.stroke();
				ctx.shadowBlur = 0;
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
			style={{ width: "140px", height: "140px" }}
			className="pointer-events-none"
		/>
	);
};

export default NeutrinoSphere;
