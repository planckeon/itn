import type React from "react";
import { useEffect, useRef, useState } from "react";

interface ProbabilityData {
	distance: number;
	probabilities: {
		electron: number;
		muon: number;
		tau: number;
	};
}

interface ProbabilityPlotProps {
	data: ProbabilityData[];
	flavors: string[];
	flavorColors: Record<string, string>;
	height?: number;
	distanceLabel: string;
	probabilityLabel: string;
}

const MARGIN = { top: 8, right: 16, bottom: 24, left: 32 };
const Y_TICKS = [0, 0.5, 1.0];

const ProbabilityPlot: React.FC<ProbabilityPlotProps> = ({
	data,
	flavorColors,
	height = 100,
	distanceLabel,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [containerWidth, setContainerWidth] = useState(0);

	// Observe container size for responsiveness
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				setContainerWidth(entry.contentRect.width);
			}
		});

		resizeObserver.observe(container);
		setContainerWidth(container.clientWidth);

		return () => resizeObserver.disconnect();
	}, []);

	// Draw on canvas
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || containerWidth === 0) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const dpr = window.devicePixelRatio || 1;
		const totalWidth = containerWidth;
		const totalHeight = height;
		const plotWidth = totalWidth - MARGIN.left - MARGIN.right;
		const plotHeight = totalHeight - MARGIN.top - MARGIN.bottom;

		// Set canvas size with DPI scaling
		canvas.width = totalWidth * dpr;
		canvas.height = totalHeight * dpr;
		canvas.style.width = `${totalWidth}px`;
		canvas.style.height = `${totalHeight}px`;

		// Reset transform and scale for DPI
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		// Clear with transparent
		ctx.clearRect(0, 0, totalWidth, totalHeight);

		// Early return if no data
		if (data.length === 0) {
			// Draw empty state - just axes
			ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(MARGIN.left, MARGIN.top);
			ctx.lineTo(MARGIN.left, MARGIN.top + plotHeight);
			ctx.lineTo(MARGIN.left + plotWidth, MARGIN.top + plotHeight);
			ctx.stroke();
			return;
		}

		const maxDistance = Math.max(1, data[data.length - 1]?.distance || 1);

		// Draw axes
		ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
		ctx.lineWidth = 1;

		// Y-axis
		ctx.beginPath();
		ctx.moveTo(MARGIN.left, MARGIN.top);
		ctx.lineTo(MARGIN.left, MARGIN.top + plotHeight);
		ctx.stroke();

		// X-axis
		ctx.beginPath();
		ctx.moveTo(MARGIN.left, MARGIN.top + plotHeight);
		ctx.lineTo(MARGIN.left + plotWidth, MARGIN.top + plotHeight);
		ctx.stroke();

		// Y-axis ticks and grid
		ctx.font = "10px monospace";
		ctx.textAlign = "right";

		for (const tick of Y_TICKS) {
			const y = MARGIN.top + plotHeight - tick * plotHeight;

			// Grid line
			ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
			ctx.beginPath();
			ctx.moveTo(MARGIN.left, y);
			ctx.lineTo(MARGIN.left + plotWidth, y);
			ctx.stroke();

			// Label
			ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
			ctx.fillText(tick.toFixed(1), MARGIN.left - 4, y + 3);
		}

		// X-axis label
		ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
		ctx.textAlign = "right";
		ctx.fillText(distanceLabel, MARGIN.left + plotWidth, MARGIN.top + plotHeight + 16);

		// Draw probability lines
		const flavors: ("electron" | "muon" | "tau")[] = ["electron", "muon", "tau"];

		for (const flavor of flavors) {
			if (data.length < 2) continue;

			ctx.strokeStyle = flavorColors[flavor];
			ctx.lineWidth = 2;
			ctx.lineCap = "round";
			ctx.lineJoin = "round";
			ctx.beginPath();

			let started = false;
			for (let i = 0; i < data.length; i++) {
				const item = data[i];
				const prob = item.probabilities[flavor];
				
				// Skip invalid data
				if (typeof prob !== 'number' || Number.isNaN(prob)) continue;
				
				const x = MARGIN.left + (item.distance / maxDistance) * plotWidth;
				const y = MARGIN.top + plotHeight - prob * plotHeight;

				if (!started) {
					ctx.moveTo(x, y);
					started = true;
				} else {
					ctx.lineTo(x, y);
				}
			}

			if (started) {
				ctx.stroke();
			}
		}

		// Draw current position markers at the rightmost point of each line
		if (data.length > 0) {
			const lastData = data[data.length - 1];
			for (const flavor of flavors) {
				const prob = lastData.probabilities[flavor];
				if (typeof prob !== 'number' || Number.isNaN(prob)) continue;
				
				const x = MARGIN.left + (lastData.distance / maxDistance) * plotWidth;
				const y = MARGIN.top + plotHeight - prob * plotHeight;

				ctx.fillStyle = flavorColors[flavor];
				ctx.beginPath();
				ctx.arc(x, y, 4, 0, Math.PI * 2);
				ctx.fill();
			}
		}
	}, [data, containerWidth, height, flavorColors, distanceLabel]);

	return (
		<div ref={containerRef} className="w-full">
			<canvas ref={canvasRef} />
		</div>
	);
};

export default ProbabilityPlot;
