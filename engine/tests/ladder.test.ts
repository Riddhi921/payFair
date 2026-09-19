import { describe, expect, it } from "vitest";
import { buildLadder } from "../src/ladder.js";

/**
 * Scenario: Ironclad Electrical Subcontracting negotiating with Summit
 * General Contractors (both synthetic, see /engine/seed/suppliers.ts).
 *   invoiceAmount = 70000 (Summit's monthlyRevenue)
 *   openingAskDays = 30, buyerAskDays = 100, walkAwayDays = 39
 *   supplierCostOfCapital = 0.15, buyerReturnOnCashAssumption = 0.04
 *
 * Every expected number below was hand-derived (long division, shown in
 * comments) independently of the implementation -- see the conversation's
 * working notes. Rungs land at: opening ask 30, concession-1 53 (=30 +
 * (100-30)/3, rounded), midpoint 65 (=(30+100)/2), walk-away 39.
 */
describe("buildLadder: Ironclad Electrical / Summit General Contractors", () => {
  const input = {
    invoiceAmount: 70000,
    buyerAskDays: 100,
    openingAskDays: 30,
    walkAwayDays: 39,
    supplierCostOfCapital: 0.15,
    buyerReturnOnCashAssumption: 0.04,
  };
  const rungs = buildLadder(input);

  it("produces exactly four rungs at the expected terms", () => {
    expect(rungs.map((r) => r.termDays)).toEqual([30, 53, 65, 39]);
    expect(rungs.map((r) => r.label)).toEqual(["Opening ask", "Concession 1", "Midpoint", "Walk-away"]);
  });

  it("Opening ask (30d, 70 days early vs. the 100d ask): within walk-away, feasible discount band", () => {
    const rung = rungs[0];
    expect(rung.withinWalkAway).toBe(true);
    expect(rung.cashGapTrade).toBeNull();
    // carryingCost(70000, 0.15, 30) = 10500 x 30/365 = 315000/365 = 863.013699
    expect(rung.carryingCost).toBeCloseTo(863.01, 1);

    const trade = rung.earlyPayDiscount!;
    expect(trade.daysEarlyVsBuyerAsk).toBe(70);
    // ceiling: x = 0.15x70/365 = 10.5/365; d = 10.5/375.5 = 21/751 = 0.0279627
    expect(trade.supplierCeilingPct).toBeCloseTo(0.027963, 4);
    // floor: x = 0.04x70/365 = 2.8/365; d = 2.8/367.8 = 14/1839 = 0.0076128
    expect(trade.buyerFloorPct).toBeCloseTo(0.007613, 4);
    expect(trade.feasible).toBe(true);
    // suggested = midpoint of [0.0076128, 0.0279627] = 0.0177878
    expect(trade.suggestedDiscountPct).toBeCloseTo(0.017788, 3);
  });

  it("Concession 1 (53d, 47 days early): OUTSIDE walk-away, both trades attached", () => {
    const rung = rungs[1];
    expect(rung.withinWalkAway).toBe(false);

    const trade = rung.earlyPayDiscount!;
    expect(trade.daysEarlyVsBuyerAsk).toBe(47);
    // ceiling: 7.05/372.05 = 141/7441 = 0.018949
    expect(trade.supplierCeilingPct).toBeCloseTo(0.018949, 3);
    // floor: 1.88/366.88 = 47/9172 = 0.005124
    expect(trade.buyerFloorPct).toBeCloseTo(0.005124, 3);
    expect(trade.feasible).toBe(true);

    const gap = rung.cashGapTrade!;
    // shortfall = carryingCost(70000,0.15,53) - carryingCost(70000,0.15,39)
    //           = 556500/365 - 409500/365 = 1524.657534 - 1121.917808 = 402.739726
    expect(gap.shortfallDollars).toBeCloseTo(402.74, 1);
    expect(gap.pricePremiumPct).toBeCloseTo(0.005753, 4);
  });

  it("Midpoint (65d, 35 days early): OUTSIDE walk-away, largest cash-gap trade of the ladder", () => {
    const rung = rungs[2];
    expect(rung.withinWalkAway).toBe(false);

    const trade = rung.earlyPayDiscount!;
    expect(trade.daysEarlyVsBuyerAsk).toBe(35);
    // ceiling: 5.25/370.25 = 21/1481 = 0.014180
    expect(trade.supplierCeilingPct).toBeCloseTo(0.01418, 3);
    // floor: 1.4/366.4 = 7/1832 = 0.0038209
    expect(trade.buyerFloorPct).toBeCloseTo(0.003821, 3);

    const gap = rung.cashGapTrade!;
    // shortfall = carryingCost(70000,0.15,65) - carryingCost(70000,0.15,39)
    //           = 682500/365 - 409500/365 = 1869.863014 - 1121.917808 = 747.945205
    expect(gap.shortfallDollars).toBeCloseTo(747.95, 1);
    expect(gap.pricePremiumPct).toBeCloseTo(0.010685, 4);

    // The gap grows monotonically from Concession 1 -> Midpoint since the term is longer.
    expect(gap.shortfallDollars).toBeGreaterThan(rungs[1].cashGapTrade!.shortfallDollars);
  });

  it("Walk-away (39d, 61 days early): back within limit, no cash-gap trade needed", () => {
    const rung = rungs[3];
    expect(rung.withinWalkAway).toBe(true);
    expect(rung.cashGapTrade).toBeNull();

    const trade = rung.earlyPayDiscount!;
    expect(trade.daysEarlyVsBuyerAsk).toBe(61);
    // ceiling: 9.15/374.15 = 183/7483 = 0.024455
    expect(trade.supplierCeilingPct).toBeCloseTo(0.024455, 3);
    // floor: 2.44/367.44 = 61/9186 = 0.0066405
    expect(trade.buyerFloorPct).toBeCloseTo(0.006641, 3);
  });
});

describe("buildLadder: no early-pay discount once a rung reaches the buyer's own ask", () => {
  it("returns null earlyPayDiscount when termDays === buyerAskDays", () => {
    const rungs = buildLadder({
      invoiceAmount: 40000,
      buyerAskDays: 30,
      openingAskDays: 30,
      walkAwayDays: 60,
      supplierCostOfCapital: 0.1,
      buyerReturnOnCashAssumption: 0.04,
    });
    // openingAskDays === buyerAskDays here, so daysEarly = 0 -> no discount trade.
    expect(rungs[0].earlyPayDiscount).toBeNull();
  });
});

describe("buildLadder: infeasible band when the buyer's return on cash exceeds the supplier's cost of capital", () => {
  it("marks the early-pay discount infeasible (buyer floor above supplier ceiling)", () => {
    const rungs = buildLadder({
      invoiceAmount: 20000,
      buyerAskDays: 90,
      openingAskDays: 30,
      walkAwayDays: 90,
      supplierCostOfCapital: 0.05, // cheap capital for the supplier
      buyerReturnOnCashAssumption: 0.25, // buyer demands a very high return to move early
    });
    const trade = rungs[0].earlyPayDiscount!;
    expect(trade.feasible).toBe(false);
    expect(trade.suggestedDiscountPct).toBeNull();
    expect(trade.buyerFloorPct).toBeGreaterThan(trade.supplierCeilingPct);
  });
});
