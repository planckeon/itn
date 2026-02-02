# Architecture Document: Imagining the Neutrino

## Overview

Interactive visualization of neutrino oscillations using modern web technologies:

- **React** for component-based UI
- **Anime.js** for smooth animations
- **Tailwind CSS** for responsive styling  
- **TypeScript** for type safety
- **Vite** for development/build

## System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   UI Components │◄───►│  Simulation     │◄───►│  Physics        │
│  (React)        │     │  Context        │     │  Engine         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
       ▲                       ▲                       ▲
       │                       │                       │
       ▼                       ▼                       │
┌─────────────────┐     ┌─────────────────┐            │
│   Visualization │     │   Controls      │            │
│  (Anime.js)     │     │  Panel          │◄───────────┘
└─────────────────┘     └─────────────────┘
```

### Core Modules

1. **Physics Layer (`src/physics/`):**
   - NuFast algorithm implementation
   - Physical constants and default parameters
   - Type definitions for oscillation parameters

2. **Components (`src/components/`):**
   - **VisualizationArea:** Main animation container
   - **NeutrinoSphere:** 3D neutrino visualization
   - **ProbabilityPlot:** 2D oscillation probability plot
   - **Starfield:** Animated background
   - **ControlsPanel:** Interactive parameter controls

3. **State Management (`src/context/`):**
   - SimulationContext for shared state
   - Physics parameters and animation state
   - Custom hooks for state access

4. **Styling:**
   - Tailwind CSS utility classes
   - Responsive design system
   - Animation timing controls

5. **Utilities (`src/utils/`):**
   - Color utilities for flavor blending
   - Math helpers for calculations
   - Performance optimizations

## Data Flow

1. **User Input → State Update:**
   - Controls update SimulationContext
   - Context triggers component updates

2. **State → Visualization:**
   - Components subscribe to context changes
   - Anime.js animations update based on state
   - Physics calculations drive visual changes

3. **Performance Optimizations:**
   - Memoized components
   - Debounced input handling
   - Efficient animation rendering

## Key Design Principles

1. **Component-Based Architecture:**
   - Reusable, self-contained components
   - Clear separation of concerns
   - Type-safe props and state

2. **Performance:**
   - Optimized physics calculations
   - Efficient animation rendering
   - Minimal re-renders

3. **Maintainability:**
   - TypeScript for type safety
   - Consistent code style
   - Comprehensive tests

Last Updated: 2026-02-02
