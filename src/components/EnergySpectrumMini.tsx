import type React from "react";
import { useEffect, useMemo, useRef } from "react";
import { useSimulation } from "../context/SimulationContext";
import { getProbabilitiesForInitialFlavor } from "../physics/NuFastPort";
import type { OscillationParameters } from "../physics/types";

// NuFit 5.2 values
const THETA12_DEG = 33.44;
const THETA13_DEG = 8.57;
const THETA23_DEG = 49.2;
const DM21_SQ = 7.42e-5;
const DM31_SQ_NO = 2.517e-3;
const DM31_SQ_IO = -2.498e-3;
const YE = 0.5;

/**
 * Compact energy spectrum plot for the bottom HUD
 * Shows P vs E at current distance
 */
const EnergySpectrumMini: React.FC<{ distance: number }> = ({ distance }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { state } = useSimulation();
	const width = 160;
	const height = 120;

	// Calculate spectrum data
	const spectrumData = useMemo(() => {
		if (distance <= 0) return [];

		const initialFlavorIndex =
			state.initialFlavor === "electron"
				? 0
				: state.initialFlavor === "muon"
					? 1
					: 2;
		const effectiveDeltaCP = state.isAntineutrino
			? -state.deltaCP
			: state.deltaCP;
		const dm31sq = state.massOrdering === "normal" ? DM31_SQ_NO : DM31_SQ_IO;

		const points: { energy: number; Pe: number; Pmu: number; Ptau: number }[] =
			[];
		const minE = 0.1;
		const maxE = 10;
		const numPoints = 50;

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
				matterEffect: state.matter,
				rho: state.density,
				Ye: YE,
				initialFlavorIndex,
				N_Newton: 0,
				maxL: 3000,
				isAntineutrino: state.isAntineutrino,
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
	}, [
		distance,
		state.initialFlavor,
		state.matter,
		state.density,
		state.deltaCP,
		state.isAntineutrino,
		state.massOrdering,
	]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const dpr = window.devicePixelRatio || 1;
		canvas.width = width * dpr;
		canvas.height = height * dpr;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		// Clear
		ctx.clearRect(0, 0, width, height);

		const padding = { top: 16, right: 8, bottom: 16, left: 24 };
		const plotW = width - padding.left - padding.right;
		const plotH = height - padding.top - padding.bottom;

		// Title
		ctx.font = "9px monospace";
		ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
		ctx.textAlign = "center";
		ctx.fillText(`P(E) @ ${Math.round(distance)} km`, width / 2, 10);

		// Axes
		ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(padding.left, padding.top);
		ctx.lineTo(padding.left, height - padding.bottom);
		ctx.lineTo(width - padding.right, height - padding.bottom);
		ctx.stroke();

		// Y axis labels
		ctx.font = "8px monospace";
		ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
		ctx.textAlign = "right";
		ctx.fillText("1", padding.left - 3, padding.top + 3);
		ctx.fillText("0", padding.left - 3, height - padding.bottom + 3);

		// X axis labels
		ctx.textAlign = "center";
		ctx.fillText("0.1", padding.left, height - 3);
		ctx.fillText("10", width - padding.right, height - 3);

		if (spectrumData.length === 0) return;

		// Map to coordinates
		const minE = 0.1;
		const maxE = 10;
		const eToX = (e: number) =>
			padding.left + ((e - minE) / (maxE - minE)) * plotW;
		const pToY = (p: number) =>
			padding.top + plotH * (1 - Math.max(0, Math.min(1, p)));

		// Draw curves
		const drawCurve = (key: "Pe" | "Pmu" | "Ptau", color: string) => {
			ctx.strokeStyle = color;
			ctx.lineWidth = 1.5;
			ctx.beginPath();
			for (let i = 0; i < spectrumData.length; i++) {
				const pt = spectrumData[i];
				const x = eToX(pt.energy);
				const y = pToY(pt[key]);
				if (i === 0) ctx.moveTo(x, y);
				else ctx.lineTo(x, y);
			}
			ctx.stroke();
		};

		drawCurve("Pe", "rgb(96, 165, 250)");
		drawCurve("Pmu", "rgb(251, 146, 60)");
		drawCurve("Ptau", "rgb(232, 121, 249)");

		// Current energy marker
		const markerX = eToX(state.energy);
		ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
		ctx.setLineDash([2, 2]);
		ctx.beginPath();
		ctx.moveTo(markerX, padding.top);
		ctx.lineTo(markerX, height - padding.bottom);
		ctx.stroke();
		ctx.setLineDash([]);
	}, [spectrumData, state.energy, distance]);

	return <canvas ref={canvasRef} style={{ width, height, display: "block" }} />;
};

export default EnergySpectrumMini;
