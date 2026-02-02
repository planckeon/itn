import type React from "react";
import { useEffect, useRef, useCallback } from "react";
import { useSimulation } from "../context/SimulationContext";

interface Star {
	// 3D position
	x: number;
	y: number;
	z: number;
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
	const cameraPitchRef = useRef(0); // Vertical rotation (clamped)
	const isDraggingRef = useRef(false);
	const lastMouseRef = useRef({ x: 0, y: 0 });

	const numStars = 500;
	const fieldSize = 2000; // Size of the star field cube
	const cameraDistance = 500; // Camera distance from center

	// Keep speed ref updated
	useEffect(() => {
		speedRef.current = state.speed;
	}, [state.speed]);

	// Mouse event handlers for camera rotation
	const handleMouseDown = useCallback((e: MouseEvent) => {
		isDraggingRef.current = true;
		lastMouseRef.current = { x: e.clientX, y: e.clientY };
		const canvas = canvasRef.current;
		if (canvas) canvas.style.cursor = "grabbing";
	}, []);

	const handleMouseMove = useCallback((e: MouseEvent) => {
		if (!isDraggingRef.current) return;
		
		const deltaX = e.clientX - lastMouseRef.current.x;
		const deltaY = e.clientY - lastMouseRef.current.y;
		lastMouseRef.current = { x: e.clientX, y: e.clientY };
		
		// Update camera angles
		cameraYawRef.current -= deltaX * 0.005;
		cameraPitchRef.current -= deltaY * 0.005;
		
		// Clamp pitch to avoid flipping
		cameraPitchRef.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, cameraPitchRef.current));
	}, []);

	const handleMouseUp = useCallback(() => {
		isDraggingRef.current = false;
		const canvas = canvasRef.current;
		if (canvas) canvas.style.cursor = "grab";
	}, []);

	// Setup mouse event listeners
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		canvas.style.cursor = "grab";
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

		// Initialize stars in 3D space
		const initStars = () => {
			const stars: Star[] = [];
			for (let i = 0; i < numStars; i++) {
				stars.push({
					x: (Math.random() - 0.5) * fieldSize,
					y: (Math.random() - 0.5) * fieldSize,
					z: (Math.random() - 0.5) * fieldSize,
					size: 0.5 + Math.random() * 1.5,
					brightness: 0.4 + Math.random() * 0.6,
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
			if (rz <= 10) return null; // Behind camera
			
			const fov = width * 0.8;
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
			const moveSpeed = speed * 8;

			// Collect stars with their projected positions for depth sorting
			const projectedStars: Array<{
				star: Star;
				current: { x: number; y: number; z: number; scale: number };
				previous: { x: number; y: number } | null;
			}> = [];

			for (const star of starsRef.current) {
				// Project current position
				const current = project(star.x, star.y, star.z, width, height);
				if (!current) continue;
				
				// Project previous position (for motion trail)
				const prevZ = star.z + moveSpeed;
				const previous = project(star.x, star.y, prevZ, width, height);
				
				projectedStars.push({
					star,
					current,
					previous: previous && speed > 0.1 ? { x: previous.x, y: previous.y } : null,
				});
			}

			// Sort by depth (far to near)
			projectedStars.sort((a, b) => b.current.z - a.current.z);

			// Draw stars
			for (const { star, current, previous } of projectedStars) {
				const { x, y, z, scale } = current;
				
				// Skip if off screen
				if (x < -50 || x > width + 50 || y < -50 || y > height + 50) continue;

				// Calculate size and alpha based on depth
				const depthFactor = 1 - (z - 10) / (cameraDistance + fieldSize / 2);
				const starSize = Math.max(0.5, star.size * scale * 0.15);
				const alpha = star.brightness * Math.max(0.2, depthFactor);

				// Draw motion blur trail
				if (previous && speed > 0.1) {
					const trailAlpha = alpha * Math.min(0.7, speed * 0.2);
					
					const gradient = context.createLinearGradient(previous.x, previous.y, x, y);
					gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
					gradient.addColorStop(1, `rgba(255, 255, 255, ${trailAlpha})`);

					context.strokeStyle = gradient;
					context.lineWidth = starSize * 0.8;
					context.lineCap = "round";
					context.beginPath();
					context.moveTo(previous.x, previous.y);
					context.lineTo(x, y);
					context.stroke();
				}

				// Draw the star point
				context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
				context.beginPath();
				context.arc(x, y, starSize, 0, Math.PI * 2);
				context.fill();
			}

			// Update star positions (move toward camera)
			for (const star of starsRef.current) {
				star.z -= moveSpeed;
				
				// Respawn stars that pass the camera
				if (star.z < -cameraDistance) {
					star.z = fieldSize / 2;
					star.x = (Math.random() - 0.5) * fieldSize;
					star.y = (Math.random() - 0.5) * fieldSize;
					star.brightness = 0.4 + Math.random() * 0.6;
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
