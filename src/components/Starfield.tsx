import type React from "react";
import { useEffect, useRef, useCallback } from "react";
import { useSimulation } from "../context/SimulationContext";

interface Star {
	// 3D position
	x: number;
	y: number;
	z: number;
	prevScreenX: number;
	prevScreenY: number;
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
	
	// Camera rotation state (spherical coordinates)
	const cameraYawRef = useRef(0); // Horizontal rotation
	const cameraPitchRef = useRef(0.3); // Slight downward tilt initially
	const isDraggingRef = useRef(false);
	const lastMouseRef = useRef({ x: 0, y: 0 });

	const numStars = 600;
	const fieldSize = 1500;
	const cameraDistance = 400;

	// Keep speed ref updated
	useEffect(() => {
		speedRef.current = state.speed;
	}, [state.speed]);

	// Mouse/Touch event handlers for camera rotation
	const handleStart = useCallback((clientX: number, clientY: number) => {
		isDraggingRef.current = true;
		lastMouseRef.current = { x: clientX, y: clientY };
		const canvas = canvasRef.current;
		if (canvas) canvas.style.cursor = "grabbing";
	}, []);

	const handleMove = useCallback((clientX: number, clientY: number) => {
		if (!isDraggingRef.current) return;
		
		const deltaX = clientX - lastMouseRef.current.x;
		const deltaY = clientY - lastMouseRef.current.y;
		lastMouseRef.current = { x: clientX, y: clientY };
		
		// Reduced sensitivity for smoother rotation
		cameraYawRef.current -= deltaX * 0.003;
		cameraPitchRef.current -= deltaY * 0.003;
		
		// Clamp pitch to avoid flipping
		cameraPitchRef.current = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, cameraPitchRef.current));
	}, []);

	const handleEnd = useCallback(() => {
		isDraggingRef.current = false;
		const canvas = canvasRef.current;
		if (canvas) canvas.style.cursor = "grab";
	}, []);

	// Mouse handlers
	const handleMouseDown = useCallback((e: MouseEvent) => {
		handleStart(e.clientX, e.clientY);
	}, [handleStart]);

	const handleMouseMove = useCallback((e: MouseEvent) => {
		handleMove(e.clientX, e.clientY);
	}, [handleMove]);

	const handleMouseUp = useCallback(() => {
		handleEnd();
	}, [handleEnd]);

	// Touch handlers
	const handleTouchStart = useCallback((e: TouchEvent) => {
		if (e.touches.length === 1) {
			handleStart(e.touches[0].clientX, e.touches[0].clientY);
		}
	}, [handleStart]);

	const handleTouchMove = useCallback((e: TouchEvent) => {
		if (e.touches.length === 1) {
			e.preventDefault(); // Prevent scrolling
			handleMove(e.touches[0].clientX, e.touches[0].clientY);
		}
	}, [handleMove]);

	const handleTouchEnd = useCallback(() => {
		handleEnd();
	}, [handleEnd]);

	// Setup mouse and touch event listeners
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		canvas.style.cursor = "grab";
		
		// Mouse events
		canvas.addEventListener("mousedown", handleMouseDown);
		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);
		
		// Touch events
		canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
		canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
		canvas.addEventListener("touchend", handleTouchEnd);

		return () => {
			canvas.removeEventListener("mousedown", handleMouseDown);
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
			canvas.removeEventListener("touchstart", handleTouchStart);
			canvas.removeEventListener("touchmove", handleTouchMove);
			canvas.removeEventListener("touchend", handleTouchEnd);
		};
	}, [handleMouseDown, handleMouseMove, handleMouseUp, handleTouchStart, handleTouchMove, handleTouchEnd]);

	// Animation loop
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const context = canvas.getContext("2d");
		if (!context) return;

		// Initialize stars in 3D space
		const initStars = () => {
			const stars: Star[] = [];
			for (let i = 0; i < numStars; i++) {
				stars.push({
					x: (Math.random() - 0.5) * fieldSize,
					y: (Math.random() - 0.5) * fieldSize,
					z: Math.random() * fieldSize - fieldSize * 0.3,
					prevScreenX: 0,
					prevScreenY: 0,
					size: 0.5 + Math.random() * 2,
					brightness: 0.5 + Math.random() * 0.5,
				});
			}
			starsRef.current = stars;
			initializedRef.current = true;
		};

		// Project 3D point to 2D screen with camera rotation
		const project = (x: number, y: number, z: number, width: number, height: number) => {
			const yaw = cameraYawRef.current;
			const pitch = cameraPitchRef.current;
			
			// Rotate around Y axis (yaw)
			const cosYaw = Math.cos(yaw);
			const sinYaw = Math.sin(yaw);
			let rx = x * cosYaw - z * sinYaw;
			let rz = x * sinYaw + z * cosYaw;
			let ry = y;
			
			// Rotate around X axis (pitch)
			const cosPitch = Math.cos(pitch);
			const sinPitch = Math.sin(pitch);
			const ry2 = ry * cosPitch - rz * sinPitch;
			const rz2 = ry * sinPitch + rz * cosPitch;
			ry = ry2;
			rz = rz2;
			
			// Move camera back
			rz += cameraDistance;
			
			// Perspective projection
			if (rz <= 1) return null; // Behind camera
			
			const fov = width * 0.9;
			const scale = fov / rz;
			const screenX = width / 2 + rx * scale;
			const screenY = height / 2 + ry * scale;
			
			return { x: screenX, y: screenY, z: rz, scale };
		};

		const animate = () => {
			const dpr = window.devicePixelRatio || 1;
			const width = canvas.clientWidth;
			const height = canvas.clientHeight;

			// Initialize stars if not done yet
			if (!initializedRef.current || starsRef.current.length === 0) {
				initStars();
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

			// Stars move toward the camera (decreasing z)
			const moveSpeed = speed * 5;

			// Draw and update stars
			for (const star of starsRef.current) {
				// Project current position
				const current = project(star.x, star.y, star.z, width, height);
				
				if (current) {
					const { x, y, z } = current;
					
					// Skip if off screen
					if (x >= -100 && x <= width + 100 && y >= -100 && y <= height + 100) {
						// Calculate size and alpha based on depth
						const maxZ = cameraDistance + fieldSize;
						const depthFactor = 1 - z / maxZ;
						const starSize = Math.max(0.5, star.size * depthFactor * 2);
						const alpha = star.brightness * Math.max(0.3, depthFactor);

						// Draw motion blur trail using stored previous screen position
						if (star.prevScreenX !== 0 && star.prevScreenY !== 0 && speed > 0.05) {
							const dx = x - star.prevScreenX;
							const dy = y - star.prevScreenY;
							const trailLength = Math.sqrt(dx * dx + dy * dy);
							
							// Only draw trail if there's visible movement
							if (trailLength > 2) {
								// Extend the trail for more visibility
								const extendFactor = Math.max(3, speed * 5);
								const trailStartX = x - dx * extendFactor;
								const trailStartY = y - dy * extendFactor;
								
								const trailAlpha = alpha * Math.min(0.8, 0.3 + speed * 0.2);
								
								const gradient = context.createLinearGradient(trailStartX, trailStartY, x, y);
								gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
								gradient.addColorStop(0.7, `rgba(255, 255, 255, ${trailAlpha * 0.5})`);
								gradient.addColorStop(1, `rgba(255, 255, 255, ${trailAlpha})`);

								context.strokeStyle = gradient;
								context.lineWidth = Math.max(1, starSize * 0.6);
								context.lineCap = "round";
								context.beginPath();
								context.moveTo(trailStartX, trailStartY);
								context.lineTo(x, y);
								context.stroke();
							}
						}

						// Draw the star point
						context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
						context.beginPath();
						context.arc(x, y, starSize, 0, Math.PI * 2);
						context.fill();

						// Store current screen position for next frame's trail
						star.prevScreenX = x;
						star.prevScreenY = y;
					}
				}

				// Update star 3D position (move toward camera)
				star.z -= moveSpeed;
				
				// Respawn stars that pass the camera
				if (star.z < -cameraDistance * 0.5) {
					star.z = fieldSize * 0.7;
					star.x = (Math.random() - 0.5) * fieldSize;
					star.y = (Math.random() - 0.5) * fieldSize;
					star.brightness = 0.5 + Math.random() * 0.5;
					star.prevScreenX = 0;
					star.prevScreenY = 0;
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
