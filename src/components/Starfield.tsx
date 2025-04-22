import React, { useRef, useEffect, useState } from 'react';
import { useSimulation } from '../context/SimulationContext';

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
}

interface StarfieldProps {
  // Add any specific props if needed later
}

const Starfield: React.FC<StarfieldProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state } = useSimulation();
  const { speed } = state;
  const [stars, setStars] = useState<Star[]>([]);

  const numStars = 500; // Number of stars

  // Initialize stars
  useEffect(() => {
    const initialStars: Star[] = [];
    for (let i = 0; i < numStars; i++) {
      initialStars.push({
        x: Math.random() * (window.innerWidth * 2) - window.innerWidth, // Center around 0
        y: Math.random() * (window.innerHeight * 2) - window.innerHeight, // Center around 0
        z: Math.random() * window.innerWidth, // Depth
        size: Math.random() * 2 + 0.5, // Random size
      });
    }
    setStars(initialStars);
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let animationFrameId: number;

    const render = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;

      context.fillStyle = '#000';
      context.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      const newStars = stars.map(star => {
        const newZ = star.z - speed * 5; // Move stars based on simulation speed

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

      setStars(newStars);

      newStars.forEach(star => {
        const perspective = width / star.z;
        const x = centerX + star.x * perspective;
        const y = centerY + star.y * perspective;
        const size = star.size * perspective * 0.1; // Adjust size based on perspective

        // Draw star
        context.fillStyle = '#FFF';
        context.beginPath();
        context.arc(x, y, size, 0, Math.PI * 2);
        context.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [stars, speed]); // Re-run effect when stars or speed change

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

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  return (
    <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}></canvas>
  );
};

export default Starfield;