import React from 'react';
import { useSimulation } from '../context/SimulationContext';

const ControlsPanel: React.FC = () => {
  const { state, setInitialFlavor, setEnergy, setSpeed, setMatter, setDensity } = useSimulation();

  return (
    <div style={{ position: 'absolute', top: '20px', left: '20px', background: 'white', padding: '20px', border: '1px solid black', zIndex: 1000 }}>
      <h2>Controls Panel</h2>
      <div>
        <label htmlFor="initialFlavor">Initial Flavor:</label>
        <select
          id="initialFlavor"
          value={state.initialFlavor}
          onChange={(e) => setInitialFlavor(e.target.value as 'electron' | 'muon' | 'tau')}
        >
          <option value="electron">Electron</option>
          <option value="muon">Muon</option>
          <option value="tau">Tau</option>
        </select>
      </div>
      <div>
        <label htmlFor="energy">Energy ({state.energy.toFixed(2)} GeV):</label>
        <input
          type="range"
          id="energy"
          min="0.1"
          max="10"
          step="0.01"
          value={state.energy}
          onChange={(e) => setEnergy(parseFloat(e.target.value))}
        />
      </div>
      <div>
        <label htmlFor="speed">Speed ({state.speed.toFixed(2)}x c):</label>
        <input
          type="range"
          id="speed"
          min="0.1"
          max="3"
          step="0.01"
          value={state.speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
        />
      </div>
      <div>
        <label htmlFor="matterEffect">Matter Effect:</label>
        <input
          type="checkbox"
          id="matterEffect"
          checked={state.matter}
          onChange={(e) => setMatter(e.target.checked)}
        />
      </div>
      {state.matter && (
        <div>
          <label htmlFor="density">Density ({state.density.toFixed(2)} g/cm³):</label>
          <input
            type="range"
            id="density"
            min="0"
            max="10"
            step="0.01"
            value={state.density}
            onChange={(e) => setDensity(parseFloat(e.target.value))}
          />
        </div>
      )}
    </div>
  );
};

export default ControlsPanel;