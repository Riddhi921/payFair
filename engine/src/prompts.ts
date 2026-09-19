import { money, pctLabel } from "./format.js";
import type { Scenario } from "./scenario.js";
import type { BuyerProfile, LadderRung, SupplierProfile } from "./types.js";

/**
 * Prompt construction, shared between the server's live Anthropic calls and
 * the eval's "export for manual pasting" mode -- both must build the exact
 * same text, or a hand-pasted eval run would be testing a different prompt
 * than the one the app actually sends.
 */

function displayName(name: string): string {
  return name.replace(" (synthetic)", "");
}

export interface DraftMessagePrompt {
  system: string;
  user: string;
}

export function buildDraftMessagePrompt(
  supplier: SupplierProfile,
  buyer: BuyerProfile,
  rung: LadderRung,
  buyerAskDays: number
): DraftMessagePrompt {
  const discountDollar =
    rung.earlyPayDiscount?.feasible && rung.earlyPayDiscount.suggestedDiscountPct != null
      ? buyer.monthlyRevenue * rung.earlyPayDiscount.suggestedDiscountPct
      : null;

  const facts = [
    `Supplier (sender): ${displayName(supplier.name)}`,
    `Buyer (recipient): ${displayName(buyer.name)}`,
    `Buyer's current requested term: Net ${buyerAskDays}`,
    `Term being proposed instead: Net ${rung.termDays}`,
    `Carrying cost to the supplier at the proposed term: ${money(rung.carryingCost)}`,
    rung.earlyPayDiscount?.feasible && rung.earlyPayDiscount.suggestedDiscountPct != null
      ? `Suggested early-pay discount to offer the buyer: ${pctLabel(
          rung.earlyPayDiscount.suggestedDiscountPct,
          2
        )} (about ${money(discountDollar!)}) for paying ${rung.earlyPayDiscount.daysEarlyVsBuyerAsk} days sooner than their original ask`
      : null,
    rung.cashGapTrade
      ? `A deposit or price adjustment of about ${money(rung.cashGapTrade.shortfallDollars)} (${pctLabel(
          rung.cashGapTrade.pricePremiumPct,
          2
        )}) may also be proposed to smooth the transition`
      : null,
  ].filter((f): f is string => f !== null);

  const system = [
    "You draft short, polite business emails for a small B2B supplier proposing shorter payment terms to one of its buyers.",
    "Hard requirements for the message you write:",
    "- Propose the specific term given below (state it explicitly, e.g. 'Net 45').",
    "- Include at least one specific dollar figure from the facts given (not a vague estimate).",
    "- Offer the buyer something concrete in return (e.g. an early-pay discount or similar), if one is given in the facts.",
    "- Tone: warm, collaborative, professional. No ultimatums, no pressure tactics, no legal or relationship threats.",
    "- Under 150 words.",
    "- Output ONLY the email body text -- no subject line, no markdown, no preamble or commentary before or after.",
  ].join("\n");

  const user = `Facts for this message:\n${facts.map((f) => `- ${f}`).join("\n")}\n\nWrite the email now.`;

  return { system, user };
}

export function buildCopilotSystemPrompt(
  supplier: SupplierProfile,
  buyer: BuyerProfile,
  buyerAskDays: number,
  costOfCapital: number,
  buyerReturnOnCash: number,
  scenario: Scenario
): string {
  const briefing = [
    `Supplier: ${displayName(supplier.name)} (${supplier.archetype.replace("_", " ")}), cost of capital ${pctLabel(
      costOfCapital,
      1
    )}, gross margin ${pctLabel(supplier.grossMarginPct, 0)}, cash buffer ${money(supplier.cashBuffer)}, opening ask Net ${
      supplier.openingAskDays
    }.`,
    `Buyer: ${displayName(buyer.name)}, asking for Net ${buyerAskDays}. Assumed buyer return on cash: ${pctLabel(
      buyerReturnOnCash,
      1
    )} (an editable assumption, not observed).`,
    scenario.walkAway.unlimited
      ? `Walk-away term: unlimited within this model -- other buyers' revenue already covers fixed costs.`
      : `Walk-away term: Net ${scenario.walkAway.walkAwayDays} -- the longest term the supplier can carry before its cash buffer runs out.`,
    `Negotiation ladder: ${scenario.ladder
      .map(
        (r) =>
          `${r.label} = Net ${r.termDays} (carrying cost ${money(r.carryingCost)}${
            r.withinWalkAway ? ", within walk-away" : ", PAST walk-away"
          })`
      )
      .join("; ")}.`,
    `Break-even risk at the buyer's full ask: ${pctLabel(scenario.risk.ratio, 1)} of this buyer's annual gross profit (${
      scenario.risk.breachesGrossProfit ? "breaches 100%" : "within gross profit"
    }).`,
    `Recommended action plan: ${scenario.actionPlan.summary}`,
  ].join("\n");

  return [
    "You are PayFair's in-app copilot: a terse, practical payment-terms negotiation advisor.",
    "Ground every answer strictly in the scenario numbers given below. Never invent a probability that the buyer will accept any particular ask -- that is explicitly out of scope. Never fabricate a number not given to you.",
    "Answer in under 120 words, in plain language a finance lead can act on immediately. If the question can't be answered from the numbers given, say so plainly instead of guessing.",
    "",
    "Current scenario:",
    briefing,
  ].join("\n");
}
