import type React from "react";
import { useSimulation } from "../context/SimulationContext";

const ControlsPanel: React.FC = () => {
	const {
		state,
		setInitialFlavor,
		setEnergy,
		setSpeed,
		setMatter,
		setDensity,
		resetSimulation,
	} = useSimulation();

	return (
		<div className="fixed top-5 left-5 bg-black/60 backdrop-blur-sm rounded-xl shadow-lg p-5 z-10 text-white font-mono border border-white/10 max-w-[280px]">
			<h2 className="text-sm uppercase tracking-widest text-white/70 mb-4">
				Controls
			</h2>
			<div className="space-y-4">
				{/* Initial Flavor */}
				<div className="space-y-1.5">
					<label
						htmlFor="initialFlavor"
						className="text-xs text-white/60 block"
					>
						Initial Flavor
					</label>
					<select
						id="initialFlavor"
						className="w-full bg-white/10 text-white rounded-lg px-3 py-2 text-sm border border-white/10 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 cursor-pointer"
						value={state.initialFlavor}
						onChange={(e) =>
							setInitialFlavor(e.target.value as "electron" | "muon" | "tau")
						}
					>
						<option value="electron" className="bg-gray-900">
							Electron (νₑ)
						</option>
						<option value="muon" className="bg-gray-900">
							Muon (νμ)
						</option>
						<option value="tau" className="bg-gray-900">
							Tau (ντ)
						</option>
					</select>
				</div>

				{/* Energy Slider */}
				<div className="space-y-1.5">
					<label htmlFor="energy" className="text-xs text-white/60 block">
						Energy:{" "}
						<span className="text-blue-400">{state.energy.toFixed(2)} GeV</span>
					</label>
					<input
						type="range"
						id="energy"
						className="w-full accent-blue-500 h-1.5 bg-white/10 rounded-full cursor-pointer"
						min="0.1"
						max="10"
						step="0.01"
						value={state.energy}
						onChange={(e) => setEnergy(Number.parseFloat(e.target.value))}
					/>
				</div>

				{/* Speed Slider */}
				<div className="space-y-1.5">
					<label htmlFor="speed" className="text-xs text-white/60 block">
						Speed:{" "}
						<span className="text-orange-400">{state.speed.toFixed(2)}×</span>
					</label>
					<input
						type="range"
						id="speed"
						className="w-full accent-orange-500 h-1.5 bg-white/10 rounded-full cursor-pointer"
						min="0"
						max="5"
						step="0.01"
						value={state.speed}
						onChange={(e) => setSpeed(Number.parseFloat(e.target.value))}
					/>
				</div>

				{/* Matter Effect Toggle */}
				<div className="flex items-center gap-3">
					<input
						type="checkbox"
						id="matterEffect"
						className="h-4 w-4 rounded border-white/30 text-purple-600 focus:ring-purple-500 cursor-pointer"
						checked={state.matter}
						onChange={(e) => setMatter(e.target.checked)}
					/>
					<label
						htmlFor="matterEffect"
						className="text-xs text-white/60 cursor-pointer"
					>
						Matter Effect
					</label>
				</div>

				{/* Density Slider (conditional) */}
				{state.matter && (
					<div className="space-y-1.5">
						<label htmlFor="density" className="text-xs text-white/60 block">
							Density:{" "}
							<span className="text-purple-400">
								{state.density.toFixed(2)} g/cm³
							</span>
						</label>
						<input
							type="range"
							id="density"
							className="w-full accent-purple-500 h-1.5 bg-white/10 rounded-full cursor-pointer"
							min="0"
							max="15"
							step="0.1"
							value={state.density}
							onChange={(e) => setDensity(Number.parseFloat(e.target.value))}
						/>
					</div>
				)}

				{/* Reset Button */}
				<button
					type="button"
					onClick={resetSimulation}
					className="w-full mt-2 py-2 px-4 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs uppercase tracking-widest rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200"
				>
					Reset
				</button>
			</div>
		</div>
	);
};

export default ControlsPanel;
