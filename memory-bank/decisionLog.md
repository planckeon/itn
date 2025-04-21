[2025-04-21 13:16:00] - Migration from Alpine.js/Chota to React/Tailwind CSS
- Decision: Rewrote UI layer using React and Tailwind CSS for better maintainability and modern development practices
- Rationale: 
  * Improved component architecture
  * Better state management
  * More maintainable styling system
  * Better developer experience
- Implementation: 
  * Created new React components for all UI elements
  * Wrapped p5.js visualization in React component
  * Implemented responsive design with Tailwind
  * Maintained all existing functionality
- Outcome: Successful migration with no loss of features
# Decision Log

## 2025-04-21: Tech Stack Simplification
### Decision
Replace Three.js with p5.js for visualization

### Rationale
- Better suited for 2D probability plots
- Lighter weight for core visualization needs
- Easier integration with Alpine.js state
- Reduced bundle size

### Implementation
- Migrated all visualization to p5.js
- Removed Three.js dependencies
- Created dedicated p5 sketch component

## 2025-04-21: State Management
### Decision
Use Alpine.js for reactive state

### Rationale
- Minimal footprint
- Declarative templates
- Reactive data flow
- Easy integration with existing stack

### Implementation
- Stores for physics parameters
- Stores for animation state
- Custom directives for math rendering

## 2025-04-21: Architecture Principles
### Decision
Adopt modular TypeScript architecture

### Rationale
- Clear separation of concerns
- Type safety
- Maintainable code structure
- Testable components

### Implementation
- Core physics layer (src/physics/)
- Visualization components (src/core/)
- UI state management (src/alpine/)
- Utility functions (src/utils/)