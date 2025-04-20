# High-Level Design: Imagining the Neutrino

## 1. Introduction
Interactive web visualization of neutrino oscillations using modern web technologies.

## 2. Goals
* Visualize 3-flavor neutrino oscillation probabilities
* Provide intuitive animation of flavor changes
* Allow user control of physical parameters
* Incorporate educational explanations
* Ensure accuracy and performance

## 3. Key Features
* **Interactive Controls:** Sliders and inputs for oscillation parameters
* **Probability Plot:** 2D canvas showing flavor probabilities vs distance  
* **Neutrino Visualization:** Animated particle with dynamic color changes
* **Starfield Background:** Simulates neutrino movement through space
* **Animation Controls:** Play/pause/reset and speed adjustment

## 4. Major Components
* **UI Layer (HTML/CSS/Alpine.js):** Input controls and layout
* **State Management (Alpine.js):** Centralized reactive stores  
* **Physics Engine (TypeScript):** NuFast algorithm implementation
* **Visualization (p5.js):** Animation and plotting system
* **Utilities:** Color/math helpers and performance optimizers

## 5. User Interaction Flow
1. Load page with default parameters  
2. Change parameters via UI controls  
3. State updates trigger recalculation  
4. Visualizations update automatically:
   - Probability plot redraws
   - Neutrino color blends accordingly
   - Starfield movement responds to speed changes
5. Toggle animation controls to pause/resume simulation  

## 6. Technical Stack
* **Core:** TypeScript + Vite  
* **Visualization:** p5.js  
* **UI Framework:** Alpine.js  
* **Styling:** CSS  
* **Math Rendering:** KaTeX  
* **Testing:** Vitest  

## 7. Architecture Principles
* Reactive data flow
* Modular component design
* Performance optimization
* Type safety
* Maintainable code structure
