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

type BottomPanel = "ternary" | "probability" | "spectrum" | null;

// Compact bottom HUD with tabbed panels
function BottomHUD() {
	const { state } = useSimulation();
	const { probabilityHistory, energy, distance } = state;
	const [activePanel, setActivePanel] = useState<BottomPanel>("probability");

	const probabilityData = probabilityHistory.map((item) => ({
		distance: item.distance,
		probabilities: {
			electron: item.Pe,
			muon: item.Pmu,
			tau: item.Ptau,
		},
	}));

	// Get current probabilities for quick stats
	const currentProbs = probabilityHistory.length > 0
		? probabilityHistory[probabilityHistory.length - 1]
		: { Pe: 1, Pmu: 0, Ptau: 0 };

	return (
		<div className="fixed bottom-0 left-0 right-0 z-20">
			{/* Expanded panel area */}
			<div className="flex justify-center px-4 pb-2">
				{activePanel === "ternary" && (
					<div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
						<TernaryPlot embedded />
					</div>
				)}
				{activePanel === "probability" && (
					<div 
						className="w-full max-w-2xl rounded-xl px-4 py-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
						style={{
							background: "rgba(20, 20, 30, 0.9)",
							border: "1px solid rgba(255, 255, 255, 0.1)",
						}}
					>
						<div className="flex items-center justify-between mb-2">
							<span className="text-white/70 text-sm font-mono">Oscillation</span>
							<div className="flex items-center gap-3">
								<div className="flex items-center gap-1">
									<div className="w-2 h-2 rounded-full bg-blue-500" />
									<span className="text-[10px] text-white/50">e</span>
								</div>
								<div className="flex items-center gap-1">
									<div className="w-2 h-2 rounded-full bg-orange-400" />
									<span className="text-[10px] text-white/50">μ</span>
								</div>
								<div className="flex items-center gap-1">
									<div className="w-2 h-2 rounded-full bg-fuchsia-500" />
									<span className="text-[10px] text-white/50">τ</span>
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
							height={70}
							distanceLabel=""
							probabilityLabel=""
							energy={energy}
							showOscillationLength={true}
						/>
					</div>
				)}
				{activePanel === "spectrum" && (
					<div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
						<EnergySpectrumPlot embedded />
					</div>
				)}
			</div>

			{/* Tab bar - always visible */}
			<div 
				className="flex items-center justify-center gap-1 py-2 px-4"
				style={{
					background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)",
				}}
			>
				{/* Quick stats on left */}
				<div className="flex items-center gap-3 mr-4 text-[10px] font-mono text-white/40">
					<span>{distance.toFixed(0)} km</span>
					<span className="text-blue-400">{(currentProbs.Pe * 100).toFixed(0)}%</span>
					<span className="text-orange-400">{(currentProbs.Pmu * 100).toFixed(0)}%</span>
					<span className="text-fuchsia-400">{(currentProbs.Ptau * 100).toFixed(0)}%</span>
				</div>

				{/* Tab buttons */}
				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={() => setActivePanel(activePanel === "ternary" ? null : "ternary")}
						className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
							activePanel === "ternary" 
								? "bg-white/20 text-white" 
								: "text-white/50 hover:text-white/80 hover:bg-white/10"
						}`}
					>
						△ Flavor
					</button>
					<button
						type="button"
						onClick={() => setActivePanel(activePanel === "probability" ? null : "probability")}
						className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
							activePanel === "probability" 
								? "bg-white/20 text-white" 
								: "text-white/50 hover:text-white/80 hover:bg-white/10"
						}`}
					>
						〰 P(t)
					</button>
					<button
						type="button"
						onClick={() => setActivePanel(activePanel === "spectrum" ? null : "spectrum")}
						className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
							activePanel === "spectrum" 
								? "bg-white/20 text-white" 
								: "text-white/50 hover:text-white/80 hover:bg-white/10"
						}`}
					>
						📊 P(E)
					</button>
				</div>
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

			{/* Menu drawer - top left */}
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

			{/* Bottom HUD with tabs */}
			<BottomHUD />

			{/* Modals */}
			<LearnMorePanel isOpen={learnOpen} onClose={() => setLearnOpen(false)} />
			<SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
			<HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
		</div>
	);
}

export default App;
