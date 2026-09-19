import { describe, expect, it } from "vitest";
import { MAX_TERM_DAYS, walkAwayTermDays } from "../src/walkaway.js";
import { monthlyFixedOutflows, monthlyOtherInflow, suppliers } from "../seed/suppliers.js";

function findSupplier(id: string) {
  const s = suppliers.find((x) => x.id === id);
  if (!s) throw new Error(`fixture missing: ${id}`);
  return s;
}

describe("walkAwayTermDays, hand-checked against the seed suppliers", () => {
  it("Cascade Precision Parts / Highline Auto Systems: ample buffer, walk-away well past the buyer's ask", () => {
    const supplier = findSupplier("cascade-precision-parts");
    const buyerId = "highline-auto-systems";
    // fixed outflows = 42000 + 6500 + 18000 = 66500
    // other inflow   = 40000 (Vantage) + 15000 (Bolt & Frame) = 55000
    // dailyBurn = (66500 - 55000) / 30 = 11500/30 = 383.333333
    // walkAway = floor(65000 / 383.333333) = floor(169.565217) = 169
    const result = walkAwayTermDays({
      cashBuffer: supplier.cashBuffer,
      monthlyFixedOutflows: monthlyFixedOutflows(supplier),
      monthlyOtherInflow: monthlyOtherInflow(supplier, buyerId),
    });
    expect(result.dailyBurn).toBeCloseTo(383.333333, 4);
    expect(result.walkAwayDays).toBe(169);
    expect(result.unlimited).toBe(false);
    // Highline asked for 90 days -- comfortably under the 169-day walk-away.
    const highline = supplier.buyers.find((b) => b.id === buyerId)!;
    expect(highline.requestedTermDays).toBeLessThan(result.walkAwayDays);
  });

  it("Meridian Ops Consulting / Northfield Retail Group: a tight, marginal case", () => {
    const supplier = findSupplier("meridian-ops-consulting");
    const buyerId = "northfield-retail-group";
    // fixed outflows = 58000 + 4200 + 3200 = 65400
    // other inflow   = 26000 (Ashford) + 18000 (Petra) = 44000
    // dailyBurn = (65400 - 44000) / 30 = 21400/30 = 713.333333
    // walkAway = floor(40000 / 713.333333) = floor(56.074766) = 56
    const result = walkAwayTermDays({
      cashBuffer: supplier.cashBuffer,
      monthlyFixedOutflows: monthlyFixedOutflows(supplier),
      monthlyOtherInflow: monthlyOtherInflow(supplier, buyerId),
    });
    expect(result.dailyBurn).toBeCloseTo(713.333333, 4);
    expect(result.walkAwayDays).toBe(56);
    // Northfield asked for 60 days -- just OVER the 56-day walk-away line.
    const northfield = supplier.buyers.find((b) => b.id === buyerId)!;
    expect(northfield.requestedTermDays).toBeGreaterThan(result.walkAwayDays);
  });

  it("Harbor Point Distribution / Union Hardware Retail: other buyers already cover fixed costs, capped at MAX_TERM_DAYS", () => {
    const supplier = findSupplier("harbor-point-distribution");
    const buyerId = "union-hardware-retail";
    // fixed outflows = 30000 + 9000 + 120000 = 159000
    // other inflow   = 95000 (Coastal) + 60000 (Ridge & Co) = 155000
    // dailyBurn = (159000 - 155000) / 30 = 4000/30 = 133.333333
    // raw days = 90000 / 133.333333 = 675 exactly (90000 x 3 / 400)
    // capped at MAX_TERM_DAYS = 180
    const result = walkAwayTermDays({
      cashBuffer: supplier.cashBuffer,
      monthlyFixedOutflows: monthlyFixedOutflows(supplier),
      monthlyOtherInflow: monthlyOtherInflow(supplier, buyerId),
    });
    expect(result.dailyBurn).toBeCloseTo(133.333333, 4);
    expect(result.walkAwayDays).toBe(MAX_TERM_DAYS);
    expect(result.unlimited).toBe(false);
  });

  it("Ironclad Electrical / Summit General Contractors: the most cash-strained scenario, walk-away far short of the ask", () => {
    const supplier = findSupplier("ironclad-electrical-subcontracting");
    const buyerId = "summit-general-contractors";
    // fixed outflows = 51000 + 3800 + 22000 = 76800
    // other inflow   = 30000 (Brightline) + 20000 (Delta Grade) = 50000
    // dailyBurn = (76800 - 50000) / 30 = 26800/30 = 893.333333
    // walkAway = floor(35000 / 893.333333) = floor(39.179104) = 39
    const result = walkAwayTermDays({
      cashBuffer: supplier.cashBuffer,
      monthlyFixedOutflows: monthlyFixedOutflows(supplier),
      monthlyOtherInflow: monthlyOtherInflow(supplier, buyerId),
    });
    expect(result.dailyBurn).toBeCloseTo(893.333333, 4);
    expect(result.walkAwayDays).toBe(39);
    // Summit asked for 100 days -- more than double the 39-day walk-away.
    const summit = supplier.buyers.find((b) => b.id === buyerId)!;
    expect(summit.requestedTermDays).toBeGreaterThan(result.walkAwayDays * 2);
  });

  it("reports unlimited when other buyers' revenue already exceeds fixed outflows", () => {
    const result = walkAwayTermDays({
      cashBuffer: 10000,
      monthlyFixedOutflows: 20000,
      monthlyOtherInflow: 25000,
    });
    expect(result.dailyBurn).toBeLessThanOrEqual(0);
    expect(result.unlimited).toBe(true);
    expect(result.walkAwayDays).toBe(MAX_TERM_DAYS);
  });
});
