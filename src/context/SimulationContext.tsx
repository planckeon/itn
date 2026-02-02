import type React from "react";
import {
	type ReactNode,
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { getProbabilitiesForInitialFlavor } from "../physics/NuFastPort";
import type { OscillationParameters } from "../physics/types";

// Neutrino physics constants (should ideally come from NuFastPort or a constants file)
const theta12_deg = 33.44;
const theta13_deg = 8.57;
const theta23_deg = 49.2;
const deltaCP_deg = 0; // Assuming CP violation phase is 0 for simplicity
const dm21sq_eV2 = 7.42e-5; // eV^2
const dm31sq_eV2 = 2.517e-3; // eV^2
const Ye = 0.5; // Electron fraction in typical matter (e.g., Earth's crust)

// Simulation constants
const LmaxSim = 3000; // km
const c = 299792.458; // km/s

type Flavor = "electron" | "muon" | "tau";

interface SimulationState {
	initialFlavor: Flavor;
	energy: number;
	speed: number;
	matter: boolean;
	density: number;
	time: number;
	probabilityHistory: {
		distance: number;
		Pe: number;
		Pmu: number;
		Ptau: number;
	}[]; // Changed to distance
	distance: number; // Added distance
}

interface SimulationContextType {
	state: SimulationState;
	setInitialFlavor: (flavor: Flavor) => void;
	setEnergy: (energy: number) => void;
	setSpeed: (speed: number) => void;
	setMatter: (matter: boolean) => void;
	setDensity: (density: number) => void;
	resetSimulation: () => void; // Added reset
}

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
	const [time, setTime] = useState<number>(0); // seconds
	const [distance, setDistance] = useState<number>(0); // km
	const [probabilityHistory, setProbabilityHistory] = useState<
		{ distance: number; Pe: number; Pmu: number; Ptau: number }[]
	>([]);

	const animationFrameId = useRef<number | null>(null);
	const lastUpdateTime = useRef<number>(0);

	const resetSimulation = () => {
		setTime(0);
		setDistance(0);
		setProbabilityHistory([]);
	};

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
				const newDistance = prevDistance + deltaTime * speed * c * 1e-3; // Distance in km
				// Reset distance and history if it exceeds LmaxSim
				if (newDistance > LmaxSim) {
					resetSimulation();
					return 0; // Reset distance to 0
				}
				return newDistance;
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

		const oscillationParams: OscillationParameters = {
			theta12_deg: theta12_deg,
			theta13_deg: theta13_deg,
			theta23_deg: theta23_deg,
			deltaCP_deg: deltaCP_deg,
			dm21sq_eV2: dm21sq_eV2,
			dm31sq_eV2: dm31sq_eV2,
			L: distance, // Use current distance
			energy: energy,
			matterEffect: matter,
			rho: density,
			Ye: Ye,
			initialFlavorIndex,
			N_Newton: 0, // Using NuFit 5.2 NO (N_Newton = 0)
			maxL: LmaxSim, // Include maxL in params
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
				// Keep history length reasonable (e.g., last 500 points)
				const probHistoryLen = 500; // Define history length
				if (newHistory.length > probHistoryLen) {
					return newHistory.slice(newHistory.length - probHistoryLen);
				}
				return newHistory;
			});
		}
	}, [initialFlavor, energy, matter, density, distance]); // Re-run effect when these parameters change

	const state: SimulationState = {
		initialFlavor,
		energy,
		speed,
		matter,
		density,
		time,
		distance, // Include distance in state
		probabilityHistory,
	};

	const contextValue: SimulationContextType = {
		state,
		setInitialFlavor,
		setEnergy,
		setSpeed,
		setMatter,
		setDensity,
		resetSimulation, // Include reset function
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
