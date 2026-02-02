import type React from "react";
import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { getProbabilitiesForInitialFlavor } from "../physics/NuFastPort";
import type { OscillationParameters } from "../physics/types";

// Neutrino physics constants (should ideally come from NuFastPort or a constants file)
// NuFit 5.2 (2022) best-fit values
const theta12_deg = 33.44;
const theta13_deg = 8.57;
const theta23_deg = 49.2;
const dm21sq_eV2 = 7.42e-5; // eV^2
// Normal Ordering: m1 < m2 < m3
const dm31sq_NO = 2.517e-3; // eV^2 (positive)
// Inverted Ordering: m3 < m1 < m2
const dm31sq_IO = -2.498e-3; // eV^2 (negative)
const Ye = 0.5; // Electron fraction in typical matter (e.g., Earth's crust)

// Simulation constants
const LmaxSim = 3000; // km
const c = 299792.458; // km/s

type Flavor = "electron" | "muon" | "tau";
type MassOrdering = "normal" | "inverted";

interface SimulationState {
	initialFlavor: Flavor;
	energy: number;
	speed: number;
	matter: boolean;
	density: number;
	deltaCP: number; // CP violation phase in degrees (0-360)
	isAntineutrino: boolean; // true for antineutrino mode
	massOrdering: MassOrdering; // normal or inverted
	zoom: number; // zoom level (0.5 to 2.0, default 1.0)
	time: number;
	probabilityHistory: {
		distance: number;
		Pe: number;
		Pmu: number;
		Ptau: number;
	}[];
	distance: number;
}

interface SimulationContextType {
	state: SimulationState;
	setInitialFlavor: (flavor: Flavor) => void;
	setEnergy: (energy: number) => void;
	setSpeed: (speed: number) => void;
	setMatter: (matter: boolean) => void;
	setDensity: (density: number) => void;
	setDeltaCP: (deltaCP: number) => void;
	setIsAntineutrino: (isAntineutrino: boolean) => void;
	setMassOrdering: (massOrdering: MassOrdering) => void;
	setZoom: (zoom: number) => void;
	resetSimulation: () => void;
	applyPreset: (preset: ExperimentPreset) => void;
}

// Experiment presets based on real neutrino experiments
export interface ExperimentPreset {
	name: string;
	baseline: number; // km
	energy: number; // GeV
	description: string;
	initialFlavor: Flavor;
}

export const EXPERIMENT_PRESETS: ExperimentPreset[] = [
	// Accelerator experiments (νμ beam)
	{
		name: "T2K",
		baseline: 295,
		energy: 0.6,
		description: "Japan, νμ→νe appearance",
		initialFlavor: "muon",
	},
	{
		name: "NOvA",
		baseline: 810,
		energy: 2.0,
		description: "USA, longest operational baseline",
		initialFlavor: "muon",
	},
	{
		name: "DUNE",
		baseline: 1300,
		energy: 2.5,
		description: "Future, high precision CP violation",
		initialFlavor: "muon",
	},
	{
		name: "Hyper-K",
		baseline: 295,
		energy: 0.6,
		description: "Japan, next-gen T2K successor",
		initialFlavor: "muon",
	},
	// Reactor experiments (ν̄e)
	{
		name: "KamLAND",
		baseline: 180,
		energy: 0.003, // 3 MeV
		description: "Japan, reactor ν̄e disappearance",
		initialFlavor: "electron",
	},
	{
		name: "Daya Bay",
		baseline: 1.6,
		energy: 0.004, // 4 MeV
		description: "China, θ13 measurement",
		initialFlavor: "electron",
	},
	{
		name: "JUNO",
		baseline: 53,
		energy: 0.003, // 3 MeV
		description: "China, mass ordering determination",
		initialFlavor: "electron",
	},
	{
		name: "Double Chooz",
		baseline: 1.05,
		energy: 0.004,
		description: "France, θ13 measurement",
		initialFlavor: "electron",
	},
	// Atmospheric
	{
		name: "Super-K Atm",
		baseline: 500,
		energy: 1.0,
		description: "Japan, atmospheric neutrinos",
		initialFlavor: "muon",
	},
	{
		name: "IceCube",
		baseline: 10000,
		energy: 25,
		description: "South Pole, high-energy atmospheric",
		initialFlavor: "muon",
	},
	// Solar
	{
		name: "Solar",
		baseline: 15000, // ~0.1 AU effective
		energy: 0.001, // 1 MeV (pp chain)
		description: "Sun to Earth, MSW effect",
		initialFlavor: "electron",
	},
];

const SimulationContext = createContext<SimulationContextType | undefined>(
	undefined,
);

