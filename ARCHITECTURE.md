# Architecture Document: Imagining the Neutrino

## Overview

Interactive visualization of neutrino flavor oscillations using:

- **p5.js** for all visualization
- **Alpine.js** for reactive state management  
- **TypeScript** for type safety
- **Vite** for development/build

## System Architecture

```
┌───────────────┐      ┌───────────────┐      ┌─────────────────┐
│   UI Layer    │◄────►│  Alpine.js    │◄────►│  p5.js          │
│  (HTML/CSS)   │      │   Stores      │      │  Visualization  │
└───────────────┘      └───────────────┘      └─────────────────┘
                              ▲                       ▲
                              │                       │
                              ▼                       │
                       ┌───────────────┐             │
                       │    Physics    │             │
                       │  Calculation  │◄────────────┘
                       │     Layer     │
                       └───────────────┘
```

### Core Modules

1. **Physics Engine (`physics/`):**
   - NuFast algorithm implementation
   - Physical constants and default parameters
   - Type definitions for oscillation parameters

2. **State Management (`alpine/`):**
   - Alpine.js stores for parameters and UI state
   - Reactive data flow between components

3. **Visualization (`visualization/`):**
   - **p5 Sketch:** Main animation and rendering
   - **Components:** 
     - Neutrino visualization
     - Probability plot
     - Starfield background

4. **Utilities (`utils/`):**
   - Color utilities for flavor blending
   - Math helpers for calculations
   - Performance optimizations

## Data Flow

1. **User Input → State Update:**
   - UI controls update Alpine stores
   - Stores trigger reactive updates

2. **State → Visualization:**
   - p5 sketch observes state changes
   - Updates animation based on current probabilities
   - Renders neutrino and plot in real-time

3. **Physics Calculations:**
   - NuFast calculates probabilities
   - Results cached for performance
   - Visual elements update based on results

## Key Design Principles

1. **Modular Structure:**
   - Clear separation of concerns
   - Small, focused components

2. **Performance:**
   - Efficient physics calculations
   - Optimized rendering pipeline
   - Caching of results

3. **Maintainability:**
   - TypeScript for type safety
   - Consistent code style
   - Comprehensive tests

## Future Enhancements

- Additional visualization modes
- Enhanced mobile experience
- Expanded educational content
- Performance monitoring
