import { type JSAnimation, animate, utils } from "animejs";
import type React from "react";
import { useEffect, useRef } from "react";

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
	width: number;
	height: number;
	distanceLabel: string;
	probabilityLabel: string;
}

const ProbabilityPlot: React.FC<ProbabilityPlotProps> = ({
	data,
	flavorColors,
	width,
	height,
	distanceLabel,
	probabilityLabel,
}) => {
	const svgRef = useRef<SVGSVGElement>(null);
	const margin = { top: 20, right: 40, bottom: 30, left: 40 };
	const dimensions = {
		width: width - margin.left - margin.right,
		height: height - margin.top - margin.bottom,
	};

	const animationRefs = useRef<JSAnimation[]>([]);

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
		animationRefs.current.forEach((anim) => {
			if (anim) {
				anim.pause();
			}
		});
		animationRefs.current = [];

		const { width: plotWidth, height: plotHeight } = dimensions;
		const numDataPoints = data.length;
		const maxDistance = data[numDataPoints - 1]?.distance || 1;

		// Clear previous drawings
		svg.innerHTML = "";

		// Create SVG elements
		const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
		g.setAttribute("transform", `translate(${margin.left}, ${margin.top})`);
		svg.appendChild(g);

		// Function to get SVG path data for a given flavor
		const getPathData = (flavor: "electron" | "muon" | "tau") => {
			return data
				.map((item, index) => {
					const x = (item.distance / maxDistance) * plotWidth;
					const y = plotHeight - item.probabilities[flavor] * plotHeight;
					return `${index === 0 ? "M" : "L"}${x},${y}`;
				})
				.join(" ");
		};

		// Draw lines
		const flavors: ("electron" | "muon" | "tau")[] = [
			"electron",
			"muon",
			"tau",
		];

		flavors.forEach((flavor) => {
			const pathData = getPathData(flavor);
			const pathElement = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"path",
			);
			pathElement.setAttribute("d", pathData);
			pathElement.setAttribute("stroke", flavorColors[flavor]);
			pathElement.setAttribute("fill", "none");
			pathElement.setAttribute("stroke-width", "2");
			g.appendChild(pathElement);

			// Animation for path drawing
			const pathLength = pathElement.getTotalLength();
			pathElement.setAttribute("stroke-dasharray", pathLength.toString());
			pathElement.setAttribute("stroke-dashoffset", pathLength.toString());

			const lineAnimation = animate(pathElement, {
				strokeDashoffset: [pathLength, 0],
				ease: "outQuad",
				duration: 800,
				delay: utils.random(0, 300),
			});
			animationRefs.current.push(lineAnimation);
		});

		// Draw current probability markers
		const lastDataItem = data[numDataPoints - 1];
		if (lastDataItem) {
			const xPos = plotWidth;

			flavors.forEach((flavor: "electron" | "muon" | "tau") => {
				const yPos =
					plotHeight - lastDataItem.probabilities[flavor] * plotHeight;
				const marker = document.createElementNS(
					"http://www.w3.org/2000/svg",
					"circle",
				);
				marker.setAttribute("cx", xPos.toString());
				marker.setAttribute("cy", yPos.toString());
				marker.setAttribute("r", "6");
				marker.setAttribute("fill", flavorColors[flavor]);
				marker.setAttribute("stroke", "#fff");
				marker.setAttribute("stroke-width", "1.5");
				marker.style.opacity = "0";
				g.appendChild(marker);

				// Animation for marker entry
				const markerAnimation = animate(marker, {
					scale: [0, 1.1, 1],
					opacity: [0, 1],
					ease: "outElastic(1, .8)",
					duration: 1000,
					delay: 800 + utils.random(0, 200),
				});
				animationRefs.current.push(markerAnimation);
			});
		}
	}, [data, dimensions, margin, flavorColors]);

	return (
		<div className="probability-plot-container">
			<svg
				ref={svgRef}
				width={width}
				height={height}
				viewBox={`0 0 ${width} ${height}`}
				preserveAspectRatio="xMidYMid meet"
			>
				<text x={margin.left} y={margin.top - 5} className="axis-label">
					{probabilityLabel}
				</text>
				<text
					x={width - margin.right}
					y={height - margin.bottom + 20}
					textAnchor="end"
					className="axis-label"
				>
					{distanceLabel}
				</text>
			</svg>
		</div>
	);
};

export default ProbabilityPlot;