export const SimulationProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [initialFlavor, setInitialFlavor] = useState<Flavor>("electron");
	const [energy, setEnergy] = useState<number>(2); // GeV
	const [speed, setSpeed] = useState<number>(1); // relative to c
	const [matter, setMatter] = useState<boolean>(false);
	const [density, setDensity] = useState<number>(2.6); // g/cm^3
	const [deltaCP, setDeltaCP] = useState<number>(0); // degrees
	const [isAntineutrino, setIsAntineutrino] = useState<boolean>(false);
	const [massOrdering, setMassOrdering] = useState<MassOrdering>("normal");
	const [zoom, setZoom] = useState<number>(0.75); // 0.5 to 2.0, default smaller
	const [time, setTime] = useState<number>(0); // seconds
	const [distance, setDistance] = useState<number>(0); // km
	const [probabilityHistory, setProbabilityHistory] = useState<
		{ distance: number; Pe: number; Pmu: number; Ptau: number }[]
	>([]);

	const animationFrameId = useRef<number | null>(null);
	const lastUpdateTime = useRef<number>(0);

	const resetSimulation = useCallback(() => {
		setTime(0);
		setDistance(0);
		setProbabilityHistory([]);
	}, []);

	const applyPreset = useCallback((preset: ExperimentPreset) => {
		setEnergy(preset.energy);
		setInitialFlavor(preset.initialFlavor);
		// Reset simulation to start fresh with new parameters
		setTime(0);
		setDistance(0);
		setProbabilityHistory([]);
	}, []);

	// Effect to update simulation time and distance
	useEffect(() => {
		const updateSimulation = (currentTime: number) => {
			if (!lastUpdateTime.current) {
				lastUpdateTime.current = currentTime;
			}

			const deltaTime = (currentTime - lastUpdateTime.current) / 1000; // delta time in seconds
			lastUpdateTime.current = currentTime;

			setTime((prevTime) => prevTime + deltaTime * speed);
			setDistance((prevDistance) => {
				// No cap - let distance grow indefinitely
				// The graph uses a sliding window so it stays readable
				return prevDistance + deltaTime * speed * c * 1e-3; // Distance in km
			});

			animationFrameId.current = requestAnimationFrame(updateSimulation);
		};

		animationFrameId.current = requestAnimationFrame(updateSimulation);

		return () => {
			if (animationFrameId.current) {
				cancelAnimationFrame(animationFrameId.current);
			}
		};
	}, [speed]); // Re-run effect if speed changes

	// Effect to recalculate probabilities when relevant parameters change
	useEffect(() => {
		const initialFlavorIndex =
			initialFlavor === "electron" ? 0 : initialFlavor === "muon" ? 1 : 2;

		// For antineutrinos, flip the sign of δCP (CP conjugation)
		const effectiveDeltaCP = isAntineutrino ? -deltaCP : deltaCP;

		// Use correct Δm²₃₁ based on mass ordering
		const dm31sq = massOrdering === "normal" ? dm31sq_NO : dm31sq_IO;

		const oscillationParams: OscillationParameters = {
			theta12_deg: theta12_deg,
			theta13_deg: theta13_deg,
			theta23_deg: theta23_deg,
			deltaCP_deg: effectiveDeltaCP,
			dm21sq_eV2: dm21sq_eV2,
			dm31sq_eV2: dm31sq,
			L: distance,
			energy: energy,
			matterEffect: matter,
			rho: density,
			Ye: Ye,
			initialFlavorIndex,
			N_Newton: 0,
			maxL: LmaxSim,
			isAntineutrino: isAntineutrino,
		};

		// Only calculate if distance is valid
		if (distance >= 0) {
			const probabilities = getProbabilitiesForInitialFlavor(oscillationParams);

			// Update probability history (add new point)
			setProbabilityHistory((prevHistory) => {
				const newHistory = [
					...prevHistory,
					{
						distance: distance,
						Pe: probabilities[0],
						Pmu: probabilities[1],
						Ptau: probabilities[2],
					},
				];
				// Keep history length reasonable - sliding window for infinite scroll
				const probHistoryLen = 800;
				if (newHistory.length > probHistoryLen) {
					return newHistory.slice(newHistory.length - probHistoryLen);
				}
				return newHistory;
			});
		}
	}, [
		initialFlavor,
		energy,
		matter,
		density,
		distance,
		deltaCP,
		isAntineutrino,
		massOrdering,
	]);

	const state: SimulationState = {
		initialFlavor,
		energy,
		speed,
		matter,
		density,
		deltaCP,
		isAntineutrino,
		massOrdering,
		zoom,
		time,
		distance,
		probabilityHistory,
	};

	const contextValue: SimulationContextType = {
		state,
		setInitialFlavor,
		setEnergy,
		setSpeed,
		setMatter,
		setDensity,
		setDeltaCP,
		setIsAntineutrino,
		setMassOrdering,
		setZoom,
		resetSimulation,
		applyPreset,
	};

	return (
		<SimulationContext.Provider value={contextValue}>
			{children}
		</SimulationContext.Provider>
	);
};

export const useSimulation = () => {
	const context = useContext(SimulationContext);
	if (context === undefined) {
		throw new Error("useSimulation must be used within a SimulationProvider");
	}
	return context;
};
