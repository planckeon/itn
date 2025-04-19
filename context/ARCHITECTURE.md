# Architecture Document: Imagining the Neutrino

## Overview

"Imagining the Neutrino" is an interactive web application for visualizing neutrino flavor oscillations. It combines accurate physics calculations with engaging visualizations to help users understand this quantum phenomenon.

## System Architecture

The application follows a modular architecture organized around core responsibilities:

```
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│   UI Layer    │◄────►│  Alpine.js    │◄────►│ Visualization │
│  (HTML/CSS)   │      │   Stores      │      │  Components   │
└───────────────┘      └───────────────┘      └───────────────┘
                              ▲                       ▲
                              │                       │
                              ▼                       │
                       ┌───────────────┐             │
                       │    Physics    │             │
                       │  Calculation  │◄────────────┘
                       │     Layer     │
                       └───────────────┘
```

### Core Components

1. **Physics Engine (`physics/`):**
   - `NuFastPort.ts`: Implements the NuFast algorithm for efficient calculation of neutrino oscillation probabilities in both vacuum and matter
   - `constants.ts`: Defines physical constants and default oscillation parameters
   - `types.ts`: TypeScript type definitions for oscillation parameters and calculation results

2. **State Management (`alpine/`):**
   - `setupAlpine.ts`: Configures Alpine.js and sets up reactive data stores for oscillation parameters, animation state, and UI state

3. **Visualization (`visualization/`):**
   - **2D Plotting (`plot/`):**
     - `ProbabilityPlot.ts`: Generates interactive plots showing oscillation probabilities vs. distance
   - **3D Visualization (`scene3d/`):**
     - `SceneManager.ts`: Manages the Three.js scene, camera, rendering, and animation loop
     - `NeutrinoSphere.ts`: Renders a neutrino representation that changes color based on flavor probabilities
     - `Starfield.ts`: Creates a dynamic star field background with depth and motion effects

4. **Utilities (`utils/`):**
   - `colorUtils.ts`: Helper functions for color blending and conversion based on probabilities
   - `mathUtils.ts`: Mathematical utility functions for calculations and formatting
   - `debounce.ts`: Performance optimization for UI events

## Data Flow

1. **User Input → State Update:**
   - User adjusts parameters via UI controls
   - Alpine.js updates the appropriate stores

2. **State → Visualization:**
   - SceneManager observes state changes through its access functions
   - When animation is playing, SceneManager:
     - Updates the current position (L)
     - Calculates new probabilities using NuFastPort
     - Updates the neutrino sphere color based on probabilities
     - Updates the starfield position
   - The ProbabilityPlot updates when parameters change:
     - Calculates probabilities for a range of distances
     - Redraws the plot with the new data
     - Updates the current position marker

3. **Physics Calculations:**
   - `getNuFastProbs` calculates the oscillation probabilities based on:
     - Neutrino parameters (mixing angles, mass differences)
     - Propagation conditions (distance, energy, matter density)
     - Initial neutrino flavor

## Key Design Principles

1. **Separation of Concerns:**
   - Physics calculations are isolated from visualization logic
   - UI state is managed separately from calculation logic

2. **Reactive Architecture:**
   - Alpine.js provides reactive state management
   - Components respond to state changes automatically

3. **Performance Optimization:**
   - The NuFast algorithm provides efficient calculations
   - 3D rendering is optimized for smooth animation
   - UI updates are debounced to prevent excessive calculations

4. **Educational Focus:**
   - Interactive controls with immediate visual feedback
   - Tooltips with LaTeX equations explain the physics
   - Real-time visualization of quantum phenomena

## Testing Strategy

- Unit tests for core physics calculations
- Unit tests for utility functions
- Visual testing for UI components

## Future Enhancements

1. Variable matter density profiles
2. Explicit support for different mass orderings
3. Additional visualization modes (phase space, triangular plot)
4. Comparison with experimental data
5. Additional educational content
