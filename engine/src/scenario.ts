import { buildActionPlan, type ActionPlan } from "./advice.js";
import { breakEvenRisk } from "./formulas.js";
import { buildLadder } from "./ladder.js";
import type { BreakEvenRiskResult, BuyerProfile, LadderRung, SupplierProfile, WalkAwayResult } from "./types.js";
import { walkAwayTermDays } from "./walkaway.js";

/**
 * Everything downstream of a (supplier, buyer, term, assumptions) tuple,
 * in one place. Both the web app and the server call this so the numbers
 * a user sees on screen are exactly the numbers the AI drafting/copilot
 * endpoints ground their answers in -- never two slightly different
 * recomputations drifting apart.
 */
export interface ScenarioParams {
  supplier: SupplierProfile;
  buyer: BuyerProfile;
  buyerAskDays: number;
  costOfCapital: number;
  buyerReturnOnCash: number;
  monthlyFixedOutflows: number;
  monthlyOtherInflow: number;
}

export interface Scenario {
  walkAway: WalkAwayResult;
  ladder: LadderRung[];
  risk: BreakEvenRiskResult;
  actionPlan: ActionPlan;
}

export function computeScenario(p: ScenarioParams): Scenario {
  const walkAway = walkAwayTermDays({
    cashBuffer: p.supplier.cashBuffer,
    monthlyFixedOutflows: p.monthlyFixedOutflows,
    monthlyOtherInflow: p.monthlyOtherInflow,
  });

  const ladder = buildLadder({
    invoiceAmount: p.buyer.monthlyRevenue,
    buyerAskDays: p.buyerAskDays,
    openingAskDays: p.supplier.openingAskDays,
    walkAwayDays: walkAway.walkAwayDays,
    supplierCostOfCapital: p.costOfCapital,
    buyerReturnOnCashAssumption: p.buyerReturnOnCash,
  });

  const risk = breakEvenRisk({
    annualRevenueFromBuyer: p.buyer.monthlyRevenue * 12,
    grossMarginPct: p.supplier.grossMarginPct,
    costOfCapital: p.costOfCapital,
    days: p.buyerAskDays,
  });

  const actionPlan = buildActionPlan({
    ladder,
    walkAwayDays: walkAway.walkAwayDays,
    walkAwayUnlimited: walkAway.unlimited,
    risk,
    buyerAskDays: p.buyerAskDays,
    buyerName: p.buyer.name,
  });

  return { walkAway, ladder, risk, actionPlan };
}
