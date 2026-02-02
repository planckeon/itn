import { type Timer, createTimer } from "animejs";
import type React from "react";
import { useEffect, useRef } from "react";
import { useSimulation } from "../context/SimulationContext";

interface Star {
	x: number;
	y: number;
	z: number;
	size: number;
}

const Starfield: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { state } = useSimulation();
	const { speed } = state;
	const starsRef = useRef<Star[]>([]);
	const timerRef = useRef<Timer | null>(null);

	const numStars = 500; // Number of stars

	// Initialize stars
	useEffect(() => {
		const initialStars: Star[] = [];
		for (let i = 0; i < numStars; i++) {
			initialStars.push({
				x: Math.random() * (window.innerWidth * 2) - window.innerWidth,
				y: Math.random() * (window.innerHeight * 2) - window.innerHeight,
				z: Math.random() * window.innerWidth,
				size: Math.random() * 2 + 0.5,
			});
		}
		starsRef.current = initialStars;
	}, []);

	// Animation loop using requestAnimationFrame for better performance
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

				context.fillStyle = "#000";
				context.fillRect(0, 0, width, height);

				const centerX = width / 2;
				const centerY = height / 2;

				starsRef.current = starsRef.current.map((star) => {
					const newZ = star.z - speed * 5;

					// Wrap stars around
					if (newZ <= 0) {
						return {
							x: Math.random() * (width * 2) - width,
							y: Math.random() * (height * 2) - height,
							z: width,
							size: Math.random() * 2 + 0.5,
						};
					}

					return { ...star, z: newZ };
				});

				starsRef.current.forEach((star) => {
					const perspective = width / star.z;
					const x = centerX + star.x * perspective;
					const y = centerY + star.y * perspective;
					const size = star.size * perspective * 0.1;

					context.fillStyle = "#FFF";
					context.beginPath();
					context.arc(x, y, size, 0, Math.PI * 2);
					context.fill();
				});
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
		></canvas>
	);
};

export default Starfield;
