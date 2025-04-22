import React from 'react';
import { SimulationProvider } from './context/SimulationContext';
import ControlsPanel from './components/ControlsPanel';
import Starfield from './components/Starfield';
import VisualizationArea from './components/VisualizationArea';
import './App.css';

function App() {
  return (
    <SimulationProvider>
      <div className="App">
        <h1>Neutrino Oscillation Visualization</h1>
        <ControlsPanel />
        <VisualizationArea />
        <Starfield />
      </div>
    </SimulationProvider>
  );
}

export default App;
