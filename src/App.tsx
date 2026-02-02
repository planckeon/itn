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

// Floating probability plot panel
const ProbabilityPanel = memo(() => {
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
		<div 
			className="fixed bottom-16 left-1/2 -translate-x-1/2 z-20 w-[55vw] max-w-2xl min-w-[320px] rounded-xl px-4 py-3"
			style={{
				background: "rgba(20, 20, 30, 0.85)",
				backdropFilter: "blur(8px)",
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
				height={100}
				distanceLabel=""
				probabilityLabel=""
				energy={energy}
				showOscillationLength={true}
			/>
		</div>
	);
});
ProbabilityPanel.displayName = "ProbabilityPanel";

interface BottomControlsProps {
	panels: PanelState;
	onTogglePanel: (panel: keyof PanelState) => void;
	onOpenShare: () => void;
	onOpenLearnMore: () => void;
	onOpenSettings: () => void;
	onOpenHelp: () => void;
}

// Three separate floating pill clusters - minimal and non-invasive
function BottomControls({ 
	panels, 
	onTogglePanel, 
	onOpenShare, 
	onOpenLearnMore, 
	onOpenSettings, 
	onOpenHelp 
}: BottomControlsProps) {
	const { state, setZoom } = useSimulation();
	const { zoom } = state;

	const zoomIn = () => setZoom(Math.min(2, zoom + 0.15));
	const zoomOut = () => setZoom(Math.max(0.5, zoom - 0.15));

	const pillStyle = {
		background: "rgba(20, 20, 30, 0.7)",
		backdropFilter: "blur(12px)",
		border: "1px solid rgba(255, 255, 255, 0.08)",
	};

	const btnBase = "w-8 h-8 rounded-full flex items-center justify-center text-sm";
	const btnInactive = "text-white/40 hover:text-white hover:bg-white/10";
	const btnActive = "text-white bg-white/15";

	return (
		<div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
			{/* Zoom controls - left cluster */}
			<div className="flex items-center rounded-full px-1" style={pillStyle}>
				<button
					type="button"
					onClick={zoomOut}
					className={`${btnBase} ${btnInactive} text-lg`}
					title="Zoom out (−)"
				>
					−
				</button>
				<button
					type="button"
					onClick={zoomIn}
					className={`${btnBase} ${btnInactive} text-lg`}
					title="Zoom in (+)"
				>
					+
				</button>
			</div>

			{/* Panel toggles - center cluster */}
			<div className="flex items-center rounded-full px-1" style={pillStyle}>
				<button
					type="button"
					onClick={() => onTogglePanel("ternary")}
					className={`${btnBase} ${panels.ternary ? btnActive : btnInactive}`}
					title="Flavor triangle"
				>
					△
				</button>
				<button
					type="button"
					onClick={() => onTogglePanel("probability")}
					className={`${btnBase} ${panels.probability ? btnActive : btnInactive}`}
					title="Oscillation plot"
				>
					〰
				</button>
				<button
					type="button"
					onClick={() => onTogglePanel("spectrum")}
					className={`${btnBase} ${panels.spectrum ? btnActive : btnInactive}`}
					title="Energy spectrum"
				>
					📊
				</button>
			</div>

			{/* Menu - right cluster */}
			<div className="flex items-center rounded-full px-1" style={pillStyle}>
				<button
					type="button"
					onClick={onOpenShare}
					className={`${btnBase} ${btnInactive}`}
					title="Share"
				>
					🔗
				</button>
				<button
					type="button"
					onClick={onOpenLearnMore}
					className={`${btnBase} ${btnInactive}`}
					title="Learn more"
				>
					📖
				</button>
				<button
					type="button"
					onClick={onOpenSettings}
					className={`${btnBase} ${btnInactive}`}
					title="Settings"
				>
					⚙️
				</button>
				<button
					type="button"
					onClick={onOpenHelp}
					className={`${btnBase} ${btnInactive}`}
					title="Help"
				>
					?
				</button>
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
	
	const [panels, setPanels] = useState<PanelState>({
		ternary: false,
		probability: true,
		spectrum: false,
	});
	const [shareOpen, setShareOpen] = useState(false);
	const [learnOpen, setLearnOpen] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [helpOpen, setHelpOpen] = useState(false);

	const togglePanel = useCallback((panel: keyof PanelState) => {
		setPanels(prev => ({ ...prev, [panel]: !prev[panel] }));
	}, []);

	const openShare = useCallback(() => setShareOpen(true), []);
	const closeShare = useCallback(() => setShareOpen(false), []);
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

			{/* Floating panels - each positioned independently */}
			{panels.ternary && (
				<div className="fixed bottom-16 left-4 z-20">
					<TernaryPlot />
				</div>
			)}
			
			{panels.probability && <ProbabilityPanel />}
			
			{panels.spectrum && (
				<div className="fixed bottom-16 right-4 z-20">
					<EnergySpectrumPlot />
				</div>
			)}

			{/* Floating bottom controls */}
			<BottomControls
				panels={panels}
				onTogglePanel={togglePanel}
				onOpenShare={openShare}
				onOpenLearnMore={openLearnMore}
				onOpenSettings={openSettings}
				onOpenHelp={openHelp}
			/>

			{/* Modals */}
			{shareOpen && <ShareButton isOpen={shareOpen} onClose={closeShare} />}
			{learnOpen && <LearnMorePanel isOpen={learnOpen} onClose={closeLearnMore} />}
			{settingsOpen && <SettingsPanel isOpen={settingsOpen} onClose={closeSettings} />}
			{helpOpen && <HelpModal isOpen={helpOpen} onClose={closeHelp} />}
		</div>
	);
}

export default App;
