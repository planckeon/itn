import type React from "react";
import { useRef, useEffect, useState, useMemo } from "react";
import { useSimulation } from "../context/SimulationContext";

// NuFit 5.2 values
const theta12 = (33.44 * Math.PI) / 180;
const theta13 = (8.57 * Math.PI) / 180;
const theta23 = (49.2 * Math.PI) / 180;

/**
 * Calculate the PMNS matrix elements (complex) given delta CP
 */
function calculatePMNS(deltaCP_deg: number) {
	const delta = (deltaCP_deg * Math.PI) / 180;
	
	const c12 = Math.cos(theta12), s12 = Math.sin(theta12);
	const c13 = Math.cos(theta13), s13 = Math.sin(theta13);
	const c23 = Math.cos(theta23), s23 = Math.sin(theta23);
	
	// Complex exponential e^(-i*delta)
	const eidRe = Math.cos(delta);
	const eidIm = -Math.sin(delta);
	
	// PMNS matrix elements (real and imaginary parts)
	// U_e1, U_e2, U_e3
	const Ue1 = { re: c12 * c13, im: 0 };
	const Ue2 = { re: s12 * c13, im: 0 };
	const Ue3 = { re: s13 * eidRe, im: s13 * eidIm };
	
	// U_mu1, U_mu2, U_mu3
	const Umu1 = { 
		re: -s12 * c23 - c12 * s23 * s13 * eidRe,
		im: -c12 * s23 * s13 * eidIm
	};
	const Umu2 = {
		re: c12 * c23 - s12 * s23 * s13 * eidRe,
		im: -s12 * s23 * s13 * eidIm
	};
	const Umu3 = { re: s23 * c13, im: 0 };
	
	// U_tau1, U_tau2, U_tau3
	const Utau1 = {
		re: s12 * s23 - c12 * c23 * s13 * eidRe,
		im: -c12 * c23 * s13 * eidIm
	};
	const Utau2 = {
		re: -c12 * s23 - s12 * c23 * s13 * eidRe,
		im: -s12 * c23 * s13 * eidIm
	};
	const Utau3 = { re: c23 * c13, im: 0 };
	
	return {
		electron: [Ue1, Ue2, Ue3],
		muon: [Umu1, Umu2, Umu3],
		tau: [Utau1, Utau2, Utau3],
	};
}

// Color palette
const COLORS = {
	electron: { r: 59, g: 130, b: 246 },   // Blue
	muon: { r: 251, g: 146, b: 60 },       // Orange
	tau: { r: 217, g: 70, b: 239 },        // Magenta
	grid: "rgba(255, 255, 255, 0.1)",
	axis: "rgba(255, 255, 255, 0.3)",
	text: "rgba(255, 255, 255, 0.6)",
};

interface Props {
	isOpen: boolean;
	onClose: () => void;
}

/**
 * 3D PMNS Matrix visualization
 * Shows the complex matrix elements as 3D bars/spheres
 * - Height represents |U|²
 * - Color represents the phase (arg(U))
 * - Can rotate view with mouse drag
 */
