import type {
	OscillationParameters,
	ProbabilityVector,
	TooltipState,
	PlotParameters,
} from "../physics/types";

// Define interfaces for the store shapes locally for clarity
// Add properties matching the store definitions in setupAlpine.ts
interface OscParamsStore {
	theta12_deg: number;
	theta13_deg: number;
	theta23_deg: number;
	deltaCP_deg: number;
	dm21sq_eV2: number;
	dm31sq_eV2: number;
	energy: number;
	maxL: number;
	rho: number;
	Ye: number;
	matterEffect: boolean;
	initialFlavorIndex: 0 | 1 | 2;
	getCalculationParams(currentL: number): OscillationParameters;
}
interface AnimationStore {
	isPlaying: boolean;
	currentL: number;
	simSpeed: number;
	lastTimestamp: number;
	play(): void;
	pause(): void;
	reset(): void;
	toggle(): void;
	setSpeed(speed: number): void;
	updateL(timestamp: number): void;
}
interface PlotParamsStore {
	maxL: number;
	numPoints: number;
	getParameters(): PlotParameters;
}
interface TooltipsStore {
	visible: TooltipState;
	show(id: string): void;
	hide(id: string): void;
	toggle(id: string): void;
	isVisible(id: string): boolean;
}

// Exported helper function
export function getDominantFlavorName(probs: ProbabilityVector): string {
	const flavorNames = ["νe", "νμ", "ντ"]; // Use standard subscripts
	if (!probs || probs.length !== 3 || probs.some((p) => isNaN(p))) return "N/A";
	const maxProb = Math.max(...probs);
	const maxIndex = probs.indexOf(maxProb);
	let name = flavorNames[maxIndex];
	const sortedProbs = [...probs].sort((a, b) => b - a);
	if (sortedProbs[0] < 0.6) name = "Mixed";
	else if (sortedProbs[0] < 0.9) name += "-like";
	return name;
}

