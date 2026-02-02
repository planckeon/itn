import type React from "react";
import { useEffect, useRef } from "react";
import { useSimulation } from "../context/SimulationContext";

interface Star {
	x: number;
	y: number;
	z: number;
	px: number; // Previous screen x
	py: number; // Previous screen y
	brightness: number;
}

const Starfield: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { state } = useSimulation();
	const speedRef = useRef(state.speed);
	const starsRef = useRef<Star[]>([]);
	const animationIdRef = useRef<number | null>(null);

	const numStars = 400;
	const starfieldDepth = 1000;

	// Keep speed ref updated
	useEffect(() => {
		speedRef.current = state.speed;
	}, [state.speed]);

	// Initialize stars in 3D spherical distribution
	useEffect(() => {
		const initialStars: Star[] = [];
		for (let i = 0; i < numStars; i++) {
			const r = 200 + Math.random() * (starfieldDepth - 200);
			const theta = Math.random() * Math.PI;
			const phi = Math.random() * Math.PI * 2;

			initialStars.push({
				x: r * Math.sin(theta) * Math.cos(phi),
				y: r * Math.sin(theta) * Math.sin(phi),
				z: r * Math.cos(theta),
				px: 0,
				py: 0,
				brightness: 0.7 + Math.random() * 0.3,
			});
		}
		starsRef.current = initialStars;
	}, []);

	// Animation loop using requestAnimationFrame
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const context = canvas.getContext("2d");
		if (!context) return;

		// Movement direction vector (diagonal, like original)
		const dirX = 1, dirY = 0.5, dirZ = 1;
		const norm = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);
		const dx = dirX / norm;
		const dy = dirY / norm;
		const dz = dirZ / norm;

		const animate = () => {
			const dpr = window.devicePixelRatio || 1;
			const width = canvas.clientWidth;
			const height = canvas.clientHeight;

			// Only resize canvas if dimensions changed
			const expectedWidth = Math.floor(width * dpr);
			const expectedHeight = Math.floor(height * dpr);
			if (canvas.width !== expectedWidth || canvas.height !== expectedHeight) {
				canvas.width = expectedWidth;
				canvas.height = expectedHeight;
			}

			// Reset transform and scale for DPI
			context.setTransform(dpr, 0, 0, dpr, 0, 0);

			const speed = speedRef.current;
			const v = 8 * speed * 0.1; // Movement velocity

			// Clear with pure black
			context.fillStyle = "#000";
			context.fillRect(0, 0, width, height);

			const centerX = width / 2;
			const centerY = height / 2;
			const focalLength = width * 0.8;

			// Update and draw stars
			for (const star of starsRef.current) {
				// Store previous screen position before moving
				const prevZ = star.z + dz * v;
				if (prevZ > 0) {
					const prevScale = focalLength / prevZ;
					star.px = centerX + (star.x + dx * v) * prevScale;
					star.py = centerY + (star.y + dy * v) * prevScale;
				}

				// Update 3D position - move star in direction
				star.x -= dx * v;
				star.y -= dy * v;
				star.z -= dz * v;

				// Reset stars that move past the viewer
				const viewDot = star.x * dx + star.y * dy + star.z * dz;
				if (viewDot < 0 || star.z < 1) {
					const r = starfieldDepth * (0.9 + Math.random() * 0.2);
					const theta = Math.PI * (0.2 + Math.random() * 0.6);
					const phi = Math.random() * Math.PI * 2;

					star.x = r * Math.sin(theta) * Math.cos(phi);
					star.y = r * Math.sin(theta) * Math.sin(phi);
					star.z = r * Math.cos(theta);
					star.px = 0;
					star.py = 0;
					star.brightness = 0.7 + Math.random() * 0.3;
					continue;
				}

				// Project to 2D
				const scale = focalLength / star.z;
				const x = centerX + star.x * scale;
				const y = centerY + star.y * scale;

				// Check if on screen
				if (x < -50 || x > width + 50 || y < -50 || y > height + 50) continue;

				// Draw motion blur trail
				if (star.px !== 0 && star.py !== 0 && speed > 0.1) {
					const lineAlpha = Math.min(0.9, 0.3 + speed * 0.2) * star.brightness;
					const lineWidth = Math.max(1, 1 + speed * 0.5);

					context.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
					context.lineWidth = lineWidth;
					context.lineCap = "round";
					context.beginPath();
					context.moveTo(star.px, star.py);
					context.lineTo(x, y);
					context.stroke();
				}

				// Draw the star point
				const normalizedDepth = star.z / starfieldDepth;
				const pointAlpha = (0.3 + 0.7 * (1 - normalizedDepth)) * star.brightness;
				const pointSize = Math.max(0.5, 2 * (1 - normalizedDepth));

				context.fillStyle = `rgba(255, 255, 255, ${pointAlpha})`;
				context.beginPath();
				context.arc(x, y, pointSize, 0, Math.PI * 2);
				context.fill();

				// Update previous position for next frame
				star.px = x;
				star.py = y;
			}

			animationIdRef.current = requestAnimationFrame(animate);
		};

		animationIdRef.current = requestAnimationFrame(animate);

		return () => {
			if (animationIdRef.current) {
				cancelAnimationFrame(animationIdRef.current);
			}
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
				zIndex: 0,
			}}
		/>
	);
};

export default Starfield;
