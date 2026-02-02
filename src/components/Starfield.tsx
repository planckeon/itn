import { type Timer, createTimer } from "animejs";
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
}

const Starfield: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { state } = useSimulation();
	const { speed } = state;
	const starsRef = useRef<Star[]>([]);
	const timerRef = useRef<Timer | null>(null);

	const numStars = 400;

	// Initialize stars
	useEffect(() => {
		const initialStars: Star[] = [];
		for (let i = 0; i < numStars; i++) {
			initialStars.push({
				x: Math.random() * (window.innerWidth * 2) - window.innerWidth,
				y: Math.random() * (window.innerHeight * 2) - window.innerHeight,
				z: Math.random() * window.innerWidth,
				px: 0,
				py: 0,
				size: Math.random() * 2 + 0.5,
			});
		}
		starsRef.current = initialStars;
	}, []);

	// Animation loop
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const context = canvas.getContext("2d");
		if (!context) return;

		// Stop any existing timer
		if (timerRef.current) {
			timerRef.current.pause();
		}

		// Use createTimer for the animation loop
		timerRef.current = createTimer({
			duration: Number.POSITIVE_INFINITY,
			onUpdate: () => {
				const { width, height } = canvas.getBoundingClientRect();
				canvas.width = width;
				canvas.height = height;

				// Clear with pure black
				context.fillStyle = "#0a0a0f";
				context.fillRect(0, 0, width, height);

				const centerX = width / 2;
				const centerY = height / 2;

				starsRef.current = starsRef.current.map((star) => {
					// Calculate current screen position BEFORE updating z
					const perspective = width / star.z;
					const currentX = centerX + star.x * perspective;
					const currentY = centerY + star.y * perspective;

					// Update z position (moving toward viewer)
					const newZ = star.z - speed * 5;

					// Wrap stars around when they pass the viewer
					if (newZ <= 1) {
						const newStar = {
							x: Math.random() * (width * 2) - width,
							y: Math.random() * (height * 2) - height,
							z: width,
							px: 0,
							py: 0,
							size: Math.random() * 2 + 0.5,
						};
						// Calculate initial screen position
						const p = width / newStar.z;
						newStar.px = centerX + newStar.x * p;
						newStar.py = centerY + newStar.y * p;
						return newStar;
					}

					return {
						...star,
						z: newZ,
						px: currentX,
						py: currentY,
					};
				});

				// Draw stars with motion blur trails
				for (const star of starsRef.current) {
					const perspective = width / star.z;
					const x = centerX + star.x * perspective;
					const y = centerY + star.y * perspective;
					const size = Math.max(0.5, star.size * perspective * 0.1);

					// Only draw trail if we have a valid previous position
					if (star.px !== 0 && star.py !== 0 && speed > 0.1) {
						// Calculate trail length based on speed
						const trailAlpha = Math.min(0.8, speed * 0.3);
						
						// Draw motion blur line from previous to current position
						const gradient = context.createLinearGradient(star.px, star.py, x, y);
						gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
						gradient.addColorStop(0.5, `rgba(255, 255, 255, ${trailAlpha * 0.5})`);
						gradient.addColorStop(1, `rgba(255, 255, 255, ${trailAlpha})`);

						context.strokeStyle = gradient;
						context.lineWidth = Math.max(1, size * 0.8);
						context.lineCap = "round";
						context.beginPath();
						context.moveTo(star.px, star.py);
						context.lineTo(x, y);
						context.stroke();
					}

					// Draw the star point at current position
					const depth = star.z / width;
					const alpha = 1 - depth * 0.5;
					context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
					context.beginPath();
					context.arc(x, y, size, 0, Math.PI * 2);
					context.fill();
				}
			},
		});

		return () => {
			if (timerRef.current) {
				timerRef.current.pause();
			}
		};
	}, [speed]);

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
				zIndex: -1,
			}}
		/>
	);
};

export default Starfield;
