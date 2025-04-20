# Testing Strategy: Imagining the Neutrino

## 1. Overview
Comprehensive testing strategy using Vitest to ensure:

- Correct physics calculations
- Reliable utility functions
- Stable component integration

## 2. Test Directory Structure
```
test/
├── physics/          # Physics calculation tests
│   ├── oscillation.test.ts
│   └── matter-effect.test.ts
├── utils/            # Utility function tests
│   ├── color.test.ts
│   └── math.test.ts
└── integration/      # Integration tests
    ├── state.test.ts
    └── visualization.test.ts
```

## 3. Testing Framework
* **Vitest:** Fast, Vite-compatible test runner
* **Coverage:** Built-in Istanbul coverage reporting
* **TypeScript:** Full type checking during tests

## 4. Test Examples

### Physics Test Example
```typescript
import { calculateOscillation } from '../src/physics/oscillation';

describe('Neutrino Oscillation Calculations', () => {
  test('Vacuum oscillation probabilities', () => {
    const result = calculateOscillation({ energy: 1, distance: 100 });
    expect(result.e).toBeCloseTo(0.7, 1);
    expect(result.mu).toBeCloseTo(0.2, 1);
    expect(result.tau).toBeCloseTo(0.1, 1);
  });
});
```

### Utility Test Example
```typescript
import { blendFlavorColors } from '../src/utils/color';

describe('Color Utilities', () => {
  test('Flavor color blending', () => {
    const result = blendFlavorColors([0.5, 0.3, 0.2]);
    expect(result).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
```

## 5. Test Types

### Unit Tests
- Physics engine calculations
- Utility functions
- Type definitions

### Integration Tests
- State management
- Component interactions
- Visualization updates

## 6. Test Coverage
* **Target:** >90% coverage for core modules
* **Measurement:** 
  ```bash
  npm run test:coverage
  ```
* **Reporting:**
  - HTML report in `coverage/` directory
  - Console summary of coverage percentages
  - Threshold enforcement in vitest.config.ts
* **Focus Areas:**
  - Physics calculations
  - Color utilities
  - Math helpers

## 7. Key Test Cases

### Physics Engine
- Vacuum oscillation validation
- Matter effect verification
- Probability matrix unitarity
- Edge case handling

### Utilities
- Color blending accuracy
- Math function correctness
- Type safety checks

### Visualization
- Rendering consistency
- Animation timing
- Performance benchmarks

## 8. Running Tests
```bash
# Run all tests
npm test

# Watch mode
npm run test:watch 

# Coverage report
npm run test:coverage

# Specific test file
npm test test/physics/oscillation.test.ts
```

## 9. CI Integration
- Automated testing on push/pull requests
- Coverage reporting
- Type checking

Last Updated: 2025-04-21
