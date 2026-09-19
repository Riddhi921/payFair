import { describe, expect, it } from "vitest";
import { buildActionPlan, riskVerdict } from "../src/advice.js";
import { buildLadder } from "../src/ladder.js";
import { breakEvenRisk } from "../src/formulas.js";

describe("riskVerdict thresholds", () => {
  it("classifies below 30% as manageable", () => {
    expect(riskVerdict(0.1).tier).toBe("good");
    expect(riskVerdict(0.29).tier).toBe("good");
  });
  it("classifies 30%-100% as high cost", () => {
    expect(riskVerdict(0.3).tier).toBe("warn");
    expect(riskVerdict(0.99).tier).toBe("warn");
  });
  it("classifies over 100% as breaching gross profit", () => {
    expect(riskVerdict(1.01).tier).toBe("bad");
  });
});

describe("buildActionPlan: Ironclad / Summit scenario (walk-away 39 vs. ask 100)", () => {
  const ladder = buildLadder({
    invoiceAmount: 70000,
    buyerAskDays: 100,
    openingAskDays: 30,
    walkAwayDays: 39,
    supplierCostOfCapital: 0.15,
    buyerReturnOnCashAssumption: 0.04,
  });
  const risk = breakEvenRisk({
    annualRevenueFromBuyer: 840000,
    grossMarginPct: 0.18,
    costOfCapital: 0.15,
    days: 100,
  });
  const plan = buildActionPlan({
    ladder,
    walkAwayDays: 39,
    walkAwayUnlimited: false,
    risk,
    buyerAskDays: 100,
    buyerName: "Summit General Contractors (synthetic)",
  });

  it("always leads with the opening-ask rung (index 0)", () => {
    expect(plan.leadRungIndex).toBe(0);
  });

  it("falls back to the walk-away rung, the last one still within limit", () => {
    // rungs: [30 (within), 53 (outside), 65 (outside), 39 (within)] -> last within-limit is index 3
    expect(plan.fallbackRungIndex).toBe(3);
    expect(ladder[plan.fallbackRungIndex].withinWalkAway).toBe(true);
  });

  it("reports the walk-away line as the hard limit", () => {
    expect(plan.hardLimitDays).toBe(39);
  });

  it("summary mentions the lead term, the fallback term, and the hard limit", () => {
    expect(plan.summary).toContain("Net 30");
    expect(plan.summary).toContain("Net 39");
    expect(plan.summary).toContain("39");
  });
});

describe("buildActionPlan: fully affordable scenario mentions no hard wall", () => {
  const ladder = buildLadder({
    invoiceAmount: 85000,
    buyerAskDays: 90,
    openingAskDays: 30,
    walkAwayDays: 169,
    supplierCostOfCapital: 0.13,
    buyerReturnOnCashAssumption: 0.04,
  });
  const risk = breakEvenRisk({
    annualRevenueFromBuyer: 1020000,
    grossMarginPct: 0.22,
    costOfCapital: 0.13,
    days: 90,
  });
  const plan = buildActionPlan({
    ladder,
    walkAwayDays: 169,
    walkAwayUnlimited: false,
    risk,
    buyerAskDays: 90,
    buyerName: "Highline Auto Systems (synthetic)",
  });

  it("falls back all the way to the walk-away rung since everything is affordable", () => {
    expect(ladder.every((r) => r.withinWalkAway)).toBe(true);
    expect(plan.fallbackRungIndex).toBe(3);
  });

  it("summary says the ask is already affordable outright", () => {
    expect(plan.summary).toMatch(/already affordable outright/);
  });
});
