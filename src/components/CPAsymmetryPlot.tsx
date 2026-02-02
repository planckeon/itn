import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSimulation } from "../context/SimulationContext";
import { initWasm, isWasmReady, wasmCalculateEnergySpectrum } from "../physics/wasmBridge";
import { getProbabilitiesForInitialFlavor } from "../physics/NuFastPort";
import type { OscillationParameters } from "../physics/types";
import InfoTooltip from "./InfoTooltip";

// NuFit 5.2 values
const THETA12_DEG = 33.44;
const THETA13_DEG = 8.57;
const THETA23_DEG = 49.2;
const DM21_SQ = 7.42e-5;
const DM31_SQ_NO = 2.517e-3;
const DM31_SQ_IO = -2.498e-3;
const YE = 0.5;

const COLORS = {
  neutrino: "rgb(59, 130, 246)",      // Blue for ν
  antineutrino: "rgb(251, 146, 60)",  // Orange for ν̄
  asymmetry: "rgb(168, 85, 247)",     // Purple for A_CP
  grid: "rgba(255, 255, 255, 0.1)",
  axis: "rgba(255, 255, 255, 0.3)",
  text: "rgba(255, 255, 255, 0.6)",
  zero: "rgba(255, 255, 255, 0.2)",
};

const INFO_TEXT = `CP Asymmetry: Difference between ν and ν̄ oscillations.

A_CP = P(ν_μ → ν_e) - P(ν̄_μ → ν̄_e)

• Positive (purple): ν more likely to appear as ν_e
• Negative: ν̄ more likely
• δ_CP ≠ 0, π causes CP violation
• Matter effects also create asymmetry`;

interface CPAsymmetryPlotProps {
  embedded?: boolean;
  fillContainer?: boolean;
}

/**
 * Shows CP asymmetry: difference between neutrino and antineutrino probabilities
 */
