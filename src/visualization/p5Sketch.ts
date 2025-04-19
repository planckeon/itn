import p5 from 'p5';
import Alpine from 'alpinejs';
import type { OscillationParameters, AnimationState, ProbabilityVector } from '../physics/types';
import { MAX_PLOT_L_DEFAULT, ANIMATION_DURATION_SECONDS } from '../physics/constants';
import { blendNeutrinoColors, FLAVOR_COLORS } from '../utils/colorUtils'; // Import FLAVOR_COLORS
import { getDominantFlavorName } from '../alpine/visualizationComponent';

// --- Type Definitions ---
export interface P5SketchInstance extends p5 {
    updateState?: (simParams: OscillationParameters, animState: AnimationState, reset: boolean) => void;
    setPlaying?: (isPlaying: boolean) => void;
    setSimSpeed?: (speed: number) => void;
    resetHistory?: () => void; // For plot history
}

interface Star {
    x: number; y: number; z: number; // z for depth simulation
    px: number; py: number; pz: number; // previous position for motion blur
    brightness: number;
}

// ==================================
// === Main Visualization Sketch ===
// ==================================
export default function createNeutrinoSketch(container: HTMLElement, plotCanvas: HTMLCanvasElement): (p: P5SketchInstance) => void {
    return (p: P5SketchInstance) => {
        let currentSimParams: OscillationParameters | null = null;
        let currentAnimState: AnimationState = { isPlaying: false, currentL: 0, simSpeed: 1.0 };
        let lastTimestamp = 0;

        // Starfield state
        let stars: Star[] = [];
        const numStars = 400; // Reduced for performance
        const starfieldDepth = 800; // Depth for perspective simulation

        // Neutrino state
        let neutrinoColor: p5.Color;
        const neutrinoSize = 20; // Size of the neutrino circle

        // Plot state
        let probHistory: ProbabilityVector[] = [];
        const probHistoryLen = 500; // Number of history points
        let currentProbs: ProbabilityVector = [NaN, NaN, NaN];
        let maxL: number = MAX_PLOT_L_DEFAULT;
        let initialFlavorIndex: number = 0;
        let flavorColorsP5: p5.Color[];
        const flavorSymbolsSimple = ['e', 'μ', 'τ']; // Simple symbols for legend

        let flavorLabelElement: HTMLElement | null = null;

        p.setup = () => {
            const canvasWidth = container.clientWidth || 800;
            const canvasHeight = container.clientHeight || 600;
            p.createCanvas(canvasWidth, canvasHeight, p.WEBGL); // Use WEBGL renderer like the reference
            p.pixelDensity(1.5); // Match the reference pixel density

            // Initialize flavor colors for p5
            flavorColorsP5 = [
                p.color(FLAVOR_COLORS.electron.r, FLAVOR_COLORS.electron.g, FLAVOR_COLORS.electron.b),
                p.color(FLAVOR_COLORS.muon.r, FLAVOR_COLORS.muon.g, FLAVOR_COLORS.muon.b),
                p.color(FLAVOR_COLORS.tau.r, FLAVOR_COLORS.tau.g, FLAVOR_COLORS.tau.b)
            ];

            neutrinoColor = p.color(flavorColorsP5[0]); // Initial color (Electron)
            initStars();
            flavorLabelElement = document.getElementById('neutrino-flavor-label');

            console.log("p5 sketch setup complete.");

            // Initial state sync
            if (window.Alpine) {
                const simParamsStore = Alpine.store('simParams') as OscillationParameters;
                const animStateStore = Alpine.store('animation') as AnimationState;
                if (simParamsStore && animStateStore) {
                    p.updateState?.(simParamsStore, animStateStore, true);
                }
            }
        };

        p.draw = () => {
            // Clear background with a slight fade for motion trail effect
            p.background(0, 0, 0, 50); // Adjust alpha for desired trail length

            const now = p.millis();
            const deltaTime = (now - lastTimestamp) / 1000.0;
            lastTimestamp = now;
            const safeDeltaTime = Math.max(0, Math.min(deltaTime, 0.1)); // Clamp delta time

            // --- Update Animation State ---
            if (currentAnimState.isPlaying && currentSimParams) {
                const L_MAX = currentSimParams.maxL || MAX_PLOT_L_DEFAULT;
                // Calculate distance increment based on speed and delta time
                // Assuming a base speed that covers L_MAX in ANIMATION_DURATION_SECONDS
                const baseSpeed_km_per_sec = L_MAX / ANIMATION_DURATION_SECONDS;
                const distanceIncrement = currentAnimState.simSpeed * baseSpeed_km_per_sec * safeDeltaTime;

                currentAnimState.currentL = (currentAnimState.currentL + distanceIncrement);
                // Loop L if it exceeds maxL
                if (currentAnimState.currentL >= L_MAX) {
                     currentAnimState.currentL = currentAnimState.currentL % L_MAX;
                     // Optionally reset history when looping
                     // probHistory = []; // Uncomment to clear plot history on loop
                }


                // Update Alpine store L for UI and plot sync
                if (Alpine.store('animation')) {
                    (Alpine.store('animation') as AnimationState).currentL = currentAnimState.currentL;
                }
            }

            // --- Calculate Probabilities ---
            // Only calculate if simParams are valid and E is not near zero
            if (window.physicsEngine && currentSimParams && !isNaN(currentSimParams.E) && Math.abs(currentSimParams.E) > 1e-9) {
                 const paramsForCalc = { ...currentSimParams, L: currentAnimState.currentL };
                 const calculatedProbs = window.physicsEngine.getProbabilitiesForInitialFlavor(paramsForCalc);
                 if (!calculatedProbs.some(isNaN)) {
                     currentProbs = calculatedProbs;
                 }
            } else if (currentSimParams?.initialFlavorIndex !== undefined) {
                 // Handle E=0 or invalid params case: set pure initial state
                 currentProbs = [0, 0, 0];
                 currentProbs[currentSimParams.initialFlavorIndex] = 1.0;
            } else {
                 // Default to unknown if no params
                 currentProbs = [NaN, NaN, NaN];
            }

            // Add logging to inspect probabilities and parameters
            if (p.frameCount % 60 === 0) { // Log every 60 frames (approx 1 second)
                console.log(`Frame ${p.frameCount}: L=${currentAnimState.currentL.toFixed(2)}, E=${currentSimParams?.E}, Probs=[${currentProbs.map(p => p.toFixed(3))}], isPlaying=${currentAnimState.isPlaying}`);
                if (currentSimParams) {
                    console.log(`  Sim Params: maxL=${currentSimParams.maxL}, initialFlavor=${currentSimParams.initialFlavorIndex}, matter=${currentSimParams.matterEffect}, rho=${currentSimParams.rho}`);
                }
            }

           // --- Update Global State and History ---
            if (window.neutrinoVisualizationData && !currentProbs.some(isNaN)) {
               window.neutrinoVisualizationData.currentProbs = currentProbs;
               window.neutrinoVisualizationData.dominantFlavor = getDominantFlavorName(currentProbs);

               // Add to probability history if playing
               if (currentAnimState.isPlaying) {
                   probHistory.push([...currentProbs]); // Store a copy
                   if (probHistory.length > probHistoryLen) {
                       probHistory.shift(); // Remove oldest
                   }
               }
            } else if (window.neutrinoVisualizationData) {
                // Reset if probabilities are invalid
                window.neutrinoVisualizationData.currentProbs = [NaN, NaN, NaN];
                window.neutrinoVisualizationData.dominantFlavor = 'Calculating...';
            }


           // --- 2D Drawing ---
           // Draw Starfield (before neutrino and plot so they are on top)
           drawStarfield(safeDeltaTime);

            // Draw Neutrino (Sphere in WEBGL)
            if (!currentProbs.some(isNaN)) {
                const blendedRgb = blendNeutrinoColors(currentProbs);
                neutrinoColor = p.color(blendedRgb.r, blendedRgb.g, blendedRgb.b);

                p.push();
                p.noStroke();
                p.ambientLight(60, 60, 80); // Add ambient light
                p.pointLight(255, 255, 255, 0, 0, 200); // Add point light
                p.specularMaterial(neutrinoColor); // Use the calculated color
                p.shininess(30); // Add shininess for a more spherical look
                // Add a simple pulsing effect based on time and speed
                const pulseFactor = 1.0 + 0.05 * Math.sin(p.millis() * 0.005 * currentAnimState.simSpeed);
                p.sphere(32 * pulseFactor, 32, 32); // Draw neutrino as a sphere (size ~32 in reference)
                p.pop();

                // Update external flavor label
                if (flavorLabelElement) {
                    const domFlavor = window.neutrinoVisualizationData?.dominantFlavor || 'Calculating...';
                     // Use the blended color for the label text
                    flavorLabelElement.innerHTML = `<span style="color: rgb(${blendedRgb.r},${blendedRgb.g},${blendedRgb.b})">${domFlavor}</span>`;
                }
            } else if (flavorLabelElement) {
                 flavorLabelElement.innerHTML = `<span>Calculating...</span>`;
            }

            // Draw Probability Plot (onto the main canvas, positioned at the bottom)
            drawProbPlot();
        };

        p.windowResized = () => {
            const canvasWidth = container.clientWidth || 800;
            const canvasHeight = container.clientHeight || 600;
            p.resizeCanvas(canvasWidth, canvasHeight);
        };

        function initStars() {
            stars = [];
            for (let i = 0; i < numStars; i++) {
                const brightness = 0.5 + Math.random() * 0.5;
                // Distribute stars in a sphere-like volume
                const r = p.random(200, starfieldDepth); // Match reference start radius
                const theta = p.random(p.PI); // Angle from z-axis
                const phi = p.random(p.TWO_PI); // Angle in xy-plane
                const x = r * Math.sin(theta) * Math.cos(phi);
                const y = r * Math.sin(theta) * Math.sin(phi);
                const z = r * Math.cos(theta);
                stars.push({ x, y, z, px: x, py: y, pz: z, brightness });
            }
        }

        function drawStarfield(dt: number) {
            const speed = currentAnimState.simSpeed;
            // Reference HTML uses a fixed direction vector (1, 0.5, 1) for star movement
            let dx = 1, dy = 0.5, dz = 1;
            let norm = Math.sqrt(dx*dx + dy*dy + dz*dz);
            dx /= norm; dy /= norm; dz /= norm;

            const baseMoveSpeed = 8; // Match reference base speed
            const v = baseMoveSpeed * speed; // Velocity vector magnitude

            p.stroke(255, 255, 255); // White color for stars

            for (let i = stars.length - 1; i >= 0; i--) {
                const star = stars[i];

                // Store previous position before updating
                star.px = star.x;
                star.py = star.y;
                star.pz = star.z;

                // Move star based on the direction vector and velocity
                star.x -= dx * v;
                star.y -= dy * v;
                star.z -= dz * v;

                // If star moves past the viewer (dot product with direction < 0), reset its position
                // This implements the reference's reset logic
                if (star.x*dx + star.y*dy + star.z*dz < 0) {
                    const r = p.random(600, starfieldDepth); // Match reference reset radius range
                    const theta = p.random(p.PI);
                    const phi = p.random(p.TWO_PI);
                    star.x = r * Math.sin(theta) * Math.cos(phi);
                    star.y = r * Math.sin(theta) * Math.sin(phi);
                    star.z = r * Math.cos(theta); // Reset to a new position in the sphere
                    // Set previous position to the new position to avoid long lines on reset
                    star.px = star.x;
                    star.py = star.y;
                    star.pz = star.z;
                }

                // Apply perspective projection for 2D drawing
                // Simple perspective: x' = x / (z + k), y' = y / (z + k)
                // Note: In WEBGL mode, p5 handles perspective somewhat, but manual projection
                // might be needed for accurate starfield simulation as in the reference.
                // Let's try drawing directly in 3D space first, as the reference does.
                // The reference HTML draws lines/points in 3D space, relying on WEBGL camera.

                // Draw motion blur line
                // Reference uses stroke(255, 255, 255, 60) and strokeWeight(1.5) for lines
                p.stroke(255, 255, 255, 60); // Match reference line alpha
                p.strokeWeight(1.5); // Match reference line weight
                p.line(star.px, star.py, star.pz, star.x, star.y, star.z);

                // Draw the star point
                // Reference uses stroke(255, 255, 255, 180) and strokeWeight(2.5) for points
                p.stroke(255, 255, 255, 180); // Match reference point alpha
                p.strokeWeight(2.5); // Match reference point weight
                p.point(star.x, star.y, star.z);
            }
        }


        function drawProbPlot() {
             // Get the 2D rendering context for the plot canvas
             const ctx = plotCanvas.getContext('2d');
             if (!ctx) {
                 console.error("Could not get 2D context for plot canvas.");
                 return;
             }

             const plotWidth = plotCanvas.width;
             const plotHeight = plotCanvas.height;

             // Clear the plot canvas
             ctx.clearRect(0, 0, plotWidth, plotHeight);

             // Define plot area within the plot canvas
             const plotMargin = { top: 20, right: 20, bottom: 25, left: 40 }; // Increased left margin for labels
             const chartWidth = plotWidth - plotMargin.left - plotMargin.right;
             const chartHeight = plotHeight - plotMargin.top - plotMargin.bottom;

             // Draw axes
             ctx.strokeStyle = '#888'; // Match reference axis color
             ctx.lineWidth = 1;
             ctx.beginPath();
             ctx.moveTo(plotMargin.left, plotMargin.top + chartHeight); // Y-axis start
             ctx.lineTo(plotMargin.left, plotMargin.top); // Y-axis end
             ctx.lineTo(plotMargin.left + chartWidth, plotMargin.top); // Top line (optional, matching reference style)
             ctx.moveTo(plotMargin.left, plotMargin.top + chartHeight); // X-axis start
             ctx.lineTo(plotMargin.left + chartWidth, plotMargin.top + chartHeight); // X-axis end
             ctx.stroke();


             // Draw probability history lines
             const historyLength = probHistory.length;
             if (historyLength >= 2) {
                 const flavorColorsRgb = [
                     [FLAVOR_COLORS.electron.r, FLAVOR_COLORS.electron.g, FLAVOR_COLORS.electron.b],
                     [FLAVOR_COLORS.muon.r, FLAVOR_COLORS.muon.g, FLAVOR_COLORS.muon.b],
                     [FLAVOR_COLORS.tau.r, FLAVOR_COLORS.tau.g, FLAVOR_COLORS.tau.b]
                 ];

                 for (let j = 0; j < 3; j++) {
                     ctx.beginPath();
                     for (let i = 0; i < historyLength; i++) {
                         // Map history index to x position across the chart width
                         const x = plotMargin.left + (i / (probHistoryLen - 1)) * chartWidth;
                         const probVal = probHistory[i]?.[j];
                         if (typeof probVal === 'number' && !isNaN(probVal)) {
                             // Map probability [0, 1] to y position [chartHeight, 0] relative to plot top
                             const y = plotMargin.top + chartHeight - probVal * chartHeight; // Adjusted mapping
                             if (i === 0) ctx.moveTo(x, y);
                             else ctx.lineTo(x, y);
                         } else {
                             // Handle gaps if there are NaNs in history
                             ctx.stroke(); // Stroke current path before moving
                             ctx.beginPath(); // Start a new path
                         }
                     }
                     ctx.strokeStyle = `rgb(${flavorColorsRgb[j][0]},${flavorColorsRgb[j][1]},${flavorColorsRgb[j][2]})`;
                     ctx.lineWidth = 2.5; // Match reference line width
                     ctx.stroke();
                 }
             }

             // Draw current probability markers (Circles at the right edge of the plot area)
             if (!currentProbs.some(isNaN)) {
                  const markerX = plotMargin.left + chartWidth;
                  const flavorColorsRgb = [
                     [FLAVOR_COLORS.electron.r, FLAVOR_COLORS.electron.g, FLAVOR_COLORS.electron.b],
                     [FLAVOR_COLORS.muon.r, FLAVOR_COLORS.muon.g, FLAVOR_COLORS.muon.b],
                     [FLAVOR_COLORS.tau.r, FLAVOR_COLORS.tau.g, FLAVOR_COLORS.tau.b]
                 ];
                  for (let j = 0; j < 3; j++) {
                      const markerY = plotMargin.top + chartHeight - currentProbs[j] * chartHeight; // Adjusted mapping
                      ctx.beginPath();
                      ctx.arc(markerX, markerY, 6, 0, 2 * Math.PI); // Match reference marker size
                      ctx.fillStyle = `rgb(${flavorColorsRgb[j][0]},${flavorColorsRgb[j][1]},${flavorColorsRgb[j][2]})`;
                      ctx.fill();
                  }
             }

              // Draw labels and legend using canvas 2D context
              ctx.font = '14px Fira Mono, Consolas, monospace'; // Match reference font
              ctx.fillStyle = '#fff'; // Match reference text color
              ctx.textAlign = 'center';
              ctx.textBaseline = 'bottom';
              ctx.fillText('Distance (km)', plotMargin.left + chartWidth / 2, plotMargin.top + chartHeight + 20); // X-axis label position

              ctx.textAlign = 'left';
              ctx.textBaseline = 'middle';
              ctx.fillText("Probability", plotMargin.left - 35, plotMargin.top + chartHeight / 2); // Y-axis label position

              // Legend
              const initialSymbol = flavorSymbolsSimple[initialFlavorIndex];
              const legendXStart = plotMargin.left + chartWidth - 150; // Position legend on the right
              const legendY = plotMargin.top - 8; // Position legend items
              const flavorColorsRgb = [
                     [FLAVOR_COLORS.electron.r, FLAVOR_COLORS.electron.g, FLAVOR_COLORS.electron.b],
                     [FLAVOR_COLORS.muon.r, FLAVOR_COLORS.muon.g, FLAVOR_COLORS.muon.b],
                     [FLAVOR_COLORS.tau.r, FLAVOR_COLORS.tau.g, FLAVOR_COLORS.tau.b]
                 ];

              for (let j = 0; j < 3; j++) {
                  ctx.fillStyle = `rgb(${flavorColorsRgb[j][0]},${flavorColorsRgb[j][1]},${flavorColorsRgb[j][2]})`;
                  ctx.fillText(`P(${initialSymbol}→${flavorSymbolsSimple[j]})`, legendXStart + j * 50, legendY); // Position legend items
              }
        }


        // --- Custom Methods for Alpine Interaction ---
        p.updateState = (simParams, animState, reset) => {
            currentSimParams = { ...simParams };
            currentAnimState = { ...currentAnimState, ...animState };
            maxL = simParams.maxL || MAX_PLOT_L_DEFAULT;
            initialFlavorIndex = simParams.initialFlavorIndex;

            if (reset) {
                currentAnimState.currentL = 0;
                probHistory = []; // Clear history on reset

                // Recalculate initial state for color/label
                if (window.physicsEngine && currentSimParams) {
                    const initialProbs = window.physicsEngine.getProbabilitiesForInitialFlavor({...currentSimParams, L: 0});
                     if (!initialProbs.some(isNaN)) {
                         const blendedRgb = blendNeutrinoColors(initialProbs);
                         neutrinoColor = p.color(blendedRgb.r, blendedRgb.g, blendedRgb.b);
                         if (flavorLabelElement) {
                             const domFlavor = getDominantFlavorName(initialProbs);
                             flavorLabelElement.innerHTML = `<span style="color: rgb(${blendedRgb.r},${blendedRgb.g},${blendedRgb.b})">${domFlavor}</span>`;
                         }
                         if(window.neutrinoVisualizationData){
                            window.neutrinoVisualizationData.currentProbs = initialProbs;
                            window.neutrinoVisualizationData.dominantFlavor = getDominantFlavorName(initialProbs);
                         }
                     } else {
                         // Handle case where initial calculation fails
                         neutrinoColor = p.color(128); // Default grey
                         if (flavorLabelElement) flavorLabelElement.innerHTML = `<span>Error</span>`;
                     }
                 }
            }
             // Ensure lastTimestamp is updated when playing starts
             if (currentAnimState.isPlaying && lastTimestamp === 0) {
                 lastTimestamp = p.millis();
             }
        };

        p.setPlaying = (isPlaying) => {
            console.log(`p5Sketch: setPlaying called with ${isPlaying}`);
            currentAnimState.isPlaying = isPlaying;
              // Reset lastTimestamp when starting playback to avoid large deltaTime
              if (isPlaying) {
                  lastTimestamp = p.millis();
                  console.log(`p5Sketch: Animation started, lastTimestamp reset to ${lastTimestamp}`);
              } else {
                  console.log(`p5Sketch: Animation paused`);
              }
        };

        p.setSimSpeed = (speed) => { currentAnimState.simSpeed = speed; };

        p.resetHistory = () => {
             probHistory = [];
        }
    };
}