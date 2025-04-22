# Component Migration Log

## Date: 2025-04-22

### Migration Status
- Checked imagining-neutrino-react/src/components/ - directory is empty
- No components found to migrate
- No action needed for component migration

### Verification
- No components to verify rendering
- No imports to check
## Core Files Migration - 2025-04-22

### Files Checked
- App.tsx: Already exists in root (no migration needed)
- main.tsx: Already exists in root (no migration needed)  
- index.css: Identical in both locations (no migration needed)

### Config Files Comparison
- tsconfig.json: Root version has more complete settings (preferred)
- vite.config.ts: Identical in both locations
- tsconfig.app.json: Similar settings, root version preferred
- tsconfig.node.json: Specific to Vite config (no changes needed)

### Next Steps
- Verify application builds correctly
- Check all imports resolve properly
## Migration Completion - 2025-04-22

### Status
- Core files successfully migrated from imagining-neutrino-react to root
- Config files merged with root versions preferred
- Type conversion layer implemented for NuFast parameters

### Remaining Issues
1. CSS files need to be created/migrated:
   - src/App.css
   - src/index.css
   - src/components/ProbabilityPlot.css

2. State management needs to be set up:
   - ../state imports
   - useAppState implementations

3. TypeScript warnings to address:
   - Unused variables
   - Missing type declarations

### Verification
- Application builds with expected TypeScript errors
- Core neutrino physics calculations are functional
## React Configuration Documentation (Preserved from imagining-neutrino-react/README.md)

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})