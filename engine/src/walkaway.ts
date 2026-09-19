import type { WalkAwayInput, WalkAwayResult } from "./types.js";

/**
 * Above this, we stop projecting and just call it "unlimited" -- no real
 * negotiation runs past half a year, and an unbounded number is useless
 * to render in a UI.
 */
export const MAX_TERM_DAYS = 180;

/**
 * walk-away term = longest term where projected cash stays above the buffer
 *
 * Model: the supplier's cash draws down at a steady daily rate equal to its
 * fixed monthly outflows (payroll + rent + vendor bills) minus its typical
 * monthly inflow from every OTHER buyer, spread evenly across the month.
 * The buyer under negotiation contributes nothing to cash until their
 * invoice actually lands on day T -- that gap is exactly what's being
 * tested. If the other buyers' revenue already covers fixed outflows
 * (dailyBurn <= 0), the cash buffer never depletes on its own, so there is
 * no walk-away ceiling from this model and we report `unlimited`.
 */
export function walkAwayTermDays(input: WalkAwayInput): WalkAwayResult {
  const { cashBuffer, monthlyFixedOutflows, monthlyOtherInflow, daysPerMonth = 30 } = input;
  const dailyBurn = (monthlyFixedOutflows - monthlyOtherInflow) / daysPerMonth;

  if (dailyBurn <= 0) {
    return { walkAwayDays: MAX_TERM_DAYS, unlimited: true, dailyBurn };
  }

  const rawDays = cashBuffer / dailyBurn;
  const walkAwayDays = Math.min(MAX_TERM_DAYS, Math.floor(rawDays));
  return { walkAwayDays, unlimited: false, dailyBurn };
}
