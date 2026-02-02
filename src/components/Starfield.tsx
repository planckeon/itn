import type React from "react";
import { useEffect, useRef } from "react";
import { useSimulation } from "../context/SimulationContext";

interface Star {
	x: number;
	y: number;
	speed: number;
	size: number;
	brightness: number;
}

const Starfield: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { state } = useSimulation();
	const speedRef = useRef(state.speed);
	const starsRef = useRef<Star[]>([]);
	const animationIdRef = useRef<number | null>(null);
	const initializedRef = useRef(false);

	const numStars = 400;

	// Keep speed ref updated
	useEffect(() => {
		speedRef.current = state.speed;
	}, [state.speed]);

	// Animation loop
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const context = canvas.getContext("2d");
		if (!context) return;

		// Initialize stars when we have dimensions
		const initStars = (width: number, height: number) => {
			const stars: Star[] = [];
			for (let i = 0; i < numStars; i++) {
				stars.push({
					x: Math.random() * width * 1.5,
					y: Math.random() * height * 1.5 - height * 0.25,
					speed: 0.5 + Math.random() * 2,
					size: 0.5 + Math.random() * 2,
					brightness: 0.5 + Math.random() * 0.5,
				});
			}
			starsRef.current = stars;
			initializedRef.current = true;
		};

		// Movement direction: from top-right toward bottom-left
		// This creates diagonal streaks like in the reference
		const dirX = -1;  // Moving left
		const dirY = 0.6; // Moving down slightly

		const animate = () => {
			const dpr = window.devicePixelRatio || 1;
			const width = canvas.clientWidth;
			const height = canvas.clientHeight;

			// Initialize stars if not done yet
			if (!initializedRef.current || starsRef.current.length === 0) {
				initStars(width, height);
			}

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

			// Clear with pure black
			context.fillStyle = "#000";
			context.fillRect(0, 0, width, height);

			// Update and draw stars
			for (const star of starsRef.current) {
				// Calculate movement based on speed
				const moveX = dirX * star.speed * speed * 3;
				const moveY = dirY * star.speed * speed * 3;

				// Draw motion blur trail (line from current to next position)
				if (speed > 0.1) {
					const trailLength = Math.abs(moveX) * 8; // Longer trail
					const trailX = star.x - dirX * trailLength;
					const trailY = star.y - dirY * trailLength;

					const lineAlpha = Math.min(0.8, 0.2 + speed * 0.15) * star.brightness;
					
					// Create gradient for trail fade
					const gradient = context.createLinearGradient(trailX, trailY, star.x, star.y);
					gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
					gradient.addColorStop(1, `rgba(255, 255, 255, ${lineAlpha})`);

					context.strokeStyle = gradient;
					context.lineWidth = star.size * 0.8;
					context.lineCap = "round";
					context.beginPath();
					context.moveTo(trailX, trailY);
					context.lineTo(star.x, star.y);
					context.stroke();
				}

				// Draw the star point
				context.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
				context.beginPath();
				context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
				context.fill();

				// Update position
				star.x += moveX;
				star.y += moveY;

				// Wrap around when star goes off screen
				if (star.x < -50) {
					star.x = width + 50;
					star.y = Math.random() * height * 1.5 - height * 0.25;
					star.speed = 0.5 + Math.random() * 2;
					star.brightness = 0.5 + Math.random() * 0.5;
				}
				if (star.y > height + 50) {
					star.y = -50;
					star.x = Math.random() * width * 1.5;
					star.speed = 0.5 + Math.random() * 2;
					star.brightness = 0.5 + Math.random() * 0.5;
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
