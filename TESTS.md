# Testing Strategy: Imagining the Neutrino

## 1. Overview
Comprehensive testing strategy using Vitest to ensure:

- Correct physics calculations
- Reliable utility functions
- Stable component integration

## 2. Testing Framework
* **Vitest:** Fast, Vite-compatible test runner
* **Coverage:** Built-in Istanbul coverage reporting
* **TypeScript:** Full type checking during tests

## 3. Test Types

### Unit Tests
- Physics engine calculations
- Utility functions
- Type definitions

### Integration Tests
- State management
- Component interactions
- Visualization updates

## 4. Test Coverage
* **Target:** >90% coverage for core modules
* **Measurement:** `npm run coverage`
* **Focus Areas:**
  - Physics calculations
  - Color utilities
  - Math helpers

## 5. Key Test Cases

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

## 6. Running Tests
```bash
# Run all tests
npm test

# Watch mode
npm run test:watch 

# Coverage report
npm run coverage
```

## 7. CI Integration
- Automated testing on push/pull requests
- Coverage reporting
- Type checking
