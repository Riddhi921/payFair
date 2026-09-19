import type { LadderRung } from "@payfair/engine";
import { Badge, Card } from "./Card";
import { money, pct } from "../lib/format";

export function LadderCard({
  rungs,
  buyerAskDays,
  selectedIndex,
  onSelect,
}: {
  rungs: LadderRung[];
  buyerAskDays: number;
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <Card eyebrow="02 · Negotiation ladder" title="Opening ask to walk-away">
      <p className="mb-4 text-sm text-ink-700">
        Each rung is a term you could propose, with the trade that makes it work. Pick one to draft a message for it.
      </p>
      <div className="space-y-3">
        {rungs.map((rung, i) => (
          <button
            key={rung.label}
            onClick={() => onSelect(i)}
            className={`block w-full rounded-lg border p-4 text-left transition ${
              selectedIndex === i
                ? "border-brand-400 bg-brand-50 ring-1 ring-brand-400"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="rounded-md bg-ink-900 px-2 py-0.5 font-mono text-xs font-bold text-white">
                  Net {rung.termDays}
                </span>
                <span className="text-sm font-semibold text-ink-900">{rung.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {rung.withinWalkAway ? (
                  <Badge tone="good">Within walk-away</Badge>
                ) : (
                  <Badge tone="warn">Past walk-away</Badge>
                )}
                <span className="font-mono text-sm font-semibold text-ink-900">{money(rung.carryingCost)}</span>
              </div>
            </div>

            <div className="mt-2.5 grid gap-2 text-xs text-ink-700 sm:grid-cols-2">
              {rung.earlyPayDiscount ? (
                rung.earlyPayDiscount.feasible ? (
                  <div>
                    <span className="font-medium text-ink-900">Early-pay discount:</span> ~
                    {pct(rung.earlyPayDiscount.suggestedDiscountPct!, 2)} for paying{" "}
                    {rung.earlyPayDiscount.daysEarlyVsBuyerAsk}d before the buyer's ask
                    <span className="block text-ink-500">
                      band {pct(rung.earlyPayDiscount.buyerFloorPct, 2)} (buyer floor) – {pct(rung.earlyPayDiscount.supplierCeilingPct, 2)} (your ceiling)
                    </span>
                  </div>
                ) : (
                  <div className="text-amber-700">
                    No feasible discount — buyer's floor ({pct(rung.earlyPayDiscount.buyerFloorPct, 2)}) exceeds your ceiling (
                    {pct(rung.earlyPayDiscount.supplierCeilingPct, 2)})
                  </div>
                )
              ) : (
                <div className="text-ink-500">
                  {rung.termDays === buyerAskDays
                    ? "At the buyer's own ask — no early-pay trade applies."
                    : "Longer than the buyer's ask — no early-pay trade applies here."}
                </div>
              )}

              {rung.cashGapTrade && (
                <div>
                  <span className="font-medium text-ink-900">Cash-gap trade:</span> deposit or price premium of ~
                  {money(rung.cashGapTrade.shortfallDollars)} ({pct(rung.cashGapTrade.pricePremiumPct, 2)}) to cover the
                  shortfall past walk-away
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}
