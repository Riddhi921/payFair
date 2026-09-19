/**
 * Read-only console report over the synthetic seed data. Not a test --
 * just a way to eyeball what the engine actually produces before wiring
 * up a UI. Run with: npx tsx scripts/demo.ts
 */
import { breakEvenRisk, factoringCost } from "../src/formulas.js";
import { buildLadder } from "../src/ladder.js";
import { monthlyFixedOutflows, monthlyOtherInflow, suppliers } from "../seed/suppliers.js";
import { walkAwayTermDays } from "../src/walkaway.js";

const money = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
const pct = (n: number) => `${(n * 100).toFixed(2)}%`;

for (const supplier of suppliers) {
  console.log("\n" + "=".repeat(78));
  console.log(`${supplier.name}  [${supplier.archetype}]`);
  console.log(
    `cost of capital ${pct(supplier.costOfCapital)} | gross margin ${pct(
      supplier.grossMarginPct
    )} | cash buffer ${money(supplier.cashBuffer)} | opening ask Net ${supplier.openingAskDays}`
  );

  // Primary buyer = the one with the longest requested term (the one worth negotiating).
  const buyer = [...supplier.buyers].sort((a, b) => b.requestedTermDays - a.requestedTermDays)[0];
  console.log(
    `\nPrimary buyer under negotiation: ${buyer.name} -- asks Net ${buyer.requestedTermDays} (${money(
      buyer.monthlyRevenue
    )}/mo)`
  );
  console.log(`  source: ${buyer.sourceNote}`);

  const walkAway = walkAwayTermDays({
    cashBuffer: supplier.cashBuffer,
    monthlyFixedOutflows: monthlyFixedOutflows(supplier),
    monthlyOtherInflow: monthlyOtherInflow(supplier, buyer.id),
  });
  console.log(
    `\nWalk-away term: Net ${walkAway.walkAwayDays}${walkAway.unlimited ? " (unlimited -- other buyers cover fixed costs)" : ""} ` +
      `(daily burn ${money(walkAway.dailyBurn)}) vs. buyer's ask of Net ${buyer.requestedTermDays}`
  );
  console.log(
    walkAway.walkAwayDays >= buyer.requestedTermDays
      ? "  -> Affordable outright: the buyer's ask is within what the business can carry."
      : "  -> NOT affordable outright: pushing past the walk-away line requires a trade or financing."
  );

  const ladder = buildLadder({
    invoiceAmount: buyer.monthlyRevenue,
    buyerAskDays: buyer.requestedTermDays,
    openingAskDays: supplier.openingAskDays,
    walkAwayDays: walkAway.walkAwayDays,
    supplierCostOfCapital: supplier.costOfCapital,
    buyerReturnOnCashAssumption: buyer.buyerReturnOnCashAssumption,
  });

  console.log("\nNegotiation ladder:");
  for (const rung of ladder) {
    const line = [`  ${rung.label.padEnd(14)} Net ${String(rung.termDays).padEnd(4)}`, `carry ${money(rung.carryingCost)}`];
    if (rung.earlyPayDiscount) {
      const t = rung.earlyPayDiscount;
      line.push(
        t.feasible
          ? `early-pay discount ~${pct(t.suggestedDiscountPct!)} (band ${pct(t.buyerFloorPct)}-${pct(t.supplierCeilingPct)})`
          : `early-pay discount NOT feasible (buyer floor ${pct(t.buyerFloorPct)} > supplier ceiling ${pct(t.supplierCeilingPct)})`
      );
    }
    if (rung.cashGapTrade) {
      line.push(`+ cash-gap trade: ${money(rung.cashGapTrade.shortfallDollars)} (${pct(rung.cashGapTrade.pricePremiumPct)} premium)`);
    }
    console.log(line.join(" | "));
  }

  const risk = breakEvenRisk({
    annualRevenueFromBuyer: buyer.monthlyRevenue * 12,
    grossMarginPct: supplier.grossMarginPct,
    costOfCapital: supplier.costOfCapital,
    days: buyer.requestedTermDays,
  });
  console.log(
    `\nBreak-even risk at the buyer's full ask: ${pct(risk.ratio)} of annual gross profit from this buyer` +
      (risk.breachesGrossProfit ? "  !! EXCEEDS annual gross profit -- financing this term costs more than the relationship earns" : "")
  );

  const factoring = factoringCost({
    invoiceAmount: buyer.monthlyRevenue,
    advanceRate: 0.85,
    feePer30Days: 0.03,
    daysOutstanding: buyer.requestedTermDays,
  });
  console.log(
    `Financing fallback at Net ${buyer.requestedTermDays}: factoring ~${money(factoring)} vs. self-financed carrying cost ~${money(
      (buyer.monthlyRevenue * supplier.costOfCapital * buyer.requestedTermDays) / 365
    )}`
  );
}
console.log("\n" + "=".repeat(78));
console.log("All figures above are synthetic demo data. See /research for sourcing, /SPEC.md for the product definition.");
