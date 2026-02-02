import type React from "react";
import { useState, useEffect } from "react";

const SHORTCUTS = [
	{ key: "Space", action: "Play / Pause" },
	{ key: "A", action: "Toggle antineutrino (ν/ν̄)" },
	{ key: "M", action: "Toggle matter effect" },
	{ key: "N", action: "Toggle mass ordering (NO/IO)" },
	{ key: "R", action: "Reset simulation" },
	{ key: "1", action: "Preset: T2K" },
	{ key: "2", action: "Preset: NOvA" },
	{ key: "3", action: "Preset: DUNE" },
	{ key: "4", action: "Preset: KamLAND" },
	{ key: "↑ / ↓", action: "Adjust energy" },
	{ key: "← / →", action: "Adjust δCP" },
	{ key: "?", action: "Show this help" },
];

/**
 * Help modal showing keyboard shortcuts
 * Press ? to toggle
 */
const HelpModal: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
				return;
			}
			
			if (e.key === "?" || (e.shiftKey && e.key === "/")) {
				e.preventDefault();
				setIsOpen((prev) => !prev);
			} else if (e.key === "Escape" && isOpen) {
				setIsOpen(false);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen]);

	if (!isOpen) {
		// Show small hint in corner
		return (
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className="fixed bottom-4 right-[340px] z-30 px-2 py-1 rounded text-xs text-white/40 hover:text-white/70 transition-colors"
				style={{
					background: "rgba(20, 20, 30, 0.6)",
					border: "1px solid rgba(255, 255, 255, 0.1)",
				}}
			>
				? Help
			</button>
		);
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center"
			style={{ background: "rgba(0, 0, 0, 0.7)" }}
			onClick={() => setIsOpen(false)}
		>
			<div
				className="rounded-xl p-6 max-w-md w-full mx-4"
				style={{
					background: "rgba(20, 20, 30, 0.95)",
					border: "1px solid rgba(255, 255, 255, 0.2)",
					backdropFilter: "blur(16px)",
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-semibold text-white">Keyboard Shortcuts</h2>
					<button
						type="button"
						onClick={() => setIsOpen(false)}
						className="text-white/50 hover:text-white text-xl leading-none"
					>
						×
					</button>
				</div>

				<div className="space-y-2">
					{SHORTCUTS.map(({ key, action }) => (
						<div key={key} className="flex items-center justify-between text-sm">
							<kbd
								className="px-2 py-1 rounded text-xs font-mono"
								style={{
									background: "rgba(255, 255, 255, 0.1)",
									border: "1px solid rgba(255, 255, 255, 0.2)",
									color: "rgba(255, 255, 255, 0.9)",
								}}
							>
								{key}
							</kbd>
							<span className="text-white/70">{action}</span>
						</div>
					))}
				</div>

				<div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-white/40">
					Press <kbd className="px-1 rounded bg-white/10">Esc</kbd> or click outside to close
				</div>
			</div>
		</div>
	);
};

export default HelpModal;
