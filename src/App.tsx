import { useState } from "react";
import EnergySpectrumPlot from "./components/EnergySpectrumPlot";
import HelpModal from "./components/HelpModal";
import LearnMorePanel from "./components/LearnMorePanel";
import PMNSMatrix from "./components/PMNSMatrix";
import ProbabilityPlot from "./components/ProbabilityPlot";
import SettingsPanel from "./components/SettingsPanel";
import ShareButton from "./components/ShareButton";
import Starfield from "./components/Starfield";
import TernaryPlot from "./components/TernaryPlot";
import TopControlBar from "./components/TopControlBar";
import VisualizationArea from "./components/VisualizationArea";
import { SimulationProvider, useSimulation } from "./context/SimulationContext";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";
import { I18nProvider } from "./i18n";

// Wrapper component to access simulation context for the plot
function PlotWrapper() {
	const { state } = useSimulation();
	const { probabilityHistory, energy } = state;

	const probabilityData = probabilityHistory.map((item) => ({
		distance: item.distance,
		probabilities: {
			electron: item.Pe,
			muon: item.Pmu,
			tau: item.Ptau,
		},
	}));

	return (
		<div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 w-[70vw] max-w-md">
			{/* Semi-transparent plot container */}
			<div
				className="rounded-lg px-3 py-2"
				style={{
					background: "rgba(20, 20, 30, 0.85)",
					border: "1px solid rgba(255, 255, 255, 0.1)",
				}}
			>
				{/* Title and legend row */}
				<div className="flex items-center justify-between mb-1">
					<span className="text-white/70 text-xs font-mono">Probability</span>
					<div className="flex items-center gap-3">
						<div className="flex items-center gap-1">
							<div className="w-2 h-2 rounded-full bg-blue-500" />
							<span className="text-[9px] text-white/60">νₑ</span>
						</div>
						<div className="flex items-center gap-1">
							<div className="w-2 h-2 rounded-full bg-orange-400" />
							<span className="text-[9px] text-white/60">νμ</span>
						</div>
						<div className="flex items-center gap-1">
							<div className="w-2 h-2 rounded-full bg-fuchsia-500" />
							<span className="text-[9px] text-white/60">ντ</span>
						</div>
					</div>
				</div>
				<ProbabilityPlot
					data={probabilityData}
					flavors={["electron", "muon", "tau"]}
					flavorColors={{
						electron: "rgb(59, 130, 246)",
						muon: "rgb(251, 146, 60)",
						tau: "rgb(217, 70, 239)",
					}}
					height={80}
					distanceLabel="Time →"
					probabilityLabel=""
					energy={energy}
					showOscillationLength={true}
				/>
			</div>
		</div>
	);
}

function App() {
	return (
		<I18nProvider>
			<SimulationProvider>
				<AppContent />
			</SimulationProvider>
		</I18nProvider>
	);
}

function AppContent() {
	// Enable keyboard shortcuts
	useKeyboardShortcuts();
	
	// Panel visibility - analysis panels hidden by default for cleaner look
	const [showAnalysis, setShowAnalysis] = useState(false);

	return (
		<>
			{/* No background color - Starfield canvas IS the background */}
			<div className="App text-white font-mono min-h-screen overflow-hidden relative">
				{/* Screen reader only title */}
				<h1 className="sr-only">Neutrino Oscillation Visualization</h1>

				{/* Starfield fills the entire screen - z-index 0 */}
				<Starfield />

				{/* Horizontal controls bar at top - z-index 20 */}
				<TopControlBar />

				{/* PMNS Matrix display - top right - z-index 10 */}
				{showAnalysis && <PMNSMatrix />}

				{/* Left side panels - z-index 10 */}
				<ShareButton />
				<LearnMorePanel />
				<SettingsPanel />

				{/* Main visualization - centered neutrino sphere - z-index 10 */}
				<main className="relative w-full h-screen flex items-center justify-center z-10 pointer-events-none">
					<VisualizationArea />
				</main>

				{/* Probability plot at bottom - z-index 20 */}
				<PlotWrapper />

				{/* Ternary flavor space plot - bottom left - z-index 10 */}
				{showAnalysis && <TernaryPlot />}

				{/* Energy spectrum plot - bottom right - z-index 10 */}
				{showAnalysis && <EnergySpectrumPlot />}

				{/* Analysis toggle button - bottom left corner */}
				<button
					type="button"
					onClick={() => setShowAnalysis(!showAnalysis)}
					className="fixed bottom-4 left-4 z-30 px-3 py-2 rounded-lg text-sm font-medium transition-all"
					style={{
						background: showAnalysis ? "rgba(59, 130, 246, 0.8)" : "rgba(40, 40, 50, 0.85)",
						border: "1px solid rgba(255, 255, 255, 0.2)",
						backdropFilter: "blur(8px)",
					}}
					title="Toggle analysis panels (Ternary plot, Energy spectrum, PMNS matrix)"
				>
					{showAnalysis ? "📊 Hide Analysis" : "📊 Analysis"}
				</button>

				{/* Help modal - press ? to toggle */}
				<HelpModal />
			</div>
		</>
	);
}

export default App;
