import type React from "react";
import { useMemo, Fragment } from "react";
import katex from "katex";

// KaTeX macros for neutrino physics
const KATEX_MACROS: Record<string, string> = {
	"\\nue": "\\nu_e",
	"\\numu": "\\nu_\\mu", 
	"\\nutau": "\\nu_\\tau",
	"\\nuebar": "\\bar{\\nu}_e",
	"\\numubar": "\\bar{\\nu}_\\mu",
	"\\nutaubar": "\\bar{\\nu}_\\tau",
	"\\dcp": "\\delta_{\\text{CP}}",
	"\\dmsq": "\\Delta m^2",
};

interface TextPart {
	type: "text" | "math" | "display-math";
	content: string;
}

/**
 * Parse text with $...$ (inline) and $$...$$ (display) math delimiters
 */
function parseMath(text: string): TextPart[] {
	const parts: TextPart[] = [];
	let i = 0;
	
	while (i < text.length) {
		// Check for display math $$...$$
		if (text[i] === "$" && text[i + 1] === "$") {
			const start = i + 2;
			const end = text.indexOf("$$", start);
			if (end !== -1) {
				parts.push({ type: "display-math", content: text.slice(start, end) });
				i = end + 2;
				continue;
			}
		}
		
		// Check for inline math $...$
		if (text[i] === "$") {
			const start = i + 1;
			// Find closing $ (not $$)
			let end = start;
			while (end < text.length) {
				if (text[end] === "$" && text[end + 1] !== "$") {
					break;
				}
				end++;
			}
			if (end < text.length && end > start) {
				parts.push({ type: "math", content: text.slice(start, end) });
				i = end + 1;
				continue;
			}
		}
		
		// Regular text - collect until next $
		const start = i;
		while (i < text.length && text[i] !== "$") {
			i++;
		}
		if (i > start) {
			parts.push({ type: "text", content: text.slice(start, i) });
		}
	}
	
	return parts;
}

/**
 * Renders text with inline math (using $...$ delimiters)
 * and display math (using $$...$$ delimiters)
 * 
 * Also supports markdown-style formatting:
 * - **bold**
 */
interface RichTextProps {
	children: string;
	className?: string;
}

const RichText: React.FC<RichTextProps> = ({ children, className = "" }) => {
	const parts = useMemo(() => parseMath(children), [children]);

	const renderMath = (latex: string, display: boolean, key: number) => {
		try {
			const html = katex.renderToString(latex, {
				displayMode: display,
				throwOnError: false,
				strict: false,
				trust: true,
				macros: KATEX_MACROS,
			});
			return display ? (
				<div 
					key={key}
					className="my-2 text-center overflow-x-auto" 
					dangerouslySetInnerHTML={{ __html: html }} 
				/>
			) : (
				<span 
					key={key}
					dangerouslySetInnerHTML={{ __html: html }} 
				/>
			);
		} catch {
			return <span key={key} className="text-red-400">{latex}</span>;
		}
	};

	const renderText = (text: string, key: number) => {
		// Process **bold** and line breaks
		const lines = text.split("\n");
		return (
			<Fragment key={key}>
				{lines.map((line, i) => {
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
				})}
			</Fragment>
		);
	};

	return (
		<div className={className}>
			{parts.map((part, i) => {
				switch (part.type) {
					case "display-math":
						return renderMath(part.content, true, i);
					case "math":
						return renderMath(part.content, false, i);
					default:
						return renderText(part.content, i);
				}
			})}
		</div>
	);
};

export default RichText;
