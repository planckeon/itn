# Imagining the Neutrino: Interactive Oscillation Visualization

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build and Deploy](https://github.com/planckeon/itn/actions/workflows/deploy.yml/badge.svg)](https://github.com/planckeon/itn/actions/workflows/deploy.yml)

**Live Demo:** [https://planckeon.github.io/itn/](https://planckeon.github.io/itn/)

A [Planckeon Labs](https://github.com/planckeon) project - R&D in fast/intelligent software tooling for theoretical physics.

## Introduction

"Imagining the Neutrino" is an interactive web-based visualization demonstrating 3-flavor neutrino oscillations using:

* **Probability Plots**: Visualize flavor probability changes over distance
* **Quantum Animation**: Observe neutrino flavor transitions through dynamic color changes  
* **Interactive Controls**: Adjust physics parameters to see impacts on oscillations
* **Educational Content**: Learn through integrated explanations with LaTeX formulas

## Key Features

- React-based component architecture
- Accurate NuFast physics calculations
- Anime.js v4 for smooth animations
- Tailwind CSS for responsive styling
- Comprehensive testing coverage

## Tech Stack

* **Frontend**: React 19 + TypeScript
* **Build**: Vite
* **Visualization**: Anime.js v4
* **Styling**: Tailwind CSS  
* **State Management**: React Context
* **Math Rendering**: KaTeX
* **Testing**: Vitest
* **Linting**: Biome

## Implementation

Uses a TypeScript port of the **NuFast** algorithm ([arXiv:2405.02400](https://arxiv.org/abs/2405.02400)) for accurate 3-flavor oscillation calculations.

Project structure:
- `src/components/`: React components for visualization and UI
- `src/context/`: Simulation state management
- `src/physics/`: NuFast implementation
- `src/utils/`: Utility functions and helpers
- `src/types/`: TypeScript type definitions
- `tests/`: Test suites organized by module

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
```

## License

MIT License - see [LICENSE](LICENSE) for details.
