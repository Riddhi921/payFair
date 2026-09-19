import { pctLabel } from "./format.js";
import type { BuyerProfile, LadderRung, SupplierProfile } from "./types.js";

/**
 * Deterministic template draft -- the fallback used whenever an AI-drafted
 * version isn't available (no ANTHROPIC_API_KEY, the API call fails, or the
 * server isn't reachable at all). No network call, no randomness: same
 * inputs always produce the same message.
 */
export function buildMessageDraft(
  supplier: SupplierProfile,
  buyer: BuyerProfile,
  rung: LadderRung,
  buyerAskDays: number
): string {
  const lines: string[] = [];

  lines.push(`Hi ${buyer.name.replace(" (synthetic)", "")} team,`);
  lines.push("");
  lines.push(
    `As we lock in terms for the next cycle, we'd like to propose Net ${rung.termDays} in place of Net ${buyerAskDays}.`
  );

  if (rung.earlyPayDiscount?.feasible && rung.earlyPayDiscount.suggestedDiscountPct != null) {
    lines.push("");
    lines.push(
      `To make that easy on your end, we're glad to offer a ${pctLabel(
        rung.earlyPayDiscount.suggestedDiscountPct,
        2
      )} discount for payment within ${rung.earlyPayDiscount.daysEarlyVsBuyerAsk} days of the invoice date.`
    );
  }

  if (rung.cashGapTrade) {
    lines.push("");
    lines.push(
      `We'd also propose a small adjustment -- roughly ${pctLabel(
        rung.cashGapTrade.pricePremiumPct,
        2
      )}, or a deposit of about that amount at signing -- to smooth the transition on our side. Happy to structure it however works best for your team.`
    );
  }

  lines.push("");
  lines.push("This keeps things predictable on both sides and shouldn't meaningfully change your payables process.");
  lines.push("Let me know if you'd like to walk through it.");
  lines.push("");
  lines.push("Best,");
  lines.push("[Your name]");
  lines.push(supplier.name.replace(" (synthetic)", ""));

  return lines.join("\n");
}
