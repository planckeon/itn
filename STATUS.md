# Project Status: Imagining the Neutrino Visualization Task

This document summarizes the work performed and the current status of the task to refactor the Imagining the Neutrino visualization project to match the appearance and behavior of the reference HTML files (`context/neutrino-oscillation.html` and `context/backup.html`), while retaining the NuFast physics engine.

## Initial Assessment

The task began with an analysis of the existing Vite/TypeScript project structure, identifying key modules for physics, visualization (initially using Three.js and Plotly.js), and UI (using Alpine.js).

## User Feedback and Refactoring Decision

User feedback indicated that the initial visualization did not match the desired appearance and performance of the reference HTML files. Specifically, issues were noted with:
- Animation performance and lag.
- Non-functional motion blur.
- Neutrino color not changing dynamically.
- Incorrect color scheme for neutrino flavors.
- Probability plot not updating during animation.

Based on user instruction, a decision was made to refactor the visualization layer to use p5.js exclusively, mirroring the approach in the reference HTML files.

## Work Performed and Debugging Steps

The following modifications were made to the codebase based on ongoing user feedback:

1.  **Color Scheme Update (`src/utils/colorUtils.ts`):** The `FLAVOR_COLORS` were updated to the user's requested scheme (blue, green, red).
2.  **p5.js Sketch Refactoring (`src/visualization/p5Sketch.ts`):**
    *   Consolidated previous p5.js sketches into a single `createNeutrinoSketch` function using the `p.WEBGL` renderer.
    *   Updated neutrino drawing logic to use `p.sphere` with lighting and dynamic color blending based on probabilities.
    *   Implemented basic starfield initialization (`initStars`) and drawing logic (`drawStarfield`) with movement and reset based on the reference.
    *   Updated `drawProbPlot` to draw onto a dedicated 2D canvas (`probPlotCanvas`) using its context, including axes, history lines, and current probability markers.
    *   Added logging in `draw` and `updateState` to debug probability calculation and plot history.
    *   Explicitly set `plotCanvas.width` and `plotCanvas.height` attributes in `p.setup` to 500x120 pixels to ensure correct drawing buffer size for the 2D plot context.
    *   Adjusted the x-axis mapping logic in `drawProbPlot` to correctly scale based on `historyLength` instead of `probHistoryLen` to fix plot distortion.
    *   Made multiple adjustments to the positioning and alignment of the "Probability" (Y-axis) and "Distance (km)" (X-axis) labels and the legend within `drawProbPlot` to better match the visual layout of the reference plots.
    *   Increased the font size for legend items in `drawProbPlot` (to 16px) to try and improve their clarity.
    *   Increased the `brightness` range in `initStars` (0.7 to 1.0) and increased alpha values for star points (to 255) and motion blur lines (to 120) in `drawStarfield`.
    *   Increased the `baseMoveSpeed` in `drawStarfield` (to 30) to adjust the length of motion blur streaks.
    *   Adjusted `numStars` to 400 and re-introduced motion blur lines with styling based on speed and depth, adjusting point rendering to complement the streaks.
    *   Initiated a major refactor to decouple the expensive NuFast physics calculation from the `p.draw` loop. Added state variables (`cachedProbabilities`, `cachedDistances`, `needsRecalculation`, `isCalculating`, `numberOfCachePoints`) to store a pre-calculated probability curve.
    *   Implemented the `recalculateAndCacheProbabilities` function to perform the full NuFast calculation across the distance range when parameters change.
    *   Modified `p.updateSimParams` to set `needsRecalculation = true` and clear the cache when relevant physics parameters change, removing the direct calculation of initial probabilities.
    *   Modified `p.draw` to check `needsRecalculation`, call `recalculateAndCacheProbabilities`, remove the per-frame physics calculation, and implement interpolation logic using the cached data to determine `currentProbs`. Removed the logic that populated `probHistory`.
    *   Attempted to move the `recalculateAndCacheProbabilities` function definition before `p.draw` to resolve a "Cannot find name" error, but this was only partially successful, leaving the function at its original location and the error unresolved.
3.  **Main Entry Point Updates (`src/main.ts`):**
    *   Updated imports and initialization logic to manage a single p5 instance.
    *   Adjusted Alpine.js effect watchers to call specific p5 sketch instance methods (`updateSimParams`, `setPlaying`, `setSimSpeed`, `resetSimulation`).
    *   Removed an incorrect call to `resetSimulation()` from the `simParams` watcher to prevent unintended plot history resets.
    *   Corrected a TypeScript error by ensuring the `P5SketchInstance` interface included all custom methods attached to the p5 instance.
    *   Removed unused imports (`p5Type`, `createNeutrinoSketch`, `getDominantFlavorName`).
4.  **Layout and Styling Updates (`index.html`, `src/style.css`):**
    *   Restructured `index.html` to use absolute positioning for the main `p5-container`, `#controls` panel, and `#probPlotCanvas`. Removed previous grid layout elements.
    *   Updated `src/style.css` with styles for absolute positioning, dark background, and initial styling for panel backgrounds, borders, and shadows based on references.
    *   Added styles to `#controls` for `max-height: calc(100vh - 40px);` and `overflow-y: auto;` to allow the panel content to scroll vertically if it exceeds the viewport height.
    *   Modified the `.neutrino-flavor-label-style` rule in `src/style.css` to position it at the top-right (`top: 20px; right: 20px; left: auto; transform: none;`) and applied styling similar to the control panels.
    *   Removed the inline padding style from the div inside `#controls` in `index.html`.
    *   Moved the Mixing Parameters controls from a dropdown within the top-left panel to a new, separate overlay panel positioned at the bottom-right (`#mixing-params-panel`), updating `index.html` and `src/style.css` accordingly.
