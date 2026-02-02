import type React from "react";
import { useRef, useEffect, useMemo } from "react";
import { useSimulation } from "../context/SimulationContext";
import { getProbabilitiesForInitialFlavor } from "../physics/NuFastPort";
import type { OscillationParameters } from "../physics/types";
import InfoTooltip from "./InfoTooltip";

// NuFit 5.2 values
const THETA12_DEG = 33.44;
const THETA13_DEG = 8.57;
const THETA23_DEG = 49.2;
const DM21_SQ = 7.42e-5;
const DM31_SQ_NO = 2.517e-3;
const DM31_SQ_IO = -2.498e-3;
const YE = 0.5;

const COLORS = {
	electron: "rgb(59, 130, 246)",
	muon: "rgb(251, 146, 60)",
	tau: "rgb(217, 70, 239)",
	grid: "rgba(255, 255, 255, 0.1)",
	axis: "rgba(255, 255, 255, 0.3)",
	text: "rgba(255, 255, 255, 0.6)",
	currentEnergy: "rgba(255, 255, 255, 0.8)",
};

const INFO_TEXT = `Energy Spectrum: P vs E at current distance.

Dashed line = selected energy.
Lower E = faster oscillation.
Higher E = slower oscillation.`;

/**
 * Shows P(ν_α → ν_β) vs Energy at fixed distance L
 */
