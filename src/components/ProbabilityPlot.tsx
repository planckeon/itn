import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

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
	const [containerWidth, setContainerWidth] = useState(500);

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

	const dimensions = useMemo(
		() => ({
			width: containerWidth - MARGIN.left - MARGIN.right,
			height: height - MARGIN.top - MARGIN.bottom,
		}),
		[containerWidth, height],
	);

	// Draw on canvas with proper DPI scaling
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const dpr = window.devicePixelRatio || 1;
		const { width: plotWidth, height: plotHeight } = dimensions;
		const totalWidth = containerWidth;
		const totalHeight = height;

		// Set canvas size with DPI scaling
		canvas.width = totalWidth * dpr;
		canvas.height = totalHeight * dpr;
		canvas.style.width = `${totalWidth}px`;
		canvas.style.height = `${totalHeight}px`;
		
		// Scale context for DPI
		ctx.scale(dpr, dpr);

		// Clear
		ctx.clearRect(0, 0, totalWidth, totalHeight);

		if (data.length === 0) return;

		const maxDistance = data[data.length - 1]?.distance || 1;

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
		ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
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

			for (let i = 0; i < data.length; i++) {
				const item = data[i];
				const x = MARGIN.left + (item.distance / maxDistance) * plotWidth;
				const y = MARGIN.top + plotHeight - item.probabilities[flavor] * plotHeight;

				if (i === 0) {
					ctx.moveTo(x, y);
				} else {
					ctx.lineTo(x, y);
				}
			}

			ctx.stroke();
		}

		// Draw current position markers at the rightmost point of each line
		if (data.length > 0) {
			const lastData = data[data.length - 1];
			for (const flavor of flavors) {
				const x = MARGIN.left + (lastData.distance / maxDistance) * plotWidth;
				const y = MARGIN.top + plotHeight - lastData.probabilities[flavor] * plotHeight;

				ctx.fillStyle = flavorColors[flavor];
				ctx.beginPath();
				ctx.arc(x, y, 4, 0, Math.PI * 2);
				ctx.fill();
			}
		}
	}, [data, dimensions, containerWidth, height, flavorColors, distanceLabel]);

	return (
		<div ref={containerRef} className="w-full">
			<canvas ref={canvasRef} />
		</div>
	);
};

export default ProbabilityPlot;
