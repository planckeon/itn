import type React from "react";
import { useMemo } from "react";
import { useSimulation } from "../context/SimulationContext";
import NeutrinoSphere from "./NeutrinoSphere";

// Flavor color mapping with enhanced styling
const FLAVOR_CONFIG = {
	electron: {
		name: "Electron",
		symbol: "νₑ",
		color: "rgb(59, 130, 246)",
		gradient: "from-blue-500 to-blue-600",
		glow: "shadow-blue-500/50",
		bgGlow: "rgba(59, 130, 246, 0.15)",
	},
	muon: {
		name: "Muon",
		symbol: "νμ",
		color: "rgb(251, 146, 60)",
		gradient: "from-orange-400 to-orange-500",
		glow: "shadow-orange-400/50",
		bgGlow: "rgba(251, 146, 60, 0.15)",
	},
	tau: {
		name: "Tau",
		symbol: "ντ",
		color: "rgb(217, 70, 239)",
		gradient: "from-fuchsia-500 to-fuchsia-600",
		glow: "shadow-fuchsia-500/50",
		bgGlow: "rgba(217, 70, 239, 0.15)",
	},
} as const;

const VisualizationArea: React.FC = () => {
	const { state } = useSimulation();
	const { probabilityHistory, distance, initialFlavor } = state;

	// Get latest probabilities
	const latestProbs = useMemo(() => {
		if (probabilityHistory.length === 0) {
			return { Pe: 1, Pmu: 0, Ptau: 0 };
		}
		return probabilityHistory[probabilityHistory.length - 1];
	}, [probabilityHistory]);

	// Determine dominant flavor
	const dominantFlavor = useMemo(() => {
		const { Pe, Pmu, Ptau } = latestProbs;
		if (Pe >= Pmu && Pe >= Ptau) return "electron";
		if (Pmu >= Pe && Pmu >= Ptau) return "muon";
		return "tau";
	}, [latestProbs]);

	const dominantConfig = FLAVOR_CONFIG[dominantFlavor];
	const initialConfig = FLAVOR_CONFIG[initialFlavor];

	return (
		<div className="relative flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 px-4">
			{/* Left side: Initial state + Sphere */}
			<div className="flex flex-col items-center gap-4">
				{/* Initial flavor indicator - compact badge */}
				<div
					className="px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 text-center"
					style={{
						background: `linear-gradient(135deg, ${initialConfig.bgGlow}, rgba(15, 23, 42, 0.6))`,
						boxShadow: `0 0 20px ${initialConfig.bgGlow}`,
					}}
				>
					<p className="text-[9px] uppercase tracking-[0.15em] text-white/50 mb-0.5 font-medium">
						Initial State
					</p>
					<div className="flex items-center justify-center gap-1.5">
						<span
							className="text-xl font-semibold"
							style={{ color: initialConfig.color }}
						>
							{initialConfig.symbol}
						</span>
						<span
							className="text-sm font-medium"
							style={{ color: initialConfig.color }}
						>
							{initialConfig.name}
						</span>
					</div>
				</div>

				{/* Neutrino visualization sphere */}
				<div className="relative">
					<NeutrinoSphere />
				</div>

				{/* Distance traveled - compact inline */}
				<div
					className="px-6 py-2.5 rounded-xl backdrop-blur-md border border-white/10 text-center"
					style={{
						background: "linear-gradient(135deg, rgba(56, 189, 248, 0.08), rgba(15, 23, 42, 0.6))",
						boxShadow: "0 0 25px rgba(56, 189, 248, 0.1)",
					}}
				>
					<p className="text-[9px] uppercase tracking-[0.15em] text-white/50 mb-0.5 font-medium">
						Distance
					</p>
					<div className="flex items-baseline justify-center gap-1">
						<span className="text-2xl font-bold text-white tabular-nums tracking-tight">
							{distance.toLocaleString("en-US", { maximumFractionDigits: 0 })}
						</span>
						<span className="text-sm font-medium text-cyan-400/70">km</span>
					</div>
				</div>
			</div>

			{/* Right side: Current state + Probability breakdown */}
			<div className="flex flex-col items-center gap-4">
				{/* Dominant flavor - prominent display */}
				<div
					className="px-6 py-3 rounded-xl backdrop-blur-md border text-center transition-all duration-500"
					style={{
						background: `linear-gradient(135deg, ${dominantConfig.bgGlow}, rgba(15, 23, 42, 0.6))`,
						borderColor: `${dominantConfig.color}40`,
						boxShadow: `0 0 30px ${dominantConfig.bgGlow}, 0 0 60px ${dominantConfig.bgGlow}`,
					}}
				>
					<p className="text-[9px] uppercase tracking-[0.15em] text-white/50 mb-1 font-medium">
						Dominant Flavor
					</p>
					<div className="flex items-center justify-center gap-2">
						<span
							className="text-3xl font-bold transition-colors duration-500"
							style={{
								color: dominantConfig.color,
								textShadow: `0 0 15px ${dominantConfig.color}`,
							}}
						>
							{dominantConfig.symbol}
						</span>
						<span
							className="text-xl font-semibold transition-colors duration-500"
							style={{ color: dominantConfig.color }}
						>
							{dominantConfig.name}
						</span>
					</div>
				</div>

				{/* Probability breakdown - vertical stack */}
				<div className="flex flex-col gap-2 w-full max-w-[200px]">
					<ProbabilityBar
						label="νₑ"
						name="Electron"
						probability={latestProbs.Pe}
						color={FLAVOR_CONFIG.electron.color}
						bgGlow={FLAVOR_CONFIG.electron.bgGlow}
					/>
					<ProbabilityBar
						label="νμ"
						name="Muon"
						probability={latestProbs.Pmu}
						color={FLAVOR_CONFIG.muon.color}
						bgGlow={FLAVOR_CONFIG.muon.bgGlow}
					/>
					<ProbabilityBar
						label="ντ"
						name="Tau"
						probability={latestProbs.Ptau}
						color={FLAVOR_CONFIG.tau.color}
						bgGlow={FLAVOR_CONFIG.tau.bgGlow}
					/>
				</div>
			</div>
		</div>
	);
};

// Horizontal probability bar component
interface ProbabilityBarProps {
	label: string;
	name: string;
	probability: number;
	color: string;
	bgGlow: string;
}

const ProbabilityBar: React.FC<ProbabilityBarProps> = ({
	label,
	name: _name,
	probability,
	color,
	bgGlow,
}) => {
	const percentage = (probability * 100).toFixed(1);

	return (
		<div
			className="flex items-center gap-3 px-3 py-2 rounded-lg border border-white/5 backdrop-blur-sm transition-all duration-300"
			style={{
				background: `linear-gradient(135deg, ${bgGlow}, rgba(15, 23, 42, 0.4))`,
			}}
		>
			{/* Symbol */}
			<span
				className="text-lg font-bold w-8 text-center"
				style={{ color }}
			>
				{label}
			</span>
			
			{/* Progress bar container */}
			<div className="flex-1">
				<div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
					<div
						className="h-full rounded-full transition-all duration-500"
						style={{
							width: `${probability * 100}%`,
							background: `linear-gradient(90deg, ${color}, ${color}dd)`,
							boxShadow: `0 0 8px ${color}`,
						}}
					/>
				</div>
			</div>
			
			{/* Percentage */}
			<span
				className="text-sm font-semibold tabular-nums w-14 text-right"
				style={{ color }}
			>
				{percentage}%
			</span>
		</div>
	);
};

export default VisualizationArea;
