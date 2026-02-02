import type React from "react";
import { useSimulation } from "../context/SimulationContext";

const TopControlBar: React.FC = () => {
	const {
		state,
		setInitialFlavor,
		setEnergy,
		setSpeed,
		setMatter,
	} = useSimulation();

	return (
		<div
			className="fixed top-4 left-1/2 -translate-x-1/2 z-20 max-w-[95vw]"
			style={{
				background: "rgba(20, 20, 30, 0.9)",
				backdropFilter: "blur(8px)",
				borderRadius: "8px",
				padding: "12px 16px",
				border: "1px solid rgba(255, 255, 255, 0.1)",
			}}
		>
			{/* Desktop layout */}
			<div className="hidden md:flex items-center gap-6 text-white font-mono text-sm">
				{/* Initial Flavor */}
				<div className="flex items-center gap-2">
					<label htmlFor="initialFlavor" className="text-white/80 whitespace-nowrap">
						Initial Flavor:
					</label>
					<select
						id="initialFlavor"
						className="bg-transparent text-white rounded px-2 py-1 border border-white/20 focus:border-blue-400/50 focus:outline-none cursor-pointer"
						style={{ background: "rgba(30, 30, 40, 0.8)" }}
						value={state.initialFlavor}
						onChange={(e) =>
							setInitialFlavor(e.target.value as "electron" | "muon" | "tau")
						}
					>
						<option value="electron" style={{ background: "#1e1e28" }}>
							Electron
						</option>
						<option value="muon" style={{ background: "#1e1e28" }}>
							Muon
						</option>
						<option value="tau" style={{ background: "#1e1e28" }}>
							Tau
						</option>
					</select>
				</div>

				{/* Energy Slider */}
				<div className="flex items-center gap-2">
					<label htmlFor="energy" className="text-white/80 whitespace-nowrap">
						Energy (GeV):
					</label>
					<input
						type="range"
						id="energy"
						className="w-32 accent-blue-500 cursor-pointer"
						min="0.1"
						max="10"
						step="0.01"
						value={state.energy}
						onChange={(e) => setEnergy(Number.parseFloat(e.target.value))}
					/>
					<span className="text-blue-400 w-10">{state.energy.toFixed(1)}</span>
				</div>

				{/* Speed Slider */}
				<div className="flex items-center gap-2">
					<label htmlFor="speed" className="text-white/80 whitespace-nowrap">
						Speed:
					</label>
					<input
						type="range"
						id="speed"
						className="w-32 accent-blue-500 cursor-pointer"
						min="0"
						max="5"
						step="0.01"
						value={state.speed}
						onChange={(e) => setSpeed(Number.parseFloat(e.target.value))}
					/>
					<span className="text-white/80 w-14">{state.speed.toFixed(2)}x</span>
				</div>

				{/* Matter Effect Toggle */}
				<div className="flex items-center gap-2">
					<label htmlFor="matterEffect" className="text-white/80 whitespace-nowrap">
						Matter effect:
					</label>
					<input
						type="checkbox"
						id="matterEffect"
						className="h-4 w-4 rounded border-white/30 cursor-pointer accent-blue-500"
						checked={state.matter}
						onChange={(e) => setMatter(e.target.checked)}
					/>
				</div>
			</div>

			{/* Mobile layout - two rows */}
			<div className="md:hidden flex flex-col gap-3 text-white font-mono text-xs">
				{/* Row 1: Flavor and Matter */}
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-2">
						<label htmlFor="initialFlavorMobile" className="text-white/80">
							Flavor:
						</label>
						<select
							id="initialFlavorMobile"
							className="bg-transparent text-white rounded px-1 py-0.5 border border-white/20 focus:outline-none cursor-pointer text-xs"
							style={{ background: "rgba(30, 30, 40, 0.8)" }}
							value={state.initialFlavor}
							onChange={(e) =>
								setInitialFlavor(e.target.value as "electron" | "muon" | "tau")
							}
						>
							<option value="electron" style={{ background: "#1e1e28" }}>νₑ</option>
							<option value="muon" style={{ background: "#1e1e28" }}>νμ</option>
							<option value="tau" style={{ background: "#1e1e28" }}>ντ</option>
						</select>
					</div>
					<div className="flex items-center gap-2">
						<label htmlFor="matterEffectMobile" className="text-white/80">
							Matter:
						</label>
						<input
							type="checkbox"
							id="matterEffectMobile"
							className="h-4 w-4 rounded border-white/30 cursor-pointer accent-blue-500"
							checked={state.matter}
							onChange={(e) => setMatter(e.target.checked)}
						/>
					</div>
				</div>

				{/* Row 2: Energy and Speed */}
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-1 flex-1">
						<label htmlFor="energyMobile" className="text-white/80">E:</label>
						<input
							type="range"
							id="energyMobile"
							className="flex-1 accent-blue-500 cursor-pointer"
							min="0.1"
							max="10"
							step="0.1"
							value={state.energy}
							onChange={(e) => setEnergy(Number.parseFloat(e.target.value))}
						/>
						<span className="text-blue-400 w-8 text-right">{state.energy.toFixed(1)}</span>
					</div>
					<div className="flex items-center gap-1 flex-1">
						<label htmlFor="speedMobile" className="text-white/80">v:</label>
						<input
							type="range"
							id="speedMobile"
							className="flex-1 accent-blue-500 cursor-pointer"
							min="0"
							max="5"
							step="0.1"
							value={state.speed}
							onChange={(e) => setSpeed(Number.parseFloat(e.target.value))}
						/>
						<span className="text-white/80 w-10 text-right">{state.speed.toFixed(1)}x</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TopControlBar;
