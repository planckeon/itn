import type React from "react";
import { useMemo, Fragment } from "react";
import katex from "katex";

// KaTeX macros for neutrino physics
const KATEX_MACROS = {
	"\\nue": "\\nu_e",
	"\\numu": "\\nu_\\mu", 
	"\\nutau": "\\nu_\\tau",
	"\\nuebar": "\\bar{\\nu}_e",
	"\\numubar": "\\bar{\\nu}_\\mu",
	"\\nutaubar": "\\bar{\\nu}_\\tau",
	"\\dcp": "\\delta_{\\text{CP}}",
	"\\dmsq": "\\Delta m^2",
};

/**
 * Renders text with inline math (using $...$ delimiters)
 * and display math (using $$...$$ delimiters)
 * 
 * Also supports markdown-style formatting:
 * - **bold**
 * - • bullet points
 */
interface RichTextProps {
	children: string;
	className?: string;
}

const RichText: React.FC<RichTextProps> = ({ children, className = "" }) => {
	const rendered = useMemo(() => {
		const parts: (string | { type: "math" | "display-math"; content: string })[] = [];
		
		// First, extract display math ($$...$$)
		let text = children;
		const displayMathRegex = /\$\$([^$]+)\$\$/g;
		let lastIndex = 0;
		let match;
		
		const segments: (string | { type: "display-math"; content: string })[] = [];
		while ((match = displayMathRegex.exec(text)) !== null) {
			if (match.index > lastIndex) {
				segments.push(text.slice(lastIndex, match.index));
			}
			segments.push({ type: "display-math", content: match[1] });
			lastIndex = match.index + match[0].length;
		}
		if (lastIndex < text.length) {
			segments.push(text.slice(lastIndex));
		}

		// Now process each segment for inline math ($...$)
		for (const segment of segments) {
			if (typeof segment !== "string") {
				parts.push(segment);
				continue;
			}

			const inlineMathRegex = /\$([^$]+)\$/g;
			let segLastIndex = 0;
			while ((match = inlineMathRegex.exec(segment)) !== null) {
				if (match.index > segLastIndex) {
					parts.push(segment.slice(segLastIndex, match.index));
				}
				parts.push({ type: "math", content: match[1] });
				segLastIndex = match.index + match[0].length;
			}
			if (segLastIndex < segment.length) {
				parts.push(segment.slice(segLastIndex));
			}
		}

		return parts;
	}, [children]);

	const renderMath = (latex: string, display: boolean) => {
		try {
			const html = katex.renderToString(latex, {
				displayMode: display,
				throwOnError: false,
				strict: false,
				trust: true,
				macros: KATEX_MACROS,
			});
			return display ? (
				<div className="my-2 text-center overflow-x-auto" dangerouslySetInnerHTML={{ __html: html }} />
			) : (
				<span dangerouslySetInnerHTML={{ __html: html }} />
			);
		} catch {
			return <span className="text-red-400">{latex}</span>;
		}
	};

	const renderText = (text: string) => {
		// Process **bold** and line breaks
		const lines = text.split("\n");
		return lines.map((line, i) => {
			// Handle bold
			const boldParts = line.split(/\*\*([^*]+)\*\*/g);
			const lineContent = boldParts.map((part, j) => {
				if (j % 2 === 1) {
					return <strong key={j} className="text-white/90">{part}</strong>;
				}
				return part;
			});
			
			return (
				<Fragment key={i}>
					{lineContent}
					{i < lines.length - 1 && <br />}
				</Fragment>
			);
		});
	};

	return (
		<div className={className}>
			{rendered.map((part, i) => {
				if (typeof part === "string") {
					return <Fragment key={i}>{renderText(part)}</Fragment>;
				}
				if (part.type === "display-math") {
					return <Fragment key={i}>{renderMath(part.content, true)}</Fragment>;
				}
				return <Fragment key={i}>{renderMath(part.content, false)}</Fragment>;
			})}
		</div>
	);
};

export default RichText;
