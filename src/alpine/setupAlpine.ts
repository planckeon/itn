/**
 * Alpine.js setup for the neutrino oscillation visualization.
 * This module initializes Alpine.js and its stores for reactive state management.
 */

import Alpine from 'alpinejs';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { defaultOscParams } from '../physics/constants';
import { OscillationParameters, NeutrinoFlavor, PlotParameters, TooltipState } from '../physics/types';
import { degToRad } from '../utils/mathUtils';
import { neutrinoVisualizationComponent } from './visualizationComponent'; // Import the component logic

// Define interfaces for the store shapes
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
  initialFlavorIndex: NeutrinoFlavor;
  // Revert return type to OscillationParameters
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

// Declare window.Alpine for global access
declare global {
  interface Window {
    Alpine: typeof Alpine;
    katex: typeof katex; // Use the imported katex type directly
  }
}

/**
 * Initialize Alpine.js and configure global stores
 */
export function setupAlpine(): void {
  // Make Alpine globally available
  window.Alpine = Alpine;

  // Register Alpine Stores (simParams, animation, plotParams, tooltips)
  // Register the oscillation parameters store with type assertion
  Alpine.store('simParams', {
    // Convert default parameters for UI display
    theta12_deg: defaultOscParams.theta12_deg,
    theta13_deg: defaultOscParams.theta13_deg,
    theta23_deg: defaultOscParams.theta23_deg,
    deltaCP_deg: defaultOscParams.deltaCP_deg,
    dm21sq_eV2: defaultOscParams.dm21sq_eV2,
    dm31sq_eV2: defaultOscParams.dm31sq_eV2,
      // Other parameters
    energy: defaultOscParams.energy, // GeV
    maxL: 1000, // Initial maxL for plot
    rho: defaultOscParams.rho, // Corrected: Use rho
    Ye: defaultOscParams.Ye,
    matterEffect: defaultOscParams.matterEffect,
    initialFlavorIndex: defaultOscParams.initialFlavorIndex, // Start with electron neutrino
      // Convert UI parameters to calculation parameters
      getCalculationParams(currentL: number): OscillationParameters { // Revert return type here
        // The returned object already matches the combined OscillationParameters interface
        return {
          // UI Params
          theta12_deg: this.theta12_deg,
          theta13_deg: this.theta13_deg,
          theta23_deg: this.theta23_deg,
          deltaCP_deg: this.deltaCP_deg,
          dm21sq_eV2: this.dm21sq_eV2,
          dm31sq_eV2: this.dm31sq_eV2,
          maxL: this.maxL, // Add missing maxL property
          energy: this.energy,
          // Calculation Params
          s12sq: Math.pow(Math.sin(degToRad(this.theta12_deg)), 2),
          s13sq: Math.pow(Math.sin(degToRad(this.theta13_deg)), 2),
          s23sq: Math.pow(Math.sin(degToRad(this.theta23_deg)), 2),
          deltaCP_rad: degToRad(this.deltaCP_deg),
          dm21sq: this.dm21sq_eV2,
          dm31sq: this.dm31sq_eV2,
          L: currentL,
          E: this.energy,
          rho: this.rho,
          Ye: this.Ye,
          matterEffect: this.matterEffect,
          initialFlavorIndex: this.initialFlavorIndex,
          N_Newton: 0
        };
      }
    } as OscParamsStore);
  
  // Register the animation state store with type assertion
  Alpine.store('animation', {
    isPlaying: false,
    currentL: 0, // km
    simSpeed: 2, // Animation speed multiplier
    lastTimestamp: 0,
    
    play() {
      this.isPlaying = true;
    },
    
    pause() {
      this.isPlaying = false;
    },
    
    reset() {
      this.currentL = 0;
      this.isPlaying = false;
    },
    
    toggle() {
      this.isPlaying = !this.isPlaying;
    },
    
    setSpeed(speed: number) {
      this.simSpeed = speed;
    },
    
    // Update the current distance based on elapsed time
    updateL(timestamp: number) {
      if (!this.isPlaying) {
        this.lastTimestamp = timestamp;
        return;
      }
      
      if (this.lastTimestamp === 0) {
        this.lastTimestamp = timestamp;
        return;
      }
      
      const deltaTime = timestamp - this.lastTimestamp;
      const maxL = (Alpine.store('plotParams') as PlotParamsStore).getParameters().maxL;
      const distancePerSecond = maxL / 20; // Example: Traverse maxL in 20s at 1x speed
      const deltaL = (deltaTime / 1000) * this.simSpeed * distancePerSecond;
      
      this.currentL += deltaL;
      
      // Reset if we've reached maxL
      if (this.currentL > maxL) {
        this.currentL %= maxL; // Loop smoothly
      }
      
      this.lastTimestamp = timestamp;
    }
  } as AnimationStore);
  
  // Register the plot parameters store with type assertion
  Alpine.store('plotParams', {
    numPoints: 200, // Number of points to calculate for the plot
    
    getParameters(): PlotParameters {
      return {
        maxL: (Alpine.store('simParams') as OscParamsStore).maxL, // Use the renamed interface
        numPoints: this.numPoints
      };
    }
  } as PlotParamsStore);
  
  // Register the tooltip state store with type assertion
  Alpine.store('tooltips', {
    visible: {} as TooltipState,
    
    show(id: string) {
      this.visible[id] = true;
    },
    
    hide(id: string) {
      this.visible[id] = false;
    },
    
    toggle(id: string) {
      this.visible[id] = !this.visible[id];
    },
    
    isVisible(id: string): boolean {
      return !!this.visible[id];
    }
  } as TooltipsStore);

  // Make KaTeX globally available (using 'any' to bypass complex type issue)
  window.katex = katex as any;

  // Add KaTeX directive
  Alpine.directive('katex', (el, { expression }, { evaluateLater, effect }) => {
    const renderMath = evaluateLater(expression);
    
    effect(() => {
      renderMath(value => {
        if (typeof value === 'string') {
          try {
            katex.render(value, el as HTMLElement, {
              throwOnError: false,
              displayMode: el.tagName === 'DIV',
              fleqn: false
            });
          } catch (error) {
            console.error('KaTeX rendering error:', error);
            el.textContent = `Error rendering equation: ${value}`;
          }
        }
      });
    });
  });

  // Register the main visualization component
  Alpine.data('neutrinoVisualization', neutrinoVisualizationComponent);
}
