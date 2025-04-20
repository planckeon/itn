import type p5 from 'p5';
import Alpine from 'alpinejs';
import type { OscillationParameters, AnimationState, ProbabilityVector } from '../physics/types';
import { MAX_PLOT_L_DEFAULT, ANIMATION_DURATION_SECONDS } from '../physics/constants';
import { blendNeutrinoColors, FLAVOR_COLORS } from '../utils/colorUtils'; // Import FLAVOR_COLORS
import { getDominantFlavorName } from '../alpine/visualizationComponent';

// --- Type Definitions ---
export interface P5SketchInstance extends p5 {
    setPlaying?: (isPlaying: boolean) => void;
    setSimSpeed?: (speed: number) => void;
    // Add the methods that are attached to the p5 instance inside the sketch closure
    updateSimParams?: (simParams: OscillationParameters) => void;
    resetSimulation?: () => void;
}

interface Star {
    x: number; y: number; z: number; // z for depth simulation
    px: number; py: number; pz: number; // previous position for motion blur
    brightness: number;
    tintColor?: p5.Color; // Add tint color property
}

// ==================================
// === Main Visualization Sketch ===
// ==================================
export default function createNeutrinoSketch(container: HTMLElement, plotCanvas: HTMLCanvasElement): (p: P5SketchInstance) => void {
    return (p: P5SketchInstance) => {
        let currentSimParams: OscillationParameters | null = null;
        let isPlaying: boolean = false; // Managed directly in sketch
        let currentL: number = 0; // Managed directly in sketch
        let simSpeed: number = 1.0; // Managed directly in sketch
        let lastTimestamp = 0;
        // Removed unused resetTriggered variable

        // Starfield state
        let stars: Star[] = [];
        const numStars = 400; // Moderate star count
        const starfieldDepth = 1000; // Match reference starfield depth range (r from 200 to 1000)
        const animationDurationSeconds = ANIMATION_DURATION_SECONDS; // Use imported constant

        // Neutrino state
        let neutrinoColor: p5.Color;
        const neutrinoSize = 32; // Match reference neutrino size

        // Plot and Physics Cache State
        // let probHistory: ProbabilityVector[] = []; // Replaced by cachedProbabilities
        // const probHistoryLen = 500; // No longer needed
        let currentProbs: ProbabilityVector = [NaN, NaN, NaN]; // Interpolated probabilities for current L
        let maxL: number = MAX_PLOT_L_DEFAULT;
        let flavorColorsP5: p5.Color[];
        let flavorLabelElement: HTMLElement | null = null;

        // Cache for pre-calculated probabilities
        let cachedProbabilities: ProbabilityVector[] | null = null;
        let cachedDistances: number[] | null = null;
        const numberOfCachePoints: number = 200; // Resolution of the cache
        let needsRecalculation: boolean = true; // Flag to trigger recalculation
        let isCalculating: boolean = false; // Flag to indicate calculation in progress

        p.setup = () => {
            const canvasWidth = container.clientWidth || 800;
            const canvasHeight = container.clientHeight || 600;
            p.createCanvas(canvasWidth, canvasHeight, p.WEBGL); // Use WEBGL renderer

            // Explicitly set plot canvas attributes to match CSS dimensions (500x120)
             if (plotCanvas) {
                 plotCanvas.width = 500;
                 plotCanvas.height = 120;
             }

            // Match the reference pixel density for main canvas (plot canvas uses 2D ctx)
            p.pixelDensity(1.5);

            // Set background color to black
            p.background(0);

            // Initialize flavor colors for p5 using the updated FLAVOR_COLORS from colorUtils
            flavorColorsP5 = [
                p.color(FLAVOR_COLORS.electron.r, FLAVOR_COLORS.electron.g, FLAVOR_COLORS.electron.b),
                p.color(FLAVOR_COLORS.muon.r, FLAVOR_COLORS.muon.g, FLAVOR_COLORS.muon.b),
                p.color(FLAVOR_COLORS.tau.r, FLAVOR_COLORS.tau.g, FLAVOR_COLORS.tau.b)
            ];

            neutrinoColor = p.color(flavorColorsP5[0]); // Initial color (Electron)
            initStars();
            flavorLabelElement = document.getElementById('neutrino-flavor-label');

            // Initial state sync - get initial parameters from Alpine after it starts
             if (window.Alpine) {
                 // Need to wait for Alpine to finish initializing if not already.
                 // Assuming DOMContentLoaded listener in main.ts handles Alpine.start() before createNeutrinoSketch.
                 const simParamsStore = Alpine.store('simParams') as OscillationParameters;
                 const animStateStore = Alpine.store('animation') as AnimationState;
                 if (simParamsStore && animStateStore) {
                     // Call the new updateSimParams method with initial state
                     p.updateSimParams?.({ ...simParamsStore });

                     // Set initial animation state
                     isPlaying = animStateStore.isPlaying;
                     simSpeed = animStateStore.simSpeed;
                     currentL = animStateStore.currentL;

                     // Trigger an initial reset to set up the plot and neutrino color correctly at L=0
                      p.resetSimulation?.();
                 }
             }
        };

        // Function to recalculate and cache probabilities across the L range
        function recalculateAndCacheProbabilities() {
            if (!currentSimParams || !window.physicsEngine || isCalculating) {
                return; // Don't calculate if params missing, engine missing, or already calculating
            }
            console.log("Recalculating probabilities...");
            isCalculating = true;
            needsRecalculation = false; // Assume success unless error

            const L_MAX = currentSimParams.maxL || MAX_PLOT_L_DEFAULT;
            const step = L_MAX / (numberOfCachePoints - 1);
            const distances: number[] = [];
            const probabilities: ProbabilityVector[] = [];

            try {
                for (let i = 0; i < numberOfCachePoints; i++) {
                    const lValue = i * step;
                    distances.push(lValue);
                    const paramsForCalc = { ...currentSimParams, L: lValue };
                    const result = window.physicsEngine.getProbabilitiesForInitialFlavor(paramsForCalc);
                    probabilities.push(result);
                }
                cachedDistances = distances;
                cachedProbabilities = probabilities;
                console.log("Probability recalculation complete.");
            } catch (error) {
                console.error("Error during probability recalculation:", error);
                needsRecalculation = true; // Set flag back on error
                cachedDistances = null;
                cachedProbabilities = null;
            }
 finally {
                isCalculating = false;
            }
        }


        p.draw = () => {
            // Check if recalculation is needed
            if (needsRecalculation && !isCalculating) {
                recalculateAndCacheProbabilities();
                // Optionally show a loading state here instead of drawing the scene
                // For now, just skip drawing this frame if calculating starts
                if (isCalculating) {
                     p.background(0); // Clear background
                     // Could draw "Calculating..." text
                     return;
                }
            }

            // Set background to black
            p.background(0);

            const now = p.millis();
            const deltaTime = (now - lastTimestamp) / 1000.0;
            lastTimestamp = now;
            const safeDeltaTime = Math.max(0, Math.min(deltaTime, 0.1)); // Clamp delta time

            // --- Update Animation State ---
            if (isPlaying && currentSimParams) {
                const L_MAX = currentSimParams.maxL || MAX_PLOT_L_DEFAULT;
                const baseSpeed_km_per_sec = L_MAX / animationDurationSeconds;
                const distanceIncrement = simSpeed * baseSpeed_km_per_sec * safeDeltaTime;
                currentL = (currentL + distanceIncrement);
                if (currentL >= L_MAX) {
                    currentL = currentL % L_MAX;
                }
                // Update Alpine store L for UI sync
                if (window.Alpine) {
                    const animStore = Alpine.store('animation') as AnimationState;
                    if (animStore) animStore.currentL = currentL;
                }
            }

            // --- Interpolate Probabilities from Cache ---
            if (cachedProbabilities && cachedDistances && cachedProbabilities.length === cachedDistances.length) {
                const L_MAX = currentSimParams?.maxL || MAX_PLOT_L_DEFAULT;
                const clampedL = Math.max(0, Math.min(currentL, L_MAX)); // Ensure L is within bounds

                // Find the segment in the cache that contains currentL
                let index1 = -1, index2 = -1;
                for (let i = 0; i < cachedDistances.length - 1; i++) {
                    if (clampedL >= cachedDistances[i] && clampedL <= cachedDistances[i + 1]) {
                        index1 = i;
                        index2 = i + 1;
                        break;
                    }
                }

                if (index1 !== -1 && index2 !== -1) {
                    const L1 = cachedDistances[index1];
                    const L2 = cachedDistances[index2];
                    const P1 = cachedProbabilities[index1];
                    const P2 = cachedProbabilities[index2];

                    // Calculate interpolation factor (t)
                    const t = (L2 - L1 > 1e-9) ? (clampedL - L1) / (L2 - L1) : 0; // Avoid division by zero

                    // Interpolate each probability component
                    const interpolatedProbs: ProbabilityVector = [0, 0, 0];
                    for (let j = 0; j < 3; j++) {
                        interpolatedProbs[j] = P1[j] + t * (P2[j] - P1[j]);
                    }
                    // Ensure probabilities sum roughly to 1 and clamp
                    const sum = interpolatedProbs.reduce((a, b) => a + b, 0);
                    if (sum > 1e-9) {
                         currentProbs = interpolatedProbs.map(p => Math.max(0, Math.min(1, p / sum))) as ProbabilityVector;
                    } else {
                         // Handle case where sum is zero (e.g., initial state)
                         currentProbs = interpolatedProbs.map(p => Math.max(0, Math.min(1, p))) as ProbabilityVector;
                    }

                } else if (cachedProbabilities.length > 0) {
                    // Handle edge cases (e.g., L exactly 0 or maxL, or outside range somehow)
                    // Use the first or last cached value
                    currentProbs = clampedL <= cachedDistances[0]
                                     ? cachedProbabilities[0]
                                     : cachedProbabilities[cachedProbabilities.length - 1];
                } else {
                     currentProbs = [NaN, NaN, NaN]; // Cache is empty
                }

            } else {
                 // Cache not ready or invalid
                 currentProbs = [NaN, NaN, NaN];
            }

            // --- Update Global State (for UI display) ---
             if (window.neutrinoVisualizationData) {
                 if (!currentProbs.some(isNaN)) {
                    window.neutrinoVisualizationData.currentProbs = currentProbs;
                    window.neutrinoVisualizationData.dominantFlavor = getDominantFlavorName(currentProbs);
                 } else {
                    window.neutrinoVisualizationData.currentProbs = [NaN, NaN, NaN];
                    window.neutrinoVisualizationData.dominantFlavor = isCalculating ? 'Calculating...' : 'Error';
                 }
             }
            // --- Removed probHistory update ---

            // --- 3D Drawing ---
            p.camera(200, 200, 400, 0, 0, 0, 0, 1, 0);
            drawStarfield(safeDeltaTime);

            // Draw Neutrino using interpolated probs
            if (!currentProbs.some(isNaN)) {
                const blendedRgb = blendNeutrinoColors(currentProbs);
                neutrinoColor = p.color(blendedRgb.r, blendedRgb.g, blendedRgb.b);
                p.push();
                p.noStroke();
                p.ambientLight(60, 60, 60);
                p.pointLight(255, 255, 255, 0, 0, 200);
                p.fill(neutrinoColor);
                p.sphere(neutrinoSize, 32, 32);
                p.pop();
                if (flavorLabelElement) {
                    const domFlavor = window.neutrinoVisualizationData?.dominantFlavor || 'Calculating...';
                    flavorLabelElement.innerHTML = `<span style="color: rgb(${blendedRgb.r},${blendedRgb.g},${blendedRgb.b})">${domFlavor}</span>`;
                }
            } else if (flavorLabelElement) {
                 flavorLabelElement.innerHTML = `<span>${isCalculating ? 'Calculating...' : 'Error'}</span>`;
            }

            // Draw Probability Plot using cache/interpolated probs
            drawProbPlot(); // drawProbPlot needs to be updated to use cache
        };

        p.windowResized = () => {
             // No need to resize the main p5 canvas here, CSS handles it.
             // The plotCanvas dimensions are set in setup.
             // If the container/window size changes, we would need logic
             // to reposition or resize the plotCanvas element via the DOM/CSS,
             // but the current structure positions it absolutely.
             // For now, we'll assume the plotCanvas size is fixed by CSS/setup.

             // However, we *do* need to resize the main WEBGL canvas managed by p5
             // to match the container size when the window is resized.
             const canvasWidth = container.clientWidth || 800;
             const canvasHeight = container.clientHeight || 600;
             p.resizeCanvas(canvasWidth, canvasHeight);

        };

        function initStars() {
            stars = [];
            const refStarfieldDepth = 1000; // Reference max radius
            for (let i = 0; i < numStars; i++) {
                const brightness = 0.7 + Math.random() * 0.3; // Increased brightness range
                // Distribute stars in a sphere-like volume, matching reference random ranges
                const r = p.random(200, refStarfieldDepth);
                const theta = p.random(p.PI); // Angle from z-axis
                const phi = p.random(p.TWO_PI); // Angle in xy-plane
                const x = r * Math.sin(theta) * Math.cos(phi);
                const y = r * Math.sin(theta) * Math.sin(phi);
                const z = r * Math.cos(theta);
                stars.push({ x, y, z, px: x, py: y, pz: z, brightness });
            }

        // Function definition moved before p.draw

        }

        function drawStarfield(_dt: number) { // Prefixed unused dt parameter
            const speed = simSpeed; // Use sketch's internal simSpeed
             // Scale movement by speed and a base factor
             const movementScale = speed * 0.1; // Adjusted scale

            // Movement direction vector
            let dx = 1, dy = 0.5, dz = 1;
            let norm = Math.sqrt(dx*dx + dy*dy + dz*dz);
            dx /= norm; dy /= norm; dz /= norm;

             const v = 8 * movementScale; // Base velocity multiplied by movement scale

            // Get CSS variables for color tinting (if needed, currently using white)
            // const primaryColorCSS = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
            // const secondaryColorCSS = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim();

            // Draw stars directly in 3D space
            for (let i = stars.length - 1; i >= 0; i--) {
                const star = stars[i];

                // Store previous position before updating
                star.px = star.x;
                star.py = star.y;
                star.pz = star.z;

                // Move star based on the direction vector and calculated velocity
                star.x -= dx * v;
                star.y -= dy * v;
                star.z -= dz * v;

                // If star moves past the viewer, reset its position
                 const viewDot = star.x*dx + star.y*dy + star.z*dz;
                 if (viewDot < 0) { // Reset if behind viewer
                     // Reset star to a new position far in front
                    const r = p.random(starfieldDepth * 0.9, starfieldDepth * 1.1); // Reset radius
                     const theta = p.random(p.PI * 0.2, p.PI * 0.8); // Keep reset theta somewhat centered
                     const phi = p.random(p.TWO_PI);
                     star.x = r * Math.sin(theta) * Math.cos(phi);
                     star.y = r * Math.sin(theta) * Math.sin(phi);
                     star.z = r * Math.cos(theta);

                    // Set previous position equal to new position on reset
                    star.px = star.x;
                    star.py = star.y;
                    star.pz = star.z;
                }

                // --- Draw Motion Blur Line ---
                // Calculate line alpha based on speed (faster = more opaque streak)
                const lineAlpha = p.map(speed, 0.1, 3, 30, 90, true); // Alpha range 30-90
                p.stroke(255, 255, 255, lineAlpha); // White lines with variable alpha

                // Calculate line weight based on speed (faster = thicker streak)
                const lineWeight = p.map(speed, 0.1, 3, 1, 2.5, true); // Weight range 1-2.5
                p.strokeWeight(lineWeight);
                p.line(star.px, star.py, star.pz, star.x, star.y, star.z);


                // --- Draw the Star Point ---
                // Calculate point alpha based on depth (closer = more opaque)
                const normalizedDepth = p.map(star.z, -starfieldDepth, starfieldDepth, 0, 1);
                const pointAlpha = p.map(normalizedDepth, 0, 1, 80, 220, true); // Alpha range 80-220
                p.stroke(255, 255, 255, pointAlpha); // White points with variable alpha

                // Calculate point size based on depth (closer = larger)
                const pointSize = p.map(normalizedDepth, 0, 1, 0.5, 2.0, true); // Size range 0.5-2.0
                p.strokeWeight(pointSize);

                p.point(star.x, star.y, star.z);
            }
        }


        function drawProbPlot() {
            const ctx = plotCanvas.getContext('2d');
            if (!ctx) {
                console.error("Could not get 2D context for plot canvas.");
                return;
            }

            // Get actual rendered dimensions and scale canvas for pixel density
            const displayWidth = plotCanvas.clientWidth;
            const displayHeight = plotCanvas.clientHeight;
            const density = p.pixelDensity();

            // Set the canvas's internal drawing buffer size to match its display size multiplied by pixel density
            plotCanvas.width = displayWidth * density;
            plotCanvas.height = displayHeight * density;

            // Scale the context to match the pixel density, so subsequent drawing uses CSS pixels
            ctx.scale(density, density);

            // Clear the plot canvas using the display dimensions
            ctx.clearRect(0, 0, displayWidth, displayHeight);

            // Define plot area within the plot canvas (using display dimensions now)
            // Adjusted margins for a more overlaid, less traditional look
            const plotMargin = { top: 30, right: 30, bottom: 30, left: 30 }; // Increased margins
            const chartWidth = displayWidth - plotMargin.left - plotMargin.right;
            const chartHeight = displayHeight - plotMargin.top - plotMargin.bottom;

            // Axes and labels removed/simplified for aesthetic redesign


            // Draw probability history lines with stylized appearance
            // Draw probability lines from cache
            if (cachedProbabilities && cachedDistances && cachedProbabilities.length > 0) {
                 const flavorColorsRgb = [ // Use RGB values directly from FLAVOR_COLORS
                    [FLAVOR_COLORS.electron.r, FLAVOR_COLORS.electron.g, FLAVOR_COLORS.electron.b],
                    [FLAVOR_COLORS.muon.r, FLAVOR_COLORS.muon.g, FLAVOR_COLORS.muon.b],
                    [FLAVOR_COLORS.tau.r, FLAVOR_COLORS.tau.g, FLAVOR_COLORS.tau.b]
                 ];
                 const L_MAX = maxL; // Use the sketch's current maxL

                 for (let j = 0; j < 3; j++) { // For each flavor probability
                     ctx.beginPath();
                     let firstPoint = true;
                     for (let i = 0; i < cachedProbabilities.length; i++) { // Iterate through cached points
                         const lValue = cachedDistances![i];
                         const probVal = cachedProbabilities[i]?.[j];

                         // Map distance L to x position
                         const x = plotMargin.left + (lValue / L_MAX) * chartWidth;

                         if (typeof probVal === 'number' && !isNaN(probVal)) {
                             // Map probability [0, 1] to y position
                             const y = plotMargin.top + chartHeight - probVal * chartHeight;

                             if (firstPoint) {
                                 ctx.moveTo(x, y);
                                 firstPoint = false;
                             } else {
                                 ctx.lineTo(x, y);
                             }
                          } else {
                             // Handle gaps if necessary (e.g., if cache contains NaNs)
                             if (!firstPoint) { // Only stroke if we have drawn something
                                 ctx.stroke();
                                 ctx.beginPath(); // Start new path after gap
                                 firstPoint = true;
                             }
                          }
                      }
                      // Stroke the completed path for this flavor
                      if (!firstPoint) { // Ensure we don't stroke an empty path
                          const lineAlpha = 220; // Consistent alpha for all lines
                          ctx.strokeStyle = `rgba(${flavorColorsRgb[j][0]},${flavorColorsRgb[j][1]},${flavorColorsRgb[j][2]}, ${lineAlpha / 255})`;
                          ctx.lineWidth = 3; // Consistent line width
                          ctx.stroke();
                      }
                   }
               }

                // Draw Title
               ctx.font = '18px Fira Mono, Consolas, monospace';
               ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim() || '#ECEFF1'; // Get CSS variable or use fallback
               ctx.textAlign = 'center';
               ctx.textBaseline = 'top';
               ctx.fillText('Probability', displayWidth / 2, plotMargin.top / 2);


                // Draw X-axis label (Distance) at bottom right
               ctx.font = '14px Fira Mono, Consolas, monospace';
               ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-color-secondary').trim() || '#B0BEC5'; // Get CSS variable or use fallback
               ctx.textAlign = 'right';
               ctx.textBaseline = 'bottom';
               ctx.fillText('Distance (km)', displayWidth - plotMargin.right, displayHeight - plotMargin.bottom / 2);


               // Draw simplified Legend (Flavor names) at top-left near lines' start points
                // const initialSymbol = flavorSymbolsPlot[initialFlavorIndex]; // Unused variable removed
               const legendXStart = plotMargin.left + 10; // Position legend items near left margin
               const legendYStart = plotMargin.top + 10; // Position legend items inside plot area
                const legendItemSpacing = 20; // Spacing between legend items (vertical)
               // const flavorNamesDisplay = ['Electron', 'Muon', 'Tau']; // Unused variable removed
               const flavorSymbolsShort = ['e', 'μ', 'τ']; // Use simple symbols


                // Increase font size and use bold for legend items if needed
               ctx.font = 'bold 14px Fira Mono, Consolas, monospace'; // Bold font for legend

               for (let j = 0; j < 3; j++) {
                    const legendColorRgb = [FLAVOR_COLORS.electron, FLAVOR_COLORS.muon, FLAVOR_COLORS.tau][j]; // Use RGB values
                    ctx.fillStyle = `rgb(${legendColorRgb.r},${legendColorRgb.g},${legendColorRgb.b})`;
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'top'; // Align text to the top

                    // Calculate y position based on legend item index and spacing
                    const y = legendYStart + j * legendItemSpacing;

                    ctx.fillText(flavorSymbolsShort[j], legendXStart, y); // Draw symbol
                     // Optionally draw a small line segment next to the symbol if needed for visual key

               }


               // Draw current probability markers (Circles at the right edge of the plot area)
               if (!currentProbs.some(isNaN)) {
                     // Calculate the right edge x-position within the canvas
                     const markerX = displayWidth - plotMargin.right;

                    const flavorColorsRgb = [ // Use RGB values directly from FLAVOR_COLORS
                      [FLAVOR_COLORS.electron.r, FLAVOR_COLORS.electron.g, FLAVOR_COLORS.electron.b],
                      [FLAVOR_COLORS.muon.r, FLAVOR_COLORS.muon.g, FLAVOR_COLORS.muon.b],
                      [FLAVOR_COLORS.tau.r, FLAVOR_COLORS.tau.g, FLAVOR_COLORS.tau.b]
                   ];
                   for (let j = 0; j < 3; j++) {
                        const markerY = plotMargin.top + chartHeight - currentProbs[j] * chartHeight; // Map probability to y position
                       const markerSize = 8; // Slightly smaller marker size

                       // Draw outer glow/ring effect for markers (creative touch)
                        const glowRadius = markerSize + 4;
                        const glowColor = flavorColorsRgb[j];
                        ctx.beginPath();
                       ctx.arc(markerX, markerY, glowRadius, 0, 2 * Math.PI);
                       // Use radial gradient for glow
                       const gradient = ctx.createRadialGradient(markerX, markerY, markerSize, markerX, markerY, glowRadius);
                       gradient.addColorStop(0, `rgba(${glowColor[0]},${glowColor[1]},${glowColor[2]}, 0.8)`);
                        gradient.addColorStop(1, `rgba(${glowColor[0]},${glowColor[1]},${glowColor[2]}, 0)`);
                        ctx.fillStyle = gradient;
                       ctx.fill();


                        // Draw the main marker circle
                       ctx.beginPath();
                       ctx.arc(markerX, markerY, markerSize, 0, 2 * Math.PI);
                        // Use RGB values directly for fill style
                       ctx.fillStyle = `rgb(${flavorColorsRgb[j][0]},${flavorColorsRgb[j][1]},${flavorColorsRgb[j][2]})`;
                       ctx.fill();

                         // Optionally add a subtle white center dot or highlight
                        ctx.beginPath();
                        ctx.arc(markerX, markerY, markerSize * 0.4, 0, 2 * Math.PI);
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                       ctx.fill();
                   }
               }

                 // Draw X-axis scale markers and labels (Simplified for aesthetic)
                 // Only draw a few key distance markers
                  const distanceMarkers = [0, maxL / 2, maxL]; // Example: Start, Middle, End distance
                  ctx.font = '12px Fira Mono, Consolas, monospace'; // Smaller font for scale markers
                  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-color-secondary').trim() || '#B0BEC5'; // Get CSS variable or use fallback


                  distanceMarkers.forEach((dist, _index) => { // Prefixed unused index parameter
                      const x = plotMargin.left + (dist / maxL) * chartWidth;
                       // Draw a small vertical line marker
                       ctx.fillRect(x, plotMargin.top + chartHeight, 1, 5);
                       // Draw distance value label below the line
                      ctx.textAlign = 'center';
                      ctx.textBaseline = 'top';
                      ctx.fillText(dist.toFixed(0), x, plotMargin.top + chartHeight + 8); // Display integer distance

                 });

         }


         // --- Custom Methods for Alpine Interaction ---
         // Method to update simulation parameters from Alpine
         p.updateSimParams = (simParams: OscillationParameters) => {
             // Check if relevant physics parameters have actually changed
             const relevantParamsChanged =
                 !currentSimParams || // Always recalc if no previous params
                 currentSimParams.theta12_deg !== simParams.theta12_deg ||
                 currentSimParams.theta13_deg !== simParams.theta13_deg ||
                 currentSimParams.theta23_deg !== simParams.theta23_deg ||
                 currentSimParams.deltaCP_deg !== simParams.deltaCP_deg ||
                 currentSimParams.dm21sq_eV2 !== simParams.dm21sq_eV2 ||
                 currentSimParams.dm31sq_eV2 !== simParams.dm31sq_eV2 ||
                 currentSimParams.energy !== simParams.energy ||
                 currentSimParams.rho !== simParams.rho ||
                 currentSimParams.matterEffect !== simParams.matterEffect ||
                 currentSimParams.initialFlavorIndex !== simParams.initialFlavorIndex ||
                 currentSimParams.maxL !== simParams.maxL;
 
             // Store the new parameters
             currentSimParams = { ...simParams };
             maxL = simParams.maxL || MAX_PLOT_L_DEFAULT; // Update maxL regardless
 
             // Set flag to trigger recalculation only if relevant parameters changed
             if (relevantParamsChanged) {
                 console.log("Relevant simParams changed, flagging for recalculation.");
                 needsRecalculation = true;
                 // Clear cache immediately so draw loop doesn't use stale data while waiting
                 cachedProbabilities = null;
                 cachedDistances = null;
                 currentProbs = [NaN, NaN, NaN]; // Reset interpolated probs
             }
             // Do not calculate initial state here; draw loop handles it after recalculation/interpolation
           };

           // Method to reset the simulation state
           p.resetSimulation = () => {
               currentL = 0; // Reset distance
               // probHistory = []; // Removed reference to probHistory
               isPlaying = false; // Stop animation on reset

               // Clear cache and trigger recalculation for the next frame
               cachedProbabilities = null;
               cachedDistances = null;
               needsRecalculation = true;
               currentProbs = [NaN, NaN, NaN]; // Reset interpolated probs

               if (window.Alpine) {
                   // Sync Alpine state with reset
                   const animStore = Alpine.store('animation') as AnimationState;
                   if (animStore) {
                       animStore.currentL = 0;
                       animStore.isPlaying = false; // Sync Alpine state
                       // Don't reset simSpeed or simParams here, just animation state
                   }
               }
                // Manually trigger a redraw. The draw loop will handle recalculation.
               p.redraw();
           };

           // Other custom methods like setPlaying, setSimSpeed could be here too,
           // but Alpine watchers are calling them directly in main.ts currently.

       }; // Closing brace for the main sketch function (return (p: P5SketchInstance) => { ... });
   }; // Closing brace for the createNeutrinoSketch outer function.
