import type React from "react";
import { useState } from "react";
import useURLState from "../hooks/useURLState";

/**
 * Share button that copies the current simulation URL to clipboard
 */
const ShareButton: React.FC = () => {
	const { copyShareURL } = useURLState();
	const [copied, setCopied] = useState(false);

	const handleClick = async () => {
		const success = await copyShareURL();
		if (success) {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			className="fixed top-[68px] left-4 z-10 px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
			style={{
				background: copied ? "rgba(34, 197, 94, 0.3)" : "rgba(20, 20, 30, 0.85)",
				border: copied ? "1px solid rgba(34, 197, 94, 0.5)" : "1px solid rgba(255, 255, 255, 0.1)",
				color: copied ? "rgb(134, 239, 172)" : "rgba(255, 255, 255, 0.7)",
				backdropFilter: "blur(8px)",
			}}
		>
			{copied ? "✓ Copied!" : "📋 Share"}
		</button>
	);
};

export default ShareButton;
