import type React from "react";
import { useState } from "react";
import { useI18n, type Language } from "../i18n";
import { useSimulation } from "../context/SimulationContext";

interface SettingsPanelProps {
	isOpen?: boolean;
	onClose?: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen: controlledOpen, onClose }) => {
	const [internalOpen, setInternalOpen] = useState(false);
	const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
	const { language, setLanguage, t, languageNames, availableLanguages } = useI18n();
	const { state, setDensity } = useSimulation();

	const handleClose = () => {
		if (onClose) onClose();
		else setInternalOpen(false);
	};

	if (!isOpen) {
		if (controlledOpen !== undefined) return null; // Controlled mode
		return (
			<button
				type="button"
				onClick={() => setInternalOpen(true)}
				className="fixed top-[116px] left-4 z-10 px-2 py-1 rounded-md text-xs font-medium transition-all hover:scale-105"
				style={{
					background: "rgba(20, 20, 30, 0.9)",
					border: "1px solid rgba(255, 255, 255, 0.1)",
					color: "rgba(255, 255, 255, 0.8)",
					backdropFilter: "blur(8px)",
				}}
			>
				⚙️ {t.settings}
			</button>
		);
	}

	return (
		<div
			className="fixed top-16 left-4 z-40 w-80 rounded-xl overflow-hidden"
			style={{
				background: "rgba(12, 12, 20, 0.96)",
				border: "1px solid rgba(255, 255, 255, 0.12)",
				backdropFilter: "blur(20px)",
				boxShadow: "0 12px 48px rgba(0, 0, 0, 0.6)",
			}}
		>
			{/* Header */}
			<div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
				<h2 className="text-base font-semibold text-white">⚙️ {t.settings}</h2>
				<button
					type="button"
					onClick={handleClose}
					className="text-white/50 hover:text-white transition-colors text-lg"
				>
					✕
				</button>
			</div>

			{/* Content */}
			<div className="p-5 space-y-5">
				{/* Language selection */}
				<div>
					<label className="block text-sm text-white/65 mb-2">Language</label>
					<select
						value={language}
						onChange={(e) => setLanguage(e.target.value as Language)}
						className="w-full px-4 py-2.5 rounded-lg text-[15px] bg-white/8 text-white border border-white/10 focus:border-white/30 outline-none"
					>
						{availableLanguages.map((lang) => (
							<option key={lang} value={lang} className="bg-gray-900">
								{languageNames[lang]}
							</option>
						))}
					</select>
				</div>

				{/* Matter density slider */}
				<div>
					<label className="block text-sm text-white/65 mb-2">
						Matter Density: {state.density.toFixed(1)} g/cm³
					</label>
					<input
						type="range"
						min="0.1"
						max="15"
						step="0.1"
						value={state.density}
						onChange={(e) => setDensity(parseFloat(e.target.value))}
						className="w-full accent-blue-500"
					/>
					<div className="flex justify-between text-xs text-white/45 mt-1.5">
						<span>Air</span>
						<span>Earth (2.8)</span>
						<span>Core (13)</span>
					</div>
				</div>

				{/* Quick presets for density */}
				<div>
					<label className="block text-sm text-white/65 mb-2">Density Presets</label>
					<div className="flex flex-wrap gap-1.5">
						{[
							{ label: "Vacuum", value: 0 },
							{ label: "Air", value: 0.001 },
							{ label: "Water", value: 1.0 },
							{ label: "Earth", value: 2.8 },
							{ label: "Core", value: 13.0 },
							{ label: "Sun", value: 150 },
						].map((preset) => (
							<button
								key={preset.label}
								type="button"
								onClick={() => setDensity(preset.value)}
								className={`px-2.5 py-1.5 rounded text-xs transition-colors ${
									Math.abs(state.density - preset.value) < 0.1
										? "bg-blue-500/30 text-blue-300 border-blue-500/50"
										: "bg-white/5 text-white/65 border-white/10"
								} border`}
							>
								{preset.label}
							</button>
						))}
					</div>
				</div>

				{/* Physics constants info */}
				<div className="pt-2 border-t border-white/10">
					<div className="text-xs text-white/40 space-y-1">
						<div>θ₁₂ = 33.44° | θ₁₃ = 8.57° | θ₂₃ = 49.2°</div>
						<div>Δm²₂₁ = 7.42×10⁻⁵ eV²</div>
						<div>Δm²₃₁ = ±2.5×10⁻³ eV² (NO/IO)</div>
						<div className="text-white/30 pt-1">NuFit 5.2 (2022) values</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SettingsPanel;
