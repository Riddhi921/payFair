import { describe, expect, it } from "vitest";
import { suppliers } from "../seed/suppliers.js";
import type { SupplierArchetype } from "../src/types.js";

const EXPECTED_ARCHETYPES: SupplierArchetype[] = [
  "parts_manufacturer",
  "professional_services",
  "distributor",
  "subcontractor",
];

// Loose sanity bounds per archetype, anchored to the contracted-term column
// of /research/payment-terms-research.html section 01. These are wide on
// purpose -- a buyer's ASK can push past the "typical" range; the point is
// to catch a data-entry mistake (e.g. a distributor buyer asking Net 400),
// not to over-constrain the negotiation scenarios.
const PLAUSIBLE_TERM_RANGE: Record<SupplierArchetype, [number, number]> = {
  parts_manufacturer: [30, 120],
  professional_services: [15, 75],
  distributor: [15, 75],
  subcontractor: [30, 150],
};

describe("seed data: four supplier archetypes, all synthetic", () => {
  it("has exactly the four required archetypes, one supplier each", () => {
    expect(suppliers).toHaveLength(4);
    expect(suppliers.map((s) => s.archetype).sort()).toEqual([...EXPECTED_ARCHETYPES].sort());
  });

  it("every supplier is explicitly marked synthetic", () => {
    for (const s of suppliers) {
      expect(s.synthetic).toBe(true);
      expect(s.name).toMatch(/\(synthetic\)/i);
    }
  });

  it("every supplier has 2-3 buyers with different payment behavior", () => {
    for (const s of suppliers) {
      expect(s.buyers.length).toBeGreaterThanOrEqual(2);
      expect(s.buyers.length).toBeLessThanOrEqual(3);
      const latenessValues = s.buyers.map((b) => b.typicalDaysLatePastTerm);
      // Not every buyer in a supplier's book behaves identically.
      expect(new Set(latenessValues).size).toBeGreaterThan(1);
    }
  });

  it("every buyer cites the research brief and its term falls in a plausible range for the archetype", () => {
    for (const s of suppliers) {
      const [min, max] = PLAUSIBLE_TERM_RANGE[s.archetype];
      for (const b of s.buyers) {
        expect(b.sourceNote).toContain("/research/payment-terms-research.html");
        expect(b.requestedTermDays).toBeGreaterThanOrEqual(min);
        expect(b.requestedTermDays).toBeLessThanOrEqual(max);
      }
    }
  });

  it("all core financial fields are positive and rates are sane fractions", () => {
    for (const s of suppliers) {
      expect(s.monthlyPayrollAmount).toBeGreaterThan(0);
      expect(s.monthlyRent).toBeGreaterThan(0);
      expect(s.monthlyVendorBills).toBeGreaterThan(0);
      expect(s.cashBuffer).toBeGreaterThan(0);
      expect(s.costOfCapital).toBeGreaterThan(0);
      expect(s.costOfCapital).toBeLessThan(1);
      expect(s.grossMarginPct).toBeGreaterThan(0);
      expect(s.grossMarginPct).toBeLessThan(1);
      expect(s.openingAskDays).toBeGreaterThan(0);
      for (const b of s.buyers) {
        expect(b.monthlyRevenue).toBeGreaterThan(0);
        expect(b.buyerReturnOnCashAssumption).toBeGreaterThan(0);
        expect(b.buyerReturnOnCashAssumption).toBeLessThan(1);
      }
    }
  });

  it("only the subcontractor archetype carries retainage (construction-specific)", () => {
    for (const s of suppliers) {
      for (const b of s.buyers) {
        if (s.archetype === "subcontractor") {
          expect(b.retainagePct).toBeDefined();
        } else {
          expect(b.retainagePct).toBeUndefined();
        }
      }
    }
  });
});
