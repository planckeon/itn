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
	} = useSimulation();

	return (
		<div className="absolute top-5 left-5 bg-[rgba(20,20,30,0.85)] rounded-xl shadow-lg p-6 z-10 text-white font-mono">
			<h2 className="text-xl mb-4">Controls Panel</h2>
			<div className="space-y-4">
				<div className="flex items-center gap-2">
					<label htmlFor="initialFlavor" className="text-sm">
						Initial Flavor:
					</label>
					<select
						id="initialFlavor"
						className="bg-gray-800 text-white rounded px-2 py-1 text-sm border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
						value={state.initialFlavor}
						onChange={(e) =>
							setInitialFlavor(e.target.value as "electron" | "muon" | "tau")
						}
					>
						<option value="electron">Electron</option>
						<option value="muon">Muon</option>
						<option value="tau">Tau</option>
					</select>
				</div>
				<div className="space-y-1">
					<label htmlFor="energy" className="text-sm block">
						Energy ({state.energy.toFixed(2)} GeV):
					</label>
					<input
						type="range"
						id="energy"
						className="w-full accent-blue-500"
						min="0.1"
						max="10"
						step="0.01"
						value={state.energy}
						onChange={(e) => setEnergy(Number.parseFloat(e.target.value))}
					/>
				</div>
				<div className="space-y-1">
					<label htmlFor="speed" className="text-sm block">
						Speed ({state.speed.toFixed(2)}x c):
					</label>
					<input
						type="range"
						id="speed"
						className="w-full accent-orange-500"
						min="0.1"
						max="3"
						step="0.01"
						value={state.speed}
						onChange={(e) => setSpeed(Number.parseFloat(e.target.value))}
					/>
				</div>
				<div className="flex items-center gap-2">
					<label htmlFor="matterEffect" className="text-sm">
						Matter Effect:
					</label>
					<input
						type="checkbox"
						id="matterEffect"
						className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
						checked={state.matter}
						onChange={(e) => setMatter(e.target.checked)}
					/>
				</div>
				{state.matter && (
					<div className="space-y-1">
						<label htmlFor="density" className="text-sm block">
							Density ({state.density.toFixed(2)} g/cm³):
						</label>
						<input
							type="range"
							id="density"
							className="w-full accent-purple-500"
							min="0"
							max="10"
							step="0.01"
							value={state.density}
							onChange={(e) => setDensity(Number.parseFloat(e.target.value))}
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export default ControlsPanel;
