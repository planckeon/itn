# AI Coding Agent Prompt: Migrate Neutrino Oscillation Visualization from p5.js to React + anime.js

## Objective

Migrate the interactive neutrino oscillation visualization from its current p5.js-based implementation to a modern React application using anime.js for all animation. The new implementation must faithfully reproduce all features, UI, and interactivity of the original, while leveraging best practices for React and anime.js integration.

---

## Requirements

### 1. UI Controls

- **Initial Flavor Selector:** Dropdown to choose neutrino type (Electron, Muon, Tau).
- **Energy Slider:** Range input (0.1–10 GeV) with live value display.
- **Speed Slider:** Controls animation speed (0.1–3x), with live value display.
- **Matter Effect Toggle:** Checkbox to enable/disable matter effects.
- **Density Slider:** Shown only if matter effect is enabled; controls density (0–10 g/cm³) with live value display.
- **All controls must update the simulation in real time.**
- **Controls are grouped in a floating, styled panel.**

### 2. Animation & Plotting Features

- **3D Starfield Animation:** Simulate a moving starfield background, giving a sense of motion through space.
- **Animated Neutrino Sphere:** Central colored sphere whose color blends according to the current flavor probabilities.
- **Flavor Label:** Text above the sphere shows the dominant flavor in real time.
- **Probability Plot:** Fixed-position canvas or SVG below the main view, plotting the time evolution of flavor probabilities (lines for e, μ, τ, color-coded).
- **Current Probabilities:** Circles at the plot's right edge indicate current probabilities for each flavor.
- **All animations and plots must update smoothly and in real time.**

### 3. Layout & Visual Style

- **Color Scheme:** Dark background (#000), white text, accent colors for flavors (blue for electron, orange for muon, magenta for tau).
- **Panels:** Controls and plot are in semi-transparent, rounded, shadowed boxes.
- **Fonts:** Monospaced (Fira Mono, Consolas).
- **Responsive:** Canvas/SVG resizes to window; controls and plot are absolutely positioned.
- **Visual fidelity and style must closely match the original design.**

### 4. Dynamic Behaviors

- **Animation speed and simulation parameters update instantly with UI changes.**
- **Starfield and neutrino sphere animate continuously.**
- **Probability plot updates in real time, showing a trailing history.**

### 5. Technical/Architectural Constraints

- **Use React functional components throughout.**
- **Use anime.js for all animation.**
- **Encapsulate all imperative anime.js logic using React refs and hooks (e.g., useRef, useEffect).**
- **Manage state using React state/hooks; synchronize UI controls and animation state bidirectionally.**
- **Use SVG and/or Canvas for rendering the starfield, sphere, and probability plot as appropriate.**
- **Follow best practices for integrating anime.js with React:**
  - Orchestrate complex animations using anime.js timelines.
  - Target DOM/SVG elements via refs.
  - Ensure React state changes trigger appropriate animation updates.
  - Avoid direct DOM manipulation outside of refs/hooks.
- **Componentize animation logic for reusability and maintainability.**
- **Ensure smooth, performant animation and interactivity.**

### 6. References & Inspiration

- **Original p5.js-based design:** See the provided requirements and design summary. The file is located at `context/neutrino-oscillation.html`.
- **Anime.js + React examples:** Reference the patterns in `context/react-anime-examples/compiled.txt` for:
  - Timeline orchestration
  - SVG path following
  - Bidirectional state synchronization
  - Componentized animation patterns
  - Encapsulation of imperative animation in React

---

## Deliverables

- A complete, idiomatic React implementation of the visualization, using anime.js for all animation.
- All features, UI, and interactivity as described above.
- Responsive, visually faithful, and performant.
- Well-structured, maintainable code using modern React and anime.js best practices.

---

**Save this prompt as ANIME_PROMPT.md.**