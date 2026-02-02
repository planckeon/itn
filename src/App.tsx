import EnergySpectrumPlot from "./components/EnergySpectrumPlot";
import HelpModal from "./components/HelpModal";
import PMNSMatrix from "./components/PMNSMatrix";
import ProbabilityPlot from "./components/ProbabilityPlot";
import Starfield from "./components/Starfield";
import TernaryPlot from "./components/TernaryPlot";
import TopControlBar from "./components/TopControlBar";
import VisualizationArea from "./components/VisualizationArea";
import { SimulationProvider, useSimulation } from "./context/SimulationContext";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";

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
		<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 w-[85vw] max-w-xl">
			{/* Semi-transparent plot container */}
			<div
				className="rounded-xl px-4 py-3"
				style={{
					background: "rgba(20, 20, 30, 0.85)",
					border: "1px solid rgba(255, 255, 255, 0.1)",
				}}
			>
				{/* Title and legend row */}
				<div className="flex items-center justify-between mb-2">
					<span className="text-white/70 text-sm font-mono">Probability</span>
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-1.5">
							<div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
							<span className="text-[10px] text-white/60">ν<sub>e</sub></span>
						</div>
						<div className="flex items-center gap-1.5">
							<div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
							<span className="text-[10px] text-white/60">ν<sub>μ</sub></span>
						</div>
						<div className="flex items-center gap-1.5">
							<div className="w-2.5 h-2.5 rounded-full bg-fuchsia-500" />
							<span className="text-[10px] text-white/60">ν<sub>τ</sub></span>
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
					height={100}
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
		<SimulationProvider>
			<AppContent />
		</SimulationProvider>
	);
}

function AppContent() {
	// Enable keyboard shortcuts
	useKeyboardShortcuts();

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
				<PMNSMatrix />

				{/* Main visualization - centered neutrino sphere - z-index 10 */}
				<main className="relative w-full h-screen flex items-center justify-center z-10 pointer-events-none">
					<VisualizationArea />
				</main>

				{/* Probability plot at bottom - z-index 20 */}
				<PlotWrapper />

				{/* Ternary flavor space plot - bottom left - z-index 10 */}
				<TernaryPlot />

				{/* Energy spectrum plot - bottom right - z-index 10 */}
				<EnergySpectrumPlot />

				{/* Help modal - press ? to toggle */}
				<HelpModal />
			</div>
		</>
	);
}

export default App;
