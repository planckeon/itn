/**
 * Math Content Validation Tests
 * 
 * Ensures all educational math content renders correctly with KaTeX.
 */

import { describe, it, expect } from "vitest";
import katex from "katex";

// Display math expressions (equation blocks)
const DISPLAY_MATH = [
  // Neutrino flavors
  "\\nu_e \\quad \\nu_\\mu \\quad \\nu_\\tau",
  
  // PMNS superposition
  "|\\nu_\\alpha\\rangle = \\sum_{i=1}^{3} U_{\\alpha i} \\, |\\nu_i\\rangle",
  
  // PMNS matrix
  "U = \\begin{pmatrix} U_{e1} & U_{e2} & U_{e3} \\\\ U_{\\mu 1} & U_{\\mu 2} & U_{\\mu 3} \\\\ U_{\\tau 1} & U_{\\tau 2} & U_{\\tau 3} \\end{pmatrix}",
  
  // Mixing angles
  "\\theta_{12} \\approx 33.4° \\quad \\theta_{13} \\approx 8.6° \\quad \\theta_{23} \\approx 49°",
  "\\delta_{CP} = \\text{unknown (key target!)}",
  
  // Mass splittings
  "\\Delta m^2_{21} = 7.42 \\times 10^{-5} \\text{ eV}^2",
  "|\\Delta m^2_{31}| \\approx 2.5 \\times 10^{-3} \\text{ eV}^2",
  
  // Oscillation formula
  "P(\\nu_\\alpha \\to \\nu_\\beta) = \\sin^2(2\\theta) \\, \\sin^2\\!\\left(\\frac{\\Delta m^2 L}{4E}\\right)",
  
  // Aligned block
  "\\begin{aligned} \\theta &= \\text{mixing angle} \\\\ \\Delta m^2 &= \\text{mass-squared difference (eV}^2\\text{)} \\\\ L &= \\text{baseline distance (km)} \\\\ E &= \\text{neutrino energy (GeV)} \\end{aligned}",
  
  // Oscillation length
  "L_{\\text{osc}} = \\frac{4\\pi E}{\\Delta m^2} \\approx 2.48 \\, \\frac{E \\text{ [GeV]}}{\\Delta m^2 \\text{ [eV}^2\\text{]}} \\text{ km}",
  
  // CP violation
  "P(\\nu_\\mu \\to \\nu_e) \\neq P(\\bar{\\nu}_\\mu \\to \\bar{\\nu}_e)",
  "\\delta_{CP} \\neq 0° \\text{ and } \\delta_{CP} \\neq 180°",
  "\\delta_{CP} \\sim -90° \\text{ (or } 270°\\text{)}",
  
  // MSW effect
  "V = \\sqrt{2} \\, G_F \\, N_e",
  "\\sin^2(2\\theta_m) = \\frac{\\sin^2(2\\theta)}{\\sin^2(2\\theta) + \\left(\\cos 2\\theta - \\frac{2EV}{\\Delta m^2}\\right)^2}",
  "E_{\\text{res}} = \\frac{\\Delta m^2 \\cos 2\\theta}{2\\sqrt{2} \\, G_F \\, N_e}",
  
  // Mass orderings
  "m_1 < m_2 \\ll m_3",
  "m_3 \\ll m_1 < m_2",
  "\\Delta m^2_{21} > 0 \\quad \\text{(solar splitting)}",
  "\\Delta m^2_{31} \\gtrless 0 \\quad \\text{(unknown sign!)}",
];

describe("Math Content Rendering", () => {
  describe("Display math (equation blocks)", () => {
    DISPLAY_MATH.forEach((expr, i) => {
      it(`should render display math #${i + 1}: ${expr.slice(0, 40)}...`, () => {
        expect(() => {
          katex.renderToString(expr, {
            displayMode: true,
            throwOnError: true,
            strict: false,
          });
        }).not.toThrow();
      });
    });
  });

  describe("Math output quality", () => {
    it("should produce well-formatted HTML", () => {
      const html = katex.renderToString("\\nu_e", { throwOnError: true });
      expect(html).toContain("katex");
      expect(html.length).toBeGreaterThan(50);
    });

    it("should render Greek letters", () => {
      const html = katex.renderToString("\\alpha\\beta\\gamma\\delta\\nu\\mu\\tau", { throwOnError: true });
      expect(html).toContain("katex");
    });

    it("should render fractions", () => {
      const html = katex.renderToString("\\frac{\\Delta m^2 L}{4E}", { throwOnError: true });
      expect(html).toContain("frac");
    });

    it("should render matrices", () => {
      const html = katex.renderToString("\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}", { throwOnError: true });
      expect(html).toContain("pmatrix");
    });

    it("should render aligned equations", () => {
      const html = katex.renderToString("\\begin{aligned} x &= 1 \\\\ y &= 2 \\end{aligned}", { throwOnError: true });
      expect(html).toContain("aligned");
    });

    it("should render subscripts and superscripts", () => {
      const html = katex.renderToString("\\nu_e^2 + \\Delta m^2_{31}", { throwOnError: true });
      expect(html).toContain("msupsub");
    });
  });
});
