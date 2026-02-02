import type React from "react";
import { useSimulation, EXPERIMENT_PRESETS } from "../context/SimulationContext";

const TopControlBar: React.FC = () => {
	const {
		state,
		setInitialFlavor,
		setEnergy,
		setSpeed,
		setMatter,
		setDeltaCP,
		setIsAntineutrino,
		setMassOrdering,
		applyPreset,
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
			<div className="hidden lg:flex items-center gap-4 text-white font-mono text-sm">
				{/* Experiment Presets */}
				<div className="flex items-center gap-2">
					<label htmlFor="preset" className="text-white/80 whitespace-nowrap">
						Preset:
					</label>
					<select
						id="preset"
						className="bg-transparent text-white rounded px-2 py-1 border border-white/20 focus:border-blue-400/50 focus:outline-none cursor-pointer"
						style={{ background: "rgba(30, 30, 40, 0.8)" }}
						onChange={(e) => {
							const preset = EXPERIMENT_PRESETS.find(p => p.name === e.target.value);
							if (preset) applyPreset(preset);
						}}
						defaultValue=""
					>
						<option value="" disabled style={{ background: "#1e1e28" }}>
							Select...
						</option>
						{EXPERIMENT_PRESETS.map((preset) => (
							<option key={preset.name} value={preset.name} style={{ background: "#1e1e28" }}>
								{preset.name}
							</option>
						))}
					</select>
				</div>

				{/* Neutrino/Antineutrino Toggle */}
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => setIsAntineutrino(!state.isAntineutrino)}
						className={`px-2 py-1 rounded border transition-colors ${
							state.isAntineutrino
								? "bg-purple-600/30 border-purple-400/50 text-purple-300"
								: "bg-blue-600/30 border-blue-400/50 text-blue-300"
						}`}
					>
						{state.isAntineutrino ? "ν̄" : "ν"}
					</button>
				</div>

				{/* Mass Ordering Toggle */}
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => setMassOrdering(state.massOrdering === "normal" ? "inverted" : "normal")}
						className={`px-2 py-1 rounded border transition-colors text-xs ${
							state.massOrdering === "normal"
								? "bg-green-600/30 border-green-400/50 text-green-300"
								: "bg-amber-600/30 border-amber-400/50 text-amber-300"
						}`}
						title={state.massOrdering === "normal" ? "Normal Ordering (m₁ < m₂ < m₃)" : "Inverted Ordering (m₃ < m₁ < m₂)"}
					>
						{state.massOrdering === "normal" ? "NO" : "IO"}
					</button>
				</div>

				{/* Initial Flavor */}
				<div className="flex items-center gap-2">
					<label htmlFor="initialFlavor" className="text-white/80 whitespace-nowrap">
						Flavor:
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
						E:
					</label>
					<input
						type="range"
						id="energy"
						className="w-20 accent-blue-500 cursor-pointer"
						min="0.1"
						max="10"
						step="0.01"
						value={state.energy}
						onChange={(e) => setEnergy(Number.parseFloat(e.target.value))}
					/>
					<span className="text-blue-400 w-12">{state.energy.toFixed(1)} GeV</span>
				</div>

				{/* δCP Slider */}
				<div className="flex items-center gap-2">
					<label htmlFor="deltaCP" className="text-white/80 whitespace-nowrap">
						δ<sub>CP</sub>:
					</label>
					<input
						type="range"
						id="deltaCP"
						className="w-20 accent-purple-500 cursor-pointer"
						min="0"
						max="360"
						step="1"
						value={state.deltaCP}
						onChange={(e) => setDeltaCP(Number.parseFloat(e.target.value))}
					/>
					<span className="text-purple-400 w-10">{state.deltaCP}°</span>
				</div>

				{/* Speed Slider */}
				<div className="flex items-center gap-2">
					<label htmlFor="speed" className="text-white/80 whitespace-nowrap">
						Speed:
					</label>
					<input
						type="range"
						id="speed"
						className="w-20 accent-blue-500 cursor-pointer"
						min="0"
						max="5"
						step="0.01"
						value={state.speed}
						onChange={(e) => setSpeed(Number.parseFloat(e.target.value))}
					/>
					<span className="text-white/80 w-10">{state.speed.toFixed(1)}x</span>
				</div>

				{/* Matter Effect Toggle */}
				<div className="flex items-center gap-2">
					<label htmlFor="matterEffect" className="text-white/80 whitespace-nowrap">
						Matter:
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

			{/* Mobile/Tablet layout - three rows */}
			<div className="lg:hidden flex flex-col gap-3 text-white font-mono text-xs">
				{/* Row 1: Preset and ν/ν̄ toggle */}
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-2">
						<select
							className="bg-transparent text-white rounded px-1 py-0.5 border border-white/20 focus:outline-none cursor-pointer text-xs"
							style={{ background: "rgba(30, 30, 40, 0.8)" }}
							onChange={(e) => {
								const preset = EXPERIMENT_PRESETS.find(p => p.name === e.target.value);
								if (preset) applyPreset(preset);
							}}
							defaultValue=""
						>
							<option value="" disabled style={{ background: "#1e1e28" }}>Preset</option>
							{EXPERIMENT_PRESETS.map((preset) => (
								<option key={preset.name} value={preset.name} style={{ background: "#1e1e28" }}>
									{preset.name}
								</option>
							))}
						</select>
					</div>
					<button
						type="button"
						onClick={() => setIsAntineutrino(!state.isAntineutrino)}
						className={`px-2 py-0.5 rounded border transition-colors text-xs ${
							state.isAntineutrino
								? "bg-purple-600/30 border-purple-400/50 text-purple-300"
								: "bg-blue-600/30 border-blue-400/50 text-blue-300"
						}`}
					>
						{state.isAntineutrino ? "ν̄" : "ν"}
					</button>
					<button
						type="button"
						onClick={() => setMassOrdering(state.massOrdering === "normal" ? "inverted" : "normal")}
						className={`px-2 py-0.5 rounded border transition-colors text-xs ${
							state.massOrdering === "normal"
								? "bg-green-600/30 border-green-400/50 text-green-300"
								: "bg-amber-600/30 border-amber-400/50 text-amber-300"
						}`}
					>
						{state.massOrdering === "normal" ? "NO" : "IO"}
					</button>
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

				{/* Row 2: Energy and δCP */}
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
						<span className="text-blue-400 w-12 text-right">{state.energy.toFixed(1)}</span>
					</div>
					<div className="flex items-center gap-1 flex-1">
						<label htmlFor="deltaCPMobile" className="text-white/80">δ:</label>
						<input
							type="range"
							id="deltaCPMobile"
							className="flex-1 accent-purple-500 cursor-pointer"
							min="0"
							max="360"
							step="5"
							value={state.deltaCP}
							onChange={(e) => setDeltaCP(Number.parseFloat(e.target.value))}
						/>
						<span className="text-purple-400 w-10 text-right">{state.deltaCP}°</span>
					</div>
				</div>

				{/* Row 3: Speed */}
				<div className="flex items-center gap-1">
					<label htmlFor="speedMobile" className="text-white/80">Speed:</label>
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
	);
};

export default TopControlBar;
