// Import styles
import "./style.css";

// Alpine.js setup
import Alpine from "alpinejs";
import type { PhysicsEngine } from "./physics/types";
import { setupAlpine } from "./alpine/setupAlpine";

import { p5 } from "p5js-wrapper";
import type {
	P5SketchInstance,
	OscillationParameters,
	AnimationState,
	ProbabilityVector,
} from "./physics/types";

// Define the expected shape of the simParams store locally
interface OscParamsStore {
	theta12_deg: number;
	theta13_deg: number;
	theta23_deg: number;
	deltaCP_deg: number;
	dm21sq_eV2: number;
	dm31sq_eV2: number;
	energy: number;
	maxL: number; // Keep maxL for p5 plot range
	rho: number;
	Ye: number;
	matterEffect: boolean;
	initialFlavorIndex: 0 | 1 | 2;
	getCalculationParams(currentL: number): OscillationParameters;
}

// Initialize Alpine.js and its stores & component definition
setupAlpine();

// Manually start Alpine AFTER stores and components are registered
window.Alpine.start();

// --- Global p5 Sketch Instance ---
// We'll store the single p5 instance globally
window.p5Instance = null;
// Keep global data for UI display if needed, p5 will draw its own overlay
window.neutrinoVisualizationData = {
	currentProbs: [Number.NaN, Number.NaN, Number.NaN], // Initialize for UI binding
	dominantFlavor: "Loading...",
};

document.addEventListener("DOMContentLoaded", async () => {
	console.log("DOM Loaded, setting up p5 sketch...");

	// Dynamically import the p5 sketch module, physics engine, and math utils
	try {
		const [neutrinoSketchModule, physicsModule, mathUtilsModule] =
			await Promise.all([
				import("./core/visualization/p5Sketch"),
				import("./physics/NuFastPort"),
				import("./utils/mathUtils"),
			]);

		const createNeutrinoSketch = neutrinoSketchModule.default; // Get the default export

		// Assign physics engine and utils to window
		window.physicsEngine = physicsModule as PhysicsEngine;
		window.degToRad = mathUtilsModule.degToRad;

		const sketchContainer = document.getElementById(
			"p5-container",
		) as HTMLDivElement; // Main container for the sketch
		// The plot will be drawn *within* this sketch, so we don't need a separate plot container here.
		// However, the sketch function expects a plotCanvas element, which might be a specific canvas
		// element within the main container or elsewhere that the sketch will draw onto.
		// Let's assume there's a canvas element with id 'probPlotCanvas' within the HTML structure.
		const plotCanvasElement = document.getElementById(
			"prob-plot-canvas",
		) as HTMLCanvasElement; // Canvas for plot drawing within the sketch

		if (!sketchContainer || !plotCanvasElement) {
			console.error("p5 container or plot canvas element not found!");
			// Attempt to proceed with just the container if plot canvas is missing,
			// the sketch might still be able to draw the animation.
			if (!sketchContainer) {
				console.error("Main p5 container element not found!");
				return; // Cannot proceed without main container
			}
			console.warn("Plot canvas element not found. Plot may not be displayed.");
			// Pass null for plotCanvasElement if not found, sketch should handle this.
			window.p5Instance = new p5(
				createNeutrinoSketch(sketchContainer, undefined),
				sketchContainer,
			) as P5SketchInstance; // Pass null if not found
		} else {
			// --- Create and store the single p5 instance ---
			// Pass the main container and the specific plot canvas element
			window.p5Instance = new p5(
				createNeutrinoSketch(sketchContainer, plotCanvasElement),
				sketchContainer,
			) as P5SketchInstance;
		}

		console.log("p5 sketch initialized.");

		// --- Set up External Watchers ---
		// Watchers now inform the single p5 sketch instance about state changes by calling specific methods.

		// Watch simulation parameters and update the sketch's parameters
		Alpine.effect(() => {
			const simParamsStore = Alpine.store("simParams") as OscParamsStore;
			// Create a plain OscillationParameters object from the store
			const plainSimParams: OscillationParameters = {
				theta12_deg: simParamsStore.theta12_deg,
				theta13_deg: simParamsStore.theta13_deg,
				theta23_deg: simParamsStore.theta23_deg,
				deltaCP_deg: simParamsStore.deltaCP_deg,
				dm21sq_eV2: simParamsStore.dm21sq_eV2,
				dm31sq_eV2: simParamsStore.dm31sq_eV2,
				energy: simParamsStore.energy,
				maxL: simParamsStore.maxL,
				rho: simParamsStore.rho,
				Ye: simParamsStore.Ye,
				matterEffect: simParamsStore.matterEffect,
				initialFlavorIndex: simParamsStore.initialFlavorIndex,
				L: 0, // L is managed by the sketch animation, set to 0 for initial parameter set
			};
			// Notify the sketch about parameter updates
			window.p5Instance?.updateSimParams?.(plainSimParams);
			// No longer trigger a reset on every parameter change.
			// Reset is now handled by explicit reset actions or initial flavor change if needed elsewhere.
		});

		// Watch animation playing state and notify the sketch
		Alpine.effect(() => {
			const isPlaying = (Alpine.store("animation") as AnimationState).isPlaying;
			window.p5Instance?.setPlaying?.(isPlaying);
		});

		// Watch simulation speed and notify the sketch
		Alpine.effect(() => {
			const simSpeed = (Alpine.store("animation") as AnimationState).simSpeed;
			window.p5Instance?.setSimSpeed?.(simSpeed);
		});

		// Clean up p5 instance on page unload
		window.addEventListener("beforeunload", () => {
			if (window.p5Instance) {
				window.p5Instance.remove();
			}
		});
	} catch (error) {
		console.error("Failed to load modules or initialize p5 sketch:", error);
	}
});

declare global {
	interface Window {
		Alpine: typeof Alpine;
		p5Instance: P5SketchInstance | null; // Declare the single instance name
		degToRad?: (deg: number) => number;

		// Keep for potential UI bindings outside p5 canvas
		neutrinoVisualizationData: {
			currentProbs: ProbabilityVector;
			dominantFlavor: string;
		};
	}
}

// No need to declare methods here, they are on the P5SketchInstance interface in p5Sketch.ts

console.log(
	"main.ts loaded - Alpine setup complete. p5 sketch initialized on DOMContentLoaded.",
);
