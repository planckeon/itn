import type { ProbabilityVector } from '../../../core/physics/types';
import { FLAVOR_COLORS } from '../../../core/utils/colorUtils';

export class ProbabilityPlot {
    private plotCanvas: HTMLCanvasElement;
    private maxL: number = 1000;
    private cachedProbabilities: ProbabilityVector[] | null = null;
    private cachedDistances: number[] | null = null;

    constructor(
        canvas: HTMLCanvasElement
    ) {
        this.plotCanvas = canvas;
        this.plotCanvas.width = 500;
        this.plotCanvas.height = 120;
    }

    public updateParameters(maxL: number): void {
        this.maxL = maxL;
    }

    public updateCache(probabilities: ProbabilityVector[] | null, distances: number[] | null): void {
        this.cachedProbabilities = probabilities;
        this.cachedDistances = distances;
    }

    public draw(): void {
        const ctx = this.plotCanvas.getContext('2d');
        if (!ctx) return;

        // Clear and setup canvas
        ctx.clearRect(0, 0, this.plotCanvas.width, this.plotCanvas.height);
        
        // Define plot area
        const plotMargin = { top: 30, right: 30, bottom: 30, left: 30 };
        const chartWidth = this.plotCanvas.width - plotMargin.left - plotMargin.right;
        const chartHeight = this.plotCanvas.height - plotMargin.top - plotMargin.bottom;

        // Draw probability curves
        if (this.cachedProbabilities && this.cachedDistances) {
            const flavorColors = [
                FLAVOR_COLORS.electron,
                FLAVOR_COLORS.muon,
                FLAVOR_COLORS.tau
            ];

            for (let j = 0; j < 3; j++) {
                ctx.beginPath();
                let firstPoint = true;

                for (let i = 0; i < this.cachedProbabilities.length; i++) {
                    const lValue = this.cachedDistances[i];
                    const probVal = this.cachedProbabilities[i]?.[j];

                    if (typeof probVal === 'number' && !isNaN(probVal)) {
                        const x = plotMargin.left + (lValue / this.maxL) * chartWidth;
                        const y = plotMargin.top + chartHeight - probVal * chartHeight;

                        if (firstPoint) {
                            ctx.moveTo(x, y);
                            firstPoint = false;
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }
                }

                if (!firstPoint) {
                    ctx.strokeStyle = `rgba(${flavorColors[j].r},${flavorColors[j].g},${flavorColors[j].b}, 0.86)`;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }
        }

        // Draw title
        ctx.font = '18px Fira Mono, Consolas, monospace';
        ctx.fillStyle = '#ECEFF1';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('Probability', this.plotCanvas.width / 2, plotMargin.top / 2);

        // Draw X-axis label
        ctx.font = '14px Fira Mono, Consolas, monospace';
        ctx.fillStyle = '#B0BEC5';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText('Distance (km)', this.plotCanvas.width - plotMargin.right, this.plotCanvas.height - plotMargin.bottom / 2);
    }
}