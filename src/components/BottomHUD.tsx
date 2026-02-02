import type React from "react";
import { useSimulation } from "../context/SimulationContext";
import EnergySpectrumMini from "./EnergySpectrumMini";
import ProbabilityPlot from "./ProbabilityPlot";
import TernaryPlotMini from "./TernaryPlotMini";

/**
 * Unified bottom HUD - three plots side by side in a cohesive bar
 * Designed to feel like a spaceship cockpit display
 */
const BottomHUD: React.FC = () => {
	const { state } = useSimulation();
	const { probabilityHistory, energy, distance } = state;

	const probabilityData = probabilityHistory.map((item) => ({
		distance: item.distance,
		probabilities: {
			electron: item.Pe,
			muon: item.Pmu,
			tau: item.Ptau,
		},
	}));

	// Current probabilities for ternary plot
	const currentProbs =
		probabilityHistory.length > 0
			? probabilityHistory[probabilityHistory.length - 1]
			: { Pe: 1, Pmu: 0, Ptau: 0 };

	return (
		<div
			className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-4"
			style={{
				background:
					"linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)",
			}}
		>
			<div className="mx-auto max-w-4xl flex items-end gap-2">
				{/* Left: Ternary flavor triangle */}
				<div
					className="flex-shrink-0 rounded-lg overflow-hidden"
					style={{
						background: "rgba(20, 20, 30, 0.9)",
						border: "1px solid rgba(255, 255, 255, 0.1)",
					}}
				>
					<TernaryPlotMini
						Pe={currentProbs.Pe}
						Pmu={currentProbs.Pmu}
						Ptau={currentProbs.Ptau}
						history={probabilityHistory}
					/>
				</div>

				{/* Center: Main probability plot - constrained width */}
				<div
					className="flex-1 max-w-md rounded-lg px-3 py-2"
					style={{
						background: "rgba(20, 20, 30, 0.9)",
						border: "1px solid rgba(255, 255, 255, 0.1)",
					}}
				>
					{/* Legend row */}
					<div className="flex items-center justify-between mb-1">
						<span className="text-white/50 text-[10px] font-mono uppercase tracking-wider">
							Oscillation
						</span>
						<div className="flex items-center gap-3">
							<div className="flex items-center gap-1">
								<div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
								<span className="text-[9px] text-white/50">e</span>
							</div>
							<div className="flex items-center gap-1">
								<div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
								<span className="text-[9px] text-white/50">μ</span>
							</div>
							<div className="flex items-center gap-1">
								<div className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" />
								<span className="text-[9px] text-white/50">τ</span>
							</div>
						</div>
					</div>
					<ProbabilityPlot
						data={probabilityData}
						flavors={["electron", "muon", "tau"]}
						flavorColors={{
							electron: "rgb(96, 165, 250)",
							muon: "rgb(251, 146, 60)",
							tau: "rgb(232, 121, 249)",
						}}
						height={70}
						distanceLabel=""
						probabilityLabel=""
						energy={energy}
						showOscillationLength={true}
					/>
				</div>

				{/* Right: Energy spectrum */}
				<div
					className="flex-shrink-0 rounded-lg overflow-hidden"
					style={{
						background: "rgba(20, 20, 30, 0.9)",
						border: "1px solid rgba(255, 255, 255, 0.1)",
					}}
				>
					<EnergySpectrumMini distance={distance} />
				</div>
			</div>
		</div>
	);
};

export default BottomHUD;
