import BottomPlotContainer from "./components/BottomPlotContainer";
import Starfield from "./components/Starfield";
import TopControlBar from "./components/TopControlBar";
import VisualizationArea from "./components/VisualizationArea";
import { SimulationProvider } from "./context/SimulationContext";
import "./App.css";

function App() {
	return (
		<SimulationProvider>
			{/* Pure black background - starfield canvas is the real background */}
			<div className="App text-white font-sans min-h-screen overflow-hidden relative bg-black">
				{/* Background starfield - stars streak past as neutrino flies through space */}
				<Starfield />

				{/* Header with branding */}
				<header className="fixed top-0 left-0 right-0 z-30 pointer-events-none">
					<div className="flex items-center justify-center py-3">
						<div className="text-center">
							<h1 className="header-title flex items-center justify-center gap-2 text-2xl md:text-3xl font-extralight tracking-[0.15em] uppercase">
								<span className="neutrino-symbol text-3xl md:text-4xl font-light">
									ν
								</span>
								<span className="header-text">Imagining the Neutrino</span>
							</h1>
							<p className="text-[10px] tracking-[0.25em] text-white/40 uppercase mt-1">
								Planckeon Labs • Interactive Oscillation Visualization
							</p>
						</div>
					</div>
				</header>

				{/* Controls at top */}
				<TopControlBar />

				{/* Main visualization - centered neutrino sphere */}
				<main className="relative w-full h-screen flex items-center justify-center">
					<VisualizationArea />
				</main>

				{/* Probability plot at bottom */}
				<BottomPlotContainer />
			</div>
		</SimulationProvider>
	);
}

export default App;
