import type React from "react";
import { useRef, useEffect } from "react";
import { useSimulation } from "../context/SimulationContext";
import InfoTooltip, { PHYSICS_INFO } from "./InfoTooltip";

/**
 * Ternary Plot (Triangle Plot) for visualizing neutrino flavor evolution
 * 
 * Each corner represents 100% probability of one flavor:
 * - Top: νₑ (electron, blue)
 * - Bottom-left: νμ (muon, orange)
 * - Bottom-right: ντ (tau, magenta)
 * 
 * The neutrino traces a path through this space as it oscillates.
 * Inspired by VISOS (VISualisation of OScillation) project.
 */

// Flavor colors matching the probability plot
const COLORS = {
	electron: "#60a5fa", // blue-400
	muon: "#fb923c", // orange-400
	tau: "#e879f9", // fuchsia-400
	trail: "rgba(255, 255, 255, 0.3)",
	current: "#ffffff",
};

const TernaryPlot: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { state } = useSimulation();

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Get device pixel ratio for crisp rendering
		const dpr = window.devicePixelRatio || 1;
		const rect = canvas.getBoundingClientRect();

		// Set canvas size accounting for DPI
		canvas.width = rect.width * dpr;
		canvas.height = rect.height * dpr;

		// Use setTransform to avoid compounding scale transforms
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		const width = rect.width;
		const height = rect.height;
		const padding = 30;

		// Triangle dimensions (equilateral triangle)
		const triangleHeight = height - padding * 2;
		const triangleSide = triangleHeight / (Math.sqrt(3) / 2);
		const centerX = width / 2;
		const topY = padding;
		const bottomY = height - padding;

		// Triangle vertices (in canvas coordinates)
		// Top: electron (Pe=1, Pmu=0, Ptau=0)
		const electronVertex = { x: centerX, y: topY };
		// Bottom-left: muon (Pe=0, Pmu=1, Ptau=0)
		const muonVertex = { x: centerX - triangleSide / 2, y: bottomY };
		// Bottom-right: tau (Pe=0, Pmu=0, Ptau=1)
		const tauVertex = { x: centerX + triangleSide / 2, y: bottomY };

		// Clear canvas
		ctx.fillStyle = "rgba(15, 15, 25, 0.95)";
		ctx.fillRect(0, 0, width, height);

		// Draw triangle outline
		ctx.beginPath();
		ctx.moveTo(electronVertex.x, electronVertex.y);
		ctx.lineTo(muonVertex.x, muonVertex.y);
		ctx.lineTo(tauVertex.x, tauVertex.y);
		ctx.closePath();
		ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
		ctx.lineWidth = 1;
		ctx.stroke();

		// Draw grid lines (probability contours)
		ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
		ctx.lineWidth = 0.5;
		for (let i = 1; i < 4; i++) {
			const t = i / 4;
			// Lines parallel to each side
			// Parallel to bottom (constant Pe)
			const p1 = lerpPoint(electronVertex, muonVertex, t);
			const p2 = lerpPoint(electronVertex, tauVertex, t);
			ctx.beginPath();
			ctx.moveTo(p1.x, p1.y);
			ctx.lineTo(p2.x, p2.y);
			ctx.stroke();

			// Parallel to left side (constant Ptau)
			const p3 = lerpPoint(muonVertex, electronVertex, t);
			const p4 = lerpPoint(muonVertex, tauVertex, t);
			ctx.beginPath();
			ctx.moveTo(p3.x, p3.y);
			ctx.lineTo(p4.x, p4.y);
			ctx.stroke();

			// Parallel to right side (constant Pmu)
			const p5 = lerpPoint(tauVertex, electronVertex, t);
			const p6 = lerpPoint(tauVertex, muonVertex, t);
			ctx.beginPath();
			ctx.moveTo(p5.x, p5.y);
			ctx.lineTo(p6.x, p6.y);
			ctx.stroke();
		}

		// Draw vertex labels
		ctx.font = "bold 12px monospace";
		ctx.textAlign = "center";

		// Electron (top)
		ctx.fillStyle = COLORS.electron;
		ctx.fillText("νₑ", electronVertex.x, electronVertex.y - 8);

		// Muon (bottom-left)
		ctx.fillStyle = COLORS.muon;
		ctx.fillText("νμ", muonVertex.x - 10, muonVertex.y + 15);

		// Tau (bottom-right)
		ctx.fillStyle = COLORS.tau;
		ctx.fillText("ντ", tauVertex.x + 10, tauVertex.y + 15);

		// Convert probabilities to ternary coordinates
		const toTernary = (Pe: number, Pmu: number, Ptau: number) => {
			// Ternary coordinates: weighted sum of vertices
			const x = Pe * electronVertex.x + Pmu * muonVertex.x + Ptau * tauVertex.x;
			const y = Pe * electronVertex.y + Pmu * muonVertex.y + Ptau * tauVertex.y;
			return { x, y };
		};

		// Draw probability history trail
		const history = state.probabilityHistory;
		if (history.length > 1) {
			ctx.beginPath();
			const firstPoint = toTernary(history[0].Pe, history[0].Pmu, history[0].Ptau);
			ctx.moveTo(firstPoint.x, firstPoint.y);

			for (let i = 1; i < history.length; i++) {
				const h = history[i];
				// Skip invalid points
				if (Number.isNaN(h.Pe) || Number.isNaN(h.Pmu) || Number.isNaN(h.Ptau)) continue;
				const point = toTernary(h.Pe, h.Pmu, h.Ptau);
				ctx.lineTo(point.x, point.y);
			}

			// Create gradient for trail (fade older points)
			const gradient = ctx.createLinearGradient(
				firstPoint.x, firstPoint.y,
				history[history.length - 1] ? toTernary(
					history[history.length - 1].Pe,
					history[history.length - 1].Pmu,
					history[history.length - 1].Ptau
				).x : firstPoint.x,
				history[history.length - 1] ? toTernary(
					history[history.length - 1].Pe,
					history[history.length - 1].Pmu,
					history[history.length - 1].Ptau
				).y : firstPoint.y
			);
			gradient.addColorStop(0, "rgba(255, 255, 255, 0.1)");
			gradient.addColorStop(1, "rgba(255, 255, 255, 0.6)");

			ctx.strokeStyle = gradient;
			ctx.lineWidth = 1.5;
			ctx.stroke();
		}

		// Draw current position
		if (history.length > 0) {
			const current = history[history.length - 1];
			if (!Number.isNaN(current.Pe) && !Number.isNaN(current.Pmu) && !Number.isNaN(current.Ptau)) {
				const currentPoint = toTernary(current.Pe, current.Pmu, current.Ptau);

				// Glow effect
				const glowGradient = ctx.createRadialGradient(
					currentPoint.x, currentPoint.y, 0,
					currentPoint.x, currentPoint.y, 12
				);

				// Color based on dominant flavor
				const dominantColor = current.Pe >= current.Pmu && current.Pe >= current.Ptau
					? COLORS.electron
					: current.Pmu >= current.Ptau
						? COLORS.muon
						: COLORS.tau;

				glowGradient.addColorStop(0, dominantColor);
				glowGradient.addColorStop(0.5, dominantColor.replace(")", ", 0.5)").replace("rgb", "rgba"));
				glowGradient.addColorStop(1, "transparent");

				ctx.beginPath();
				ctx.arc(currentPoint.x, currentPoint.y, 12, 0, Math.PI * 2);
				ctx.fillStyle = glowGradient;
				ctx.fill();

				// Center dot
				ctx.beginPath();
				ctx.arc(currentPoint.x, currentPoint.y, 4, 0, Math.PI * 2);
				ctx.fillStyle = COLORS.current;
				ctx.fill();
			}
		}

		// Draw title
		ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
		ctx.font = "10px monospace";
		ctx.textAlign = "center";
		ctx.fillText("Flavor Space", centerX, height - 5);

	}, [state.probabilityHistory]);

	return (
		<div
			className="absolute bottom-4 left-4 z-10"
			style={{
				background: "rgba(20, 20, 30, 0.85)",
				backdropFilter: "blur(8px)",
				borderRadius: "8px",
				padding: "8px",
				border: "1px solid rgba(255, 255, 255, 0.1)",
			}}
		>
			{/* Info button in top right corner */}
			<div className="absolute top-1 right-1">
				<InfoTooltip text={PHYSICS_INFO.ternaryPlot} />
			</div>
			<canvas
				ref={canvasRef}
				style={{ width: "150px", height: "150px" }}
			/>
		</div>
	);
};

// Linear interpolation between two points
function lerpPoint(a: { x: number; y: number }, b: { x: number; y: number }, t: number) {
	return {
		x: a.x + (b.x - a.x) * t,
		y: a.y + (b.y - a.y) * t,
	};
}

export default TernaryPlot;
