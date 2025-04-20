import type p5 from 'p5';
import type { AnimationState, OscillationParameters, ProbabilityVector } from '../physics/types';

export type { ProbabilityVector, OscillationParameters, AnimationState };

/**
 * Extended p5 instance with custom methods for neutrino visualization
 */
export interface P5SketchInstance extends p5 {
    setPlaying?: (isPlaying: boolean) => void;
    setSimSpeed?: (speed: number) => void;
    updateSimParams?: (simParams: OscillationParameters) => void;
    resetSimulation?: () => void;
}

declare global {
    interface Window {
        Alpine: {
            store: (name: string) => any;
            start: () => void;
        };
        physicsEngine?: {
            getProbabilitiesForInitialFlavor: (params: OscillationParameters) => ProbabilityVector;
        };
        degToRad?: (deg: number) => number;
    }
}