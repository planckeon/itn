import { useState } from "react";
import HelpModal from "./components/HelpModal";
import LearnMorePanel from "./components/LearnMorePanel";
import MenuDrawer from "./components/MenuDrawer";
import PMNSMatrix from "./components/PMNSMatrix";
import ProbabilityPlot from "./components/ProbabilityPlot";
import SettingsPanel from "./components/SettingsPanel";
import Starfield from "./components/Starfield";
import TernaryPlot from "./components/TernaryPlot";
import EnergySpectrumPlot from "./components/EnergySpectrumPlot";
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
		<div className="fixed bottom-4 left-[200px] right-[280px] z-20 min-w-[240px]">
			{/* Semi-transparent plot container */}
			<div
				className="rounded-xl px-4 py-3"
				style={{
					background: "rgba(20, 20, 30, 0.9)",
					border: "1px solid rgba(255, 255, 255, 0.1)",
				}}
			>
				{/* Title and legend row */}
				<div className="flex items-center justify-between mb-2">
					<span className="text-white/70 text-sm font-mono">Probability</span>
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-1.5">
							<div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
							<span className="text-[11px] text-white/60">ν<sub>e</sub></span>
						</div>
						<div className="flex items-center gap-1.5">
							<div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
							<span className="text-[11px] text-white/60">ν<sub>μ</sub></span>
						</div>
						<div className="flex items-center gap-1.5">
							<div className="w-2.5 h-2.5 rounded-full bg-fuchsia-500" />
							<span className="text-[11px] text-white/60">ν<sub>τ</sub></span>
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
	useKeyboardShortcuts();
	
	const [learnOpen, setLearnOpen] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [helpOpen, setHelpOpen] = useState(false);

	return (
		<div className="App text-white font-mono min-h-screen overflow-hidden relative bg-black">
			<h1 className="sr-only">Neutrino Oscillation Visualization</h1>

			{/* Background */}
			<Starfield />

			{/* Top control bar */}
			<TopControlBar />

			{/* Menu drawer - top left, consolidates Share/Learn/Settings/Help */}
			<MenuDrawer
				onOpenLearnMore={() => setLearnOpen(true)}
				onOpenSettings={() => setSettingsOpen(true)}
				onOpenHelp={() => setHelpOpen(true)}
			/>

			{/* PMNS Matrix - top right */}
			<PMNSMatrix />

			{/* Main visualization */}
			<main className="relative w-full h-screen flex items-center justify-center z-10 pointer-events-none">
				<VisualizationArea />
			</main>

			{/* Bottom row: Ternary (left) | Probability (center) | Spectrum (right) */}
			<TernaryPlot />
			<PlotWrapper />
			<EnergySpectrumPlot />

			{/* Modals controlled by menu drawer */}
			<LearnMorePanel isOpen={learnOpen} onClose={() => setLearnOpen(false)} />
			<SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
			<HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
		</div>
	);
}

export default App;
