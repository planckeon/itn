# Imagining the Neutrino

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-166%20passing-brightgreen)](https://github.com/planckeon/itn)
[![Demo](https://img.shields.io/badge/demo-live-blue)](https://planckeon.github.io/itn/)

**[▶ Launch Demo](https://planckeon.github.io/itn/)**

<p align="center">
  <img src="docs/screenshot.png" alt="Imagining the Neutrino" width="800">
</p>

Watch a neutrino fly through space as its flavor oscillates in real-time.

The physics engine is [nufast](https://github.com/planckeon/nufast) compiled to WebAssembly—13 KB, 20 million calculations per second, the same algorithm used by T2K and JUNO.

---

## What It Does

A neutrino created as νμ doesn't stay νμ. As it travels, quantum mechanics mixes its flavor—sometimes it's νe, sometimes ντ, usually some superposition of all three. This is neutrino oscillation, and it's how we know neutrinos have mass.

This visualization lets you see that happen. The sphere's color reflects the flavor probabilities. Red = electron, green = muon, blue = tau. The plots show probability vs distance, energy spectrum, and the ternary flavor triangle.

---

## Features

**Visualization**
- 3D starfield with camera rotation (drag to orbit)
- Color-blending neutrino sphere
- MSW resonance glow (golden ring at resonance energy)
- 60fps canvas rendering

**Physics**
- 11 experiment presets: DUNE, T2K, NOvA, Hyper-K, KamLAND, JUNO, IceCube...
- δCP slider (CP violation phase)
- Antineutrino mode
- Normal/Inverted mass ordering
- Matter effects with PREM Earth model

**Analysis**
- Probability vs distance plot with oscillation length markers
- Ternary flavor triangle (VISOS-style)
- Energy spectrum at current baseline
- PMNS mixing matrix display

**Polish**
- Keyboard shortcuts (press `?`)
- URL state sharing
- 7 languages
- Mobile responsive

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play/Pause |
| `A` | Toggle antineutrino |
| `M` | Toggle matter |
| `N` | Toggle mass ordering |
| `1-4` | Presets (T2K, NOvA, DUNE, KamLAND) |
| `↑/↓` | Energy |
| `←/→` | δCP |
| `S` | Copy share URL |
| `?` | Help |

---

## URL Sharing

Share exact configurations:

```
https://planckeon.github.io/itn/#e=2.5&f=muon&d=180&m=1&p=dune
```

---

## Tech Stack

| What | How |
|------|-----|
| UI | React 19 + TypeScript + Tailwind |
| Build | Vite |
| Graphics | Canvas 2D @ 60fps |
| Physics | nufast WASM (Zig → 13 KB) |
| Math | KaTeX |
| Tests | Vitest (166 passing) |

---

## The Physics

NuFit 5.2 parameters:
- θ₁₂ = 33.44°, θ₁₃ = 8.57°, θ₂₃ = 49.2°
- Δm²₂₁ = 7.42×10⁻⁵ eV²
- Δm²₃₁ = +2.517×10⁻³ eV² (NO) / −2.498×10⁻³ eV² (IO)

The algorithm is NuFast ([arXiv:2405.02400](https://arxiv.org/abs/2405.02400)) by Denton & Parke. Uses the Eigenvalue-Eigenvector Identity to avoid cubic eigenvalue equations—sub-microsecond per calculation.

---

## Development

```bash
npm install
npm run dev      # localhost:5173
npm run build
npm test         # 166 passing
```

---

## Citation

```bibtex
@software{itn,
  author = {Kataru, Baalateja},
  title = {Imagining the Neutrino: Interactive 3-Flavor Oscillation Visualization},
  year = {2026},
  url = {https://github.com/planckeon/itn}
}
```

Physics engine:

```bibtex
@article{Denton:2024xzk,
  author = {Denton, Peter B. and Parke, Stephen J.},
  title = "{NuFast}",
  eprint = "2405.02400",
  year = "2024"
}
```

---

## License

MIT

---

*A [Planckeon Labs](https://github.com/planckeon) project.*
