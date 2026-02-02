import type React from "react";
import { useState } from "react";
import useURLState from "../hooks/useURLState";

interface MenuDrawerProps {
	onOpenLearnMore: () => void;
	onOpenSettings: () => void;
	onOpenHelp: () => void;
}

/**
 * Collapsible menu drawer - consolidates Share, Learn More, Settings, Help
 * Keeps the main view clean while providing access to all features
 */
const MenuDrawer: React.FC<MenuDrawerProps> = ({ onOpenLearnMore, onOpenSettings, onOpenHelp }) => {
	const [isOpen, setIsOpen] = useState(false);
	const { copyShareURL } = useURLState();
	const [copied, setCopied] = useState(false);

	const handleShare = async () => {
		const success = await copyShareURL();
		if (success) {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	return (
		<div className="fixed top-20 left-4 z-30">
			{/* Toggle button */}
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-105"
				style={{
					background: isOpen ? "rgba(59, 130, 246, 0.3)" : "rgba(30, 30, 40, 0.9)",
					border: "1px solid rgba(255, 255, 255, 0.15)",
					backdropFilter: "blur(8px)",
				}}
				title="Menu"
			>
				<span className="text-white/80 text-lg">{isOpen ? "✕" : "☰"}</span>
			</button>

			{/* Drawer content */}
			{isOpen && (
				<div
					className="mt-2 rounded-lg overflow-hidden"
					style={{
						background: "rgba(20, 20, 30, 0.95)",
						border: "1px solid rgba(255, 255, 255, 0.1)",
						backdropFilter: "blur(12px)",
					}}
				>
					<button
						type="button"
						onClick={handleShare}
						className="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/10 transition-colors flex items-center gap-3 border-b border-white/5"
					>
						<span>{copied ? "✓" : "📋"}</span>
						<span>{copied ? "Copied!" : "Share Link"}</span>
					</button>
					<button
						type="button"
						onClick={() => { onOpenLearnMore(); setIsOpen(false); }}
						className="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/10 transition-colors flex items-center gap-3 border-b border-white/5"
					>
						<span>📚</span>
						<span>Learn More</span>
					</button>
					<button
						type="button"
						onClick={() => { onOpenSettings(); setIsOpen(false); }}
						className="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/10 transition-colors flex items-center gap-3 border-b border-white/5"
					>
						<span>⚙️</span>
						<span>Settings</span>
					</button>
					<button
						type="button"
						onClick={() => { onOpenHelp(); setIsOpen(false); }}
						className="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/10 transition-colors flex items-center gap-3"
					>
						<span>❓</span>
						<span>Help (Shortcuts)</span>
					</button>
				</div>
			)}
		</div>
	);
};

export default MenuDrawer;
