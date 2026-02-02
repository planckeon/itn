import { describe, expect, it } from "vitest";
import {
  EARTH_RADIUS_KM,
  getPREMDensity,
  getMaxDepth,
  getMinRadius,
  getAverageDensity,
  getCrossedLayers,
  getAverageYe,
  describeBaseline,
} from "../../src/physics/prem";

describe("PREM Earth model", () => {
  describe("getPREMDensity", () => {
    it("returns ~13 g/cm³ at Earth center", () => {
      const rho = getPREMDensity(0);
      expect(rho).toBeCloseTo(13.0885, 2);
    });

    it("returns ~2.6-2.9 g/cm³ at surface", () => {
      const rho = getPREMDensity(6360);
      expect(rho).toBeGreaterThan(2.5);
      expect(rho).toBeLessThan(3.5);
    });

    it("returns ~11-12 g/cm³ in outer core", () => {
      const rho = getPREMDensity(2500);
      expect(rho).toBeGreaterThan(10);
      expect(rho).toBeLessThan(13);
    });

    it("returns ~5 g/cm³ in lower mantle", () => {
      const rho = getPREMDensity(4500);
      expect(rho).toBeGreaterThan(4);
      expect(rho).toBeLessThan(6);
    });

    it("returns crustal density for surface (continental crust, not ocean)", () => {
      const rho = getPREMDensity(6370);
      expect(rho).toBeCloseTo(2.8, 1);
    });
  });

  describe("getMaxDepth", () => {
    it("returns 0 for zero baseline", () => {
      expect(getMaxDepth(0)).toBe(0);
    });

    it("returns correct depth for DUNE baseline (1300 km)", () => {
      // L = 1300 km, R = 6371 km
      // r_min = sqrt(6371² - 650²) ≈ 6337.8 km
      // depth = 6371 - 6337.8 ≈ 33.2 km
      const depth = getMaxDepth(1300);
      expect(depth).toBeGreaterThan(30);
      expect(depth).toBeLessThan(40);
    });

    it("returns ~6371 km for diameter path", () => {
      const depth = getMaxDepth(2 * EARTH_RADIUS_KM);
      expect(depth).toBeCloseTo(EARTH_RADIUS_KM, 0);
    });
  });

  describe("getMinRadius", () => {
    it("returns Earth radius for zero baseline", () => {
      expect(getMinRadius(0)).toBe(EARTH_RADIUS_KM);
    });

    it("returns 0 for diameter path", () => {
      expect(getMinRadius(2 * EARTH_RADIUS_KM)).toBe(0);
    });
  });

  describe("getAverageDensity", () => {
    it("returns ~2.6 for zero baseline", () => {
      expect(getAverageDensity(0)).toBeCloseTo(2.6, 1);
    });

    it("returns ~2.8 for short baseline (T2K, 295 km)", () => {
      const rho = getAverageDensity(295);
      expect(rho).toBeGreaterThan(2.5);
      expect(rho).toBeLessThan(3.5);
    });

    it("returns higher density for DUNE baseline (1300 km)", () => {
      const rho = getAverageDensity(1300);
      expect(rho).toBeGreaterThan(2.8);
      expect(rho).toBeLessThan(4.0);
    });

    it("returns very high density for core-crossing path", () => {
      // A path that crosses the core (baseline > ~10673 km)
      const rho = getAverageDensity(11000);
      expect(rho).toBeGreaterThan(6);
    });
  });

  describe("getCrossedLayers", () => {
    it("returns only crust for short baseline", () => {
      const layers = getCrossedLayers(100);
      expect(layers).toContain("crust");
      expect(layers).not.toContain("inner_core");
    });

    it("returns all layers for diameter path", () => {
      const layers = getCrossedLayers(12742);
      expect(layers).toContain("crust");
      expect(layers).toContain("inner_core");
      expect(layers).toContain("outer_core");
    });
  });

  describe("getAverageYe", () => {
    it("returns ~0.494 for mantle-only paths", () => {
      const ye = getAverageYe(1300);
      expect(ye).toBeCloseTo(0.494, 2);
    });

    it("returns lower Y_e for core-crossing paths", () => {
      const ye = getAverageYe(11000);
      expect(ye).toBeLessThan(0.494);
    });
  });

  describe("describeBaseline", () => {
    it("describes surface paths correctly", () => {
      const desc = describeBaseline(100);
      expect(desc).toContain("Surface");
    });

    it("describes DUNE baseline correctly", () => {
      const desc = describeBaseline(1300);
      expect(desc).toContain("Crust");
    });

    it("describes core-crossing paths correctly", () => {
      // Need baseline > 10673 km to reach core
      const desc = describeBaseline(11000);
      expect(desc).toContain("Core");
    });
  });
});
