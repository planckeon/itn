// Import styles
import './style.css';

// Alpine.js setup
import Alpine from 'alpinejs';
import { setupAlpine } from './alpine/setupAlpine';

// Import from p5js-wrapper for runtime, use original p5 for types
import { p5 } from 'p5js-wrapper'; // Use the wrapper's p5 constructor
import type p5Type from 'p5'; // Use original p5 types with an alias
// Import the P5SketchInstance type and the default sketch factory function
import type { P5SketchInstance } from './visualization/p5Sketch';
import createNeutrinoSketch from './visualization/p5Sketch'; // Import the default export
import type { OscillationParameters, AnimationState, ProbabilityVector } from './physics/types'; // Keep needed types
import { getDominantFlavorName } from './alpine/visualizationComponent'; // Keep helper

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
    currentProbs: [NaN, NaN, NaN], // Initialize for UI binding
    dominantFlavor: 'Loading...'
};


document.addEventListener('DOMContentLoaded', async () => {
  console.log("DOM Loaded, setting up p5 sketch...");

  // Dynamically import the p5 sketch module, physics engine, and math utils
  try {
    const [neutrinoSketchModule, physicsModule, mathUtilsModule] = await Promise.all([
        import('./visualization/p5Sketch'),
        import('./physics/NuFastPort'),
        import('./utils/mathUtils')
    ]);

    const createNeutrinoSketch = neutrinoSketchModule.default; // Get the default export

    // Assign physics engine and utils to window
    window.physicsEngine = physicsModule;
    window.degToRad = mathUtilsModule.degToRad;

    const sketchContainer = document.getElementById('p5-container') as HTMLDivElement; // Main container for the sketch
    // The plot will be drawn *within* this sketch, so we don't need a separate plot container here.
    // However, the sketch function expects a plotCanvas element, which might be a specific canvas
    // element within the main container or elsewhere that the sketch will draw onto.
    // Let's assume there's a canvas element with id 'probPlotCanvas' within the HTML structure.
    const plotCanvasElement = document.getElementById('probPlotCanvas') as HTMLCanvasElement; // Canvas for plot drawing within the sketch

    if (!sketchContainer || !plotCanvasElement) {
      console.error('p5 container or plot canvas element not found!');
      // Attempt to proceed with just the container if plot canvas is missing,
      // the sketch might still be able to draw the animation.
       if (!sketchContainer) {
           console.error('Main p5 container element not found!');
           return; // Cannot proceed without main container
       }
       console.warn('Plot canvas element not found. Plot may not be displayed.');
       // Pass null for plotCanvasElement if not found, sketch should handle this.
       window.p5Instance = new p5(createNeutrinoSketch(sketchContainer, null as any), sketchContainer); // Pass null if not found

    } else {
        // --- Create and store the single p5 instance ---
        // Pass the main container and the specific plot canvas element
        window.p5Instance = new p5(createNeutrinoSketch(sketchContainer, plotCanvasElement), sketchContainer);
    }


    console.log("p5 sketch initialized.");

    // --- Set up External Watchers ---
    // Watchers now inform the single p5 sketch instance about state changes.
    const notifySketchUpdate = (resetAnimation: boolean = false) => {
        const simParamsStore = Alpine.store('simParams') as OscParamsStore;
        const animState = Alpine.store('animation') as AnimationState;

        // Create a plain OscillationParameters object from the store
        // The sketch's updateState will handle using getCalculationParams internally if needed
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
            // Include calculated fields needed by OscillationParameters type, even if not directly used by p5 state update
             s12sq: Math.pow(Math.sin(window.degToRad?.(simParamsStore.theta12_deg) ?? 0), 2),
             s13sq: Math.pow(Math.sin(window.degToRad?.(simParamsStore.theta13_deg) ?? 0), 2),
             s23sq: Math.pow(Math.sin(window.degToRad?.(simParamsStore.theta23_deg) ?? 0), 2),
             deltaCP_rad: window.degToRad?.(simParamsStore.deltaCP_deg) ?? 0,
             dm21sq: simParamsStore.dm21sq_eV2,
             dm31sq: simParamsStore.dm31sq_eV2,
             L: animState.currentL, // Current L might be relevant
             E: simParamsStore.energy,
             N_Newton: 0 // Assuming default
        };

        // Notify the single sketch instance
        if (window.p5Instance) {
            (window.p5Instance as P5SketchInstance).updateState?.(plainSimParams, { ...animState }, resetAnimation);
             if (resetAnimation) {
                 (window.p5Instance as P5SketchInstance).resetHistory?.(); // Call resetHistory on the single instance
             }
        }
    };

    // Watch relevant Alpine stores and notify the sketch
    Alpine.effect(() => { (Alpine.store('simParams') as OscParamsStore).initialFlavorIndex; notifySketchUpdate(true); }); // Reset on flavor change
    Alpine.effect(() => { (Alpine.store('simParams') as OscParamsStore).matterEffect; notifySketchUpdate(false); });
    Alpine.effect(() => { (Alpine.store('simParams') as OscParamsStore).rho; notifySketchUpdate(false); });
    Alpine.effect(() => { (Alpine.store('simParams') as OscParamsStore).energy; notifySketchUpdate(false); });
    Alpine.effect(() => { (Alpine.store('simParams') as OscParamsStore).theta12_deg; notifySketchUpdate(false); });
    Alpine.effect(() => { (Alpine.store('simParams') as OscParamsStore).theta13_deg; notifySketchUpdate(false); });
    Alpine.effect(() => { (Alpine.store('simParams') as OscParamsStore).theta23_deg; notifySketchUpdate(false); });
    Alpine.effect(() => { (Alpine.store('simParams') as OscParamsStore).deltaCP_deg; notifySketchUpdate(false); });
    Alpine.effect(() => { (Alpine.store('simParams') as OscParamsStore).dm21sq_eV2; notifySketchUpdate(false); });
    Alpine.effect(() => { (Alpine.store('simParams') as OscParamsStore).dm31sq_eV2; notifySketchUpdate(false); });
    Alpine.effect(() => { (Alpine.store('simParams') as OscParamsStore).maxL; notifySketchUpdate(false); }); // Update sketch on maxL change

    Alpine.effect(() => {
        const isPlaying = (Alpine.store('animation') as AnimationState).isPlaying;
        // Notify the single sketch instance
        (window.p5Instance as P5SketchInstance)?.setPlaying?.(isPlaying);
    });
    Alpine.effect(() => {
        const simSpeed = (Alpine.store('animation') as AnimationState).simSpeed;
         // Notify the single sketch instance
        (window.p5Instance as P5SketchInstance)?.setSimSpeed?.(simSpeed);
    });

    // Clean up p5 instance on page unload
    window.addEventListener('beforeunload', () => {
      window.p5Instance?.remove(); // Remove the single instance
    });

  } catch (error) {
      console.error("Failed to load modules or initialize p5 sketch:", error);
  }
});


// Declare globals on the window object
declare global {
  interface Window {
    Alpine: typeof Alpine;
    p5Instance: P5SketchInstance | null; // Declare the single instance name
    physicsEngine?: typeof import('./physics/NuFastPort'); // Type for the physics module
    degToRad?: (deg: number) => number;

    // Keep for potential UI bindings outside p5 canvas
    neutrinoVisualizationData: {
      currentProbs: ProbabilityVector;
      dominantFlavor: string;
    };
  }
}

console.log("main.ts loaded - Alpine setup complete. p5 sketch initialized on DOMContentLoaded.");
