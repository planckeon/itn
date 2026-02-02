import type React from "react";
import { useMemo } from "react";
import katex from "katex";

interface MathProps {
	children: string;
	display?: boolean; // true for display mode (centered block), false for inline
}

/**
 * Renders LaTeX math using KaTeX
 * 
 * Usage:
 *   <Math>E = mc^2</Math>              // inline
 *   <Math display>E = mc^2</Math>      // display (centered block)
 */
const Math: React.FC<MathProps> = ({ children, display = false }) => {
	const html = useMemo(() => {
		try {
			return katex.renderToString(children, {
				displayMode: display,
				throwOnError: false,
				strict: false,
				trust: true,
				macros: {
					// Custom macros for neutrino physics
					"\\nue": "\\nu_e",
					"\\numu": "\\nu_\\mu",
					"\\nutau": "\\nu_\\tau",
					"\\nuebar": "\\bar{\\nu}_e",
					"\\numubar": "\\bar{\\nu}_\\mu",
					"\\nutaubar": "\\bar{\\nu}_\\tau",
					"\\dcp": "\\delta_{CP}",
					"\\dmsq": "\\Delta m^2",
				},
			});
		} catch {
			return children;
		}
	}, [children, display]);

	if (display) {
		return (
			<div
				className="my-2 overflow-x-auto"
				dangerouslySetInnerHTML={{ __html: html }}
			/>
		);
	}

	return (
		<span
			className="inline"
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
};

export default Math;
