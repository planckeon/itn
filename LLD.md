# Low-Level Design: Imagining the Neutrino

## 1. Core Modules

### 1.1 Physics Layer (`src/physics/`)
* **`constants.ts`:** 
  - Physical constants and default parameters
  - Flavor colors and names

* **`types.ts`:** 
  - `OscillationParameters` interface
  - `ProbabilityMatrix` and `ProbabilityVector` types
  - Animation state types

* **`NuFastPort.ts`:** 
  - Implements NuFast algorithm
  - Handles both vacuum and matter oscillations
  - Includes numerical stability checks

### 1.2 Visualization (`src/visualization/`)
* **Main Sketch (`p5Sketch.ts`):**
  - Manages WEBGL canvas
  - Coordinates all visual components
  - Handles animation loop

* **Components:**
  - `Neutrino.ts`: Dynamic sphere with color blending
  - `ProbabilityPlot.ts`: 2D canvas plotting
  - `Starfield.ts`: Background animation

### 1.3 State Management (`src/alpine/`)
* **Stores:**
  - `simParams`: Physics parameters
  - `animState`: Animation controls
  - `uiState`: Interface settings

* **Directives:**
  - Custom `x-katex` for LaTeX rendering
  - Reactive bindings for all controls

## 2. Key Algorithms

* **NuFast Calculation:**
  - Accurate probability computation
  - Optimized for performance
  - Handles edge cases

* **Color Blending:**
  - RGB interpolation based on probabilities
  - Smooth transitions between flavors

* **Animation Loop:**
  - Time-based updates
  - Efficient rendering pipeline
  - Frame-rate independent movement

## 3. Data Structures

* **`OscillationParameters`:**
  - All physics inputs in one interface
  - Type-safe parameter handling

* **Probability Types:**
  - `ProbabilityVector`: [P_e, P_μ, P_τ]
  - `ProbabilityMatrix`: 3x3 transition matrix

## 4. Performance Optimizations

* **Caching:**
  - Pre-calculated probability curves
  - Memoized expensive operations

* **Rendering:**
  - Efficient p5.js drawing
  - Minimal DOM updates
  - Debounced input handling

## 5. Error Handling

* **Physics:**
  - Input validation
  - Probability clamping
  - NaN checks

* **Rendering:**
  - Canvas safety checks
  - Graceful fallbacks
  - Error boundaries
