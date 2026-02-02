# Architecture Document: Imagining the Neutrino

## Overview

Interactive visualization of neutrino oscillations using modern web technologies:

- **React 19** for component-based UI
- **Canvas 2D** for high-performance rendering
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
│  (Canvas 2D)    │     │  (TopControlBar)│◄───────────┘
└─────────────────┘     └─────────────────┘
```

### Core Modules

1. **Physics Layer (`src/physics/`):**
   - NuFast algorithm implementation
   - Physical constants and default parameters
   - Type definitions for oscillation parameters

2. **Components (`src/components/`):**
   - **Starfield:** 3D starfield with camera rotation
   - **NeutrinoSphere:** Color-blending sphere visualization
   - **ProbabilityPlot:** Canvas-based oscillation plot
   - **TopControlBar:** Parameter controls (responsive)
   - **VisualizationArea:** Main container

3. **State Management (`src/context/`):**
   - SimulationContext for shared state
   - Physics parameters and animation state
   - Custom hooks for state access

4. **Utilities (`src/utils/`):**
   - Color utilities for flavor blending
   - Math helpers for calculations
   - Debounce for input handling

## Data Flow

1. **User Input → State Update:**
   - Controls update SimulationContext
   - Context triggers component updates

2. **State → Visualization:**
   - Components subscribe to context changes
   - Canvas animations render at 60fps
   - Physics calculations drive visual changes

3. **Performance:**
   - requestAnimationFrame for smooth rendering
   - DPI-aware canvas scaling
   - Memoized calculations

## Key Design Principles

1. **Component-Based Architecture:**
   - Reusable, self-contained components
   - Clear separation of concerns
   - Type-safe props and state

2. **Performance:**
   - Canvas 2D for efficient rendering
   - Minimal dependencies (~67KB gzipped)
   - Frame-rate independent physics

3. **Mobile-First:**
   - Touch support for camera rotation
   - Responsive control bar
   - Full viewport utilization

Last Updated: 2026-02-02
