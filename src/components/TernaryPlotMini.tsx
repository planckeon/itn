import type React from "react";
import { useRef, useEffect } from "react";

interface TernaryPlotMiniProps {
	Pe: number;
	Pmu: number;
	Ptau: number;
	history?: { Pe: number; Pmu: number; Ptau: number }[];
}

/**
 * Compact ternary plot for the bottom HUD
 * Shows flavor composition in a triangle
 */
const TernaryPlotMini: React.FC<TernaryPlotMiniProps> = ({ Pe, Pmu, Ptau, history = [] }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const size = 120;
	const padding = 8;

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const dpr = window.devicePixelRatio || 1;
		canvas.width = size * dpr;
		canvas.height = size * dpr;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		// Clear
		ctx.clearRect(0, 0, size, size);

		// Triangle vertices (equilateral, pointing up)
		const h = (size - padding * 2) * Math.sin(Math.PI / 3);
		const cx = size / 2;
		const top = { x: cx, y: padding };
		const left = { x: padding, y: padding + h };
		const right = { x: size - padding, y: padding + h };

		// Draw triangle outline
		ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(top.x, top.y);
		ctx.lineTo(right.x, right.y);
		ctx.lineTo(left.x, left.y);
		ctx.closePath();
		ctx.stroke();

		// Labels
		ctx.font = "9px monospace";
		ctx.textAlign = "center";
		ctx.fillStyle = "rgba(96, 165, 250, 0.8)"; // blue for e
		ctx.fillText("e", top.x, top.y - 2);
		ctx.fillStyle = "rgba(251, 146, 60, 0.8)"; // orange for μ
		ctx.fillText("μ", left.x - 6, left.y + 4);
		ctx.fillStyle = "rgba(232, 121, 249, 0.8)"; // pink for τ
		ctx.fillText("τ", right.x + 6, right.y + 4);

		// Convert probabilities to barycentric coordinates
		const toXY = (pe: number, pmu: number, ptau: number) => {
			const x = left.x * pmu + right.x * ptau + top.x * pe;
			const y = left.y * pmu + right.y * ptau + top.y * pe;
			return { x, y };
		};

		// Draw history trail
		if (history.length > 1) {
			ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
			ctx.lineWidth = 1;
			ctx.beginPath();
			const first = toXY(history[0].Pe, history[0].Pmu, history[0].Ptau);
			ctx.moveTo(first.x, first.y);
			for (let i = 1; i < history.length; i++) {
				const pt = toXY(history[i].Pe, history[i].Pmu, history[i].Ptau);
				ctx.lineTo(pt.x, pt.y);
			}
			ctx.stroke();
		}

		// Draw current position
		const current = toXY(Pe, Pmu, Ptau);
		
		// Glow
		const gradient = ctx.createRadialGradient(current.x, current.y, 0, current.x, current.y, 8);
		gradient.addColorStop(0, "rgba(96, 165, 250, 0.6)");
		gradient.addColorStop(1, "rgba(96, 165, 250, 0)");
		ctx.fillStyle = gradient;
		ctx.beginPath();
		ctx.arc(current.x, current.y, 8, 0, Math.PI * 2);
		ctx.fill();

		// Dot
		ctx.fillStyle = "rgb(96, 165, 250)";
		ctx.beginPath();
		ctx.arc(current.x, current.y, 3, 0, Math.PI * 2);
		ctx.fill();

	}, [Pe, Pmu, Ptau, history]);

	return (
		<canvas
			ref={canvasRef}
			style={{ width: size, height: size, display: "block" }}
		/>
	);
};

export default TernaryPlotMini;
