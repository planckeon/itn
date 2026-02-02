import type React from "react";
import { useEffect, useRef, useState } from "react";
import useURLState from "../hooks/useURLState";

interface ShareButtonProps {
	isOpen?: boolean;
	onClose?: () => void;
}

/**
 * Share button/modal that copies the current simulation URL to clipboard
 */
const ShareButton: React.FC<ShareButtonProps> = ({
	isOpen: controlledOpen,
	onClose,
}) => {
	const { copyShareURL } = useURLState();
	const [copied, setCopied] = useState(false);
	const [internalOpen] = useState(false);
	const hasTriedCopy = useRef(false);

	const isControlled = controlledOpen !== undefined;
	const isOpen = isControlled ? controlledOpen : internalOpen;

	// Reset copy state when modal closes
	useEffect(() => {
		if (!isOpen) {
			setCopied(false);
			hasTriedCopy.current = false;
		}
	}, [isOpen]);

	// Auto-copy when opened in controlled mode
	useEffect(() => {
		if (isControlled && isOpen && !hasTriedCopy.current) {
			hasTriedCopy.current = true;
			copyShareURL().then((success) => {
				if (success) {
					setCopied(true);
					setTimeout(() => {
						if (onClose) onClose();
					}, 1200);
				} else {
					// Failed - close immediately
					if (onClose) onClose();
				}
			});
		}
	}, [isControlled, isOpen, copyShareURL, onClose]);

	const handleClick = async () => {
		const success = await copyShareURL();
		if (success) {
			setCopied(true);
			setTimeout(() => {
				setCopied(false);
				if (onClose) onClose();
			}, 1500);
		}
	};

	// Controlled mode: show modal
	if (isControlled) {
		if (!isOpen) return null;

		return (
			<div
				className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 pointer-events-auto"
				onClick={onClose}
			>
				<div
					className="rounded-xl p-6 text-center"
					style={{
						background: "rgba(20, 20, 30, 0.95)",
						border: "1px solid rgba(255, 255, 255, 0.1)",
					}}
					onClick={(e) => e.stopPropagation()}
				>
					<div className="text-2xl mb-2">{copied ? "✓" : "📋"}</div>
					<div className="text-white/80">
						{copied ? "Link copied to clipboard!" : "Copying..."}
					</div>
				</div>
			</div>
		);
	}

	// Uncontrolled mode: standalone button
	return (
		<button
			type="button"
			onClick={handleClick}
			className="fixed top-[60px] left-4 z-10 px-2 py-1 rounded-lg text-xs font-mono"
			style={{
				background: copied
					? "rgba(34, 197, 94, 0.3)"
					: "rgba(20, 20, 30, 0.85)",
				border: copied
					? "1px solid rgba(34, 197, 94, 0.5)"
					: "1px solid rgba(255, 255, 255, 0.1)",
				color: copied ? "rgb(134, 239, 172)" : "rgba(255, 255, 255, 0.7)",
				backdropFilter: "blur(8px)",
			}}
		>
			{copied ? "✓ Copied!" : "📋 Share"}
		</button>
	);
};

export default ShareButton;
