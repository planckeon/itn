import BottomPlotContainer from "./components/BottomPlotContainer";
import Starfield from "./components/Starfield";
import TopControlBar from "./components/TopControlBar";
import VisualizationArea from "./components/VisualizationArea";
import { SimulationProvider } from "./context/SimulationContext";

function App() {
	return (
		<SimulationProvider>
			<div className="App bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white font-sans min-h-screen overflow-hidden relative">
				{/* Background starfield */}
				<Starfield />

				{/* Header with branding */}
				<header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-center py-2 pointer-events-none">
					<div className="text-center">
						<h1 className="text-2xl font-light tracking-widest text-white/90">
							<span className="text-cyan-400">ν</span> IMAGINING THE NEUTRINO
						</h1>
						<p className="text-[10px] tracking-[0.3em] text-white/40 uppercase mt-0.5">
							Planckeon Labs • Interactive Oscillation Visualization
						</p>
					</div>
				</header>

				{/* Main visualization */}
				<main className="relative w-full h-screen flex items-center justify-center">
					<VisualizationArea />
				</main>

				{/* Controls at top */}
				<TopControlBar />

				{/* Probability plot at bottom */}
				<BottomPlotContainer />
			</div>
		</SimulationProvider>
	);
}

export default App;
