import { type JSAnimation, animate, utils } from "animejs";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

// Increased margins for better label visibility
const MARGIN = { top: 16, right: 24, bottom: 40, left: 52 };
const Y_TICKS = [0, 0.25, 0.5, 0.75, 1.0];

// Glow colors for each flavor (slightly saturated versions)
const GLOW_COLORS: Record<string, string> = {
	electron: "rgba(96, 165, 250, 0.6)",
	muon: "rgba(251, 146, 60, 0.6)",
	tau: "rgba(232, 121, 249, 0.6)",
};

const ProbabilityPlot: React.FC<ProbabilityPlotProps> = ({
	data,
	flavorColors,
	height = 180,
	distanceLabel,
	probabilityLabel,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);
	const animationRefs = useRef<JSAnimation[]>([]);
	const [containerWidth, setContainerWidth] = useState(600);

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

	const getPathData = useCallback(
		(
			flavor: "electron" | "muon" | "tau",
			plotWidth: number,
			plotHeight: number,
			maxDistance: number,
		) => {
			return data
				.map((item, index) => {
					const x = (item.distance / maxDistance) * plotWidth;
					const y = plotHeight - item.probabilities[flavor] * plotHeight;
					return `${index === 0 ? "M" : "L"}${x},${y}`;
				})
				.join(" ");
		},
		[data],
	);

	// Calculate nice x-axis ticks
	const getXTicks = useCallback((maxDistance: number): number[] => {
		if (maxDistance <= 0) return [0];

		// Find a nice step size
		const targetTicks = 5;
		const rawStep = maxDistance / targetTicks;
		const magnitude = 10 ** Math.floor(Math.log10(rawStep));
		const normalized = rawStep / magnitude;

		let step: number;
		if (normalized <= 1) step = magnitude;
		else if (normalized <= 2) step = 2 * magnitude;
		else if (normalized <= 5) step = 5 * magnitude;
		else step = 10 * magnitude;

		const ticks: number[] = [];
		for (let tick = 0; tick <= maxDistance; tick += step) {
			ticks.push(Math.round(tick));
		}
		// Always include the max if not already there
		if (ticks[ticks.length - 1] < maxDistance) {
			ticks.push(Math.round(maxDistance));
		}
		return ticks;
	}, []);

	useEffect(() => {
		const svg = svgRef.current;
		if (
			!data ||
			data.length === 0 ||
			!svg ||
			dimensions.width <= 0 ||
			dimensions.height <= 0
		) {
			return;
		}

		// Clear previous animations
		for (const anim of animationRefs.current) {
			if (anim) {
				anim.pause();
			}
		}
		animationRefs.current = [];

		const { width: plotWidth, height: plotHeight } = dimensions;
		const numDataPoints = data.length;
		const maxDistance = data[numDataPoints - 1]?.distance || 1;
		const xTicks = getXTicks(maxDistance);

		// Clear previous drawings
		svg.innerHTML = "";

		// Create defs for filters (glow effects)
		const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
		svg.appendChild(defs);

		// Create glow filters for each flavor
		const flavors: ("electron" | "muon" | "tau")[] = [
			"electron",
			"muon",
			"tau",
		];

		for (const flavor of flavors) {
			const filter = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"filter",
			);
			filter.setAttribute("id", `glow-${flavor}`);
			filter.setAttribute("x", "-50%");
			filter.setAttribute("y", "-50%");
			filter.setAttribute("width", "200%");
			filter.setAttribute("height", "200%");

			const feGaussianBlur = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"feGaussianBlur",
			);
			feGaussianBlur.setAttribute("stdDeviation", "3");
			feGaussianBlur.setAttribute("result", "coloredBlur");
			filter.appendChild(feGaussianBlur);

			const feMerge = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"feMerge",
			);
			const feMergeNode1 = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"feMergeNode",
			);
			feMergeNode1.setAttribute("in", "coloredBlur");
			const feMergeNode2 = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"feMergeNode",
			);
			feMergeNode2.setAttribute("in", "SourceGraphic");
			feMerge.appendChild(feMergeNode1);
			feMerge.appendChild(feMergeNode2);
			filter.appendChild(feMerge);

			defs.appendChild(filter);
		}

		// Create main group with margins
		const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
		g.setAttribute("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);
		svg.appendChild(g);

		// Draw grid lines (horizontal) - more visible
		for (const tick of Y_TICKS) {
			const y = plotHeight - tick * plotHeight;
			const gridLine = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"line",
			);
			gridLine.setAttribute("x1", "0");
			gridLine.setAttribute("y1", y.toString());
			gridLine.setAttribute("x2", plotWidth.toString());
			gridLine.setAttribute("y2", y.toString());
			gridLine.setAttribute("stroke", "rgba(255, 255, 255, 0.12)");
			gridLine.setAttribute("stroke-width", "1");
			gridLine.setAttribute("stroke-dasharray", "4,4");
			g.appendChild(gridLine);
		}

		// Draw Y-axis - cleaner and brighter
		const yAxis = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"line",
		);
		yAxis.setAttribute("x1", "0");
		yAxis.setAttribute("y1", "0");
		yAxis.setAttribute("x2", "0");
		yAxis.setAttribute("y2", plotHeight.toString());
		yAxis.setAttribute("stroke", "rgba(255, 255, 255, 0.4)");
		yAxis.setAttribute("stroke-width", "1.5");
		g.appendChild(yAxis);

		// Draw X-axis - cleaner and brighter
		const xAxis = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"line",
		);
		xAxis.setAttribute("x1", "0");
		xAxis.setAttribute("y1", plotHeight.toString());
		xAxis.setAttribute("x2", plotWidth.toString());
		xAxis.setAttribute("y2", plotHeight.toString());
		xAxis.setAttribute("stroke", "rgba(255, 255, 255, 0.4)");
		xAxis.setAttribute("stroke-width", "1.5");
		g.appendChild(xAxis);

		// Y-axis ticks and labels - larger and brighter
		for (const tick of Y_TICKS) {
			const y = plotHeight - tick * plotHeight;

			// Tick mark
			const tickMark = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"line",
			);
			tickMark.setAttribute("x1", "-6");
			tickMark.setAttribute("y1", y.toString());
			tickMark.setAttribute("x2", "0");
			tickMark.setAttribute("y2", y.toString());
			tickMark.setAttribute("stroke", "rgba(255, 255, 255, 0.5)");
			tickMark.setAttribute("stroke-width", "1.5");
			g.appendChild(tickMark);

			// Label - larger font
			const label = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"text",
			);
			label.setAttribute("x", "-10");
			label.setAttribute("y", (y + 4).toString());
			label.setAttribute("text-anchor", "end");
			label.setAttribute("fill", "rgba(255, 255, 255, 0.7)");
			label.setAttribute("font-size", "11");
			label.setAttribute("font-family", "system-ui, sans-serif");
			label.textContent = tick.toFixed(tick % 0.5 === 0 ? 1 : 2);
			g.appendChild(label);
		}

		// X-axis ticks and labels - larger and brighter
		for (const tick of xTicks) {
			const x = (tick / maxDistance) * plotWidth;

			// Tick mark
			const tickMark = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"line",
			);
			tickMark.setAttribute("x1", x.toString());
			tickMark.setAttribute("y1", plotHeight.toString());
			tickMark.setAttribute("x2", x.toString());
			tickMark.setAttribute("y2", (plotHeight + 6).toString());
			tickMark.setAttribute("stroke", "rgba(255, 255, 255, 0.5)");
			tickMark.setAttribute("stroke-width", "1.5");
			g.appendChild(tickMark);

			// Label - larger font
			const label = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"text",
			);
			label.setAttribute("x", x.toString());
			label.setAttribute("y", (plotHeight + 20).toString());
			label.setAttribute("text-anchor", "middle");
			label.setAttribute("fill", "rgba(255, 255, 255, 0.7)");
			label.setAttribute("font-size", "11");
			label.setAttribute("font-family", "system-ui, sans-serif");
			label.textContent = tick.toString();
			g.appendChild(label);
		}

		// Y-axis label - positioned better
		const yLabel = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"text",
		);
		yLabel.setAttribute("x", (-plotHeight / 2).toString());
		yLabel.setAttribute("y", "-38");
		yLabel.setAttribute("text-anchor", "middle");
		yLabel.setAttribute("fill", "rgba(255, 255, 255, 0.75)");
		yLabel.setAttribute("font-size", "12");
		yLabel.setAttribute("font-weight", "500");
		yLabel.setAttribute("font-family", "system-ui, sans-serif");
		yLabel.setAttribute("transform", "rotate(-90)");
		yLabel.textContent = probabilityLabel;
		g.appendChild(yLabel);

		// X-axis label - positioned better
		const xLabel = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"text",
		);
		xLabel.setAttribute("x", (plotWidth / 2).toString());
		xLabel.setAttribute("y", (plotHeight + 35).toString());
		xLabel.setAttribute("text-anchor", "middle");
		xLabel.setAttribute("fill", "rgba(255, 255, 255, 0.75)");
		xLabel.setAttribute("font-size", "12");
		xLabel.setAttribute("font-weight", "500");
		xLabel.setAttribute("font-family", "system-ui, sans-serif");
		xLabel.textContent = distanceLabel;
		g.appendChild(xLabel);

		// Draw probability lines with glow effect
		for (const flavor of flavors) {
			const pathData = getPathData(flavor, plotWidth, plotHeight, maxDistance);

			// Glow layer (drawn first, behind main line)
			const glowPath = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"path",
			);
			glowPath.setAttribute("d", pathData);
			glowPath.setAttribute("stroke", GLOW_COLORS[flavor]);
			glowPath.setAttribute("fill", "none");
			glowPath.setAttribute("stroke-width", "8");
			glowPath.setAttribute("stroke-linecap", "round");
			glowPath.setAttribute("stroke-linejoin", "round");
			glowPath.setAttribute("opacity", "0.4");
			glowPath.setAttribute("filter", `url(#glow-${flavor})`);
			g.appendChild(glowPath);

			// Main line
			const pathElement = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"path",
			);
			pathElement.setAttribute("d", pathData);
			pathElement.setAttribute("stroke", flavorColors[flavor]);
			pathElement.setAttribute("fill", "none");
			pathElement.setAttribute("stroke-width", "3");
			pathElement.setAttribute("stroke-linecap", "round");
			pathElement.setAttribute("stroke-linejoin", "round");
			g.appendChild(pathElement);

			// Animation for path drawing
			const pathLength = pathElement.getTotalLength();
			pathElement.setAttribute("stroke-dasharray", pathLength.toString());
			pathElement.setAttribute("stroke-dashoffset", pathLength.toString());
			glowPath.setAttribute("stroke-dasharray", pathLength.toString());
			glowPath.setAttribute("stroke-dashoffset", pathLength.toString());

			const lineAnimation = animate(pathElement, {
				strokeDashoffset: [pathLength, 0],
				ease: "outQuad",
				duration: 800,
				delay: utils.random(0, 300),
			});
			animationRefs.current.push(lineAnimation);

			const glowAnimation = animate(glowPath, {
				strokeDashoffset: [pathLength, 0],
				ease: "outQuad",
				duration: 800,
				delay: utils.random(0, 300),
			});
			animationRefs.current.push(glowAnimation);
		}

		// Draw current probability markers with enhanced styling
		const lastDataItem = data[numDataPoints - 1];
		if (lastDataItem) {
			const xPos = plotWidth;

			for (const flavor of flavors) {
				const yPos =
					plotHeight - lastDataItem.probabilities[flavor] * plotHeight;

				// Outer glow ring
				const glowRing = document.createElementNS(
					"http://www.w3.org/2000/svg",
					"circle",
				);
				glowRing.setAttribute("cx", xPos.toString());
				glowRing.setAttribute("cy", yPos.toString());
				glowRing.setAttribute("r", "10");
				glowRing.setAttribute("fill", GLOW_COLORS[flavor]);
				glowRing.setAttribute("opacity", "0");
				glowRing.setAttribute("filter", `url(#glow-${flavor})`);
				g.appendChild(glowRing);

				// Main marker
				const marker = document.createElementNS(
					"http://www.w3.org/2000/svg",
					"circle",
				);
				marker.setAttribute("cx", xPos.toString());
				marker.setAttribute("cy", yPos.toString());
				marker.setAttribute("r", "6");
				marker.setAttribute("fill", flavorColors[flavor]);
				marker.setAttribute("stroke", "#fff");
				marker.setAttribute("stroke-width", "2");
				marker.style.opacity = "0";
				g.appendChild(marker);

				// Animation for glow ring
				const glowAnimation = animate(glowRing, {
					opacity: [0, 0.5],
					scale: [0.5, 1],
					ease: "outQuad",
					duration: 600,
					delay: 700 + utils.random(0, 200),
				});
				animationRefs.current.push(glowAnimation);

				// Animation for marker entry
				const markerAnimation = animate(marker, {
					scale: [0, 1.15, 1],
					opacity: [0, 1],
					ease: "outElastic(1, .8)",
					duration: 1000,
					delay: 800 + utils.random(0, 200),
				});
				animationRefs.current.push(markerAnimation);
			}
		}
	}, [
		data,
		dimensions,
		flavorColors,
		getPathData,
		distanceLabel,
		probabilityLabel,
		getXTicks,
	]);

	return (
		<div ref={containerRef} className="w-full">
			<svg
				ref={svgRef}
				width={containerWidth}
				height={height}
				viewBox={`0 0 ${containerWidth} ${height}`}
				preserveAspectRatio="xMidYMid meet"
				role="img"
				aria-label="Neutrino oscillation probability plot showing how flavor probabilities change with distance"
			/>
		</div>
	);
};

export default ProbabilityPlot;
