import { describe, expect, it } from "vitest";
import {
  annualizedDiscountRate,
  bandBound,
  breakEvenRisk,
  buyerFloorDiscount,
  carryingCost,
  factoringCost,
  supplierCeilingDiscount,
} from "../src/formulas.js";

describe("carryingCost = amount x r x days/365", () => {
  it("clean numbers: full year at 10% equals the full rate", () => {
    // 100000 x 0.10 x 365/365 = 100000 x 0.10 = 10000
    expect(carryingCost(100000, 0.1, 365)).toBeCloseTo(10000, 6);
  });

  it("clean numbers: 36.5 days is exactly 1/10 of a year", () => {
    // 100000 x 0.10 x 36.5/365 = 100000 x 0.10 x 0.1 = 1000
    expect(carryingCost(100000, 0.1, 36.5)).toBeCloseTo(1000, 6);
  });

  it("matches the published $50K / 12% example (30 / 60 / 90 days)", () => {
    // Hand check: 50000 x 0.12 = 6000/year.
    // 30d: 6000 x 30/365 = 180000/365 = 493.150684931507
    // 60d: 6000 x 60/365 = 360000/365 = 986.301369863014
    // 90d: 6000 x 90/365 = 540000/365 = 1479.452054794520
    expect(carryingCost(50000, 0.12, 30)).toBeCloseTo(493.150685, 4);
    expect(carryingCost(50000, 0.12, 60)).toBeCloseTo(986.30137, 4);
    expect(carryingCost(50000, 0.12, 90)).toBeCloseTo(1479.452055, 4);
  });
});

describe("annualizedDiscountRate = d/(1-d) x 365/daysEarly", () => {
  it("clean numbers: at 365 days the days factor drops out", () => {
    // 0.2 / (1 - 0.2) = 0.25 exactly
    expect(annualizedDiscountRate(0.2, 365)).toBeCloseTo(0.25, 10);
  });

  it("corrected research example: 2% for 20 days early is ~37%, not 36%", () => {
    // 0.02/0.98 = 0.0204081632653061
    // x 365/20 = x 18.25 = 0.372448979591837
    expect(annualizedDiscountRate(0.02, 20)).toBeCloseTo(0.372449, 5);
  });

  it("corrected research example: the SAME 2% for 60 days early is ~12%, regardless of the underlying term", () => {
    // 0.0204081632653061 x 365/60 = x 6.08333333 = 0.124149659863946
    expect(annualizedDiscountRate(0.02, 60)).toBeCloseTo(0.12415, 4);
  });

  it("throws on non-positive daysEarly (can't annualize an instantaneous discount)", () => {
    expect(() => annualizedDiscountRate(0.02, 0)).toThrow();
  });
});

describe("bandBound (supplier ceiling / buyer floor): x = r x t/365; d = x/(1+x)", () => {
  it("clean numbers: at 365 days, d = r/(1+r)", () => {
    // r = 0.25, t = 365 -> x = 0.25 -> d = 0.25/1.25 = 0.2
    expect(bandBound(0.25, 365)).toBeCloseTo(0.2, 10);
  });

  it("is the exact algebraic inverse of annualizedDiscountRate for several (rate, days) pairs", () => {
    const cases: Array<[number, number]> = [
      [0.1, 30],
      [0.15, 61],
      [0.2, 10],
      [0.04, 90],
    ];
    for (const [rate, days] of cases) {
      const d = bandBound(rate, days);
      expect(annualizedDiscountRate(d, days)).toBeCloseTo(rate, 8);
    }
  });

  it("supplier ceiling at 13% cost of capital, 70 days early (hand-checked)", () => {
    // x = 0.13 x 70/365 = 9.1/365 = 0.0249315068493151
    // d = x/(1+x) = 9.1/374.1 = 91/3741 = 0.0243250...
    expect(supplierCeilingDiscount(0.13, 70)).toBeCloseTo(0.024325, 5);
  });

  it("buyer floor at 4% assumed return on cash, 70 days early (hand-checked)", () => {
    // x = 0.04 x 70/365 = 2.8/365 = 0.00767123287671233
    // d = x/(1+x) = 2.8/367.8 = 14/1839 = 0.0076128...
    expect(buyerFloorDiscount(0.04, 70)).toBeCloseTo(0.0076128, 6);
  });
});

