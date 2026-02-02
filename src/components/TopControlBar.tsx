import type React from "react";
import { useId } from "react";
import { useSimulation } from "../context/SimulationContext";

const FLAVORS = [
	{ label: "Electron (νₑ)", value: "electron", color: "rgb(59, 130, 246)" },
	{ label: "Muon (νμ)", value: "muon", color: "rgb(251, 146, 60)" },
	{ label: "Tau (ντ)", value: "tau", color: "rgb(217, 70, 239)" },
];

// Styled slider component with proper thumb styling
interface StyledSliderProps {
	value: number;
	min: number;
	max: number;
	step: number;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	color: string;
	label: string;
	unit: string;
	formatValue?: (val: number) => string;
	id: string;
}

const StyledSlider: React.FC<StyledSliderProps> = ({
	value,
	min,
	max,
	step,
	onChange,
	color,
	label,
	unit,
	formatValue,
	id,
}) => {
	const percentage = ((value - min) / (max - min)) * 100;
	const displayValue = formatValue ? formatValue(value) : value.toFixed(2);

	return (
		<div className="flex flex-col items-center min-w-[110px] group">
			<label
				htmlFor={id}
				className="text-[10px] uppercase tracking-widest text-white/50 mb-1.5 font-medium"
			>
				{label}
			</label>
			<div className="relative w-full">
				<input
					id={id}
					type="range"
					min={min}
					max={max}
					step={step}
					value={value}
					onChange={onChange}
					className="slider-input w-full h-2 rounded-full cursor-pointer transition-all"
					style={
						{
							"--slider-color": color,
							"--slider-percentage": `${percentage}%`,
						} as React.CSSProperties
					}
				/>
			</div>
			<span className="text-sm font-medium text-white/80 mt-1.5 tabular-nums">
				{displayValue}{" "}
				<span className="text-white/40 text-xs font-normal">{unit}</span>
			</span>
		</div>
	);
};

// Control button component
interface ControlButtonProps {
	onClick: () => void;
	ariaLabel: string;
	variant?: "primary" | "secondary";
	children: React.ReactNode;
}

