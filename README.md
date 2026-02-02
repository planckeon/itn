# Imagining the Neutrino

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build and Deploy](https://github.com/planckeon/itn/actions/workflows/deploy.yml/badge.svg)](https://github.com/planckeon/itn/actions/workflows/deploy.yml)

**[▶ Launch Demo](https://planckeon.github.io/itn/)**

![Screenshot](docs/screenshot.png)

An interactive visualization of 3-flavor neutrino oscillations. Watch a neutrino fly through space as its flavor changes, with real-time probability calculations.

A [Planckeon Labs](https://github.com/planckeon) project.

## Features

- **Immersive 3D Starfield** — Fly through space with the neutrino
- **Interactive Camera** — Drag to rotate your view (mouse or touch)
- **Color-Evolving Sphere** — The neutrino's color reflects its flavor probabilities
- **Real-time Probability Plot** — Watch P(νₑ), P(νμ), P(ντ) evolve over distance
- **Physics Controls** — Adjust energy, speed, initial flavor, and matter effects
- **Mobile Responsive** — Full touch support with compact UI

## Physics

Uses a TypeScript port of the **NuFast** algorithm ([arXiv:2405.02400](https://arxiv.org/abs/2405.02400)) for accurate 3-flavor neutrino oscillation probability calculations, including matter effects.

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 19 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| Rendering | Canvas 2D (60fps) |
| State | React Context |
| Testing | Vitest |

## Development

```bash
npm install      # Install dependencies
npm run dev      # Dev server at localhost:5173
npm run build    # Production build
npm test         # Run tests (38 passing)
```

## Project Structure

```
src/
├── components/     # React components
│   ├── Starfield.tsx       # 3D starfield with camera rotation
│   ├── NeutrinoSphere.tsx  # Color-blending sphere
│   ├── ProbabilityPlot.tsx # Canvas-based plot
│   └── TopControlBar.tsx   # Parameter controls
├── context/        # Simulation state
├── physics/        # NuFast implementation
└── utils/          # Helpers
```

## License

MIT — see [LICENSE](LICENSE)