// --- Simplified Alpine Component ---
export function neutrinoVisualizationComponent() {
	const Alpine = window.Alpine;
	// Removed unused updatePlotDebounced variable

	// Helper function within component scope
	const getPhysicsParams = (lValue: number): OscillationParameters => {
		const simParams = Alpine.store("simParams") as OscParamsStore;
		if (!simParams) {
			console.error("simParams store not available in getPhysicsParams");
			return {} as OscillationParameters;
		}
		// Add guard for E=0 within the helper as well
		if (Math.abs(simParams.energy) < 1e-9) {
			console.warn("getPhysicsParams called with E near zero.");
			// Return parameters that won't cause NaN, maybe with L=0?
			// Or rely on the check within the physics engine itself.
		}
		const degToRadFn = window.degToRad || ((d) => (d * Math.PI) / 180);
		return {
			theta12_deg: simParams.theta12_deg,
			theta13_deg: simParams.theta13_deg,
			theta23_deg: simParams.theta23_deg,
			deltaCP_deg: simParams.deltaCP_deg,
			dm21sq_eV2: simParams.dm21sq_eV2,
			dm31sq_eV2: simParams.dm31sq_eV2,
			energy: simParams.energy,
			maxL: simParams.maxL, // Add missing maxL property
			s12sq: Math.pow(Math.sin(degToRadFn(simParams.theta12_deg)), 2),
			s13sq: Math.pow(Math.sin(degToRadFn(simParams.theta13_deg)), 2),
			s23sq: Math.pow(Math.sin(degToRadFn(simParams.theta23_deg)), 2),
			deltaCP_rad: degToRadFn(simParams.deltaCP_deg),
			dm21sq: simParams.dm21sq_eV2,
			dm31sq: simParams.dm31sq_eV2,
			L: lValue,
			E: simParams.energy,
			rho: simParams.rho,
			Ye: simParams.Ye,
			matterEffect: simParams.matterEffect,
			initialFlavorIndex: simParams.initialFlavorIndex,
			N_Newton: 0,
		};
	};

	return {
		// --- State Stores (References for template binding) ---
		simParams: Alpine.store("simParams") as OscParamsStore,
		animState: Alpine.store("animation") as AnimationStore,
		plotParams: Alpine.store("plotParams") as PlotParamsStore,
		tooltipState: Alpine.store("tooltips") as TooltipsStore,

		// --- Component State (for UI binding) ---
		currentProbs: [NaN, NaN, NaN] as ProbabilityVector, // Initialize with NaN
		dominantFlavor: "Loading...",
		flavorSymbols: ["νₑ", "ν<0xE1><0xB5><0x81>", "ν<0xE1><0xB5><0x8F>"], // νμ, ντ

		// --- Methods (Simplified: Only modify stores or handle UI) ---
		// Removed requestPlotUpdate method as plotting is handled by p5 sketch draw loop

		updateVisualization() {
			// This method is now primarily triggered by watchers reacting to store changes.
			console.log("Alpine: updateVisualization called (likely by UI event)");
			this.reset(); // Resetting handles state sync via watchers
		},

		playPause() {
			this.animState.toggle(); // Watcher handles sceneManagerInstance call
		},

		reset() {
			console.log("Alpine: Resetting simulation state via component method");
			this.animState.reset(); // Watcher for currentL handles instance updates
			// Explicitly update UI state for L=0
			this.updateCurrentProbsAndFlavor(0);
		},

		setDensity(presetDensity: number) {
			// Modify stores, watchers handle the rest
			this.simParams.rho = presetDensity;
			if (!this.simParams.matterEffect && presetDensity > 0) {
				this.simParams.matterEffect = true;
			} else if (presetDensity === 0 && this.simParams.matterEffect) {
				this.simParams.matterEffect = false;
			}
		},

		toggleTooltip(name: string) {
			const tooltipState = Alpine.store("tooltips") as TooltipsStore;
			if (!tooltipState.visible.hasOwnProperty(name)) {
				console.warn(`Tooltip state for '${name}' not found.`);
				return;
			}
			const currentState = tooltipState.visible[name];
			// Close all tooltips first
			for (const key in tooltipState.visible) {
				tooltipState.visible[key] = false;
			}
			// Toggle the selected one
			tooltipState.visible[name] = !currentState;

			// If opening, render KaTeX inside this specific tooltip
			if (tooltipState.visible[name]) {
				// @ts-ignore: Alpine magic property
				this.$nextTick(() => {
					// @ts-ignore: Alpine magic property
					const tooltipElement = this.$el.querySelector(
						`.tooltip-content[data-tooltip-id="${name}"]`,
					);
					if (tooltipElement && window.katex) {
						tooltipElement
							.querySelectorAll("[x-katex]")
							.forEach((katexEl: Element) => {
								const expression = katexEl.getAttribute("x-katex") || "";
								if (expression) {
									try {
										window.katex.render(expression, katexEl as HTMLElement, {
											throwOnError: false,
											displayMode:
												katexEl.tagName === "DIV" ||
												katexEl.tagName === "P" ||
												(katexEl.tagName === "SPAN" &&
													katexEl.classList.contains("display")),
										});
									} catch (e) {
										console.error(
											"KaTeX rendering error:",
											e,
											"Expression:",
											expression,
										);
										katexEl.textContent = `LaTeX Error`;
									}
								}
							});
					}
				});
			}
		},

		hideTooltip(name: string) {
			const tooltipState = Alpine.store("tooltips") as TooltipsStore;
			if (tooltipState.visible.hasOwnProperty(name)) {
				tooltipState.visible[name] = false;
			}
		},

		// --- Internal Helper Methods ---
		updateCurrentProbsAndFlavor(lValue: number) {
			if (!window.physicsEngine) {
				this.dominantFlavor = "Loading...";
				this.currentProbs = [NaN, NaN, NaN];
				return;
			}
			// Call helper function directly (not via this)
			const params = getPhysicsParams(lValue);
			const probs =
				window.physicsEngine.getProbabilitiesForInitialFlavor(params);
			this.currentProbs = probs;
			this.dominantFlavor = getDominantFlavorName(probs);
			// SceneManager updates its own color via its animation loop
		},
	}; // End of return object
} // End of function neutrinoVisualizationComponent
