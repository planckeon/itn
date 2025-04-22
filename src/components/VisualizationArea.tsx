import React from 'react';
import Starfield from './Starfield';
import NeutrinoSphere from './NeutrinoSphere';
import FlavorLabel from './FlavorLabel';
import ProbabilityPlot from './ProbabilityPlot';

const VisualizationArea: React.FC = () => {
  return (
    <div>
      <h2>Visualization Area</h2>
      <Starfield />
      <NeutrinoSphere />
      <FlavorLabel />
      <ProbabilityPlot />
    </div>
  );
};

export default VisualizationArea;