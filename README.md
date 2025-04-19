# Imagining the Neutrino: Interactive Oscillation Visualization

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build and Deploy](https://github.com/YOUR_USERNAME/imagining-the-neutrino/actions/workflows/deploy.yml/badge.svg)](https://github.com/YOUR_USERNAME/imagining-the-neutrino/actions/workflows/deploy.yml) <!-- Replace YOUR_USERNAME -->
<!-- [![Tests](https://img.shields.io/badge/Tests-Passing-success.svg)]() Add dynamic badge if publishing results -->
<!-- [![Coverage](https://img.shields.io/badge/Coverage-80%25+-brightgreen.svg)]() Update with actual coverage -->

**Live Demo:** [https://YOUR_USERNAME.github.io/imagining-the-neutrino/](https://YOUR_USERNAME.github.io/imagining-the-neutrino/) <!-- Replace YOUR_USERNAME -->

![Screenshot of Imagining the Neutrino Visualization](docs/screenshot_placeholder.png) <!-- Add a representative screenshot -->

## Introduction

"Imagining the Neutrino" is an interactive web-based visualization tool designed to demonstrate the fascinating quantum mechanical phenomenon of 3-flavor neutrino oscillations. It provides users with:

* Interactive Probability Plots: Visualize how the probability of detecting a neutrino as an electron (νe), muon (νμ), or tau (ντ) flavor changes as it travels through vacuum or matter.
* 3D Animation: Observe a representation of a neutrino flying through space, its color dynamically shifting based on its instantaneous flavor probabilities.
* Educational Content: Explore key concepts through integrated tooltips with LaTeX formulas explaining the physics parameters.
* Parameter Control: Adjust neutrino energy, initial flavor, environment (vacuum/matter), matter density, and fundamental mixing parameters (θ12, θ23, θ13, δCP, Δm²₂₁, Δm²₃₁) to see their impact on oscillations.

This project aims to make the complex physics of neutrino oscillations more intuitive and accessible, using accurate calculations based on the NuFast algorithm.

## Background

### Neutrino Oscillations

Neutrinos are elementary particles that interact very weakly with matter. They come in three "flavors": electron, muon, and tau. Neutrino oscillation is the process where a neutrino created with a specific flavor can later be measured to have a different flavor. This phenomenon confirms that neutrinos have mass and that the flavor states are quantum superpositions of distinct mass states (mass eigenstates).

### Theory

* **Vacuum Oscillations:** The probability depends on mixing angles (θ_ij), CP phase (δ_CP), mass-squared differences (Δm²), energy (E), and distance (L).
* **Matter Oscillations (MSW Effect):** Interactions with electrons in matter modify effective masses and mixing, altering oscillation patterns.

### Implementation Details

This visualization uses a highly accurate algorithm based on the **NuFast** approach ([arXiv:2405.02400](https://arxiv.org/abs/2405.02400)) ported to TypeScript to calculate the full 3-flavor oscillation probabilities in both vacuum and constant-density matter.

* **Frontend:** Vite, TypeScript, HTML, Chota.css
* **Reactivity/UI:** Alpine.js
* **Plotting:** Plotly.js
* **3D Rendering:** Three.js (with OrbitControls)
* **LaTeX Rendering:** KaTeX
* **Physics Engine:** Custom TypeScript port based on NuFast.

See `docs/IMPLEMENTATION.md` and `docs/ARCHITECTURE.md` for more details.

## Setup

### Requirements

* Node.js (v18 or later recommended)
* npm (or yarn/pnpm)

### Quick Start

1. Clone the repository:

   ```bash
   git clone https://github.com/YOUR_USERNAME/imagining-the-neutrino.git # Replace YOUR_USERNAME
   cd imagining-the-neutrino
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173` (or the port specified by Vite).

## Development

* **Development Server:** `npm run dev` (includes Hot Module Replacement)
* **Code Style:** (Consider adding Prettier/ESLint for consistency)

## Testing

This project uses [Vitest](https://vitest.dev/) for unit testing.

* Run all tests once:

  ```bash
  npm test
  ```

* Run tests in watch mode:

  ```bash
  npm run test:watch
  ```

* Check test coverage:

  ```bash
  npm run coverage
  ```

See `docs/TESTS.md` for the testing strategy.

## Building

* Build the static site for production (output to `dist/` folder):

  ```bash
  npm run build
  ```

* Preview the production build locally:

  ```bash
  npm run preview
  ```

## CI/CD

Continuous integration and deployment to GitHub Pages are handled via GitHub Actions (`./.github/workflows/deploy.yml`). Pushes to the `main` branch will automatically trigger the build, test, and deployment process.

## Citations / References

* **NuFast:** Denton, P. B., & Parke, S. J. (2024). *NuFast: A fast code for long-baseline neutrino oscillation probabilities in matter*. arXiv preprint [arXiv:2405.02400](https://arxiv.org/abs/2405.02400).
* **Oscillation Parameters:** Based on NuFit 5.2 values (see [PDG](https://pdg.lbl.gov/) or NuFit websites for latest global fits).
* **Libraries:** Three.js, Plotly.js, Alpine.js, Chota.css, KaTeX, Vite, Vitest, TypeScript.

## Acknowledgements

* Based on the precise calculation methods developed in NuFast.
* Inspired by educational physics visualizations.
* Thanks to the creators of the open-source libraries used.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
