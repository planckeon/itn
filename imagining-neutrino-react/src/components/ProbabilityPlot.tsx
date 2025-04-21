// ProbabilityPlot.tsx
import React from "react";

type ProbabilityDatum = {
  distance: number;
  probabilities: { [flavor: string]: number };
};

type ProbabilityPlotProps = {
  data: ProbabilityDatum[];
  flavors: string[];
  flavorColors: { [flavor: string]: string };
  width?: number;
  height?: number;
  distanceLabel?: string;
  probabilityLabel?: string;
};

const MARGIN = { top: 32, right: 32, bottom: 48, left: 56 };

export const ProbabilityPlot: React.FC<ProbabilityPlotProps> = ({
  data,
  flavors,
  flavorColors,
  width = 600,
  height = 240,
  distanceLabel = "Distance (km)",
  probabilityLabel = "Probability",
}) => {
  if (!data || data.length === 0) return null;

  // Compute bounds
  const minX = Math.min(...data.map((d) => d.distance));
  const maxX = Math.max(...data.map((d) => d.distance));
  const minY = 0;
  const maxY = 1;

  // Scales
  const plotWidth = width - MARGIN.left - MARGIN.right;
  const plotHeight = height - MARGIN.top - MARGIN.bottom;
  const xScale = (x: number) =>
    ((x - minX) / (maxX - minX)) * plotWidth + MARGIN.left;
  const yScale = (y: number) =>
    plotHeight + MARGIN.top - ((y - minY) / (maxY - minY)) * plotHeight;

  // Axis ticks
  const xTicks = 5;
  const yTicks = 5;
  const xTickVals = Array.from({ length: xTicks + 1 }, (_, i) =>
    minX + ((maxX - minX) * i) / xTicks
  );
  const yTickVals = Array.from({ length: yTicks + 1 }, (_, i) =>
    minY + ((maxY - minY) * i) / yTicks
  );

  // Line generator
  const linePath = (flavor: string) => {
    return data
      .map((d, i) => {
        const x = xScale(d.distance);
        const y = yScale(d.probabilities[flavor]);
        return i === 0 ? `M${x},${y}` : `L${x},${y}`;
      })
      .join(" ");
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        width={width}
        height={height}
        className="bg-neutral-900 rounded-2xl shadow-xl"
        style={{ display: "block" }}
      >
        {/* Axes */}
        {/* X axis */}
        <line
          x1={MARGIN.left}
          y1={height - MARGIN.bottom}
          x2={width - MARGIN.right}
          y2={height - MARGIN.bottom}
          stroke="#aaa"
          strokeWidth={1.5}
        />
        {/* Y axis */}
        <line
          x1={MARGIN.left}
          y1={MARGIN.top}
          x2={MARGIN.left}
          y2={height - MARGIN.bottom}
          stroke="#aaa"
          strokeWidth={1.5}
        />

        {/* X axis ticks and labels */}
        {xTickVals.map((x, i) => {
          const px = xScale(x);
          return (
            <g key={i}>
              <line
                x1={px}
                y1={height - MARGIN.bottom}
                x2={px}
                y2={height - MARGIN.bottom + 8}
                stroke="#aaa"
                strokeWidth={1}
              />
              <text
                x={px}
                y={height - MARGIN.bottom + 24}
                fill="#ccc"
                fontSize={13}
                textAnchor="middle"
              >
                {x.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Y axis ticks and labels */}
        {yTickVals.map((y, i) => {
          const py = yScale(y);
          return (
            <g key={i}>
              <line
                x1={MARGIN.left - 8}
                y1={py}
                x2={MARGIN.left}
                y2={py}
                stroke="#aaa"
                strokeWidth={1}
              />
              <text
                x={MARGIN.left - 12}
                y={py + 4}
                fill="#ccc"
                fontSize={13}
                textAnchor="end"
              >
                {y.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Axis labels */}
        <text
          x={width / 2}
          y={height - 8}
          fill="#ccc"
          fontSize={15}
          textAnchor="middle"
        >
          {distanceLabel}
        </text>
        <text
          x={MARGIN.left - 36}
          y={MARGIN.top + plotHeight / 2}
          fill="#ccc"
          fontSize={15}
          textAnchor="middle"
          transform={`rotate(-90,${MARGIN.left - 36},${MARGIN.top +
            plotHeight / 2})`}
        >
          {probabilityLabel}
        </text>

        {/* Probability lines */}
        {flavors.map((flavor) => (
          <path
            key={flavor}
            d={linePath(flavor)}
            fill="none"
            stroke={flavorColors[flavor] || "#fff"}
            strokeWidth={2.5}
          />
        ))}

        {/* Inline legend (top right) */}
        <g>
          {flavors.map((flavor, i) => (
            <g
              key={flavor}
              transform={`translate(${width - MARGIN.right - 110},${MARGIN.top +
                i * 22})`}
            >
              <rect
                x={0}
                y={-10}
                width={22}
                height={6}
                fill={flavorColors[flavor] || "#fff"}
                rx={2}
              />
              <text
                x={28}
                y={-4}
                fill="#ccc"
                fontSize={14}
                alignmentBaseline="middle"
              >
                {flavor}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default ProbabilityPlot;