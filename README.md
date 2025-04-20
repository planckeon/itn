# Imagining the Neutrino: Interactive Oscillation Visualization

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build and Deploy](https://github.com/bkataru/imagining-the-neutrino/actions/workflows/deploy.yml/badge.svg)](https://github.com/bkataru/imagining-the-neutrino/actions/workflows/deploy.yml)

**Live Demo:** [https://bkataru.github.io/imagining-the-neutrino/](https://bkataru.github.io/imagining-the-neutrino/)

![Neutrino Oscillation Visualization](context/screenshot_placeholder.png)

## Introduction

"Imagining the Neutrino" is an interactive web-based visualization demonstrating 3-flavor neutrino oscillations using:

* **Probability Plots**: Visualize flavor probability changes over distance
* **Quantum Animation**: Observe neutrino flavor transitions through dynamic color changes  
* **Interactive Controls**: Adjust physics parameters to see impacts on oscillations
* **Educational Content**: Learn through integrated explanations with LaTeX formulas

## Key Features

- Modular TypeScript architecture
- Accurate NuFast physics calculations
- Responsive design with mobile support
- Clean, maintainable code structure
- Comprehensive testing coverage

## Current Tech Stack

* **Frontend**: Vite + TypeScript
* **Visualization**: p5.js
* **UI**: Alpine.js + Chota.css  
* **Math Rendering**: KaTeX
* **Testing**: Vitest
* **Linting**: Biome/ESLint

## Implementation

Uses a TypeScript port of the **NuFast** algorithm ([arXiv:2405.02400](https://arxiv.org/abs/2405.02400)) for accurate 3-flavor oscillation calculations.

Project structure:
- `src/core/`: Core physics calculations, types, and visualization components
- `src/alpine/`: UI components and stores
- `src/physics/`: NuFast implementation
- `src/styles/`: CSS modules and design system
- `src/utils/`: Utility functions and helpers
- `src/types/`: TypeScript type definitions
- `test/`: Test suites organized by module
  - `test/physics/`: Physics calculation tests
  - `test/utils/`: Utility function tests

See `ARCHITECTURE.md` for detailed technical documentation.

## Development

```bash
# Install dependencies
npm install

# Development server with hot reload
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage

# Lint and check code
npm run lint

# Format code
npm run format

# Check formatting
npm run format:check
```

## License
MIT License - see [LICENSE](LICENSE) for details.
