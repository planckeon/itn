import type React from "react";
import { useSimulation } from "../context/SimulationContext";

const FLAVORS = [
	{ label: "Electron (νₑ)", value: "electron", color: "rgb(59, 130, 246)" },
	{ label: "Muon (νμ)", value: "muon", color: "rgb(251, 146, 60)" },
	{ label: "Tau (ντ)", value: "tau", color: "rgb(217, 70, 239)" },
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

	const handleDensityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setDensity(Number(e.target.value));
	};

	// Animation controls
	const handlePlay = () => setSpeed(state.speed || 1);
	const handlePause = () => setSpeed(0);
	const handleReset = () => resetSimulation();

	const selectedFlavor = FLAVORS.find((f) => f.value === state.initialFlavor);

	return (
		<div className="fixed top-14 left-1/2 z-20 -translate-x-1/2">
			<div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl px-6 py-3 flex flex-wrap items-center gap-6 border border-white/10">
				{/* Flavor Dropdown */}
				<div className="flex flex-col items-start">
					<label className="text-[10px] uppercase tracking-widest text-white/60 mb-1">
						Initial Flavor
					</label>
					<select
						className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-white/10 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer transition-all"
						style={{
							color: selectedFlavor?.color,
						}}
						value={state.initialFlavor}
						onChange={handleFlavorChange}
					>
						{FLAVORS.map((f) => (
							<option key={f.value} value={f.value}>
								{f.label}
							</option>
						))}
					</select>
				</div>

				{/* Energy Slider */}
				<div className="flex flex-col items-center min-w-[120px]">
					<label className="text-[10px] uppercase tracking-widest text-white/60 mb-1">
						Energy
					</label>
					<input
						type="range"
						min={0.1}
						max={10}
						step={0.01}
						value={state.energy}
						onChange={handleEnergyChange}
						className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
						style={{
							background: `linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(59, 130, 246) ${((state.energy - 0.1) / 9.9) * 100}%, rgba(255,255,255,0.1) ${((state.energy - 0.1) / 9.9) * 100}%, rgba(255,255,255,0.1) 100%)`,
						}}
					/>
					<span className="text-sm font-medium text-white/80 mt-1 tabular-nums">
						{state.energy.toFixed(2)}{" "}
						<span className="text-white/40 text-xs">GeV</span>
					</span>
				</div>

				{/* Speed Slider */}
				<div className="flex flex-col items-center min-w-[120px]">
					<label className="text-[10px] uppercase tracking-widest text-white/60 mb-1">
						Simulation Speed
					</label>
					<input
						type="range"
						min={0}
						max={5}
						step={0.01}
						value={state.speed}
						onChange={handleSpeedChange}
						className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
						style={{
							background: `linear-gradient(to right, rgb(251, 146, 60) 0%, rgb(251, 146, 60) ${(state.speed / 5) * 100}%, rgba(255,255,255,0.1) ${(state.speed / 5) * 100}%, rgba(255,255,255,0.1) 100%)`,
						}}
					/>
					<span className="text-sm font-medium text-white/80 mt-1 tabular-nums">
						{state.speed.toFixed(2)}
						<span className="text-white/40 text-xs">x</span>
					</span>
				</div>

				{/* Divider */}
				<div className="w-px h-10 bg-white/10" />

				{/* Matter Effect Toggle */}
				<div className="flex flex-col items-center">
					<label className="text-[10px] uppercase tracking-widest text-white/60 mb-1">
						Matter Effect
					</label>
					<button
						type="button"
						onClick={() => setMatter(!state.matter)}
						className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
							state.matter
								? "bg-purple-600/80 text-white border border-purple-400/30"
								: "bg-slate-800/80 text-white/50 border border-white/10 hover:bg-slate-700/80"
						}`}
					>
						{state.matter ? "ON" : "OFF"}
					</button>
				</div>

				{/* Density (only if matter effect is on) */}
				{state.matter && (
					<div className="flex flex-col items-center min-w-[100px]">
						<label className="text-[10px] uppercase tracking-widest text-white/60 mb-1">
							Density
						</label>
						<input
							type="range"
							min={0}
							max={15}
							step={0.1}
							value={state.density}
							onChange={handleDensityChange}
							className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
							style={{
								background: `linear-gradient(to right, rgb(168, 85, 247) 0%, rgb(168, 85, 247) ${(state.density / 15) * 100}%, rgba(255,255,255,0.1) ${(state.density / 15) * 100}%, rgba(255,255,255,0.1) 100%)`,
							}}
						/>
						<span className="text-sm font-medium text-white/80 mt-1 tabular-nums">
							{state.density.toFixed(1)}{" "}
							<span className="text-white/40 text-xs">g/cm³</span>
						</span>
					</div>
				)}

				{/* Divider */}
				<div className="w-px h-10 bg-white/10" />

				{/* Play/Pause/Reset Controls */}
				<div className="flex items-center gap-2">
					{state.speed > 0 ? (
						<button
							type="button"
							onClick={handlePause}
							className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white flex items-center justify-center border border-white/10 transition-all hover:scale-105"
							aria-label="Pause"
						>
							<svg
								className="w-4 h-4"
								fill="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<rect x="6" y="4" width="4" height="16" rx="1" />
								<rect x="14" y="4" width="4" height="16" rx="1" />
							</svg>
						</button>
					) : (
						<button
							type="button"
							onClick={handlePlay}
							className="w-10 h-10 rounded-xl bg-cyan-600/80 hover:bg-cyan-500/80 text-white flex items-center justify-center border border-cyan-400/30 transition-all hover:scale-105"
							aria-label="Play"
						>
							<svg
								className="w-4 h-4 ml-0.5"
								fill="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path d="M8 5v14l11-7z" />
							</svg>
						</button>
					)}
					<button
						type="button"
						onClick={handleReset}
						className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white flex items-center justify-center border border-white/10 transition-all hover:scale-105"
						aria-label="Reset"
					>
						<svg
							className="w-4 h-4"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	);
};

export default TopControlBar;
