/**
 * Math Content Validation Tests
 * 
 * Ensures all educational math content renders correctly with KaTeX.
 * This is the automated test suite that runs with `npm test`.
 */

import { describe, it, expect } from "vitest";
import katex from "katex";

// All math expressions from LearnMorePanel.tsx
// These are the actual LaTeX strings as they appear at runtime (after template literal escaping)
const MATH_EXPRESSIONS = {
  inline: [
    "10^{14}",
    "\\nu_e",
    "\\nu_\\mu",
    "\\nu_\\tau",
    "\\nu_e, \\nu_\\mu, \\nu_\\tau",
    "\\nu_1, \\nu_2, \\nu_3",
    "E",
    "L",
    "\\theta_{12} \\approx 33°",
    "\\theta_{13} \\approx 8.5°",
    "\\theta_{23} \\approx 49°",
    "\\delta_{CP}",
    "\\Delta m^2_{21}",
    "\\Delta m^2_{31}",
    "|U_{\\alpha i}|^2",
    "i",
    "\\alpha",
    "\\nu_\\alpha \\to \\nu_\\beta",
    "\\sin^2(2\\theta)",
    "\\Delta m^2",
    "\\text{eV}^2",
    "\\delta_{CP} \\neq 0°",
    "180°",
    "V = \\sqrt{2} G_F N_e",
    "m_1 < m_2 \\ll m_3",
    "m_3 \\ll m_1 < m_2",
    "\\Delta m^2_{21} = 7.42 \\times 10^{-5}",
    "|\\Delta m^2_{31}| \\approx 2.5 \\times 10^{-3}",
    "\\bar{\\nu}_e",
  ],
  display: [
    "|\\nu_\\alpha\\rangle = \\sum_i U_{\\alpha i} |\\nu_i\\rangle",
    "P(\\nu_\\alpha \\to \\nu_\\beta) = \\sin^2(2\\theta) \\sin^2\\left(\\frac{\\Delta m^2 L}{4E}\\right)",
    "L_{\\text{osc}} = \\frac{4\\pi E}{\\Delta m^2} \\approx 2.48 \\times \\frac{E[\\text{GeV}]}{\\Delta m^2[\\text{eV}^2]} \\text{ km}",
    "P(\\nu_\\mu \\to \\nu_e) \\neq P(\\bar{\\nu}_\\mu \\to \\bar{\\nu}_e)",
    "\\sin^2(2\\theta_m) = \\frac{\\sin^2(2\\theta)}{\\sin^2(2\\theta) + (\\cos(2\\theta) - V/\\Delta)^2}",
    "E_{\\text{res}} = \\frac{\\Delta m^2 \\cos(2\\theta)}{2\\sqrt{2} G_F N_e}",
  ],
};

describe("Math Content Rendering", () => {
  describe("Inline math expressions", () => {
    MATH_EXPRESSIONS.inline.forEach((expr, i) => {
      it(`should render inline math #${i + 1}: ${expr.slice(0, 30)}...`, () => {
        expect(() => {
          katex.renderToString(expr, {
            displayMode: false,
            throwOnError: true,
            strict: false,
          });
        }).not.toThrow();
      });
    });
  });

  describe("Display math expressions", () => {
    MATH_EXPRESSIONS.display.forEach((expr, i) => {
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
    it("should produce non-empty HTML output", () => {
      const html = katex.renderToString("\\nu_e", { throwOnError: true });
      expect(html).toContain("katex");
      expect(html.length).toBeGreaterThan(50);
    });

    it("should handle Greek letters correctly", () => {
      const html = katex.renderToString("\\alpha\\beta\\gamma\\delta", { throwOnError: true });
      expect(html).toContain("α");
      expect(html).toContain("β");
      expect(html).toContain("γ");
      expect(html).toContain("δ");
    });

    it("should handle subscripts and superscripts", () => {
      const html = katex.renderToString("x_1^2 + y_{12}^{34}", { throwOnError: true });
      expect(html).toContain("msupsub");
    });

    it("should handle fractions", () => {
      const html = katex.renderToString("\\frac{a}{b}", { throwOnError: true });
      expect(html).toContain("frac");
    });
  });
});