describe("breakEvenRisk = annual term cost / annual gross profit from that buyer", () => {
  it("clean numbers: low-risk case", () => {
    // revenue 365000, r=0.10, days=73 (=365/5, so days/365 = 0.2 exactly)
    // annualTermCost = 365000 x 0.10 x 0.2 = 7300
    // annualGrossProfit = 365000 x 0.20 = 73000
    // ratio = 7300/73000 = 0.1
    const result = breakEvenRisk({
      annualRevenueFromBuyer: 365000,
      grossMarginPct: 0.2,
      costOfCapital: 0.1,
      days: 73,
    });
    expect(result.annualTermCost).toBeCloseTo(7300, 6);
    expect(result.annualGrossProfit).toBeCloseTo(73000, 6);
    expect(result.ratio).toBeCloseTo(0.1, 8);
    expect(result.breachesGrossProfit).toBe(false);
  });

  it("clean numbers: thin-margin case breaches 100% of gross profit", () => {
    // Same revenue/rate/days as above, but margin cut to 3%.
    // annualTermCost = 365000 x 0.15 x 90/365 = 54750 x 90/365 = 150 x 90 = 13500
    // annualGrossProfit = 365000 x 0.03 = 10950
    // ratio = 13500/10950 = 90/73 = 1.23287671232877
    const result = breakEvenRisk({
      annualRevenueFromBuyer: 365000,
      grossMarginPct: 0.03,
      costOfCapital: 0.15,
      days: 90,
    });
    expect(result.annualTermCost).toBeCloseTo(13500, 6);
    expect(result.annualGrossProfit).toBeCloseTo(10950, 6);
    expect(result.ratio).toBeCloseTo(1.232877, 5);
    expect(result.breachesGrossProfit).toBe(true);
  });

  it("the ratio is independent of deal size (revenue cancels algebraically)", () => {
    const small = breakEvenRisk({
      annualRevenueFromBuyer: 50000,
      grossMarginPct: 0.2,
      costOfCapital: 0.12,
      days: 60,
    });
    const large = breakEvenRisk({
      annualRevenueFromBuyer: 5000000,
      grossMarginPct: 0.2,
      costOfCapital: 0.12,
      days: 60,
    });
    expect(small.ratio).toBeCloseTo(large.ratio, 10);
  });
});

describe("factoringCost: fee per 30 days x days outstanding, on the ADVANCED portion", () => {
  it("clean numbers: $100K invoice, 80% advance, 3%/30d, 90 days out", () => {
    // advanced = 80000; periods = 90/30 = 3; fee = 80000 x 0.03 x 3 = 7200
    expect(
      factoringCost({ invoiceAmount: 100000, advanceRate: 0.8, feePer30Days: 0.03, daysOutstanding: 90 })
    ).toBeCloseTo(7200, 6);
  });

  it("clean numbers: $50K invoice, 85% advance, 2.5%/30d, 60 days out", () => {
    // advanced = 42500; periods = 2; fee = 42500 x 0.025 x 2 = 2125
    expect(
      factoringCost({ invoiceAmount: 50000, advanceRate: 0.85, feePer30Days: 0.025, daysOutstanding: 60 })
    ).toBeCloseTo(2125, 6);
  });

  it("costs more than self-financing (carryingCost) at the same term -- matches the research finding", () => {
    const invoiceAmount = 70000;
    const days = 100;
    const factoring = factoringCost({
      invoiceAmount,
      advanceRate: 0.85,
      feePer30Days: 0.03,
      daysOutstanding: days,
    });
    const selfFinanced = carryingCost(invoiceAmount, 0.15, days);
    expect(factoring).toBeGreaterThan(selfFinanced);
  });
});
