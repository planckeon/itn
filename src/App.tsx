import { useState } from "react";
import BottomHUD from "./components/BottomHUD";
import HelpModal from "./components/HelpModal";
import LearnMorePanel from "./components/LearnMorePanel";
import MenuDrawer from "./components/MenuDrawer";
import PMNSMatrix from "./components/PMNSMatrix";
import SettingsPanel from "./components/SettingsPanel";
import Starfield from "./components/Starfield";
import TopControlBar from "./components/TopControlBar";
import VisualizationArea from "./components/VisualizationArea";
import { SimulationProvider } from "./context/SimulationContext";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";
import { I18nProvider } from "./i18n";

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
	// Enable keyboard shortcuts
	useKeyboardShortcuts();
	
	// Panel states
	const [showLearnMore, setShowLearnMore] = useState(false);
	const [showSettings, setShowSettings] = useState(false);
	const [showHelp, setShowHelp] = useState(false);
	const [showPMNS, setShowPMNS] = useState(false);

	return (
		<div className="App text-white font-mono min-h-screen overflow-hidden relative bg-black">
			{/* Screen reader only title */}
			<h1 className="sr-only">Neutrino Oscillation Visualization</h1>

			{/* Starfield fills the entire screen - z-index 0 */}
			<Starfield />

			{/* Compact controls bar at top - z-index 20 */}
			<TopControlBar />

			{/* Menu drawer - replaces scattered left buttons */}
			<MenuDrawer 
				onOpenLearnMore={() => setShowLearnMore(true)}
				onOpenSettings={() => setShowSettings(true)}
				onOpenHelp={() => setShowHelp(true)}
			/>

			{/* PMNS Matrix toggle - top right */}
			<button
				type="button"
				onClick={() => setShowPMNS(!showPMNS)}
				className="fixed top-20 right-4 z-20 w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-105"
				style={{
					background: showPMNS ? "rgba(59, 130, 246, 0.3)" : "rgba(30, 30, 40, 0.9)",
					border: "1px solid rgba(255, 255, 255, 0.15)",
					backdropFilter: "blur(8px)",
				}}
				title="Toggle PMNS Matrix"
			>
				<span className="text-white/80 text-xs font-bold">|U|²</span>
			</button>

			{/* PMNS Matrix panel */}
			{showPMNS && <PMNSMatrix />}

			{/* Main visualization - centered neutrino sphere */}
			<main className="relative w-full h-screen flex items-center justify-center z-10 pointer-events-none">
				<VisualizationArea />
			</main>

			{/* Unified bottom HUD with all three plots */}
			<BottomHUD />

			{/* Modals/Panels */}
			{showLearnMore && <LearnMorePanel isOpen onClose={() => setShowLearnMore(false)} />}
			{showSettings && <SettingsPanel isOpen onClose={() => setShowSettings(false)} />}
			<HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
		</div>
	);
}

export default App;
