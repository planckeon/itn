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
   - Physical constants (NuFit 5.2 best-fit)
   - Normal/Inverted mass ordering support
   - Type definitions for oscillation parameters

2. **Components (`src/components/`):**
   - **Starfield:** 3D starfield with camera rotation
   - **NeutrinoSphere:** Color-blending sphere with MSW resonance glow
   - **ProbabilityPlot:** P vs L plot with oscillation length markers
   - **TernaryPlot:** VISOS-style flavor triangle
   - **EnergySpectrumPlot:** P vs E at fixed L
   - **TopControlBar:** All controls (responsive)
   - **InfoTooltip:** Physics explanations on hover
   - **VisualizationArea:** Main container + MSW indicator

3. **State Management (`src/context/`):**
   - SimulationContext for shared state
   - Physics parameters (energy, δCP, mass ordering, matter effect)
   - Experiment presets (T2K, NOvA, DUNE, KamLAND)
   - Animation state and history

4. **Hooks (`src/hooks/`):**
   - **useKeyboardShortcuts:** Keyboard navigation

5. **Utilities (`src/utils/`):**
   - Color utilities for flavor blending
   - Math helpers for calculations
   - Debounce for input handling

## Data Flow

1. **User Input → State Update:**
   - Controls/keyboard update SimulationContext
   - Context triggers component updates

2. **State → Visualization:**
   - Components subscribe to context changes
   - Canvas animations render at 60fps
   - Physics calculations drive visual changes

3. **Performance:**
   - requestAnimationFrame for smooth rendering
   - DPI-aware canvas scaling (`setTransform()`)
   - Memoized calculations

## Key Design Principles

1. **Component-Based Architecture:**
   - Reusable, self-contained components
   - Clear separation of concerns
   - Type-safe props and state

2. **Performance:**
   - Canvas 2D for efficient rendering
   - Minimal dependencies (~71KB gzipped)
   - Frame-rate independent physics

3. **Mobile-First:**
   - Touch support for camera rotation
   - Responsive control bar (compact on mobile)
   - Full viewport utilization

4. **Educational:**
   - Info tooltips explain physics concepts
   - Oscillation length markers for intuition
   - MSW resonance visualization

## Physics Features

| Feature | Implementation |
|---------|----------------|
| 3-flavor oscillations | NuFast algorithm |
| Matter effect (MSW) | Adjustable density |
| CP violation | δCP slider (0-360°) |
| Mass ordering | NO/IO toggle |
| Antineutrino | Sign flip on δCP |

Last Updated: 2026-02-02