const PMNSMatrix3D: React.FC<Props> = ({ isOpen, onClose }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { state } = useSimulation();
	const [rotation, setRotation] = useState({ x: -25, y: 35 });
	const [isDragging, setIsDragging] = useState(false);
	const lastMouseRef = useRef({ x: 0, y: 0 });

	const matrix = useMemo(() => {
		return calculatePMNS(state.deltaCP);
	}, [state.deltaCP]);

	// Handle mouse drag for rotation
	const handleMouseDown = (e: React.MouseEvent) => {
		setIsDragging(true);
		lastMouseRef.current = { x: e.clientX, y: e.clientY };
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		if (!isDragging) return;
		const dx = e.clientX - lastMouseRef.current.x;
		const dy = e.clientY - lastMouseRef.current.y;
		setRotation((r) => ({
			x: Math.max(-60, Math.min(60, r.x + dy * 0.5)),
			y: r.y + dx * 0.5,
		}));
		lastMouseRef.current = { x: e.clientX, y: e.clientY };
	};

	const handleMouseUp = () => {
		setIsDragging(false);
	};

	useEffect(() => {
		if (!isOpen || !canvasRef.current) return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const dpr = window.devicePixelRatio || 1;
		const width = 400;
		const height = 350;
		canvas.width = width * dpr;
		canvas.height = height * dpr;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		// Clear
		ctx.fillStyle = "rgba(15, 15, 25, 1)";
		ctx.fillRect(0, 0, width, height);

		// 3D projection parameters
		const cx = width / 2;
		const cy = height / 2 + 20;
		const scale = 50;
		const rotX = (rotation.x * Math.PI) / 180;
		const rotY = (rotation.y * Math.PI) / 180;

		// 3D to 2D projection
		function project(x: number, y: number, z: number) {
			// Rotate around Y axis
			const x1 = x * Math.cos(rotY) - z * Math.sin(rotY);
			const z1 = x * Math.sin(rotY) + z * Math.cos(rotY);
			// Rotate around X axis
			const y1 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
			const z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);
			// Simple perspective
			const fov = 400;
			const pScale = fov / (fov + z2);
			return {
				x: cx + x1 * scale * pScale,
				y: cy - y1 * scale * pScale,
				z: z2,
				scale: pScale,
			};
		}

		// Draw grid floor
		ctx.strokeStyle = COLORS.grid;
		ctx.lineWidth = 0.5;
		for (let i = -2; i <= 2; i++) {
			const p1 = project(i, 0, -2);
			const p2 = project(i, 0, 2);
			ctx.beginPath();
			ctx.moveTo(p1.x, p1.y);
			ctx.lineTo(p2.x, p2.y);
			ctx.stroke();
			
			const p3 = project(-2, 0, i);
			const p4 = project(2, 0, i);
			ctx.beginPath();
			ctx.moveTo(p3.x, p3.y);
			ctx.lineTo(p4.x, p4.y);
			ctx.stroke();
		}

		// Prepare bars data with z-order
		interface Bar {
			row: string;
			col: number;
			x: number;
			z: number;
			height: number;
			phase: number;
			color: typeof COLORS.electron;
			zOrder: number;
		}

		const bars: Bar[] = [];
		const rows = ["electron", "muon", "tau"] as const;
		const rowColors = [COLORS.electron, COLORS.muon, COLORS.tau];

		rows.forEach((row, rowIdx) => {
			matrix[row].forEach((val, colIdx) => {
				const magnitude = Math.sqrt(val.re * val.re + val.im * val.im);
				const phase = Math.atan2(val.im, val.re);
				const x = (colIdx - 1) * 1.2;
				const z = (rowIdx - 1) * 1.2;
				const centerProj = project(x, 0, z);
				
				bars.push({
					row,
					col: colIdx,
					x,
					z,
					height: magnitude * magnitude * 2.5, // |U|² scaled
					phase,
					color: rowColors[rowIdx],
					zOrder: centerProj.z,
				});
			});
		});

		// Sort by z-order (back to front)
		bars.sort((a, b) => b.zOrder - a.zOrder);

		// Draw bars
		bars.forEach((bar) => {
			const h = bar.height;
			const halfW = 0.3;

			// Bar corners
			const corners = [
				project(bar.x - halfW, 0, bar.z - halfW),
				project(bar.x + halfW, 0, bar.z - halfW),
				project(bar.x + halfW, 0, bar.z + halfW),
				project(bar.x - halfW, 0, bar.z + halfW),
				project(bar.x - halfW, h, bar.z - halfW),
				project(bar.x + halfW, h, bar.z - halfW),
				project(bar.x + halfW, h, bar.z + halfW),
				project(bar.x - halfW, h, bar.z + halfW),
			];

			// Phase affects brightness
			const phaseFactor = 0.7 + 0.3 * Math.cos(bar.phase);
			const r = Math.round(bar.color.r * phaseFactor);
			const g = Math.round(bar.color.g * phaseFactor);
			const b = Math.round(bar.color.b * phaseFactor);

			// Draw sides (back first)
			const drawFace = (indices: number[], darken: number) => {
				ctx.beginPath();
				ctx.moveTo(corners[indices[0]].x, corners[indices[0]].y);
				for (let i = 1; i < indices.length; i++) {
					ctx.lineTo(corners[indices[i]].x, corners[indices[i]].y);
				}
				ctx.closePath();
				ctx.fillStyle = `rgba(${Math.round(r * darken)}, ${Math.round(g * darken)}, ${Math.round(b * darken)}, 0.9)`;
				ctx.fill();
				ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.5)`;
				ctx.lineWidth = 0.5;
				ctx.stroke();
			};

			// Draw visible faces based on rotation
			if (rotation.y > 0) {
				drawFace([0, 4, 7, 3], 0.6); // Left face
			} else {
				drawFace([1, 5, 6, 2], 0.6); // Right face
			}
			if (rotation.y < 90 && rotation.y > -90) {
				drawFace([0, 1, 5, 4], 0.7); // Front face
			}
			drawFace([4, 5, 6, 7], 1.0); // Top face
		});

		// Draw axis labels
		ctx.font = "11px monospace";
		ctx.fillStyle = COLORS.text;
		
		// Column labels (ν1, ν2, ν3)
		["ν₁", "ν₂", "ν₃"].forEach((label, i) => {
			const p = project((i - 1) * 1.2, 0, 2.5);
			ctx.fillText(label, p.x - 8, p.y);
		});

		// Row labels (νe, νμ, ντ)
		const rowLabels = [
			{ label: "νₑ", color: COLORS.electron },
			{ label: "νμ", color: COLORS.muon },
			{ label: "ντ", color: COLORS.tau },
		];
		rowLabels.forEach((item, i) => {
			const p = project(-2.5, 0, (i - 1) * 1.2);
			ctx.fillStyle = `rgb(${item.color.r}, ${item.color.g}, ${item.color.b})`;
			ctx.fillText(item.label, p.x - 5, p.y + 4);
		});

		// Title and info
		ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
		ctx.font = "bold 13px sans-serif";
		ctx.fillText("3D PMNS Matrix |U|²", 15, 25);
		
		ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
		ctx.font = "10px monospace";
		ctx.fillText(`δCP = ${state.deltaCP}°`, 15, 42);
		ctx.fillText("Drag to rotate", width - 90, height - 10);

	}, [isOpen, matrix, rotation, state.deltaCP]);

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center"
			style={{ background: "rgba(0, 0, 0, 0.8)" }}
			onClick={onClose}
		>
			<div
				className="rounded-xl overflow-hidden"
				style={{
					background: "rgba(15, 15, 25, 0.98)",
					border: "1px solid rgba(255, 255, 255, 0.2)",
					backdropFilter: "blur(16px)",
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
					<span className="text-sm text-white/80">3D PMNS Matrix Visualization</span>
					<button
						type="button"
						onClick={onClose}
						className="text-white/50 hover:text-white px-2"
					>
						✕
					</button>
				</div>
				<canvas
					ref={canvasRef}
					style={{ width: "400px", height: "350px", cursor: "grab" }}
					onMouseDown={handleMouseDown}
					onMouseMove={handleMouseMove}
					onMouseUp={handleMouseUp}
					onMouseLeave={handleMouseUp}
				/>
				<div className="px-4 py-2 border-t border-white/10 text-[10px] text-white/50">
					Bar height = |U|² (probability). Color = flavor. Brightness varies with CP phase.
				</div>
			</div>
		</div>
	);
};

export default PMNSMatrix3D;
