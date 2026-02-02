# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-02-02

### Added
- **Learn More Panel** — 8 educational sections covering neutrino physics
- **Settings Panel** — Language selector and density presets
- **KaTeX Math Rendering** — Beautiful LaTeX equations in educational content
- **Internationalization (i18n)** — 7 languages: EN, ES, JA, ZH, HI, FR, DE
- **3D PMNS Matrix Visualization** — Interactive rotatable bar chart
- **URL State Sharing** — Share exact simulation configurations via URL hash

### Changed
- Improved canvas text rendering for Greek letters with proper subscripts
- Better energy spectrum plot label positioning to avoid overlaps
- Grouped experiment presets by type (Accelerator, Reactor, Natural) in dropdown

### Fixed
- KaTeX CSS loading issue (removed SRI hash that was blocking stylesheet)
- Double rendering in RichText component math parser

## [1.1.2] - 2026-02-02

### Fixed
- Canvas DPI scaling using `setTransform()` instead of `scale()` to prevent compounding transforms

## [1.1.1] - 2026-02-02

### Fixed
- Mobile touch support for camera rotation
- Responsive control bar layout for small screens

## [1.1.0] - 2026-02-02

### Added
- **δCP Slider** — CP violation phase control (0-360°)
- **Antineutrino Toggle** — ν/ν̄ button that flips δCP sign
- **11 Experiment Presets** — T2K, NOvA, DUNE, Hyper-K, KamLAND, Daya Bay, JUNO, Double Chooz, Super-K, IceCube, Solar
- **Ternary Probability Triangle** — VISOS-style flavor space visualization
- **Oscillation Length Markers** — L₃₁, L₂₁ dashed lines on probability plot
- **MSW Resonance Visualization** — Golden ring and badge at resonance energy
- **Mass Hierarchy Toggle** — Normal/Inverted ordering with NuFit 5.2 values
- **Info Tooltips** — Physics explanations on hover with auto-positioning
- **Energy Spectrum Plot** — P vs E at fixed L (bottom right)
- **PMNS Matrix Display** — |U|² mixing matrix visualization
- **Keyboard Shortcuts** — Space, A, M, N, R, S, 1-4, arrows, ?
- **Help Modal** — Keyboard shortcuts reference

## [1.0.0] - 2026-02-02

### Added
- Initial release
- 3D starfield with diagonal motion and camera rotation
- Color-evolving neutrino sphere with specular highlight
- Real-time probability calculations using NuFast algorithm
- Probability vs Distance plot
- Top control bar with energy, speed, flavor, and matter effect controls
- Mobile responsive design with touch support
- 38 unit tests for physics and utilities
