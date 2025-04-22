import React, { useRef, useEffect, useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import anime from 'animejs';
import './ProbabilityPlot.css'; // Assuming a dedicated CSS file for responsiveness and styling

interface ProbabilityHistoryItem {
  distance: number;
  Pe: number;
  Pmu: number;
  Ptau: number;
}

interface ProbabilityPlotProps {}

const ProbabilityPlot: React.FC<ProbabilityPlotProps> = () => {
  const { state } = useSimulation();
  const { probabilityHistory } = state;
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const margin = { top: 20, right: 40, bottom: 30, left: 40 }; // Increased right margin for markers

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth - margin.left - margin.right,
          height: containerRef.current.clientHeight - margin.top - margin.bottom,
        });
      }
    };

    handleResize(); // Set initial dimensions
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [margin]); // Re-run if margins change (though they are constant here)

  useEffect(() => {
    const svg = svgRef.current;
    if (!probabilityHistory || probabilityHistory.length === 0 || !svg || dimensions.width <= 0 || dimensions.height <= 0) {
    console.log('ProbabilityPlot: probabilityHistory update', probabilityHistory);
      return;
    }

    const { width, height } = dimensions;
    const numDataPoints = probabilityHistory.length;
    const maxDistance = probabilityHistory[numDataPoints - 1]?.distance || 1; // Get max distance from data

    // Clear previous drawings
    svg.innerHTML = '';

    // Create SVG elements
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);
    svg.appendChild(g);


    // Function to get SVG path data for a given flavor
    const getPathData = (flavor: 'Pe' | 'Pmu' | 'Ptau') => {
      return probabilityHistory.map((item: ProbabilityHistoryItem, index: number) => {
        const x = (item.distance / maxDistance) * width;
        const y = height - (item[flavor] * height);
        return `${index === 0 ? 'M' : 'L'}${x},${y}`;
      }).join(' ');
    };

    // Draw lines
    const flavors: ('Pe' | 'Pmu' | 'Ptau')[] = ['Pe', 'Pmu', 'Ptau'];
    const colors = {
      Pe: 'blue',
      Pmu: 'orange',
      Ptau: 'magenta',
    };

    flavors.forEach(flavor => {
      const pathData = getPathData(flavor);
      const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathElement.setAttribute('d', pathData);
      pathElement.setAttribute('stroke', colors[flavor]);
      pathElement.setAttribute('fill', 'none');
      pathElement.setAttribute('stroke-width', '2');
      g.appendChild(pathElement); // Append to the group

      // Animation for path drawing
      const pathLength = pathElement.getTotalLength();
      pathElement.setAttribute('stroke-dasharray', pathLength.toString());
      pathElement.setAttribute('stroke-dashoffset', pathLength.toString());

      anime({
        targets: pathElement,
        strokeDashoffset: [pathLength, 0],
        easing: 'linear',
        duration: 1000, // Animation duration (adjust as needed)
        delay: anime.random(0, 500), // Stagger animations slightly
      });
    });

    // Draw current probability markers
    const lastDataItem = probabilityHistory[numDataPoints - 1];
    if (lastDataItem) {
      const lastData = lastDataItem;
      const xPos = width; // At the right edge of the plot area

      flavors.forEach(flavor => {
        const yPos = height - (lastData[flavor] * height);
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        marker.setAttribute('cx', xPos.toString());
        marker.setAttribute('cy', yPos.toString());
        marker.setAttribute('r', '6'); // Slightly larger radius
        marker.setAttribute('fill', colors[flavor]);
        marker.setAttribute('stroke', '#fff'); // White border
        marker.setAttribute('stroke-width', '1.5');
        marker.style.opacity = '0'; // Start with opacity 0
        g.appendChild(marker); // Append to the group

        // Animation for marker entry
        anime({
          targets: marker,
          scale: [0, 1],
          opacity: [0, 1],
          easing: 'easeOutElastic(1, .5)',
          duration: 800, // Animation duration (adjust as needed)
          delay: 1000 + anime.random(0, 300), // Delay after line drawing
        });
      });
    }


  }, [probabilityHistory, dimensions, margin]); // Redraw when probabilityHistory, dimensions, or margin changes

  return (
    <div className="probability-plot-container" ref={containerRef}>
      <h2>Probability Plot</h2>
      <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${dimensions.width + margin.left + margin.right} ${dimensions.height + margin.top + margin.bottom}`} preserveAspectRatio="xMidYMid meet"></svg>
    </div>
  );
};

export default ProbabilityPlot;