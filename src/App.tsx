import ControlsPanel from "./components/ControlsPanel";
import ProbabilityPlot from "./components/ProbabilityPlot";
import Starfield from "./components/Starfield";
import VisualizationArea from "./components/VisualizationArea";
import { SimulationProvider, useSimulation } from "./context/SimulationContext";

// Wrapper component to access simulation context for the plot
function PlotWrapper() {
	const { state } = useSimulation();
	const { probabilityHistory } = state;

	const probabilityData = probabilityHistory.map((item) => ({
		distance: item.distance,
		probabilities: {
			electron: item.Pe,
			muon: item.Pmu,
			tau: item.Ptau,
		},
	}));

	return (
		<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10 w-[85vw] max-w-xl">
			{/* Semi-transparent plot container - lets starfield show through */}
			<div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
				{/* Compact legend */}
				<div className="flex items-center justify-center gap-4 mb-2">
					<div className="flex items-center gap-1.5">
						<div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
						<span className="text-[10px] text-white/60">νₑ</span>
					</div>
					<div className="flex items-center gap-1.5">
						<div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
						<span className="text-[10px] text-white/60">νμ</span>
					</div>
					<div className="flex items-center gap-1.5">
						<div className="w-2.5 h-2.5 rounded-full bg-fuchsia-500" />
						<span className="text-[10px] text-white/60">ντ</span>
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
					height={120}
					distanceLabel="Distance (km)"
					probabilityLabel="P"
				/>
			</div>
		</div>
	);
}

function App() {
	return (
		<SimulationProvider>
			{/* Pure black background - starfield is THE visual experience */}
			<div className="App bg-black text-white font-mono min-h-screen overflow-hidden relative">
				{/* Screen reader only title */}
				<h1 className="sr-only">Neutrino Oscillation Visualization</h1>

				{/* Starfield fills the entire screen - this IS the background */}
				<Starfield />

				{/* Controls panel - semi-transparent overlay in corner */}
				<ControlsPanel />

				{/* Main visualization - centered neutrino sphere */}
				<main className="relative w-full h-screen flex items-center justify-center">
					<VisualizationArea />
				</main>

				{/* Probability plot at bottom - semi-transparent */}
				<PlotWrapper />
			</div>
		</SimulationProvider>
	);
}

export default App;
