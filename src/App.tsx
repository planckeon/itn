import { memo, useCallback, useState } from "react";
import EnergySpectrumPlot from "./components/EnergySpectrumPlot";
import HelpModal from "./components/HelpModal";
import LearnMorePanel from "./components/LearnMorePanel";
import PMNSMatrix from "./components/PMNSMatrix";
import ProbabilityPlot from "./components/ProbabilityPlot";
import SettingsPanel from "./components/SettingsPanel";
import ShareButton from "./components/ShareButton";
import Starfield from "./components/Starfield";
import TernaryPlot from "./components/TernaryPlot";
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

const panelStyle = {
	background: "rgba(20, 20, 30, 0.8)",
	backdropFilter: "blur(12px)",
	border: "1px solid rgba(255, 255, 255, 0.1)",
};

// Inline Probability Panel that flexes with container
const FlexProbabilityPanel = memo(() => {
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
			className="flex-1 min-w-[280px] max-w-3xl rounded-xl px-4 py-3"
			style={panelStyle}
		>
			<div className="flex items-center justify-between mb-2">
				<span className="text-white/60 text-xs font-medium">Oscillation</span>
				<div className="flex items-center gap-2">
					<div className="flex items-center gap-1">
						<div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
						<span className="text-[9px] text-white/40">e</span>
					</div>
					<div className="flex items-center gap-1">
						<div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
						<span className="text-[9px] text-white/40">μ</span>
					</div>
					<div className="flex items-center gap-1">
						<div className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" />
						<span className="text-[9px] text-white/40">τ</span>
					</div>
				</div>
			</div>
			<ProbabilityPlot
				data={probabilityData}
				flavors={["electron", "muon", "tau"]}
				flavorColors={{
					electron: "rgb(96, 165, 250)",
					muon: "rgb(251, 146, 60)",
					tau: "rgb(232, 121, 249)",
				}}
				height={90}
				distanceLabel=""
				probabilityLabel=""
				energy={energy}
				showOscillationLength={true}
			/>
		</div>
	);
});
FlexProbabilityPanel.displayName = "FlexProbabilityPanel";

// Inline Ternary Panel
const FlexTernaryPanel = memo(() => (
	<div className="flex-shrink-0 rounded-xl p-3" style={panelStyle}>
		<TernaryPlot embedded />
	</div>
));
FlexTernaryPanel.displayName = "FlexTernaryPanel";

// Inline Spectrum Panel that can expand
const FlexSpectrumPanel = memo(({ canExpand }: { canExpand: boolean }) => (
	<div
		className={`rounded-xl p-3 ${canExpand ? "flex-1 min-w-[280px] max-w-3xl" : "flex-shrink-0"}`}
		style={panelStyle}
	>
		<EnergySpectrumPlot embedded fillContainer={canExpand} />
	</div>
));
FlexSpectrumPanel.displayName = "FlexSpectrumPanel";

interface BottomHUDProps {
	panels: PanelState;
	onTogglePanel: (panel: keyof PanelState) => void;
	onOpenShare: () => void;
	onOpenLearnMore: () => void;
	onOpenSettings: () => void;
	onOpenHelp: () => void;
}

// Unified bottom HUD with flexbox layout
function BottomHUD({
	panels,
	onTogglePanel,
	onOpenShare,
	onOpenLearnMore,
	onOpenSettings,
	onOpenHelp,
}: BottomHUDProps) {
	const { state, setZoom } = useSimulation();
	const { zoom } = state;

	const zoomIn = () => setZoom(Math.min(2, zoom + 0.15));
	const zoomOut = () => setZoom(Math.max(0.5, zoom - 0.15));

	const anyPanelOpen = panels.ternary || panels.probability || panels.spectrum;

	// Spectrum can expand if it's the only plot panel
	const spectrumCanExpand = !panels.probability && panels.spectrum;

	const pillStyle = {
		background: "rgba(20, 20, 30, 0.75)",
		backdropFilter: "blur(12px)",
		border: "1px solid rgba(255, 255, 255, 0.08)",
	};

	const btnBase =
		"w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors";
	const btnInactive = "text-white/40 hover:text-white hover:bg-white/10";
	const btnActive = "text-white bg-white/20";

	return (
		<div className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none pb-4 px-4">
			{/* Panels row - flexbox aware of each other */}
			{anyPanelOpen && (
				<div className="flex justify-center items-end gap-3 mb-3 pointer-events-auto">
					{panels.ternary && <FlexTernaryPanel />}
					{panels.probability && <FlexProbabilityPanel />}
					{panels.spectrum && (
						<FlexSpectrumPanel canExpand={spectrumCanExpand} />
					)}
				</div>
			)}

			{/* Control clusters */}
			<div className="flex justify-center items-center gap-1.5 pointer-events-auto">
				{/* Zoom controls */}
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

				{/* Panel toggles */}
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

				{/* Menu */}
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
		setPanels((prev) => ({ ...prev, [panel]: !prev[panel] }));
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

			{/* Bottom HUD - panels + controls unified */}
			<BottomHUD
				panels={panels}
				onTogglePanel={togglePanel}
				onOpenShare={openShare}
				onOpenLearnMore={openLearnMore}
				onOpenSettings={openSettings}
				onOpenHelp={openHelp}
			/>

			{/* Modals */}
			{shareOpen && <ShareButton isOpen={shareOpen} onClose={closeShare} />}
			{learnOpen && (
				<LearnMorePanel isOpen={learnOpen} onClose={closeLearnMore} />
			)}
			{settingsOpen && (
				<SettingsPanel isOpen={settingsOpen} onClose={closeSettings} />
			)}
			{helpOpen && <HelpModal isOpen={helpOpen} onClose={closeHelp} />}
		</div>
	);
}

export default App;
