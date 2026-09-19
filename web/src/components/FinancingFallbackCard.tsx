import { carryingCost, factoringCost, supplierCeilingDiscount, type BuyerProfile } from "@payfair/engine";
import { Card } from "./Card";
import { money } from "../lib/format";

const FACTORING_ADVANCE_RATE = 0.85;
const FACTORING_FEE_PER_30_DAYS = 0.03;

export function FinancingFallbackCard({
  buyer,
  buyerAskDays,
  costOfCapital,
}: {
  buyer: BuyerProfile;
  buyerAskDays: number;
  costOfCapital: number;
}) {
  const dynamicDiscountCost = buyer.monthlyRevenue * supplierCeilingDiscount(costOfCapital, buyerAskDays);
  const factoring = factoringCost({
    invoiceAmount: buyer.monthlyRevenue,
    advanceRate: FACTORING_ADVANCE_RATE,
    feePer30Days: FACTORING_FEE_PER_30_DAYS,
    daysOutstanding: buyerAskDays,
  });
  const selfFinance = carryingCost(buyer.monthlyRevenue, costOfCapital, buyerAskDays);
  const cheaper = dynamicDiscountCost <= factoring ? "dynamic discounting" : "factoring";

  return (
    <Card eyebrow="04 · Financing fallback" title="If you accept the term as-is">
      <p className="mb-4 text-sm text-ink-700">
        Two ways to get paid before Net {buyerAskDays} actually lands, priced on this exact invoice (
        {money(buyer.monthlyRevenue)}):
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">Dynamic discounting</div>
          <div className="mt-1 font-mono text-2xl font-bold text-ink-900">{money(dynamicDiscountCost)}</div>
          <p className="mt-2 text-xs leading-relaxed text-ink-500">
            Priced at your own break-even ceiling to be paid on day 0 instead of Net {buyerAskDays}. Only available if
            the buyer runs a program like C2FO or Taulia — the buyer has to opt in.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">Factoring</div>
          <div className="mt-1 font-mono text-2xl font-bold text-ink-900">{money(factoring)}</div>
          <p className="mt-2 text-xs leading-relaxed text-ink-500">
            Assumes {Math.round(FACTORING_ADVANCE_RATE * 100)}% advance, {Math.round(FACTORING_FEE_PER_30_DAYS * 100)}%
            per 30 days outstanding — a mid-range rate within the 1–5%/month typical for small suppliers. Available
            without the buyer's involvement.
          </p>
        </div>
      </div>

      <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-ink-700">
        <span className="font-mono font-semibold">{money(Math.min(dynamicDiscountCost, factoring))}</span> is the
        cheaper of the two here ({cheaper}) — consistent with dynamic discounting generally undercutting factoring,
        since factoring also prices in taking on the buyer's credit risk. For reference, self-financing the gap
        through your own credit line at {Math.round(costOfCapital * 1000) / 10}% would cost about{" "}
        {money(selfFinance)}.
      </p>
    </Card>
  );
}
