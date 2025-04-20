# Implementation Details: Imagining the Neutrino

## 1. Physics Engine

* **NuFast Algorithm:**
  - TypeScript port of NuFast paper calculations
  - Optimized for performance with caching
  - Handles both vacuum and matter oscillations

* **Numerical Precision:**
  - Uses standard TypeScript number type
  - Includes checks for edge cases
  - Clamps probabilities to valid range [0,1]

## 2. Visualization (p5.js)

* **Main Sketch:**
  - Single p5 instance handles all rendering
  - Uses WEBGL mode for 3D effects
  - Efficient animation loop with delta timing

* **Components:**
  - **Neutrino:** Sphere with dynamic color blending
  - **Probability Plot:** 2D canvas for oscillation curves
  - **Starfield:** Background with motion effects

* **Performance:**
  - Physics calculations decoupled from rendering
  - Caching of probability results
  - Optimized drawing operations

## 3. State Management

* **Alpine.js Stores:**
  - Centralized reactive state
  - Handles all physics parameters
  - Manages animation state

* **UI Binding:**
  - Direct HTML bindings to stores
  - Debounced input handling
  - Responsive layout

## 4. Build Process

* **Vite:**
  - Fast development server
  - Optimized production builds
  - GitHub Pages deployment

* **TypeScript:**
  - Strict type checking
  - Modern module system
  - Comprehensive type definitions

## Key Design Decisions

1. **p5.js for Visualization:**
   - Unified rendering approach
   - Good performance characteristics
   - Simplified codebase

2. **Modular Architecture:**
   - Clear separation of concerns
   - Reusable components
   - Better maintainability

3. **Type Safety:**
   - Comprehensive type definitions
   - Reduced runtime errors
   - Better developer experience
