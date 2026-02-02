import type React from "react";
import { useEffect, useRef, useCallback } from "react";
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
	
	// Camera rotation state
	const cameraAngleRef = useRef(Math.PI * 0.75); // Start at ~135 degrees (top-right to bottom-left)
	const isDraggingRef = useRef(false);
	const lastMouseXRef = useRef(0);

	const numStars = 400;

	// Keep speed ref updated
	useEffect(() => {
		speedRef.current = state.speed;
	}, [state.speed]);

	// Mouse event handlers for camera rotation
	const handleMouseDown = useCallback((e: MouseEvent) => {
		isDraggingRef.current = true;
		lastMouseXRef.current = e.clientX;
	}, []);

	const handleMouseMove = useCallback((e: MouseEvent) => {
		if (!isDraggingRef.current) return;
		
		const deltaX = e.clientX - lastMouseXRef.current;
		lastMouseXRef.current = e.clientX;
		
		// Rotate camera based on horizontal drag
		// Negative to make dragging left rotate camera left (stars appear to move right)
		cameraAngleRef.current += deltaX * 0.005;
	}, []);

	const handleMouseUp = useCallback(() => {
		isDraggingRef.current = false;
	}, []);

	// Setup mouse event listeners
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		canvas.addEventListener("mousedown", handleMouseDown);
		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);

		return () => {
			canvas.removeEventListener("mousedown", handleMouseDown);
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [handleMouseDown, handleMouseMove, handleMouseUp]);

	// Animation loop
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const context = canvas.getContext("2d");
		if (!context) return;

		// Initialize stars when we have dimensions
		const initStars = (width: number, height: number) => {
			const stars: Star[] = [];
			// Distribute stars in a larger area for smooth wrapping
			const spread = Math.max(width, height) * 2;
			for (let i = 0; i < numStars; i++) {
				stars.push({
					x: Math.random() * spread - spread / 2,
					y: Math.random() * spread - spread / 2,
					speed: 0.5 + Math.random() * 2,
					size: 0.5 + Math.random() * 2,
					brightness: 0.5 + Math.random() * 0.5,
				});
			}
			starsRef.current = stars;
			initializedRef.current = true;
		};

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
			const angle = cameraAngleRef.current;

			// Calculate movement direction from camera angle
			const dirX = Math.cos(angle);
			const dirY = Math.sin(angle);

			// Clear with pure black
			context.fillStyle = "#000";
			context.fillRect(0, 0, width, height);

			const centerX = width / 2;
			const centerY = height / 2;
			const spread = Math.max(width, height) * 2;

			// Update and draw stars
			for (const star of starsRef.current) {
				// Calculate movement based on speed and camera angle
				const moveX = dirX * star.speed * speed * 3;
				const moveY = dirY * star.speed * speed * 3;

				// Screen position (centered)
				const screenX = centerX + star.x;
				const screenY = centerY + star.y;

				// Only draw if on screen (with margin)
				if (screenX > -100 && screenX < width + 100 && 
					screenY > -100 && screenY < height + 100) {
					
					// Draw motion blur trail
					if (speed > 0.1) {
						const trailLength = star.speed * speed * 25;
						const trailX = screenX - dirX * trailLength;
						const trailY = screenY - dirY * trailLength;

						const lineAlpha = Math.min(0.8, 0.2 + speed * 0.15) * star.brightness;
						
						// Create gradient for trail fade
						const gradient = context.createLinearGradient(trailX, trailY, screenX, screenY);
						gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
						gradient.addColorStop(1, `rgba(255, 255, 255, ${lineAlpha})`);

						context.strokeStyle = gradient;
						context.lineWidth = star.size * 0.8;
						context.lineCap = "round";
						context.beginPath();
						context.moveTo(trailX, trailY);
						context.lineTo(screenX, screenY);
						context.stroke();
					}

					// Draw the star point
					context.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
					context.beginPath();
					context.arc(screenX, screenY, star.size, 0, Math.PI * 2);
					context.fill();
				}

				// Update position
				star.x += moveX;
				star.y += moveY;

				// Wrap around when star goes too far from center
				const distFromCenter = Math.sqrt(star.x * star.x + star.y * star.y);
				if (distFromCenter > spread / 2) {
					// Respawn on the opposite side
					const respawnAngle = Math.atan2(star.y, star.x) + Math.PI;
					const respawnDist = spread / 2 * (0.8 + Math.random() * 0.2);
					star.x = Math.cos(respawnAngle) * respawnDist;
					star.y = Math.sin(respawnAngle) * respawnDist;
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
				cursor: isDraggingRef.current ? "grabbing" : "grab",
			}}
		/>
	);
};

export default Starfield;
