// BottomPlotContainer.tsx
import React from "react";

import ProbabilityPlot from "./ProbabilityPlot";
import { useMemo } from "react";
import { useAppState } from "../state";
/* Removed unused import: flavorColorsRGB */

// Helper to convert [r,g,b] to CSS rgb string
const flavorColorStrings = {
  electron: "rgb(80,180,255)",
  muon: "rgb(255,140,40)",
  tau: "rgb(220,60,255)",
};

const FLAVORS = ["electron", "muon", "tau"];

const BottomPlotContainer: React.FC = () => {
  const { simParams, plotParams } = useAppState();
  const [simState] = simParams;
  const [plotState] = plotParams;

  // Generate probability data for the plot
  const probabilityData = useMemo(() => {
    const { calculateNuFastProbs } = await import("../physics/NuFastPort");
    const points: { distance: number; probabilities: { [flavor: string]: number } }[] = [];
    const maxL = simState.maxL ?? 1000;
    const numPoints = plotState.numPoints ?? 200;
    for (let i = 0; i < numPoints; ++i) {
      const L = (i / (numPoints - 1)) * maxL;
      const params = { ...simState, L };
      const probMatrix = calculateNuFastProbs(params);
      // Each row: [to_e, to_mu, to_tau], initial flavor = simState.initialFlavorIndex
      const row = probMatrix[simState.initialFlavorIndex ?? 0];
      points.push({
        distance: L,
        probabilities: {
          electron: row[0],
          muon: row[1],
          tau: row[2],
        },
      });
    }
    return points;
  }, [simState, plotState]);

  return (
    <div className="fixed bottom-4 left-1/2 z-20 -translate-x-1/2 bg-neutral-900/95 rounded-lg shadow-xl px-6 py-3 flex items-center justify-center border border-neutral-800 min-w-[320px] max-w-xl w-full backdrop-blur-sm">
      <ProbabilityPlot
        data={probabilityData}
        flavors={FLAVORS}
        flavorColors={flavorColorStrings}
        width={520}
        height={200}
        distanceLabel="Distance (km)"
        probabilityLabel="Probability"
      />
    </div>
  );
};

export default BottomPlotContainer;