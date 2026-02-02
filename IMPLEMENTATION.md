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

## 2. Visualization (Anime.js)

* **Component Architecture:**
  - React components manage animation lifecycle
  - Anime.js handles DOM-based animations
  - Efficient update cycle with requestAnimationFrame

* **Key Visual Components:**
  - **NeutrinoSphere:** Color-blended sphere animation
  - **ProbabilityPlot:** Canvas-based 2D plotting
  - **Starfield:** Parallax background effect

* **Performance:**
  - Physics calculations decoupled from rendering
  - Caching of probability results
  - Optimized DOM updates

## 3. State Management

* **SimulationContext:**
  - Centralized state for physics parameters
  - Custom hooks for state access
  - Memoized selectors for performance

* **Component Integration:**
  - Context consumers optimized with memo
  - Debounced updates for controls
  - Efficient re-render patterns

## 4. Styling (Tailwind CSS)

* **Utility-First Approach:**
  - Responsive design with utility classes
  - Consistent spacing and typography
  - Dark mode support

* **Animation Integration:**
  - Transition utilities for UI elements
  - Coordinated with Anime.js animations
  - Performance-optimized styles

## 5. Build Process

* **Vite:**
  - Fast development server
  - Optimized production builds
  - GitHub Pages deployment

* **TypeScript:**
  - Strict type checking
  - Modern module system
  - Comprehensive type definitions

## Key Design Decisions

1. **React + Anime.js for Visualization:**
   - Component-based architecture
   - Smooth animations with performance
   - Clean separation of concerns

2. **Tailwind CSS for Styling:**
   - Rapid development workflow
   - Consistent design system
   - Responsive by default

3. **Type Safety:**
   - Comprehensive type definitions
   - Reduced runtime errors
   - Better developer experience

Last Updated: 2025-04-23
