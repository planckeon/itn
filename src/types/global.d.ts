declare global {
	interface Window {
		physicsEngine?: import("../physics/types").PhysicsEngine;
		neutrinoVisualizationData?: {
			currentProbs: import("../physics/types").ProbabilityVector;
			dominantFlavor: string;
		};
		p5Instance?: import("../physics/types").P5SketchInstance;
		degToRad?: (deg: number) => number;
	}
}
