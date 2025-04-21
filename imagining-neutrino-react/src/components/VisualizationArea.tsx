// VisualizationArea.tsx
import React from "react";
import NeutrinoVisualization from "./NeutrinoVisualization";

const VisualizationArea: React.FC = () => (
  <div className="flex-1 flex items-center justify-center min-h-0">
    <div className="w-full h-full max-w-3xl max-h-[60vh] bg-neutral-800/70 rounded-2xl border border-neutral-700 flex items-center justify-center">
      {/* NeutrinoVisualization renders the p5.js sketch */}
      <NeutrinoVisualization />
    </div>
  </div>
);

export default VisualizationArea;