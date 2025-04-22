import React, { useRef, useEffect } from "react";

// @ts-ignore - Using global p5 from CDN
declare const p5: any;
import createNeutrinoSketch from "../core/visualization/p5Sketch";

const NeutrinoVisualization: React.FC = () => {
  const sketchContainerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<any>(null);

  useEffect(() => {
    if (sketchContainerRef.current) {
      // Clean up any previous instance
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
      // Create new p5 instance
      p5InstanceRef.current = new p5(
        createNeutrinoSketch(sketchContainerRef.current),
        sketchContainerRef.current
      );
    }
    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={sketchContainerRef}
      style={{ width: "100%", height: "100%", minHeight: 400 }}
      id="neutrino-sketch-container"
    />
  );
};

export default NeutrinoVisualization;