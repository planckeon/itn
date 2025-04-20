import type p5 from 'p5';
import type { P5SketchInstance } from '../../../core/types/p5js-wrapper';

interface Star {
    x: number;
    y: number; 
    z: number;
    px: number;
    py: number;
    pz: number;
    brightness: number;
    tintColor?: p5.Color;
}

export class StarfieldVisualization {
    private stars: Star[] = [];
    private numStars = 400;
    private starfieldDepth = 1000;
    
    constructor(private p: P5SketchInstance) {}

    public initStars(): void {
        this.stars = [];
        for (let i = 0; i < this.numStars; i++) {
            const brightness = 0.7 + this.p.random() * 0.3;
            const r = this.p.random(200, this.starfieldDepth);
            const theta = this.p.random(this.p.PI);
            const phi = this.p.random(this.p.TWO_PI);
            
            this.stars.push({
                x: r * Math.sin(theta) * Math.cos(phi),
                y: r * Math.sin(theta) * Math.sin(phi),
                z: r * Math.cos(theta),
                px: 0, py: 0, pz: 0,
                brightness
            });
        }
    }

    public drawStarfield(_dt: number, speed: number): void {
        const movementScale = speed * 0.1;
        const v = 8 * movementScale;
        
        // Movement direction vector
        let dx = 1, dy = 0.5, dz = 1;
        const norm = Math.sqrt(dx*dx + dy*dy + dz*dz);
        dx /= norm; dy /= norm; dz /= norm;

        for (let i = this.stars.length - 1; i >= 0; i--) {
            const star = this.stars[i];
            
            // Store previous position
            star.px = star.x;
            star.py = star.y;
            star.pz = star.z;

            // Update position
            star.x -= dx * v;
            star.y -= dy * v; 
            star.z -= dz * v;

            // Reset stars that move past viewer
            const viewDot = star.x*dx + star.y*dy + star.z*dz;
            if (viewDot < 0) {
                const r = this.p.random(this.starfieldDepth * 0.9, this.starfieldDepth * 1.1);
                const theta = this.p.random(this.p.PI * 0.2, this.p.PI * 0.8);
                const phi = this.p.random(this.p.TWO_PI);
                
                star.x = r * Math.sin(theta) * Math.cos(phi);
                star.y = r * Math.sin(theta) * Math.sin(phi);
                star.z = r * Math.cos(theta);
                star.px = star.x;
                star.py = star.y;
                star.pz = star.z;
            }

            // Draw motion blur line
            const lineAlpha = this.p.map(speed, 0.1, 3, 30, 90, true);
            this.p.stroke(255, 255, 255, lineAlpha);
            
            const lineWeight = this.p.map(speed, 0.1, 3, 1, 2.5, true);
            this.p.strokeWeight(lineWeight);
            
            this.p.line(star.px, star.py, star.pz, star.x, star.y, star.z);

            // Draw star point
            const normalizedDepth = this.p.map(star.z, -this.starfieldDepth, this.starfieldDepth, 0, 1);
            const pointAlpha = this.p.map(normalizedDepth, 0, 1, 80, 220, true);
            this.p.stroke(255, 255, 255, pointAlpha);
            
            const pointSize = this.p.map(normalizedDepth, 0, 1, 0.5, 2.0, true);
            this.p.strokeWeight(pointSize);
            
            this.p.point(star.x, star.y, star.z);
        }
    }
}