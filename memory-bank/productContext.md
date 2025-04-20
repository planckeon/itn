# Product Context

This file provides a high-level overview of the "Imagining the Neutrino" project - an interactive web-based visualization demonstrating 3-flavor neutrino oscillations.

## Project Goal
Create an educational visualization tool that:
- Demonstrates neutrino flavor oscillations through dynamic animations
- Provides accurate physics calculations using NuFast algorithm
- Offers intuitive controls for exploring parameter space
- Combines visual learning with mathematical explanations

## Key Features
- **Interactive Controls:** Adjust oscillation parameters in real-time
- **Probability Plots:** Visualize flavor changes over distance
- **Quantum Animation:** Color-changing neutrino representation
- **Educational Content:** Integrated explanations with LaTeX formulas
- **Modular Architecture:** Clean TypeScript codebase
- **Responsive Design:** Works across device sizes

## Overall Architecture
- **UI Layer:** Alpine.js + Chota CSS
- **Visualization:** p5.js (replaced Three.js)
- **Physics Engine:** NuFast TypeScript implementation
- **Core Modules:**
  - `src/physics/`: Oscillation calculations
  - `src/core/`: Visualization components
  - `src/alpine/`: State management
  - `src/utils/`: Helper functions
- **Testing:** Vitest test suites