import type React from "react";
import { useSimulation } from "../context/SimulationContext";

const FLAVORS = [
	{ label: "Electron", value: "electron" },
	{ label: "Muon", value: "muon" },
	{ label: "Tau", value: "tau" },
];

const TopControlBar: React.FC = () => {
	const {
		state,
		setInitialFlavor,
		setEnergy,
		setSpeed,
		setMatter,
		setDensity,
		resetSimulation,
	} = useSimulation();

	// Handlers
	const handleFlavorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setInitialFlavor(e.target.value as "electron" | "muon" | "tau");
	};

	const handleEnergyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEnergy(Number(e.target.value));
	};

	const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSpeed(Number(e.target.value));
	};

	const handleMatterEffectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setMatter(e.target.checked);
	};

	const handleDensityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setDensity(Number(e.target.value));
	};

	// Animation controls
	const handlePlay = () => setSpeed(state.speed || 1); // Resume animation
	const handlePause = () => setSpeed(0); // Pause animation
	const handleReset = () => resetSimulation();

	return (
		<div className="fixed top-4 left-1/2 z-20 -translate-x-1/2 bg-neutral-900/95 rounded-lg shadow-xl px-4 py-1.5 flex flex-wrap items-center gap-3 border border-neutral-800 max-w-3xl w-full justify-center backdrop-blur-sm">
			{/* Flavor Dropdown */}
			<label className="flex flex-col items-center text-xs font-medium text-neutral-300">
				<span className="text-xs text-neutral-400">Flavor</span>
				<select
					className="mt-0.5 px-2 py-0.5 rounded-md bg-neutral-800 border border-neutral-700 text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
					value={state.initialFlavor}
					onChange={handleFlavorChange}
				>
					{FLAVORS.map((f) => (
						<option key={f.value} value={f.value}>
							{f.label}
						</option>
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
					value={state.energy}
					onChange={handleEnergyChange}
					className="w-full h-1.5 accent-blue-500"
				/>
				<span className="text-[10px] mt-0.5 text-neutral-300">
					{state.energy.toFixed(2)} GeV
				</span>
			</label>

			{/* Speed Slider */}
			<label className="flex flex-col items-center text-xs font-medium text-neutral-300 w-32">
				<span className="text-xs text-neutral-400">Speed</span>
				<input
					type="range"
					min={0.1}
					max={5}
					step={0.01}
					value={state.speed}
					onChange={handleSpeedChange}
					className="w-full h-1.5 accent-orange-500"
				/>
				<span className="text-[10px] mt-0.5 text-neutral-300">
					{state.speed.toFixed(2)}x
				</span>
			</label>

			{/* Matter Effect Checkbox */}
			<label className="flex items-center gap-1.5 text-xs text-neutral-400">
				<input
					type="checkbox"
					checked={state.matter}
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
					value={state.density}
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
					value={state.distance.toFixed(0)}
					readOnly
					className="mt-0.5 px-2 py-0.5 rounded-md bg-neutral-800 border border-neutral-700 text-neutral-100 w-full text-xs"
				/>
				<span className="text-[10px] mt-0.5 text-neutral-300">km</span>
			</label>

			{/* Play/Pause/Reset Buttons */}
			<div className="flex items-center gap-1.5 ml-1">
				{state.speed > 0 ? (
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
