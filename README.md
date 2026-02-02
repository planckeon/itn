# Imagining the Neutrino

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build and Deploy](https://github.com/planckeon/itn/actions/workflows/deploy.yml/badge.svg)](https://github.com/planckeon/itn/actions/workflows/deploy.yml)

**[▶ Launch Demo](https://planckeon.github.io/itn/)**

![Screenshot](docs/screenshot.png)

An interactive visualization of 3-flavor neutrino oscillations. Watch a neutrino fly through space as its flavor changes, with real-time probability calculations.

A [Planckeon Labs](https://github.com/planckeon) project.

## Features

### Visualization
- **Immersive 3D Starfield** — Fly through space with the neutrino
- **Interactive Camera** — Drag to rotate your view (mouse or touch)
- **Color-Evolving Sphere** — The neutrino's color reflects its flavor probabilities
- **MSW Resonance Glow** — Golden ring when at matter resonance energy

### Analysis Plots
- **Probability vs Distance** — P(νₑ), P(νμ), P(ντ) over time with oscillation length markers
- **Ternary Flavor Triangle** — VISOS-style flavor space trajectory
- **Energy Spectrum** — P vs E at current distance (bottom right)
- **PMNS Matrix** — |U|² mixing matrix display (top right)

### Physics Controls
- **Experiment Presets** — T2K, NOvA, DUNE, KamLAND configurations
- **δCP Slider** — CP violation phase (0-360°)
- **ν/ν̄ Toggle** — Neutrino/antineutrino mode
- **NO/IO Toggle** — Normal/Inverted mass ordering
- **Matter Effect** — Enable MSW effect with adjustable density
- **Energy & Speed** — Continuous sliders

### Quality of Life
- **Keyboard Shortcuts** — See below (press `?` for help)
- **Help Modal** — Press `?` for shortcuts reference
- **Info Tooltips** — Hover over (?) for physics explanations
- **Mobile Responsive** — Full touch support with compact UI

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play/Pause |
| `A` | Toggle antineutrino |
| `M` | Toggle matter effect |
| `N` | Toggle mass ordering |
| `R` | Reset simulation |
| `1-4` | Apply presets (T2K, NOvA, DUNE, KamLAND) |
| `↑/↓` | Adjust energy |
| `←/→` | Adjust δCP |
| `?` | Show help modal |

## Physics

Uses a TypeScript port of the **NuFast** algorithm ([arXiv:2405.02400](https://arxiv.org/abs/2405.02400)) for accurate 3-flavor neutrino oscillation probability calculations.

**Parameters (NuFit 5.2):**
- θ₁₂ = 33.44°, θ₁₃ = 8.57°, θ₂₃ = 49.2°
- Δm²₂₁ = 7.42×10⁻⁵ eV²
- Δm²₃₁ = +2.517×10⁻³ eV² (NO) / -2.498×10⁻³ eV² (IO)

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
├── components/
│   ├── Starfield.tsx          # 3D starfield with camera rotation
│   ├── NeutrinoSphere.tsx     # Color-blending sphere + MSW glow
│   ├── ProbabilityPlot.tsx    # P vs L plot with markers
│   ├── TernaryPlot.tsx        # Flavor triangle
│   ├── EnergySpectrumPlot.tsx # P vs E spectrum
│   ├── PMNSMatrix.tsx         # |U|² mixing matrix
│   ├── TopControlBar.tsx      # All controls
│   ├── InfoTooltip.tsx        # Physics explanations
│   └── HelpModal.tsx          # Keyboard shortcuts modal
├── hooks/
│   └── useKeyboardShortcuts.ts
├── context/
│   └── SimulationContext.tsx  # All state + physics
├── physics/
│   ├── NuFastPort.ts          # Core algorithm
│   └── types.ts               # Interfaces
└── utils/                     # Helpers
```

## License

MIT — see [LICENSE](LICENSE)
