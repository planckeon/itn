import type p5 from "p5";

export interface PhysicsEngine {
	calculateNuFastProbs: (params: OscillationParameters) => ProbabilityMatrix;
	getProbabilitiesForInitialFlavor: (
		params: OscillationParameters,
	) => ProbabilityVector;
	probabilityVacuumLBL: (
		s12sq: number,
		s13sq: number,
		s23sq: number,
		delta: number,
		Dmsq21: number,
		Dmsq31: number,
		L: number,
		E: number,
	) => ProbabilityMatrix;
	probabilityMatterLBL: (
		s12sq: number,
		s13sq: number,
		s23sq: number,
		delta: number,
		Dmsq21: number,
		Dmsq31: number,
		L: number,
		E: number,
		rho: number,
		Ye: number,
		N_Newton: number,
	) => ProbabilityMatrix;
}

export type ProbabilityMatrix = [
	ProbabilityVector,
	ProbabilityVector,
	ProbabilityVector,
];

export interface OscillationParameters {
	L: number; // km
	energy: number; // GeV
	theta12_deg: number;
	theta13_deg: number;
	theta23_deg: number;
	deltaCP_deg: number;
	dm21sq_eV2: number;
	dm31sq_eV2: number;
	maxL?: number; // km
	initialFlavorIndex?: number;
	rho?: number; // g/cm^3
	matterEffect?: boolean;
	Ye?: number; // Electron fraction
	N_Newton?: number; // Newton-Raphson iterations
}

export type ProbabilityVector = [number, number, number];

export interface AnimationState {
	isPlaying: boolean;
	simSpeed: number;
	currentL: number;
}

export interface P5SketchInstance extends p5 {
	setPlaying?: (isPlaying: boolean) => void;
	setSimSpeed?: (speed: number) => void;
	updateSimParams?: (simParams: OscillationParameters) => void;
	resetSimulation?: () => void;
	remove: () => void;
}

export type NeutrinoFlavor = 0 | 1 | 2; // 0: electron, 1: muon, 2: tau

export interface PlotParameters {
maxL: number;
numPoints: number;
}

export interface TooltipState {
[key: string]: boolean;
}
