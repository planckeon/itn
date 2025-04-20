import type p5 from 'p5';
import type { P5SketchInstance } from '../../../core/types/p5js-wrapper';
import type { ProbabilityVector } from '../../../core/physics/types';
import { FLAVOR_COLORS } from '../../../core/utils/colorUtils';

interface NeutrinoState {
    color: p5.Color;
    size: number;
    currentProbs: ProbabilityVector;
    dominantFlavor: string;
}

export class NeutrinoVisualization {
    private state: NeutrinoState;
    private flavorColorsP5: p5.Color[];
    
    constructor(private p: P5SketchInstance) {
        this.state = {
            color: p.color(0),
            size: 32,
            currentProbs: [NaN, NaN, NaN],
            dominantFlavor: 'Loading...'
        };

        this.flavorColorsP5 = [
            p.color(FLAVOR_COLORS.electron.r, FLAVOR_COLORS.electron.g, FLAVOR_COLORS.electron.b),
            p.color(FLAVOR_COLORS.muon.r, FLAVOR_COLORS.muon.g, FLAVOR_COLORS.muon.b),
            p.color(FLAVOR_COLORS.tau.r, FLAVOR_COLORS.tau.g, FLAVOR_COLORS.tau.b)
        ];
        
        this.state.color = p.color(this.flavorColorsP5[0]);
    }

    public updateProbabilities(probs: ProbabilityVector, dominantFlavor: string): void {
        this.state.currentProbs = probs;
        this.state.dominantFlavor = dominantFlavor;
        
        if (!probs.some(isNaN)) {
            const blendedRgb = this.blendNeutrinoColors(probs);
            this.state.color = this.p.color(blendedRgb.r, blendedRgb.g, blendedRgb.b);
        }
    }

    public draw(): void {
        if (!this.state.currentProbs.some(isNaN)) {
            this.p.push();
            this.p.noStroke();
            this.p.ambientLight(60, 60, 60);
            this.p.pointLight(255, 255, 255, 0, 0, 200);
            this.p.fill(this.state.color);
            this.p.sphere(this.state.size, 32, 32);
            this.p.pop();
        }
    }

    public getFlavorLabelHtml(): string {
        if (this.state.currentProbs.some(isNaN)) {
            return 'Loading...';
        }
        const r = this.p.red(this.state.color);
        const g = this.p.green(this.state.color);
        const b = this.p.blue(this.state.color);
        return `<span style="color: rgb(${r},${g},${b})">${this.state.dominantFlavor}</span>`;
    }

    private blendNeutrinoColors(probs: ProbabilityVector): { r: number; g: number; b: number } {
        return {
            r: Math.round(probs[0] * FLAVOR_COLORS.electron.r + 
                          probs[1] * FLAVOR_COLORS.muon.r + 
                          probs[2] * FLAVOR_COLORS.tau.r),
            g: Math.round(probs[0] * FLAVOR_COLORS.electron.g + 
                          probs[1] * FLAVOR_COLORS.muon.g + 
                          probs[2] * FLAVOR_COLORS.tau.g),
            b: Math.round(probs[0] * FLAVOR_COLORS.electron.b + 
                          probs[1] * FLAVOR_COLORS.muon.b + 
                          probs[2] * FLAVOR_COLORS.tau.b)
        };
    }
}