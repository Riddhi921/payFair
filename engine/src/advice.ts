import { money, pctLabel } from "./format.js";
import type { BreakEvenRiskResult, LadderRung } from "./types.js";

export type RiskTier = "good" | "warn" | "bad";

export interface RiskVerdict {
  tier: RiskTier;
  label: string;
  copy: string;
}

/**
 * Single source of truth for how a break-even ratio reads as advice.
 * Used by the break-even card, the action-plan summary, and the copilot's
 * offline fallback so all three always agree.
 */
export function riskVerdict(ratio: number): RiskVerdict {
  if (ratio > 1) {
    return {
      tier: "bad",
      label: "Breaches gross profit",
      copy: "Financing this term for a year costs more than the relationship earns. Accepting it as-is likely isn't sustainable -- push hard, restructure the deal, or reconsider the account.",
    };
  }
  if (ratio >= 0.3) {
    return {
      tier: "warn",
      label: "High cost",
      copy: "This term eats a large share of what the relationship earns. Worth pushing for a shorter term or a trade -- but accepting and financing isn't unreasonable if the account is strategic.",
    };
  }
  return {
    tier: "good",
    label: "Manageable cost",
    copy: "Financing this term is cheap relative to what the relationship earns. Pushing is optional here, not urgent -- accepting and financing around it is a fine outcome.",
  };
}

export interface ActionPlan {
  /** Index into the ladder to lead the negotiation with -- always the opening ask. */
  leadRungIndex: number;
  /** Index into the ladder to concede to if the buyer pushes back -- the most favorable rung still inside walk-away. */
  fallbackRungIndex: number;
  hardLimitDays: number;
  risk: RiskVerdict;
  /** Plain-English recommendation, ready to display or hand to an LLM as grounding context. */
  summary: string;
}

export function buildActionPlan(input: {
  ladder: LadderRung[];
  walkAwayDays: number;
  walkAwayUnlimited: boolean;
  risk: BreakEvenRiskResult;
  buyerAskDays: number;
  buyerName: string;
}): ActionPlan {
  const { ladder, walkAwayDays, walkAwayUnlimited, risk, buyerAskDays, buyerName } = input;

  const leadRungIndex = 0;
  let fallbackRungIndex = 0;
  for (let i = ladder.length - 1; i >= 0; i--) {
    if (ladder[i].withinWalkAway) {
      fallbackRungIndex = i;
      break;
    }
  }

  const risk_ = riskVerdict(risk.ratio);
  const lead = ladder[leadRungIndex];
  const fallback = ladder[fallbackRungIndex];
  const affordable = walkAwayUnlimited || buyerAskDays <= walkAwayDays;

  const leadTrade =
    lead.earlyPayDiscount?.feasible && lead.earlyPayDiscount.suggestedDiscountPct != null
      ? ` with a ${pctLabel(lead.earlyPayDiscount.suggestedDiscountPct)} early-pay discount as the incentive`
      : "";

  const limitLine = affordable
    ? `${buyerName.replace(" (synthetic)", "")}'s own ask of Net ${buyerAskDays} is already affordable outright, so there's no hard wall here -- but opening lower still saves real money.`
    : `Don't go past Net ${walkAwayDays} without adding a deposit or price premium to cover the gap -- that's the point your cash buffer runs out before this invoice would be paid.`;

  // The walk-away line (short-term cash liquidity) and the break-even ratio
  // (annual profitability) are different lenses and can disagree -- a deal
  // can be cash-tight this quarter while still being profitable over a
  // year. Bridge that explicitly instead of stating both flatly back to back.
  const bridge =
    !affordable && risk_.tier === "good"
      ? " That cash-timing wall is separate from profitability, though: "
      : !affordable
        ? " On top of the cash-timing problem: "
        : " On profitability: ";

  const summary =
    `Lead with Net ${lead.termDays}${leadTrade}. ` +
    `If they push back, you can concede to Net ${fallback.termDays} (costs ${money(fallback.carryingCost)} to carry) and stay safe. ` +
    `${limitLine}` +
    `${bridge}${risk_.copy}`;

  return {
    leadRungIndex,
    fallbackRungIndex,
    hardLimitDays: walkAwayDays,
    risk: risk_,
    summary,
  };
}
