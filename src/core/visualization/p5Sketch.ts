import { StarfieldVisualization } from "./components/starfield";
import { NeutrinoVisualization } from "./components/neutrino";
import { ProbabilityPlot } from "./components/probabilityPlot";
import type { P5SketchInstance } from "../types/p5js-wrapper";
import type {
	OscillationParameters,
	ProbabilityVector,
	AnimationState,
} from "../physics/types";
import { ANIMATION_DURATION_SECONDS } from "../../physics/constants";

import Alpine from "alpinejs";
import type * as NuFastPort from "../../physics/NuFastPort";

export default function createNeutrinoSketch(
	container: HTMLElement,
	plotCanvas?: HTMLCanvasElement,
): (p: P5SketchInstance) => void {
	return (p: P5SketchInstance) => {
		// State management
		let currentSimParams: OscillationParameters | null = null;
		let isPlaying = false;
		let currentL = 0;
		let simSpeed = 1.0;
		let lastTimestamp = 0;
		let needsRecalculation = true;
		let isCalculating = false;
		let cachedProbabilities: ProbabilityVector[] | null = null;
		let cachedDistances: number[] | null = null;
		const numberOfCachePoints = 200;

		// Initialize visualization components
		const starfield = new StarfieldVisualization(p);
		const neutrino = new NeutrinoVisualization(p);
		const probabilityPlot = new ProbabilityPlot(plotCanvas);

		p.setup = () => {
			const canvasWidth = container.clientWidth || 800;
			const canvasHeight = container.clientHeight || 600;
			p.createCanvas(canvasWidth, canvasHeight, p.WEBGL);
			p.pixelDensity(1.5);
			p.background(0);

			starfield.initStars();
			syncWithAlpineState();
		};

		p.draw = () => {
			p.background(0);

			// Handle probability calculations
			if (needsRecalculation && !isCalculating) {
				recalculateAndCacheProbabilities();
			}

			// Update animation state
			const now = p.millis();
			const deltaTime = (now - lastTimestamp) / 1000;
			lastTimestamp = now;
			const safeDeltaTime = Math.max(0, Math.min(deltaTime, 0.1));

			if (isPlaying && currentSimParams) {
				updateAnimationState(safeDeltaTime);
			}

			// Update visualization components
			const currentProbs = getCurrentProbabilities();
			neutrino.updateProbabilities(
				currentProbs,
				getDominantFlavorName(currentProbs),
			);
			probabilityPlot.updateCache(cachedProbabilities, cachedDistances);

			// Draw components
			p.camera(200, 200, 400, 0, 0, 0, 0, 1, 0);
			starfield.drawStarfield(safeDeltaTime, simSpeed);
			neutrino.draw();
			probabilityPlot.draw();
		};

		p.windowResized = () => {
			const canvasWidth = container.clientWidth || 800;
			const canvasHeight = container.clientHeight || 600;
			p.resizeCanvas(canvasWidth, canvasHeight);
		};

		// Helper functions
		function recalculateAndCacheProbabilities(): void {
			if (!currentSimParams || !window.physicsEngine || isCalculating) return;

			isCalculating = true;
			needsRecalculation = false;

			const L_MAX = currentSimParams.maxL || 1000;
			const step = L_MAX / (numberOfCachePoints - 1);
			const distances: number[] = [];
			const probabilities: ProbabilityVector[] = [];

			try {
				for (let i = 0; i < numberOfCachePoints; i++) {
					const lValue = i * step;
					distances.push(lValue);
					const params = { ...currentSimParams, L: lValue };
					probabilities.push(
						window.physicsEngine.getProbabilitiesForInitialFlavor(params),
					);
				}
				cachedDistances = distances;
				cachedProbabilities = probabilities;
			} catch (error) {
				console.error("Probability recalculation error:", error);
				needsRecalculation = true;
				cachedDistances = null;
				cachedProbabilities = null;
			} finally {
				isCalculating = false;
			}
		}

		function updateAnimationState(deltaTime: number): void {
			const L_MAX = currentSimParams?.maxL || 1000;
			const baseSpeed = L_MAX / ANIMATION_DURATION_SECONDS;
			currentL = (currentL + simSpeed * baseSpeed * deltaTime) % L_MAX;

			if (window.Alpine) {
				const animStore = Alpine.store("animation") as AnimationState;
				if (animStore) animStore.currentL = currentL;
			}
		}

		function getCurrentProbabilities(): ProbabilityVector {
			if (!cachedProbabilities || !cachedDistances || !currentSimParams) {
				return [NaN, NaN, NaN];
			}

			const L_MAX = currentSimParams.maxL || 1000;
			const clampedL = Math.max(0, Math.min(currentL, L_MAX));

			// Find interpolation segment
			for (let i = 0; i < cachedDistances.length - 1; i++) {
				if (
					clampedL >= cachedDistances[i] &&
					clampedL <= cachedDistances[i + 1]
				) {
					const t =
						(clampedL - cachedDistances[i]) /
						(cachedDistances[i + 1] - cachedDistances[i]);
					return [
						cachedProbabilities[i][0] +
							t * (cachedProbabilities[i + 1][0] - cachedProbabilities[i][0]),
						cachedProbabilities[i][1] +
							t * (cachedProbabilities[i + 1][1] - cachedProbabilities[i][1]),
						cachedProbabilities[i][2] +
							t * (cachedProbabilities[i + 1][2] - cachedProbabilities[i][2]),
					];
				}
			}

			return cachedProbabilities[0]; // Fallback
		}

		function syncWithAlpineState(): void {
			if (!window.Alpine) return;

			const simParamsStore = Alpine.store("simParams") as OscillationParameters;
			const animStateStore = Alpine.store("animation") as AnimationState;

			if (simParamsStore && animStateStore) {
				p.updateSimParams?.({ ...simParamsStore });
				isPlaying = animStateStore.isPlaying;
				simSpeed = animStateStore.simSpeed;
				currentL = animStateStore.currentL;
				p.resetSimulation?.();
			}
		}

		// Attach methods to p5 instance
		p.updateSimParams = (params: OscillationParameters) => {
			currentSimParams = params;
			needsRecalculation = true;
			probabilityPlot.updateParameters(params.maxL);
		};

		p.setPlaying = (playing: boolean) => {
			isPlaying = playing;
		};

		p.setSimSpeed = (speed: number) => {
			simSpeed = speed;
		};

		p.resetSimulation = () => {
			currentL = 0;
			isPlaying = false;
			needsRecalculation = true;
		};
	};
}

// Helper function (could be moved to a separate utils file)
function getDominantFlavorName(probs: ProbabilityVector): string {
	const flavorNames = ["νe", "νμ", "ντ"];
	if (!probs || probs.length !== 3 || probs.some((p) => isNaN(p))) return "N/A";

	const maxProb = Math.max(...probs);
	const maxIndex = probs.indexOf(maxProb);
	let name = flavorNames[maxIndex];

	const sortedProbs = [...probs].sort((a, b) => b - a);
	if (sortedProbs[0] < 0.6) name = "Mixed";
	else if (sortedProbs[0] < 0.9) name += "-like";

	return name;
}
