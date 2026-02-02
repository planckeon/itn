# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.0] - 2026-02-03

### Added
- **WASM Loading Indicator** — Shows "Loading physics engine..." with spinner while WASM initializes
  - Fades to "Physics engine ready" or "Using fallback engine" on completion
  - Positioned at top center, disappears after 500ms
- **PREM Earth Density Model** — Realistic density profiles for neutrino paths through Earth
  - Dziewonski & Anderson (1981) polynomial fit for all Earth layers
  - Calculates average density along neutrino trajectory
  - Shows path description (crust/mantle/core-crossing) when matter enabled
- **PREM Preset Button** — Green "🌍 PREM" button auto-calculates density from baseline
  - Updates dynamically as baseline changes
  - Shows max depth and layer information

### Changed
- **45% Faster Vacuum Calculations** — VacuumBatch API pre-computes mixing matrix elements
  - Energy spectrum: 72ns/point (was 131ns/point)
  - Baseline scan also uses optimized batch API
- **Added Baseline Scan Support** — New `wasmCalculateBaselineScan` function in WASM bridge

### Technical
- nufast 0.3.1 adds VacuumBatch struct with spectrum() and baseline_scan() methods
- WASM bridge exports loading state via `onWasmStateChange()` callback
- New prem.ts module with 21 tests

## [1.4.0] - 2026-02-03

### Added
- **Rust/WASM Physics Engine** — High-performance oscillation calculations via WebAssembly
  - Using `nufast` v0.3.0 from crates.io (27% faster than C++ for matter calculations)
  - WASM binary: 32KB gzipped
- **Energy Spectrum Boost** — 400 data points with WASM vs 200 with JS fallback
- **State Persistence** — Simulation settings auto-save to localStorage across sessions

### Changed
- **Sliding Window Plot** — X-axis now shows actual distance range (min → max km)
- **Oscillation Markers** — L₃₁/L₂₁ markers update correctly for current visible range

### Fixed
- **Infinite Scroll Glitch** — Probability plot no longer breaks at high distances
- **Debounce Test** — Fixed context preservation test for Vitest compatibility

## [1.3.0] - 2026-02-03

### Added
- **Physics-based Neutrino Sphere** — Hybrid visualization with solid 3D core and wavefunction particle cloud
- **Flavor-colored Particles** — 40-70 particles on sphere surface colored by actual probability distribution
- **Matter Effect Visualization** — Particles orbit faster and wobble more in matter
- **MSW Resonance Effect** — Triple pulsing golden rings when near resonance energy
- **Smooth Color Transitions** — Core color blends gradually when flavor mix changes
- **Responsive Panel Layout** — Flexbox-based panels resize dynamically based on which are enabled
- **Scroll Detection** — Wheel zoom no longer hijacks scroll in modals/scrollable elements

### Changed
- **Three Pill Clusters Design** — Minimal control bar split into Zoom, Panels, Menu clusters
- **Dynamic Panel Sizing** — Spectrum plot expands to fill space when it's the only active panel
- Reduced sphere core radius for better particle visibility
- Improved 3D shading with specular highlight and depth-based particle opacity

### Fixed
- Removed broken wavefunction oscillation causing orbital ring artifacts
- Scroll now works properly inside Learn More panel and other modals
- Energy spectrum plot fills container width when expanded

## [1.2.0] - 2026-02-02

### Added
- **Unified Bottom Control Bar** — Sleek control panel with panel toggles and menu buttons
- **Multi-select Panel Toggles** — Enable any combination of △ Flavor, 〰 P(t), 📊 P(E) panels
- **Scroll Zoom** — Mouse wheel zoom in/out on neutrino sphere (0.5x to 2x)
- **11 new tooltip positioning tests** — Comprehensive edge case coverage
- **Learn More Panel** — 8 educational sections covering neutrino physics
- **Settings Panel** — Language selector and density presets
- **KaTeX Math Rendering** — Beautiful LaTeX equations in educational content
- **Internationalization (i18n)** — 7 languages: EN, ES, JA, ZH, HI, FR, DE
- **3D PMNS Matrix Visualization** — Interactive rotatable bar chart
- **URL State Sharing** — Share exact simulation configurations via URL hash

### Changed
- Moved menu actions (Share, Learn More, Settings, Help) to bottom control bar
- Removed hamburger menu in favor of always-visible action buttons
- Improved probability plot aspect ratio (taller for better curve visibility)
- Improved canvas text rendering for Greek letters with proper subscripts
- Better energy spectrum plot label positioning to avoid overlaps
- Grouped experiment presets by type (Accelerator, Reactor, Natural) in dropdown

### Fixed
- Tooltip viewport overflow — tooltips now use fixed positioning with viewport clamping
- Ternary plot tooltip positioning — tooltips render correctly inside embedded panels
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