const ControlButton: React.FC<ControlButtonProps> = ({
	onClick,
	ariaLabel,
	variant = "secondary",
	children,
}) => {
	const baseClasses =
		"w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95";
	const variantClasses =
		variant === "primary"
			? "bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 border border-cyan-400/30"
			: "bg-slate-800/90 hover:bg-slate-700/90 text-white/90 border border-white/10 hover:border-white/20";

	return (
		<button
			type="button"
			onClick={onClick}
			className={`${baseClasses} ${variantClasses}`}
			aria-label={ariaLabel}
		>
			{children}
		</button>
	);
};

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

	// Generate unique IDs for accessibility
	const flavorSelectId = useId();
	const energySliderId = useId();
	const speedSliderId = useId();
	const densitySliderId = useId();

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
		<>
			{/* Slider styles - injected once */}
			<style>{`
				.slider-input {
					-webkit-appearance: none;
					appearance: none;
					background: linear-gradient(
						to right,
						var(--slider-color) 0%,
						var(--slider-color) var(--slider-percentage),
						rgba(255, 255, 255, 0.1) var(--slider-percentage),
						rgba(255, 255, 255, 0.1) 100%
					);
					border-radius: 9999px;
				}
				
				.slider-input::-webkit-slider-thumb {
					-webkit-appearance: none;
					appearance: none;
					width: 16px;
					height: 16px;
					background: white;
					border-radius: 50%;
					cursor: pointer;
					box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3), 0 0 0 2px var(--slider-color);
					transition: transform 0.15s ease, box-shadow 0.15s ease;
				}
				
				.slider-input::-webkit-slider-thumb:hover {
					transform: scale(1.15);
					box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4), 0 0 0 3px var(--slider-color);
				}
				
				.slider-input::-webkit-slider-thumb:active {
					transform: scale(1.1);
				}
				
				.slider-input::-moz-range-thumb {
					width: 16px;
					height: 16px;
					background: white;
					border: none;
					border-radius: 50%;
					cursor: pointer;
					box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3), 0 0 0 2px var(--slider-color);
					transition: transform 0.15s ease, box-shadow 0.15s ease;
				}
				
				.slider-input::-moz-range-thumb:hover {
					transform: scale(1.15);
					box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4), 0 0 0 3px var(--slider-color);
				}
				
				.slider-input:focus {
					outline: none;
				}
				
				.slider-input:focus-visible::-webkit-slider-thumb {
					box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3), 0 0 0 3px var(--slider-color), 0 0 0 5px rgba(255, 255, 255, 0.3);
				}
				
				/* Custom select styling */
				.flavor-select {
					background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
					background-repeat: no-repeat;
					background-position: right 10px center;
					padding-right: 32px;
				}
				
				.flavor-select option {
					background-color: #1e293b;
					color: white;
					padding: 8px;
				}
			`}</style>

			<div className="fixed top-20 left-1/2 z-20 -translate-x-1/2 px-4">
				<div
					className="relative rounded-2xl shadow-2xl px-5 py-3 flex flex-wrap items-center justify-center gap-5 border border-white/[0.08] overflow-hidden"
					style={{
						background:
							"linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.75) 100%)",
						backdropFilter: "blur(20px) saturate(180%)",
						WebkitBackdropFilter: "blur(20px) saturate(180%)",
					}}
				>
					{/* Subtle inner glow */}
					<div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />

					{/* Flavor Dropdown */}
					<div className="flex flex-col items-center relative z-10">
						<label
							htmlFor={flavorSelectId}
							className="text-[10px] uppercase tracking-widest text-white/50 mb-1.5 font-medium"
						>
							Initial Flavor
						</label>
						<select
							id={flavorSelectId}
							className="flavor-select px-3 py-2 rounded-lg bg-slate-800/80 border border-white/10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 cursor-pointer transition-all hover:bg-slate-700/80 hover:border-white/20"
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

					{/* Divider */}
					<div className="w-px h-12 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

					{/* Energy Slider */}
					<div className="relative z-10">
						<StyledSlider
							id={energySliderId}
							value={state.energy}
							min={0.1}
							max={10}
							step={0.01}
							onChange={handleEnergyChange}
							color="rgb(59, 130, 246)"
							label="Energy"
							unit="GeV"
						/>
					</div>

					{/* Speed Slider */}
					<div className="relative z-10">
						<StyledSlider
							id={speedSliderId}
							value={state.speed}
							min={0}
							max={5}
							step={0.01}
							onChange={handleSpeedChange}
							color="rgb(251, 146, 60)"
							label="Speed"
							unit="×"
						/>
					</div>

					{/* Divider */}
					<div className="w-px h-12 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

					{/* Matter Effect Toggle */}
					<div className="flex flex-col items-center relative z-10">
						<span className="text-[10px] uppercase tracking-widest text-white/50 mb-1.5 font-medium">
							Matter Effect
						</span>
						<button
							type="button"
							aria-pressed={state.matter}
							onClick={() => setMatter(!state.matter)}
							className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 overflow-hidden ${
								state.matter
									? "text-white border border-purple-400/40"
									: "bg-slate-800/80 text-white/50 border border-white/10 hover:bg-slate-700/80 hover:border-white/20 hover:text-white/70"
							}`}
							style={
								state.matter
									? {
											background:
												"linear-gradient(135deg, rgba(147, 51, 234, 0.6) 0%, rgba(126, 34, 206, 0.8) 100%)",
											boxShadow:
												"0 4px 15px -3px rgba(147, 51, 234, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
										}
									: undefined
							}
						>
							{state.matter && (
								<div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 pointer-events-none" />
							)}
							<span className="relative z-10">
								{state.matter ? "ON" : "OFF"}
							</span>
						</button>
					</div>

					{/* Density (only if matter effect is on) */}
					{state.matter && (
						<div className="relative z-10">
							<StyledSlider
								id={densitySliderId}
								value={state.density}
								min={0}
								max={15}
								step={0.1}
								onChange={handleDensityChange}
								color="rgb(168, 85, 247)"
								label="Density"
								unit="g/cm³"
								formatValue={(val) => val.toFixed(1)}
							/>
						</div>
					)}

					{/* Divider */}
					<div className="w-px h-12 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

					{/* Play/Pause/Reset Controls */}
					<div className="flex items-center gap-2 relative z-10">
						{state.speed > 0 ? (
							<ControlButton onClick={handlePause} ariaLabel="Pause">
								<svg
									className="w-4 h-4"
									fill="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<rect x="6" y="4" width="4" height="16" rx="1" />
									<rect x="14" y="4" width="4" height="16" rx="1" />
								</svg>
							</ControlButton>
						) : (
							<ControlButton
								onClick={handlePlay}
								ariaLabel="Play"
								variant="primary"
							>
								<svg
									className="w-4 h-4 ml-0.5"
									fill="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path d="M8 5v14l11-7z" />
								</svg>
							</ControlButton>
						)}
						<ControlButton onClick={handleReset} ariaLabel="Reset">
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
						</ControlButton>
					</div>
				</div>
			</div>
		</>
	);
};

export default TopControlBar;
