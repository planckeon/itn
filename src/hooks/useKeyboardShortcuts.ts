import { useEffect, useCallback } from "react";
import { useSimulation, EXPERIMENT_PRESETS } from "../context/SimulationContext";

/**
 * Keyboard shortcuts for the simulation
 * 
 * Space - Toggle play/pause (set speed to 0 or 1)
 * A - Toggle antineutrino mode
 * M - Toggle matter effect
 * N - Toggle mass ordering (Normal/Inverted)
 * R - Reset simulation
 * S - Copy share URL to clipboard
 * 1-4 - Apply experiment presets (T2K, NOvA, DUNE, KamLAND)
 * Arrow Up/Down - Adjust energy
 * Arrow Left/Right - Adjust δCP
 */
export function useKeyboardShortcuts() {
	const {
		state,
		setSpeed,
		setEnergy,
		setDeltaCP,
		setMatter,
		setIsAntineutrino,
		setMassOrdering,
		resetSimulation,
		applyPreset,
	} = useSimulation();

	const handleKeyDown = useCallback((e: KeyboardEvent) => {
		// Don't trigger shortcuts when typing in inputs
		if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
			return;
		}

		switch (e.key.toLowerCase()) {
			case " ": // Space - play/pause
				e.preventDefault();
				setSpeed(state.speed === 0 ? 1 : 0);
				break;

			case "a": // A - antineutrino toggle
				setIsAntineutrino(!state.isAntineutrino);
				break;

			case "m": // M - matter effect toggle
				setMatter(!state.matter);
				break;

			case "n": // N - mass ordering toggle
				setMassOrdering(state.massOrdering === "normal" ? "inverted" : "normal");
				break;

			case "r": // R - reset
				resetSimulation();
				break;

			case "1": // Presets 1-4
			case "2":
			case "3":
			case "4":
				const presetIndex = parseInt(e.key) - 1;
				if (EXPERIMENT_PRESETS[presetIndex]) {
					applyPreset(EXPERIMENT_PRESETS[presetIndex]);
				}
				break;

			case "arrowup": // Increase energy
				e.preventDefault();
				setEnergy(Math.min(10, state.energy + 0.5));
				break;

			case "arrowdown": // Decrease energy
				e.preventDefault();
				setEnergy(Math.max(0.1, state.energy - 0.5));
				break;

			case "arrowleft": // Decrease δCP
				e.preventDefault();
				setDeltaCP((state.deltaCP - 15 + 360) % 360);
				break;

			case "arrowright": // Increase δCP
				e.preventDefault();
				setDeltaCP((state.deltaCP + 15) % 360);
				break;
		}
	}, [state, setSpeed, setEnergy, setDeltaCP, setMatter, setIsAntineutrino, setMassOrdering, resetSimulation, applyPreset]);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);
}

export default useKeyboardShortcuts;