const EnergySpectrumPlot: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { state } = useSimulation();

	// Calculate spectrum data
	const spectrumData = useMemo(() => {
		const { distance, initialFlavor, matter, density, deltaCP, isAntineutrino, massOrdering } = state;
		
		if (distance <= 0) return [];

		const initialFlavorIndex = initialFlavor === "electron" ? 0 : initialFlavor === "muon" ? 1 : 2;
		const effectiveDeltaCP = isAntineutrino ? -deltaCP : deltaCP;
		const dm31sq = massOrdering === "normal" ? DM31_SQ_NO : DM31_SQ_IO;

		const points: { energy: number; Pe: number; Pmu: number; Ptau: number }[] = [];
		const minE = 0.1;
		const maxE = 10;
		const numPoints = 200;

		for (let i = 0; i <= numPoints; i++) {
			const energy = minE + (maxE - minE) * (i / numPoints);

			const params: OscillationParameters = {
				theta12_deg: THETA12_DEG,
				theta13_deg: THETA13_DEG,
				theta23_deg: THETA23_DEG,
				deltaCP_deg: effectiveDeltaCP,
				dm21sq_eV2: DM21_SQ,
				dm31sq_eV2: dm31sq,
				L: distance,
				energy: energy,
				matterEffect: matter,
				rho: density,
				Ye: YE,
				initialFlavorIndex,
				N_Newton: 0,
				maxL: 3000,
				isAntineutrino,
			};

			const probs = getProbabilitiesForInitialFlavor(params);
			points.push({
				energy,
				Pe: probs[0],
				Pmu: probs[1],
				Ptau: probs[2],
			});
		}

		return points;
	}, [state.distance, state.initialFlavor, state.matter, state.density, state.deltaCP, state.isAntineutrino, state.massOrdering]);

	// Draw the plot
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const dpr = window.devicePixelRatio || 1;
		const width = 260;
		const height = 150;

		canvas.width = width * dpr;
		canvas.height = height * dpr;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		// Clear
		ctx.fillStyle = "rgba(20, 20, 30, 0.9)";
		ctx.fillRect(0, 0, width, height);

		const padding = { top: 20, right: 15, bottom: 25, left: 35 };
		const plotWidth = width - padding.left - padding.right;
		const plotHeight = height - padding.top - padding.bottom;

		// Draw grid
		ctx.strokeStyle = COLORS.grid;
		ctx.lineWidth = 0.5;

		// Horizontal grid lines (0, 0.5, 1.0)
		for (let p = 0; p <= 1; p += 0.5) {
			const y = padding.top + plotHeight * (1 - p);
			ctx.beginPath();
			ctx.moveTo(padding.left, y);
			ctx.lineTo(padding.left + plotWidth, y);
			ctx.stroke();
		}

		// Draw axes labels
		ctx.fillStyle = COLORS.text;
		ctx.font = "9px monospace";
		ctx.textAlign = "right";
		ctx.fillText("1.0", padding.left - 3, padding.top + 3);
		ctx.fillText("0.5", padding.left - 3, padding.top + plotHeight / 2 + 3);
		ctx.fillText("0", padding.left - 3, padding.top + plotHeight + 3);

		// X-axis labels
		ctx.textAlign = "center";
		ctx.fillText("0.1", padding.left, height - 5);
		ctx.fillText("5", padding.left + plotWidth / 2, height - 5);
		ctx.fillText("10 GeV", padding.left + plotWidth - 5, height - 5);

		// Title with subscript-style formatting
		ctx.fillStyle = COLORS.text;
		ctx.font = "10px monospace";
		ctx.textAlign = "left";
		const titleX = padding.left;
		ctx.fillText("P vs E", titleX, 12);
		ctx.font = "9px monospace";
		ctx.fillText(`(L=${state.distance.toFixed(0)} km)`, titleX + 42, 12);

		if (spectrumData.length === 0) {
			ctx.fillStyle = COLORS.text;
			ctx.textAlign = "center";
			ctx.fillText("Start simulation to see spectrum", width / 2, height / 2);
			return;
		}

		// Map energy to x (log scale would be nice but linear is clearer)
		const minE = 0.1;
		const maxE = 10;
		const eToX = (e: number) => padding.left + ((e - minE) / (maxE - minE)) * plotWidth;
		const pToY = (p: number) => padding.top + plotHeight * (1 - Math.max(0, Math.min(1, p)));

		// Draw probability curves
		const drawCurve = (key: "Pe" | "Pmu" | "Ptau", color: string) => {
			ctx.strokeStyle = color;
			ctx.lineWidth = 1.5;
			ctx.beginPath();

			for (let i = 0; i < spectrumData.length; i++) {
				const point = spectrumData[i];
				const x = eToX(point.energy);
				const y = pToY(point[key]);

				if (i === 0) {
					ctx.moveTo(x, y);
				} else {
					ctx.lineTo(x, y);
				}
			}
			ctx.stroke();
		};

		drawCurve("Pe", COLORS.electron);
		drawCurve("Pmu", COLORS.muon);
		drawCurve("Ptau", COLORS.tau);

		// Draw current energy marker
		const currentX = eToX(state.energy);
		if (currentX >= padding.left && currentX <= padding.left + plotWidth) {
			ctx.strokeStyle = COLORS.currentEnergy;
			ctx.lineWidth = 1;
			ctx.setLineDash([4, 4]);
			ctx.beginPath();
			ctx.moveTo(currentX, padding.top);
			ctx.lineTo(currentX, padding.top + plotHeight);
			ctx.stroke();
			ctx.setLineDash([]);

			// Label - position depends on x to avoid title overlap
			ctx.fillStyle = COLORS.currentEnergy;
			ctx.font = "8px monospace";
			ctx.textAlign = "center";
			// If energy marker is in left third, put label on right side of line
			// Otherwise put it above the line
			if (currentX < padding.left + plotWidth * 0.4) {
				// Put label to the right of the dashed line
				ctx.textAlign = "left";
				ctx.fillText(`${state.energy.toFixed(1)}`, currentX + 3, padding.top + 10);
			} else {
				// Put label above the dashed line
				ctx.fillText(`${state.energy.toFixed(1)}`, currentX, padding.top - 3);
			}
		}

	}, [spectrumData, state.distance, state.energy]);

	return (
		<div
			className="absolute bottom-4 right-4 z-10"
			style={{
				background: "rgba(20, 20, 30, 0.85)",
				backdropFilter: "blur(8px)",
				borderRadius: "8px",
				padding: "8px",
				border: "1px solid rgba(255, 255, 255, 0.1)",
			}}
		>
			<div className="absolute top-1 right-1">
				<InfoTooltip text={INFO_TEXT} position="left" />
			</div>
			<canvas
				ref={canvasRef}
				style={{ width: "260px", height: "150px" }}
			/>
		</div>
	);
};

export default EnergySpectrumPlot;
