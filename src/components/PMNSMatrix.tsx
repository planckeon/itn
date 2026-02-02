import type React from "react";
import { useMemo } from "react";
import { useSimulation } from "../context/SimulationContext";
import InfoTooltip from "./InfoTooltip";

// NuFit 5.2 values
const THETA12_DEG = 33.44;
const THETA13_DEG = 8.57;
const THETA23_DEG = 49.2;

const INFO_TEXT = `The PMNS matrix (Pontecorvo–Maki–Nakagawa–Sakata) describes how neutrino flavor states (νe, νμ, ντ) relate to mass states (ν1, ν2, ν3).

|Uαi|² gives the probability of finding mass state i in flavor state α.

The matrix depends on three mixing angles (θ12, θ13, θ23) and the CP phase (δCP).`;

/**
 * Displays the PMNS matrix elements |U_αi|²
 */
const PMNSMatrix: React.FC = () => {
	const { state } = useSimulation();
	const { deltaCP, isAntineutrino } = state;

	// Calculate PMNS matrix elements
	const matrix = useMemo(() => {
		const t12 = (THETA12_DEG * Math.PI) / 180;
		const t13 = (THETA13_DEG * Math.PI) / 180;
		const t23 = (THETA23_DEG * Math.PI) / 180;
		// Note: δCP affects complex phases but |U|² values are mostly independent
		// The full complex calculation would use e^(iδ) terms

		const c12 = Math.cos(t12), s12 = Math.sin(t12);
		const c13 = Math.cos(t13), s13 = Math.sin(t13);
		const c23 = Math.cos(t23), s23 = Math.sin(t23);

		// PMNS matrix elements (complex, but we show |U|²)
		// U = R23 * U13(δ) * R12
		// For |U|², the CP phase only matters for interference terms

		// Row 1: electron
		const Ue1 = c12 * c13;
		const Ue2 = s12 * c13;
		const Ue3 = s13; // Actually s13 * e^(-iδ), but |Ue3|² = s13²

		// Row 2: muon (simplified, ignoring complex phase for |U|²)
		const Umu1_sq = Math.pow(-s12 * c23 - c12 * s23 * s13, 2);
		const Umu2_sq = Math.pow(c12 * c23 - s12 * s23 * s13, 2);
		const Umu3_sq = Math.pow(s23 * c13, 2);

		// Row 3: tau
		const Utau1_sq = Math.pow(s12 * s23 - c12 * c23 * s13, 2);
		const Utau2_sq = Math.pow(-c12 * s23 - s12 * c23 * s13, 2);
		const Utau3_sq = Math.pow(c23 * c13, 2);

		return {
			electron: [Ue1 * Ue1, Ue2 * Ue2, Ue3 * Ue3],
			muon: [Umu1_sq, Umu2_sq, Umu3_sq],
			tau: [Utau1_sq, Utau2_sq, Utau3_sq],
		};
	}, [deltaCP, isAntineutrino]);

	const formatProb = (p: number) => p.toFixed(2);

	return (
		<div
			className="absolute top-20 right-4 z-10"
			style={{
				background: "rgba(20, 20, 30, 0.85)",
				backdropFilter: "blur(8px)",
				borderRadius: "8px",
				padding: "10px",
				border: "1px solid rgba(255, 255, 255, 0.1)",
				fontSize: "10px",
				fontFamily: "monospace",
			}}
		>
			<div className="flex items-center justify-between mb-2">
				<span className="text-white/70 text-xs">|U|² Matrix</span>
				<InfoTooltip text={INFO_TEXT} />
			</div>
			
			{/* Matrix header */}
			<div className="grid grid-cols-4 gap-1 text-white/50 mb-1">
				<span></span>
				<span className="text-center">ν₁</span>
				<span className="text-center">ν₂</span>
				<span className="text-center">ν₃</span>
			</div>

			{/* Electron row */}
			<div className="grid grid-cols-4 gap-1 text-blue-400">
				<span>νₑ</span>
				<span className="text-center">{formatProb(matrix.electron[0])}</span>
				<span className="text-center">{formatProb(matrix.electron[1])}</span>
				<span className="text-center">{formatProb(matrix.electron[2])}</span>
			</div>

			{/* Muon row */}
			<div className="grid grid-cols-4 gap-1 text-orange-400">
				<span>νμ</span>
				<span className="text-center">{formatProb(matrix.muon[0])}</span>
				<span className="text-center">{formatProb(matrix.muon[1])}</span>
				<span className="text-center">{formatProb(matrix.muon[2])}</span>
			</div>

			{/* Tau row */}
			<div className="grid grid-cols-4 gap-1 text-fuchsia-400">
				<span>ντ</span>
				<span className="text-center">{formatProb(matrix.tau[0])}</span>
				<span className="text-center">{formatProb(matrix.tau[1])}</span>
				<span className="text-center">{formatProb(matrix.tau[2])}</span>
			</div>

			{/* Current δCP */}
			<div className="mt-2 pt-2 border-t border-white/10 text-white/50 text-center">
				δ<sub>CP</sub> = {deltaCP}° {isAntineutrino ? "(ν̄)" : "(ν)"}
			</div>
		</div>
	);
};

export default PMNSMatrix;