const CPAsymmetryPlot: React.FC<CPAsymmetryPlotProps> = ({
  embedded = false,
  fillContainer = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { state } = useSimulation();
  const [wasmReady, setWasmReady] = useState(false);

  useEffect(() => {
    initWasm().then(setWasmReady);
  }, []);

  // Calculate asymmetry data
  const asymmetryData = useMemo(() => {
    const {
      distance,
      initialFlavor,
      deltaCP,
      massOrdering,
      matter,
      density,
    } = state;

    // Convert flavor string to index
    const flavorIndex = initialFlavor === "electron" ? 0 : initialFlavor === "muon" ? 1 : 2;

    const dm31sq = massOrdering === "normal" ? DM31_SQ_NO : DM31_SQ_IO;
    const numPoints = wasmReady && isWasmReady() ? 200 : 100;
    const eMin = 0.1;
    const eMax = 10.0;

    // Calculate for both neutrino and antineutrino
    const nuData: { energy: number; Pe: number; Pmu: number; Ptau: number }[] = [];
    const antiData: { energy: number; Pe: number; Pmu: number; Ptau: number }[] = [];

    if (wasmReady && isWasmReady()) {
      // Use WASM for both
      const nuParams = {
        theta12_deg: THETA12_DEG,
        theta13_deg: THETA13_DEG,
        theta23_deg: THETA23_DEG,
        deltaCP_deg: deltaCP,
        dm21sq_eV2: DM21_SQ,
        dm31sq_eV2: dm31sq,
        matterEffect: matter,
        rho: density,
        Ye: YE,
        initialFlavorIndex: flavorIndex,
        isAntineutrino: false,
      };

      const antiParams = { ...nuParams, isAntineutrino: true };

      try {
        const nuResult = wasmCalculateEnergySpectrum(nuParams, distance, eMin, eMax, numPoints);
        const antiResult = wasmCalculateEnergySpectrum(antiParams, distance, eMin, eMax, numPoints);
        nuData.push(...nuResult);
        antiData.push(...antiResult);
      } catch {
        // Fallback to JS
      }
    }

    // Fallback to JavaScript calculation
    if (nuData.length === 0) {
      for (let i = 0; i < numPoints; i++) {
        const t = i / (numPoints - 1);
        const e = eMin + t * (eMax - eMin);

        const nuParams: OscillationParameters = {
          theta12_deg: THETA12_DEG,
          theta13_deg: THETA13_DEG,
          theta23_deg: THETA23_DEG,
          deltaCP_deg: deltaCP,
          dm21sq_eV2: DM21_SQ,
          dm31sq_eV2: dm31sq,
          L: distance,
          energy: e,
          rho: matter ? density : 0,
          Ye: YE,
          matterEffect: matter,
          isAntineutrino: false,
        };

        const antiParams: OscillationParameters = { ...nuParams, isAntineutrino: true };

        const nuProbs = getProbabilitiesForInitialFlavor(nuParams, flavorIndex);
        const antiProbs = getProbabilitiesForInitialFlavor(antiParams, flavorIndex);

        nuData.push({ energy: e, Pe: nuProbs[0], Pmu: nuProbs[1], Ptau: nuProbs[2] });
        antiData.push({ energy: e, Pe: antiProbs[0], Pmu: antiProbs[1], Ptau: antiProbs[2] });
      }
    }

    // Calculate asymmetry
    return nuData.map((nu, i) => {
      const anti = antiData[i];
      return {
        energy: nu.energy,
        nuPe: nu.Pe,
        antiPe: anti.Pe,
        asymmetry: nu.Pe - anti.Pe, // A_CP for appearance channel
      };
    });
  }, [state, wasmReady]);

  // Find max asymmetry for scaling
  const maxAsymmetry = useMemo(() => {
    const max = Math.max(...asymmetryData.map(d => Math.abs(d.asymmetry)));
    return Math.max(max, 0.05); // Minimum scale
  }, [asymmetryData]);

  // Draw the plot
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const padding = { top: 30, right: 20, bottom: 40, left: 50 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    // Draw grid
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;

    // Horizontal grid lines (probability scale)
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (i / 4) * plotHeight;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + plotWidth, y);
      ctx.stroke();
    }

    // Zero line (emphasized)
    const zeroY = padding.top + plotHeight / 2;
    ctx.strokeStyle = COLORS.zero;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, zeroY);
    ctx.lineTo(padding.left + plotWidth, zeroY);
    ctx.stroke();
    ctx.lineWidth = 1;

    // Vertical grid lines (energy scale)
    ctx.strokeStyle = COLORS.grid;
    for (let i = 0; i <= 5; i++) {
      const x = padding.left + (i / 5) * plotWidth;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + plotHeight);
      ctx.stroke();
    }

    // Helper to convert data to canvas coordinates
    const eMin = 0.1;
    const eMax = 10.0;
    const toX = (e: number) => padding.left + ((e - eMin) / (eMax - eMin)) * plotWidth;
    const toY = (a: number) => padding.top + plotHeight / 2 - (a / maxAsymmetry) * (plotHeight / 2);

    // Draw asymmetry curve (filled)
    ctx.beginPath();
    ctx.moveTo(toX(asymmetryData[0].energy), zeroY);
    for (const point of asymmetryData) {
      ctx.lineTo(toX(point.energy), toY(point.asymmetry));
    }
    ctx.lineTo(toX(asymmetryData[asymmetryData.length - 1].energy), zeroY);
    ctx.closePath();
    ctx.fillStyle = "rgba(168, 85, 247, 0.3)";
    ctx.fill();

    // Draw asymmetry curve (line)
    ctx.beginPath();
    ctx.moveTo(toX(asymmetryData[0].energy), toY(asymmetryData[0].asymmetry));
    for (const point of asymmetryData) {
      ctx.lineTo(toX(point.energy), toY(point.asymmetry));
    }
    ctx.strokeStyle = COLORS.asymmetry;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw current energy marker
    const currentE = state.energy;
    if (currentE >= eMin && currentE <= eMax) {
      const markerX = toX(currentE);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(markerX, padding.top);
      ctx.lineTo(markerX, padding.top + plotHeight);
      ctx.stroke();
      ctx.setLineDash([]);

      // Find asymmetry at current energy
      const closest = asymmetryData.reduce((prev, curr) =>
        Math.abs(curr.energy - currentE) < Math.abs(prev.energy - currentE) ? curr : prev
      );

      // Draw point
      ctx.beginPath();
      ctx.arc(markerX, toY(closest.asymmetry), 4, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.asymmetry;
      ctx.fill();
    }

    // Axis labels
    ctx.fillStyle = COLORS.text;
    ctx.font = "11px system-ui, sans-serif";
    ctx.textAlign = "center";

    // X-axis labels
    for (let i = 0; i <= 5; i++) {
      const e = eMin + (i / 5) * (eMax - eMin);
      const x = padding.left + (i / 5) * plotWidth;
      ctx.fillText(e.toFixed(1), x, height - padding.bottom + 20);
    }
    ctx.fillText("Energy (GeV)", padding.left + plotWidth / 2, height - 5);

    // Y-axis labels
    ctx.textAlign = "right";
    const yLabels = [maxAsymmetry, maxAsymmetry / 2, 0, -maxAsymmetry / 2, -maxAsymmetry];
    for (let i = 0; i < yLabels.length; i++) {
      const y = padding.top + (i / (yLabels.length - 1)) * plotHeight;
      ctx.fillText(yLabels[i].toFixed(2), padding.left - 8, y + 4);
    }

    // Y-axis title
    ctx.save();
    ctx.translate(12, padding.top + plotHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText("A_CP = P(ν) - P(ν̄)", 0, 0);
    ctx.restore();

    // Title with current asymmetry value
    const closest = asymmetryData.reduce((prev, curr) =>
      Math.abs(curr.energy - state.energy) < Math.abs(prev.energy - state.energy) ? curr : prev
    );
    
    ctx.textAlign = "left";
    ctx.font = "bold 12px system-ui, sans-serif";
    ctx.fillStyle = COLORS.asymmetry;
    ctx.fillText(
      `A_CP = ${closest.asymmetry >= 0 ? "+" : ""}${(closest.asymmetry * 100).toFixed(1)}%`,
      padding.left,
      padding.top - 10
    );

    // δ_CP indicator
    ctx.textAlign = "right";
    ctx.font = "11px system-ui, sans-serif";
    ctx.fillStyle = COLORS.text;
    ctx.fillText(`δ_CP = ${state.deltaCP.toFixed(0)}°`, width - padding.right, padding.top - 10);

  }, [asymmetryData, state.energy, state.deltaCP, maxAsymmetry]);

  const containerClass = fillContainer
    ? "w-full h-full"
    : embedded
    ? "w-full h-[180px]"
    : "w-[400px] h-[250px]";

  return (
    <div ref={containerRef} className={`relative ${containerClass}`}>
      <canvas ref={canvasRef} className="w-full h-full" />
      {!embedded && (
        <div className="absolute top-2 right-2">
          <InfoTooltip text={INFO_TEXT} />
        </div>
      )}
    </div>
  );
};

export default CPAsymmetryPlot;
