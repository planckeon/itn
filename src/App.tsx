import ControlsPanel from "./components/ControlsPanel";
import Starfield from "./components/Starfield";
import VisualizationArea from "./components/VisualizationArea";
import { SimulationProvider } from "./context/SimulationContext";

function App() {
	return (
		<SimulationProvider>
			<div className="App bg-black text-white font-mono min-h-screen overflow-hidden relative">
				<h1 className="sr-only">Neutrino Oscillation Visualization</h1>
				<ControlsPanel />
				<VisualizationArea />
				<Starfield />
			</div>
		</SimulationProvider>
	);
}

export default App;
