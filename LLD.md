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

### 1.2 Components (`src/components/`)
* **Main Components:**
  - `VisualizationArea.tsx`: Main animation container
  - `NeutrinoSphere.tsx`: 3D neutrino visualization with Anime.js
  - `ProbabilityPlot.tsx`: 2D canvas for oscillation curves
  - `Starfield.tsx`: Animated background
  - `ControlsPanel.tsx`: Interactive parameter controls

* **Props:**
  - Type-safe props for all components
  - Default values for optional props
  - Context integration via hooks

### 1.3 State Management (`src/context/`)
* **SimulationContext:**
  - Centralized state for physics parameters
  - Animation controls and timing
  - Custom hooks for state access
  - Memoized selectors for performance

* **Data Flow:**
  - Unidirectional data flow
  - Optimized re-renders
  - Debounced updates for performance

## 2. Key Algorithms

* **NuFast Calculation:**
  - Accurate probability computation
  - Optimized for performance
  - Handles edge cases

* **Color Blending:**
  - RGB interpolation based on probabilities
  - Smooth transitions between flavors

* **Animation Loop:**
  - RequestAnimationFrame-based
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

* **React:**
  - Memoized components
  - Optimized context usage
  - Efficient re-renders

* **Rendering:**
  - Efficient Anime.js animations
  - Canvas-based plotting
  - Debounced input handling

## 5. Error Handling

* **Physics:**
  - Input validation
  - Probability clamping
  - NaN checks

* **Rendering:**
  - Error boundaries
  - Graceful fallbacks
  - Loading states

Last Updated: 2025-04-23
