import type React from "react";
import { useState, useEffect } from "react";

const SHORTCUTS = [
	{ key: "Space", action: "Play / Pause" },
	{ key: "A", action: "Toggle antineutrino (ν/ν̄)" },
	{ key: "M", action: "Toggle matter effect" },
	{ key: "N", action: "Toggle mass ordering (NO/IO)" },
	{ key: "R", action: "Reset simulation" },
	{ key: "S", action: "Copy share URL" },
	{ key: "1-4", action: "Quick presets (T2K, NOvA, DUNE, KamLAND)" },
	{ key: "↑ / ↓", action: "Adjust energy" },
	{ key: "← / →", action: "Adjust δCP" },
	{ key: "?", action: "Show this help" },
];

interface HelpModalProps {
	isOpen?: boolean;
	onClose?: () => void;
}

/**
 * Help modal showing keyboard shortcuts
 * Press ? to toggle, or control via props
 */
const HelpModal: React.FC<HelpModalProps> = ({ isOpen: controlledOpen, onClose }) => {
	const [internalOpen, setInternalOpen] = useState(false);
	const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
	const setIsOpen = onClose ? (open: boolean) => { if (!open) onClose(); } : setInternalOpen;

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
				return;
			}
			
			if (e.key === "?" || (e.shiftKey && e.key === "/")) {
				e.preventDefault();
				if (controlledOpen !== undefined && onClose) {
					onClose();
				} else {
					setInternalOpen((prev) => !prev);
				}
			} else if (e.key === "Escape" && isOpen) {
				setIsOpen(false);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, controlledOpen, onClose]);

	if (!isOpen) {
		// Show small hint in corner - positioned relative to viewport
		return (
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className="fixed bottom-4 z-30 px-2 py-1 rounded text-xs text-white/40 hover:text-white/70 transition-colors hidden sm:block"
				style={{
					// Position between center plot and right spectrum plot
					right: "calc(50% + 240px)",
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
			style={{ background: "rgba(0, 0, 0, 0.75)" }}
			onClick={() => setIsOpen(false)}
		>
			<div
				className="rounded-xl p-8 max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto scrollbar-hide"
				style={{
					background: "rgba(18, 18, 28, 0.96)",
					border: "1px solid rgba(255, 255, 255, 0.15)",
					backdropFilter: "blur(20px)",
					boxShadow: "0 16px 64px rgba(0, 0, 0, 0.5)",
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-xl font-semibold text-white">Keyboard Shortcuts</h2>
					<button
						type="button"
						onClick={() => setIsOpen(false)}
						className="text-white/50 hover:text-white text-2xl leading-none"
					>
						×
					</button>
				</div>

				<div className="space-y-3">
					{SHORTCUTS.map(({ key, action }) => (
						<div key={key} className="flex items-center justify-between text-[15px]">
							<kbd
								className="px-3 py-1.5 rounded text-sm font-mono"
								style={{
									background: "rgba(255, 255, 255, 0.08)",
									border: "1px solid rgba(255, 255, 255, 0.15)",
									color: "rgba(255, 255, 255, 0.95)",
								}}
							>
								{key}
							</kbd>
							<span className="text-white/75">{action}</span>
						</div>
					))}
				</div>

				<div className="mt-8 pt-5 border-t border-white/10 text-center text-sm text-white/45">
					Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/70">Esc</kbd> or click outside to close
				</div>
			</div>
		</div>
	);
};

export default HelpModal;
