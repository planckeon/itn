import type React from "react";
import { useEffect, useRef } from "react";
import { useSimulation } from "../context/SimulationContext";

interface Star {
	x: number;
	y: number;
	z: number;
	px: number; // Previous x (screen position)
	py: number; // Previous y (screen position)
	size: number;
	brightness: number;
}

const Starfield: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { state } = useSimulation();
	const speedRef = useRef(state.speed);
	const starsRef = useRef<Star[]>([]);
	const animationIdRef = useRef<number | null>(null);

	const numStars = 400;

	// Keep speed ref updated
	useEffect(() => {
		speedRef.current = state.speed;
	}, [state.speed]);

	// Initialize stars
	useEffect(() => {
		const initialStars: Star[] = [];
		for (let i = 0; i < numStars; i++) {
			initialStars.push({
				x: Math.random() * (window.innerWidth * 2) - window.innerWidth,
				y: Math.random() * (window.innerHeight * 2) - window.innerHeight,
				z: Math.random() * 1000,
				px: 0,
				py: 0,
				size: Math.random() * 2 + 0.5,
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

		const animate = () => {
			const { width, height } = canvas.getBoundingClientRect();
			canvas.width = width;
			canvas.height = height;

			const speed = speedRef.current;

			// Clear with pure black
			context.fillStyle = "#000";
			context.fillRect(0, 0, width, height);

			const centerX = width / 2;
			const centerY = height / 2;
			const maxDepth = 1000;

			// Update and draw stars
			for (let i = 0; i < starsRef.current.length; i++) {
				const star = starsRef.current[i];

				// Calculate current screen position
				const perspective = maxDepth / star.z;
				const x = centerX + star.x * perspective;
				const y = centerY + star.y * perspective;

				// Draw motion blur trail from previous to current position
				if (star.px !== 0 && star.py !== 0 && speed > 0.1) {
					const trailAlpha = Math.min(0.9, speed * 0.4) * star.brightness;
					
					context.strokeStyle = `rgba(255, 255, 255, ${trailAlpha})`;
					context.lineWidth = Math.max(1, star.size * perspective * 0.08);
					context.lineCap = "round";
					context.beginPath();
					context.moveTo(star.px, star.py);
					context.lineTo(x, y);
					context.stroke();
				}

				// Draw the star point at current position
				const alpha = star.brightness * (1 - star.z / maxDepth * 0.5);
				const size = Math.max(0.5, star.size * perspective * 0.08);
				
				context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
				context.beginPath();
				context.arc(x, y, size, 0, Math.PI * 2);
				context.fill();

				// Store current position as previous
				star.px = x;
				star.py = y;

				// Update z position (moving toward viewer)
				star.z -= speed * 8;

				// Wrap stars around when they pass the viewer
				if (star.z <= 1) {
					star.x = Math.random() * (width * 2) - width;
					star.y = Math.random() * (height * 2) - height;
					star.z = maxDepth;
					star.px = 0;
					star.py = 0;
					star.brightness = 0.7 + Math.random() * 0.3;
				}
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

	// Handle window resizing
	useEffect(() => {
		const handleResize = () => {
			const canvas = canvasRef.current;
			if (canvas) {
				const { width, height } = canvas.getBoundingClientRect();
				canvas.width = width;
				canvas.height = height;
			}
		};

		window.addEventListener("resize", handleResize);
		handleResize();

		return () => {
			window.removeEventListener("resize", handleResize);
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
