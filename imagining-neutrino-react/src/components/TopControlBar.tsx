import React from "react";
import { useAppState } from "../state";
/* Removed unused import: matterDensityPresets */

const FLAVORS = [
  { label: "Electron", value: 0 },
  { label: "Muon", value: 1 },
  { label: "Tau", value: 2 },
];

const TopControlBar: React.FC = () => {
  const { simParams, animation } = useAppState();
  const [simState, simDispatch] = simParams;
  const [animState, animDispatch] = animation;

  // Handlers
  const handleFlavorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    simDispatch({ type: "SET_PARAM", key: "initialFlavorIndex", value: Number(e.target.value) });
  };

  const handleEnergyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    simDispatch({ type: "SET_PARAM", key: "energy", value: Number(e.target.value) });
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    animDispatch({ type: "SET_SPEED", value: Number(e.target.value) });
  };

  const handleMatterEffectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    simDispatch({ type: "TOGGLE_MATTER_EFFECT", value: e.target.checked });
  };

  const handleDensityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    simDispatch({ type: "SET_DENSITY", value: Number(e.target.value) });
  };

  const handleMaxLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    simDispatch({ type: "SET_PARAM", key: "maxL", value: Number(e.target.value) });
  };

  // Animation controls
  const handlePlay = () => animDispatch({ type: "PLAY" });
  const handlePause = () => animDispatch({ type: "PAUSE" });
  const handleReset = () => animDispatch({ type: "RESET" });

  return (
    <div className="fixed top-4 left-1/2 z-20 -translate-x-1/2 bg-neutral-900/95 rounded-lg shadow-xl px-4 py-1.5 flex flex-wrap items-center gap-3 border border-neutral-800 max-w-3xl w-full justify-center backdrop-blur-sm">
      {/* Flavor Dropdown */}
      <label className="flex flex-col items-center text-xs font-medium text-neutral-300">
        <span className="text-xs text-neutral-400">Flavor</span>
        <select
          className="mt-0.5 px-2 py-0.5 rounded-md bg-neutral-800 border border-neutral-700 text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
          value={simState.initialFlavorIndex}
          onChange={handleFlavorChange}
        >
          {FLAVORS.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </label>

      {/* Energy Slider */}
      <label className="flex flex-col items-center text-xs font-medium text-neutral-300 w-32">
        <span className="text-xs text-neutral-400">Energy</span>
        <input
          type="range"
          min={0.1}
          max={10}
          step={0.01}
          value={simState.energy}
          onChange={handleEnergyChange}
          className="w-full h-1.5 accent-blue-500"
        />
        <span className="text-[10px] mt-0.5 text-neutral-300">{simState.energy.toFixed(2)} GeV</span>
      </label>

      {/* Speed Slider */}
      <label className="flex flex-col items-center text-xs font-medium text-neutral-300 w-32">
        <span className="text-xs text-neutral-400">Speed</span>
        <input
          type="range"
          min={0.1}
          max={5}
          step={0.01}
          value={animState.simSpeed}
          onChange={handleSpeedChange}
          className="w-full h-1.5 accent-orange-500"
        />
        <span className="text-[10px] mt-0.5 text-neutral-300">{animState.simSpeed.toFixed(2)}x</span>
      </label>

      {/* Matter Effect Checkbox */}
      <label className="flex items-center gap-1.5 text-xs text-neutral-400">
        <input
          type="checkbox"
          checked={!!simState.matterEffect}
          onChange={handleMatterEffectChange}
          className="h-3.5 w-3.5 accent-purple-500 rounded focus:ring-1 focus:ring-purple-500"
        />
        <span>Matter</span>
      </label>

      {/* Density Input */}
      <label className="flex flex-col items-center text-xs font-medium text-neutral-300 w-28">
        <span className="text-xs text-neutral-400">Density</span>
        <input
          type="number"
          min={0}
          max={200}
          step={0.01}
          value={simState.rho ?? 0}
          onChange={handleDensityChange}
          className="mt-0.5 px-2 py-0.5 rounded-md bg-neutral-800 border border-neutral-700 text-neutral-100 w-full text-xs"
        />
        <span className="text-[10px] mt-0.5 text-neutral-300">g/cm³</span>
      </label>

      {/* Max Distance Input */}
      <label className="flex flex-col items-center text-xs font-medium text-neutral-300 w-32">
        <span className="text-xs text-neutral-400">Max Dist</span>
        <input
          type="number"
          min={10}
          max={20000}
          step={1}
          value={simState.maxL}
          onChange={handleMaxLChange}
          className="mt-0.5 px-2 py-0.5 rounded-md bg-neutral-800 border border-neutral-700 text-neutral-100 w-full text-xs"
        />
        <span className="text-[10px] mt-0.5 text-neutral-300">km</span>
      </label>

      {/* Play/Pause/Reset Buttons */}
      <div className="flex items-center gap-1.5 ml-1">
        {animState.isPlaying ? (
          <button
            onClick={handlePause}
            className="px-2.5 py-0.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-xs font-medium shadow-sm border border-neutral-700"
            aria-label="Pause"
          >
            ❚❚
          </button>
        ) : (
          <button
            onClick={handlePlay}
            className="px-2.5 py-0.5 rounded-md bg-blue-600 hover:bg-blue-500 text-neutral-100 text-xs font-medium shadow-sm border border-blue-700"
            aria-label="Play"
          >
            ▶
          </button>
        )}
        <button
          onClick={handleReset}
          className="px-2.5 py-0.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-xs font-medium shadow-sm border border-neutral-700"
          aria-label="Reset"
        >
          ⟳
        </button>
      </div>
    </div>
  );
};

export default TopControlBar;