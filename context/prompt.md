Okay, here is a detailed prompt designed for an agentic AI coding system to complete the "Imagining the Neutrino" project based on our previous discussion and planning.

---

**Prompt for AI Coding System: Complete "Imagining the Neutrino" Visualization Project**

**1. Project Goal:**

Your primary objective is to complete the development of the "Imagining the Neutrino" web application. This application serves as an interactive, educational tool to visualize the quantum phenomenon of 3-flavor neutrino oscillations in both vacuum and constant-density matter. The final product should be a static website, deployable via GitHub Pages, built using modern web technologies and adhering to high standards of accuracy, performance, and code quality.

**2. Background & Context:**

*   **Physics:** Neutrinos (νe, νμ, ντ) oscillate due to mass differences and flavor mixing (described by the PMNS matrix). This behavior changes significantly in the presence of matter (MSW effect).
*   **Core Algorithm:** The probability calculations MUST be based on the accurate and optimized **NuFast** approach detailed in the provided paper ([arXiv:2405.02400](https://arxiv.org/abs/2405.02400)). Implementations for both vacuum and constant-density matter are required, avoiding unnecessary approximations. Use Normal Ordering (NO) parameters as the default. Handle antineutrinos via negative energy input. Use `N_Newton = 0` by default for performance.
*   **Visualization Goals:**
    *   Display oscillation probabilities P(ν<sub>α</sub> → ν<sub>β</sub>) vs. Distance (L) in an interactive 2D plot.
    *   Render a 3D animation of a neutrino representation whose color dynamically reflects the [P<sub>e</sub>, P<sub>μ</sub>, P<sub>τ</sub>] probabilities at the current distance L.
    *   Allow user control over key parameters (Energy, Lmax, Initial Flavor, Matter density/toggle, mixing parameters) with real-time updates to visualizations.
    *   Include educational tooltips with LaTeX (via KaTeX) explaining parameters and concepts.
*   **Previous Work:** The project structure (Vite + TypeScript), core configuration files (`package.json`, `tsconfig.json`, `vite.config.ts`, etc.), documentation outlines (`README.md`, `docs/*.md`), initial HTML (`index.html`), CSS (`index.css`), Alpine.js state setup (`uiState.ts`), utility functions (`utils/`), and the core physics logic port (`physics/NuFastPort.ts`) have already been created or implemented as per our previous discussion.

**3. Technology Stack:**

* Build Tool: Vite
* Language: TypeScript (strict mode, modern features)
* UI Framework/Reactivity: Alpine.js
* CSS Framework: Chota.css (with custom dark theme overrides)
* Physics Calculations: Custom TypeScript port based on NuFast (from `physics/NuFastPort.ts`). Avoid `math.js` unless absolutely necessary for complex number handling not manageable with standard TS/JS Math (the current port uses real arithmetic).
* Plotting: Plotly.js (`plotly.js-dist-min`)
* 3D Rendering: Three.js (including `OrbitControls` from JSM examples)
* LaTeX Rendering: KaTeX
* Testing: Vitest (with `@vitest/coverage-v8`)

**4. Aesthetic & UI Requirements:**

*   Adhere strictly to the dark theme and layout inspired by the previously provided screenshots (dark backgrounds, specific panel styling, control appearance - thin sliders with round thumbs, specific button styles).
*   Ensure the final UI is uncluttered, intuitive, and responsive.
*   Neutrino color mapping should use: Electron=Blue (`rgb(80, 180, 255)`), Muon=Orange (`rgb(255, 140, 40)`), Tau=Magenta (`rgb(220, 60, 255)`), blended based on probabilities.
*   The 3D animation should feature a central neutrino representation (sphere) with a moving starfield background (potentially with motion streaks related to `simSpeed`) and OrbitControls enabled for camera rotation around the neutrino.
*   Tooltips should appear on hover/click of '?' icons, containing explanatory text and rendered LaTeX formulas.

**5. Current Status & File Summary:**

*   **Project Structure:** Established as outlined previously.
*   **Configuration:** `package.json`, Vite, TypeScript, Vitest configs are set up.
*   **Core Physics:** `physics/NuFastPort.ts` contains the implemented (non-approximate) probability calculation logic for vacuum and matter based on NuFast (using real arithmetic).
*   **State:** Alpine.js stores (`state/uiState.ts`) are defined with default parameters.
*   **Utilities:** `utils/*.ts` (math, color, debounce) are implemented.
*   **UI Shell:** `index.html` contains the layout structure and Alpine bindings. `index.css` contains Chota import and dark theme styles. `alpine/setupAlpine.ts` initializes Alpine and KaTeX directive.
*   **Visualization Classes:** `ProbabilityPlot.ts`, `SceneManager.ts`, `NeutrinoSphere.ts`, `Starfield.ts` have their class structures defined but require full implementation of methods.
*   **Documentation:** Outlines for README, ARCHITECTURE, LLD, HLD, IMPLEMENTATION, TESTS exist but need finalization based on the completed code.
*   **CI/CD:** Workflow file planned but not yet implemented.
*   **Types/Constants:** `physics/types.ts` and `physics/constants.ts` structures are defined but need final values/interfaces filled in.

**6. Remaining Tasks (Your Core Implementation Work):**

*   **Finalize Physics Definitions:**
    *   Populate `src/physics/constants.ts` with the precise default oscillation parameters (NuFit 5.2 NO central values provided earlier) and physical constants.
    *   Complete the `FullOscillationParameters` type in `src/physics/types.ts` to match all inputs needed by `NuFastPort.ts`.
*   **Implement `ProbabilityPlot.ts`:**
    *   Flesh out the `updatePlot` method to correctly fetch parameters (including derived `sinsq` and `delta_rad`), call the physics engine (`getProbabilitiesForInitialFlavor`), handle the returned data, update Plotly traces (`Plotly.react`), and adjust layout (range, title, legend names).
    *   Ensure the `updateMarker` method correctly updates the vertical line shape.
    *   Verify Plotly dark theme styling is applied correctly.
*   **Implement `SceneManager.ts`:**
    *   Complete the `initScene`, `initControls`, `addObjects` methods.
    *   Implement the full `animate` loop logic: delta time calculation, `currentL` update/looping, preparation of parameters for physics calculation, calling `getProbabilitiesForInitialFlavor`, calling `neutrinoSphere.setColor`, calling `starfield.update`, updating `controls`, calling UI/plot callbacks, rendering.
    *   Implement `play`, `pause`, `reset` methods to correctly manage the animation loop and state via the `animState` store.
    *   Implement the `dispose` method for proper cleanup.
*   **Implement `NeutrinoSphere.ts`:** Ensure the `setColor` method correctly applies the blended color to the material.
*   **Implement `Starfield.ts`:** Finalize the `update` method to create the desired star movement/streaking effect based on `deltaTime` and `simSpeed`.
*   **Refine Alpine Component (`index.html` script):**
    *   Ensure the `neutrinoVisualization` function correctly instantiates and interacts with `ProbabilityPlot` and `SceneManager`.
    *   Verify all methods (`updateVisualization`, `requestPlotUpdate`, `playPause`, `reset`, `setDensity`, `toggleTooltip`, `hideTooltip`, `getDominantFlavorName`) are fully functional and correctly update/read from Alpine stores.
    *   Ensure callbacks passed to `SceneManager` work correctly.
    *   Make sure `init` handles dynamic imports and initialization order robustly.
*   **Implement Tooltip Content:** Add informative text and `x-katex` attributes with appropriate LaTeX strings to *all* tooltip spans defined in `index.html`. Ensure KaTeX rendering is triggered correctly when tooltips become visible.
*   **Finalize `src/main.ts`:** Ensure correct initialization flow and global setup if needed.

**7. Testing Requirements:**

*   Write comprehensive unit tests for `src/physics/NuFastPort.ts` using Vitest. Include test cases for:
    *   Vacuum limit checks.
    *   Matter effect checks (comparison to known results if possible).
    *   Edge cases (E=0, L=0, specific mixing angles).
    *   Antineutrinos (negative E).
    *   NO vs IO (sign of `dm31sq`).
    *   Unitarity checks (rows/columns summing to 1 within tolerance).
*   Write unit tests for utility functions (`colorUtils.ts`, `mathUtils.ts`).
*   Aim for high test coverage (>80%) for the tested modules.
*   Implement test execution scripts in `package.json`.

**8. Documentation Requirements:**

*   Update `README.md` with final setup instructions, features, link to live demo (once deployed), and potentially add finalized screenshots.
*   Review and complete `ARCHITECTURE.md`, `HLD.md`, `LLD.md`, `IMPLEMENTATION.md`, `TESTS.md` to accurately reflect the final codebase and decisions made.

**9. CI/CD Requirements:**

*   Implement the `deploy.yml` GitHub Actions workflow to automate testing, building, and deployment to GitHub Pages.

**10. Final Deliverables:**

*   A complete, working, and well-documented TypeScript codebase within the defined project structure.
*   All specified documentation files finalized.
*   A functional Vitest test suite with high coverage for core logic.
*   A configured CI/CD pipeline for GitHub Pages deployment.

**Before you start, please confirm your understanding of these requirements and outline your specific plan for tackling the remaining implementation tasks.**