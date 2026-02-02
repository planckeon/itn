import { useState, useCallback, memo } from "react";
import HelpModal from "./components/HelpModal";
import LearnMorePanel from "./components/LearnMorePanel";
import PMNSMatrix from "./components/PMNSMatrix";
import ProbabilityPlot from "./components/ProbabilityPlot";
import SettingsPanel from "./components/SettingsPanel";
import ShareButton from "./components/ShareButton";
import Starfield from "./components/Starfield";
import TernaryPlot from "./components/TernaryPlot";
import EnergySpectrumPlot from "./components/EnergySpectrumPlot";
import TopControlBar from "./components/TopControlBar";
import VisualizationArea from "./components/VisualizationArea";
import { SimulationProvider, useSimulation } from "./context/SimulationContext";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";
import { I18nProvider } from "./i18n";

interface PanelState {
	ternary: boolean;
	probability: boolean;
	spectrum: boolean;
}

interface BottomHUDProps {
	onOpenLearnMore: () => void;
	onOpenSettings: () => void;
	onOpenHelp: () => void;
}

// Memoized panel components to prevent unnecessary re-renders
const TernaryPanel = memo(() => (
	<div className="flex-shrink-0">
		<TernaryPlot embedded />
	</div>
));
TernaryPanel.displayName = "TernaryPanel";

const SpectrumPanel = memo(() => (
	<div className="flex-shrink-0">
		<EnergySpectrumPlot embedded />
	</div>
));
SpectrumPanel.displayName = "SpectrumPanel";