5.  **Build Error Resolution:**
    *   Fixed TypeScript errors related to the missing `maxL` property in `src/alpine/setupAlpine.ts` and `src/alpine/visualizationComponent.ts`.
    *   Removed obsolete code related to a `plotInstance` in `src/alpine/visualizationComponent.ts`.
    *   Addressed unused variable warnings (TS6133) by removing unnecessary declarations/imports or prefixing unused parameters (`_dt`, `_index`). A mistake was made in removing `initialFlavorIndex` from `p5Sketch.ts`, which was later corrected by re-inserting its declaration and then removing the redundant assignment within `p.updateSimParams`.

## Current Status

Significant progress has been made in refactoring the project to use p5.js for visualization, implementing core functionality, and beginning a major refactor to improve performance by decoupling physics calculations. The UI layout has been updated to use overlays, and control elements have been restyled.

However, the task is not yet complete, and the following key issues and requirements remain:

-   **Performance Bottleneck:** Despite decoupling physics calculations from the draw loop and optimizing starfield drawing, the performance is still reported as slow compared to the inspiration files. Further investigation into the performance of the NuFast port itself or more advanced rendering techniques may be necessary.
-   **Function Placement Error:** The `recalculateAndCacheProbabilities` function definition was not successfully moved before `p.draw`, resulting in a "Cannot find name" error during the build.
-   **Remaining `probHistory` Errors:** References to the removed `probHistory` variable still exist in `drawProbPlot` and `p.resetSimulation`, causing build errors.
-   **Plot Labels Still Distorted:** The small flavor labels in the plot legend and potentially the "Probability" label text rendering still appear distorted despite multiple attempts to fix positioning and font size.
-   **Layout Requires Redesign (No Scrolling):** The current layout with a scrolling controls panel is not the desired end state. A comprehensive redesign of the interface layout is required to arrange all control elements and visualization components to fit within the window without requiring scrolling.
-   **Overall Aesthetic Refinement:** The user desires a more polished and "better looking, more complete" design, implying further refinement of spacing, alignment, and visual details.

## Next Steps (for AI Coding Agent)

Continue the development of the Imagining the Neutrino visualization project by addressing the remaining issues and implementing the required design changes.

Specifically, the next steps are:

1.  **Fix Function Placement:** Successfully move the `recalculateAndCacheProbabilities` function definition in `src/visualization/p5Sketch.ts` to before the `p.draw` function definition to resolve the "Cannot find name" build error.
2.  **Fix Remaining `probHistory` Errors:** Modify the `drawProbPlot` and `p.resetSimulation` functions in `src/visualization/p5Sketch.ts` to remove references to the old `probHistory` variable. `drawProbPlot` should draw the plot lines using the `cachedProbabilities` and `cachedDistances` arrays, and `p.resetSimulation` should clear the cache and set `needsRecalculation = true`.
3.  **Investigate Performance:** Further analyze the performance bottleneck. If decoupling physics and basic starfield optimization did not yield sufficient improvement, investigate the performance characteristics of the NuFast port itself when called repeatedly for the cache calculation. Consider profiling the sketch to identify other potential rendering bottlenecks. Explore using p5.js's `p.points` or `p.beginShape`/`p.endShape` with vertex arrays for more optimized starfield rendering if the current approach is still too slow.
4.  **Implement Redesigned Layout:** Modify the HTML structure and CSS styles for the control panels (`#top-overlay`, `#mixing-params-panel`) and potentially other elements to achieve a compact layout that fits within the viewport without scrolling, arranging controls logically (e.g., a horizontal top bar and bottom panels).
5.  **Fix Plot Label Distortion:** Further investigate and attempt to resolve the distortion of the plot labels in `drawProbPlot`. Experiment with text rendering properties and positioning. If necessary, consider alternative approaches for rendering text on the 2D plot canvas within a WEBGL sketch.
6.  **Refine Starfield and Animation:** Make further adjustments to star brightness, motion blur parameters, and potentially star count based on visual assessment and performance testing.
7.  **Overall Aesthetic Polish:** Continue refining the CSS styling for all UI elements to improve spacing, alignment, and visual consistency, aiming for a polished and complete design based on the aesthetic cues from the reference screenshots.
8.  **Verify and Iterate:** Regularly build (`npm run build`) and serve the production output (`npm run preview`) to visually verify the changes and iterate on the implementation based on the observed results in the browser. Provide updated builds and seek user feedback as needed to confirm progress and alignment with expectations.

This task requires careful coordination of changes across HTML, CSS, and TypeScript (p5.js sketch). The agent should be mindful of interactions between CSS layout/positioning and p5.js canvas rendering. The primary focus should be on resolving the build errors and significantly improving performance while continuing the visual redesign.