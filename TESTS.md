# Testing Strategy: Imagining the Neutrino

## 1. Overview
Comprehensive testing strategy using Vitest and React Testing Library to ensure:

- Correct physics calculations
- Reliable utility functions
- Stable component integration
- Consistent behavior across states

## 2. Test Directory Structure
```
test/
├── components/        # React component tests
│   ├── NeutrinoSphere.test.tsx
│   └── ControlsPanel.test.tsx
├── physics/          # Physics calculation tests
│   ├── oscillation.test.ts
│   └── matter-effect.test.ts
├── utils/            # Utility function tests
│   ├── color.test.ts
│   └── math.test.ts
└── context/          # State management tests
    └── SimulationContext.test.ts
```

## 3. Testing Framework
* **Vitest:** Fast, Vite-compatible test runner
* **React Testing Library:** For component tests
* **Coverage:** Built-in Istanbul coverage reporting
* **TypeScript:** Full type checking during tests

## 4. Test Examples

### Component Test Example
```typescript
import { render } from '@testing-library/react';
import NeutrinoSphere from '../src/components/NeutrinoSphere';

describe('NeutrinoSphere', () => {
  test('renders with default props', () => {
    const { container } = render(<NeutrinoSphere probabilities={[0.5, 0.3, 0.2]} />);
    expect(container.firstChild).toHaveClass('neutrino-sphere');
  });
});
```

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

## 5. Test Types

### Unit Tests
- Physics engine calculations
- Utility functions
- Type definitions

### Integration Tests
- Component interactions
- Context state changes
- Visualization updates

### Component Tests
- Rendering output
- User interactions
- State changes

## 6. Test Coverage
* **Target:** >90% coverage for all modules
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
  - React components
  - State management

## 7. Key Test Cases

### Physics Engine
- Vacuum oscillation validation
- Matter effect verification
- Probability matrix unitarity
- Edge case handling

### Components
- Rendering consistency
- Prop updates
- User interactions
- Context integration

### Utilities
- Color blending accuracy
- Math function correctness
- Type safety checks

## 8. Running Tests
```bash
# Run all tests
npm test

# Watch mode
npm run test:watch 

# Coverage report
npm run test:coverage

# Specific test file
npm test test/components/NeutrinoSphere.test.tsx
```

## 9. CI Integration
- Automated testing on push/pull requests
- Coverage reporting
- Type checking
- Linting

Last Updated: 2025-04-23
