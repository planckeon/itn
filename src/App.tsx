import BottomPlotContainer from "./components/BottomPlotContainer";
import Starfield from "./components/Starfield";
import TopControlBar from "./components/TopControlBar";
import VisualizationArea from "./components/VisualizationArea";
import { SimulationProvider } from "./context/SimulationContext";
import "./App.css";

function App() {
	return (
		<SimulationProvider>
			<div className="App text-white font-sans min-h-screen overflow-hidden relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
				{/* Background starfield */}
				<Starfield />

				{/* Header with branding - more compact */}
				<header className="fixed top-0 left-0 right-0 z-30 pointer-events-none">
					{/* Gradient fade overlay for header area */}
					<div className="absolute inset-0 h-24 bg-gradient-to-b from-slate-950/90 via-slate-950/50 to-transparent" />

					<div className="relative flex items-center justify-center py-3">
						<div className="text-center">
							{/* Main title with animated glow */}
							<h1 className="header-title flex items-center justify-center gap-2 text-2xl md:text-3xl font-extralight tracking-[0.15em] uppercase">
								<span className="neutrino-symbol text-3xl md:text-4xl font-light">
									ν
								</span>
								<span className="header-text">Imagining the Neutrino</span>
							</h1>

							{/* Subtitle with separator line */}
							<div className="mt-2 flex items-center justify-center gap-2">
								<span className="header-line" />
								<p className="text-[10px] tracking-[0.2em] text-white/40 uppercase font-light">
									Planckeon Labs
								</p>
								<span className="text-white/20 text-[10px]">•</span>
								<p className="text-[10px] tracking-[0.2em] text-white/40 uppercase font-light">
									Interactive Oscillation Visualization
								</p>
								<span className="header-line" />
							</div>
						</div>
					</div>
				</header>

				{/* Controls at top - positioned below header */}
				<TopControlBar />

				{/* Main content area - better vertical distribution */}
				<main className="relative w-full min-h-screen flex flex-col">
					{/* Spacer for header and controls */}
					<div className="h-32" />
					
					{/* Visualization in upper portion */}
					<div className="flex-1 flex items-start justify-center pt-8 pb-4">
						<VisualizationArea />
					</div>
					
					{/* Plot takes bottom portion with more visibility */}
					<div className="h-[280px] relative z-10">
						<BottomPlotContainer />
					</div>
				</main>
			</div>
		</SimulationProvider>
	);
}

export default App;
