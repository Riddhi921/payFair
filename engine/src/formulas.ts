import type {
  BreakEvenRiskInput,
  BreakEvenRiskResult,
  FactoringCostInput,
} from "./types.js";

/**
 * Dollar cost of financing `amount` for `days` at an annual rate.
 * carrying cost = amount x r x days/365
 */
export function carryingCost(amount: number, annualRate: number, days: number): number {
  return amount * annualRate * (days / 365);
}

/**
 * Converts a flat early-payment discount into its annualized cost.
 * annualized = d/(1-d) x 365/daysEarly
 *
 * Depends ONLY on the discount and the number of days paid early ---
 * NOT on the length of the underlying contracted term. See SPEC.md,
 * "Research corrections applied", item 1.
 */
export function annualizedDiscountRate(discount: number, daysEarly: number): number {
  if (daysEarly <= 0) {
    throw new Error("daysEarly must be positive to annualize a discount");
  }
  return (discount / (1 - discount)) * (365 / daysEarly);
}

/**
 * Shared shape behind both the supplier's ceiling discount and the buyer's
 * floor discount: the flat discount rate that is break-even, over
 * `daysEarly` days, against an annual rate `annualRate`.
 *
 * x = annualRate x daysEarly / 365
 * d = x / (1 + x)
 *
 * This is the exact inverse of annualizedDiscountRate(): bandBound(r, t)
 * is the discount d such that annualizedDiscountRate(d, t) === r.
 */
export function bandBound(annualRate: number, daysEarly: number): number {
  const x = (annualRate * daysEarly) / 365;
  return x / (1 + x);
}

/**
 * The MOST a supplier should discount an invoice to be paid `daysEarly`
 * days sooner, given its own cost of capital. Offering less than this
 * saves the supplier more in avoided carrying cost than it gives up;
 * offering more costs the supplier more than just self-financing the gap.
 */
export function supplierCeilingDiscount(supplierCostOfCapital: number, daysEarly: number): number {
  return bandBound(supplierCostOfCapital, daysEarly);
}

/**
 * The LEAST discount a buyer would need to be offered to make paying
 * `daysEarly` days sooner worth it, given the buyer's assumed return on
 * cash. This rate is an ASSUMPTION (see BuyerProfile.buyerReturnOnCashAssumption)
 * -- it is never observed, and the product must present it as editable,
 * not measured.
 */
export function buyerFloorDiscount(buyerReturnOnCash: number, daysEarly: number): number {
  return bandBound(buyerReturnOnCash, daysEarly);
}

/**
 * break-even risk = annual term cost / annual gross profit from that buyer
 *
 * Note the annualRevenueFromBuyer term cancels algebraically:
 * ratio = (costOfCapital x days/365) / grossMarginPct
 * -- we still take revenue as an input so the dollar figures are reportable,
 * but the ratio itself is independent of deal size.
 */
export function breakEvenRisk(input: BreakEvenRiskInput): BreakEvenRiskResult {
  const { annualRevenueFromBuyer, grossMarginPct, costOfCapital, days } = input;
  const annualTermCost = carryingCost(annualRevenueFromBuyer, costOfCapital, days);
  const annualGrossProfit = annualRevenueFromBuyer * grossMarginPct;
  const ratio = annualTermCost / annualGrossProfit;
  return {
    annualTermCost,
    annualGrossProfit,
    ratio,
    breachesGrossProfit: ratio > 1,
  };
}

/**
 * factoring cost = fee-per-30-days x days outstanding, applied to the
 * ADVANCED portion of the invoice (not the full face value).
 */
export function factoringCost(input: FactoringCostInput): number {
  const { invoiceAmount, advanceRate, feePer30Days, daysOutstanding } = input;
  const advancedPortion = invoiceAmount * advanceRate;
  const periods = daysOutstanding / 30;
  return advancedPortion * feePer30Days * periods;
}
