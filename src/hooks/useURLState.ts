import { useCallback, useEffect } from "react";
import {
	EXPERIMENT_PRESETS,
	useSimulation,
} from "../context/SimulationContext";

/**
 * Syncs simulation state with URL hash parameters
 * Allows sharing specific configurations via URL
 *
 * Format: #e=2&f=electron&d=180&a=1&m=1&o=normal
 * - e: energy (GeV)
 * - f: flavor (electron|muon|tau)
 * - d: deltaCP (0-360)
 * - a: antineutrino (0|1)
 * - m: matter (0|1)
 * - o: ordering (normal|inverted)
 * - p: preset name
 */
export function useURLState() {
	const {
		state,
		setEnergy,
		setInitialFlavor,
		setDeltaCP,
		setIsAntineutrino,
		setMatter,
		setMassOrdering,
		applyPreset,
	} = useSimulation();

	// Load state from URL on mount
	useEffect(() => {
		const hash = window.location.hash.slice(1);
		if (!hash) return;

		const params = new URLSearchParams(hash);

		// Apply preset first if specified
		const presetName = params.get("p");
		if (presetName) {
			const preset = EXPERIMENT_PRESETS.find(
				(p) => p.name.toLowerCase() === presetName.toLowerCase(),
			);
			if (preset) applyPreset(preset);
		}

		// Then override with specific params
		const energy = params.get("e");
		if (energy) setEnergy(Number.parseFloat(energy));

		const flavor = params.get("f");
		if (flavor && ["electron", "muon", "tau"].includes(flavor)) {
			setInitialFlavor(flavor as "electron" | "muon" | "tau");
		}

		const deltaCP = params.get("d");
		if (deltaCP) setDeltaCP(Number.parseFloat(deltaCP));

		const antineutrino = params.get("a");
		if (antineutrino) setIsAntineutrino(antineutrino === "1");

		const matter = params.get("m");
		if (matter) setMatter(matter === "1");

		const ordering = params.get("o");
		if (ordering && ["normal", "inverted"].includes(ordering)) {
			setMassOrdering(ordering as "normal" | "inverted");
		}
	}, []); // Only on mount

	// Generate shareable URL
	const getShareURL = useCallback(() => {
		const params = new URLSearchParams();

		params.set("e", state.energy.toFixed(2));
		params.set("f", state.initialFlavor);
		params.set("d", state.deltaCP.toString());

		if (state.isAntineutrino) params.set("a", "1");
		if (state.matter) params.set("m", "1");
		if (state.massOrdering === "inverted") params.set("o", "inverted");

		const url = `${window.location.origin}${window.location.pathname}#${params.toString()}`;
		return url;
	}, [state]);

	// Copy URL to clipboard
	const copyShareURL = useCallback(async () => {
		const url = getShareURL();
		try {
			await navigator.clipboard.writeText(url);
			return true;
		} catch {
			// Fallback for older browsers
			const input = document.createElement("input");
			input.value = url;
			document.body.appendChild(input);
			input.select();
			document.execCommand("copy");
			document.body.removeChild(input);
			return true;
		}
	}, [getShareURL]);

	return { getShareURL, copyShareURL };
}

export default useURLState;