// Unified bottom control panel with toggleable widgets and menu
function BottomHUD({ onOpenLearnMore, onOpenSettings, onOpenHelp }: BottomHUDProps) {
	const { state, setZoom } = useSimulation();
	const { probabilityHistory, energy, distance, zoom } = state;
	const [panels, setPanels] = useState<PanelState>({
		ternary: false,
		probability: true,
		spectrum: false,
	});
	const [shareOpen, setShareOpen] = useState(false);

	// Memoized toggle to prevent recreation
	const togglePanel = useCallback((panel: keyof PanelState) => {
		setPanels(prev => ({ ...prev, [panel]: !prev[panel] }));
	}, []);

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

	const anyPanelOpen = panels.ternary || panels.probability || panels.spectrum;

	return (
		<div className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none">
			{/* Panel area - rendered conditionally without animation */}
			{anyPanelOpen && (
				<div className="flex justify-center items-end gap-3 px-4 pb-2 pointer-events-auto">
					{panels.ternary && <TernaryPanel />}
					{panels.probability && (
						<div 
							className="flex-1 max-w-2xl min-w-[300px] rounded-xl px-4 py-3"
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
								height={120}
								distanceLabel=""
								probabilityLabel=""
								energy={energy}
								showOscillationLength={true}
							/>
						</div>
					)}
					{panels.spectrum && <SpectrumPanel />}
				</div>
			)}

			{/* Control bar - floating centered pill */}
			<div className="flex justify-center pb-4 pointer-events-auto">
				<div 
					className="flex items-center gap-3 py-2 px-4 rounded-full"
					style={{
						background: "rgba(20, 20, 30, 0.75)",
						backdropFilter: "blur(12px)",
						border: "1px solid rgba(255, 255, 255, 0.1)",
					}}
				>
					{/* Zoom controls */}
					<div className="flex items-center gap-1">
						<button
							type="button"
							onClick={() => setZoom(Math.max(0.5, zoom - 0.15))}
							className="w-8 h-8 rounded-lg text-white/50 hover:text-white hover:bg-white/10 flex items-center justify-center text-base"
							title="Zoom out (−)"
						>
							−
						</button>
						<button
							type="button"
							onClick={() => setZoom(Math.min(2, zoom + 0.15))}
							className="w-8 h-8 rounded-lg text-white/50 hover:text-white hover:bg-white/10 flex items-center justify-center text-base"
							title="Zoom in (+)"
						>
							+
						</button>
					</div>

					{/* Divider */}
					<div className="w-px h-4 bg-white/15" />

					{/* Quick stats - hidden on very small screens */}
					<div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-white/50">
						<span>{distance.toFixed(0)} km</span>
						<span className="text-blue-400">{(currentProbs.Pe * 100).toFixed(0)}%</span>
						<span className="text-orange-400">{(currentProbs.Pmu * 100).toFixed(0)}%</span>
						<span className="text-fuchsia-400">{(currentProbs.Ptau * 100).toFixed(0)}%</span>
					</div>

					{/* Divider - hidden when stats hidden */}
					<div className="hidden sm:block w-px h-4 bg-white/15" />

					{/* Panel toggles */}
					<div className="flex items-center gap-1">
						<button
							type="button"
							onClick={() => togglePanel("ternary")}
							className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
								panels.ternary 
									? "bg-white/20 text-white" 
									: "text-white/50 hover:text-white hover:bg-white/10"
							}`}
							title="Flavor Space"
						>
							△
						</button>
						<button
							type="button"
							onClick={() => togglePanel("probability")}
							className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
								panels.probability 
									? "bg-white/20 text-white" 
									: "text-white/50 hover:text-white hover:bg-white/10"
							}`}
							title="Oscillation Plot"
						>
							〰
						</button>
						<button
							type="button"
							onClick={() => togglePanel("spectrum")}
							className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
								panels.spectrum 
									? "bg-white/20 text-white" 
									: "text-white/50 hover:text-white hover:bg-white/10"
							}`}
							title="Energy Spectrum"
						>
							📊
						</button>
					</div>

					{/* Divider */}
					<div className="w-px h-4 bg-white/15" />

					{/* Menu buttons */}
					<div className="flex items-center gap-1">
						<button
							type="button"
							onClick={() => setShareOpen(true)}
							className="w-8 h-8 rounded-lg text-white/50 hover:text-white hover:bg-white/10 flex items-center justify-center text-sm"
							title="Share"
						>
							🔗
						</button>
						<button
							type="button"
							onClick={onOpenLearnMore}
							className="hidden sm:flex w-8 h-8 rounded-lg text-white/50 hover:text-white hover:bg-white/10 items-center justify-center text-sm"
							title="Learn More"
						>
							📖
						</button>
						<button
							type="button"
							onClick={onOpenSettings}
							className="w-8 h-8 rounded-lg text-white/50 hover:text-white hover:bg-white/10 flex items-center justify-center text-sm"
							title="Settings"
						>
							⚙️
						</button>
						<button
							type="button"
							onClick={onOpenHelp}
							className="w-8 h-8 rounded-lg text-white/50 hover:text-white hover:bg-white/10 flex items-center justify-center text-sm"
							title="Help (?)"
						>
							?
						</button>
					</div>
				</div>
			</div>

			{/* Share modal */}
			{shareOpen && (
				<ShareButton isOpen={shareOpen} onClose={() => setShareOpen(false)} />
			)}
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

	// Memoized handlers to prevent unnecessary re-renders
	const openLearnMore = useCallback(() => setLearnOpen(true), []);
	const closeLearnMore = useCallback(() => setLearnOpen(false), []);
	const openSettings = useCallback(() => setSettingsOpen(true), []);
	const closeSettings = useCallback(() => setSettingsOpen(false), []);
	const openHelp = useCallback(() => setHelpOpen(true), []);
	const closeHelp = useCallback(() => setHelpOpen(false), []);

	return (
		<div className="App text-white font-mono min-h-screen overflow-hidden relative bg-black">
			<h1 className="sr-only">Neutrino Oscillation Visualization</h1>

			{/* Background */}
			<Starfield />

			{/* Top control bar */}
			<TopControlBar />

			{/* PMNS Matrix - top right */}
			<PMNSMatrix />

			{/* Main visualization - centered */}
			<main className="relative w-full h-screen flex items-center justify-center z-10 pointer-events-none">
				<VisualizationArea />
			</main>

			{/* Bottom HUD with panels and menu */}
			<BottomHUD 
				onOpenLearnMore={openLearnMore}
				onOpenSettings={openSettings}
				onOpenHelp={openHelp}
			/>

			{/* Modals - only render when open */}
			{learnOpen && <LearnMorePanel isOpen={learnOpen} onClose={closeLearnMore} />}
			{settingsOpen && <SettingsPanel isOpen={settingsOpen} onClose={closeSettings} />}
			{helpOpen && <HelpModal isOpen={helpOpen} onClose={closeHelp} />}
		</div>
	);
}

export default App;
