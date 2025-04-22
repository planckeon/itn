## 2025-04-21 - Utility Function Consolidation

### Changes Made:
1. Created centralized utils/index.ts to export all utility functions
2. Consolidated physics helpers by:
   - Keeping NuFastPort.ts as the primary physics implementation
   - Maintaining only unique exports from neutrinoPhysics.ts (LmaxSim)
3. Verified no duplicate colorUtils.ts files exist in the project

### Impact:
- All utility functions are now accessible through a single import path
- Reduced code duplication in physics calculations
- Improved maintainability of utility functions