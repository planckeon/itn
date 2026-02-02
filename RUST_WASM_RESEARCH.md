# Rust/WASM Research: Imagining the Neutrino

## Executive Summary

**Recommendation: NOT WORTH IT for this project**

While Rust + WASM could theoretically speed up the physics calculations, the complexity/benefit tradeoff is unfavorable for this visualization.

---

## Current Physics Code Analysis

### Location: `src/physics/NuFastPort.ts`

The physics code is a TypeScript port of the NuFast algorithm for 3-flavor neutrino oscillation probability calculations.

### What it does:
1. **Vacuum oscillations** (`_probabilityVacuumLBL`): ~50 lines of pure math
2. **Matter effects** (`_probabilityMatterLBL`): ~40 lines, calls vacuum function
3. **Entry point** (`calculateNuFastProbs`): Parameter conversion and dispatch

### Operations:
- Trigonometric functions: `sin`, `cos`, `asin`, `atan`, `sqrt`
- Basic arithmetic: multiplication, division, addition
- Small arrays: 3x3 probability matrices
- No loops over large datasets
- No complex data structures

### Computational complexity: **O(1) per calculation**
- Each call performs ~50-100 floating point operations
- Returns a 3x3 matrix (9 numbers)

---

## Performance Assessment

### Current Performance
The simulation runs at 60fps with no perceptible lag because:
1. Physics calculation is trivial (~100 FLOPs per frame)
2. JavaScript V8 JIT compiles this to near-native code
3. Real bottleneck is DOM updates and canvas rendering

### Would WASM Help?
| Factor | Assessment |
|--------|------------|
| Calculation speed | Maybe 2-3x faster, but irrelevant when base is ~1μs |
| Memory | No benefit - tiny data structures |
| Animation | Won't help - canvas/DOM is the bottleneck |
| Bundle size | Would ADD ~50-100KB of WASM |
| Build complexity | Significant increase |

### Profiling Reality Check
If the physics calculation takes **1 microsecond** in JS:
- 2x speedup = 0.5 microseconds saved per frame
- At 60fps = 30 microseconds saved per second
- **Completely imperceptible**

---

## When WASM Would Make Sense

WASM would be beneficial if we were:
1. Running millions of calculations (Monte Carlo simulations)
2. Rendering complex 3D scenes with custom shaders
3. Doing real-time audio processing
4. Building a physics engine with collision detection

For a simple visualization like this? Overkill.

---

## Existing Rust Implementations

### Searched for:
- `nufast rust` - No results
- `neutrino oscillation rust` - No dedicated crates
- `physics simulation wasm` - General frameworks, nothing specific

The NuFast algorithm originates from a C++ implementation. A Rust port would need to be written from scratch.

---

## If We Proceeded Anyway

### Project Structure
```
imagining-the-neutrino/
├── crates/
│   └── nufast-wasm/
│       ├── Cargo.toml
│       ├── src/
│       │   └── lib.rs
│       └── pkg/           # wasm-pack output
├── src/
│   └── physics/
│       └── nufast-wasm.ts # JS wrapper
└── vite.config.ts         # WASM plugin config
```

### Dependencies
```toml
[dependencies]
wasm-bindgen = "0.2"

[lib]
crate-type = ["cdylib"]
```

### Build Integration
```json
{
  "scripts": {
    "build:wasm": "cd crates/nufast-wasm && wasm-pack build --target web",
    "build": "npm run build:wasm && tsc && vite build"
  }
}
```

### Vite Config
```typescript
import wasm from "vite-plugin-wasm";

export default {
  plugins: [wasm()],
};
```

---

## Recommended Optimizations Instead

If performance ever becomes an issue, consider:

1. **Web Workers**: Offload calculations to a worker thread
2. **Memoization**: Cache probability calculations for repeated parameters
3. **Batch calculations**: Calculate multiple distances at once
4. **requestAnimationFrame optimization**: Skip frames when tab is hidden
5. **Canvas optimization**: Use OffscreenCanvas or WebGL for rendering

---

## Conclusion

**Don't add Rust/WASM to this project.**

The physics code is already fast enough. The real work is in React rendering and canvas animation, which WASM can't help with.

If you want to use Rust for physics simulations, consider building a separate CLI tool or a more complex simulation that actually needs the performance (like a full detector simulation or parameter space scan).

---

*Research completed: 2026-02-02*
