import { carryingCost, type BuyerProfile, type SupplierProfile, type WalkAwayResult } from "@payfair/engine";
import { Badge, Card } from "./Card";
import { money } from "../lib/format";

export function CashGapCard({
  supplier,
  buyer,
  buyerAskDays,
  walkAway,
  costOfCapital,
}: {
  supplier: SupplierProfile;
  buyer: BuyerProfile;
  buyerAskDays: number;
  walkAway: WalkAwayResult;
  costOfCapital: number;
}) {
  const affordable = walkAway.unlimited || buyerAskDays <= walkAway.walkAwayDays;
  const costAtAsk = carryingCost(buyer.monthlyRevenue, costOfCapital, buyerAskDays);
  const costAtOpening = carryingCost(buyer.monthlyRevenue, costOfCapital, supplier.openingAskDays);
  const gap = costAtAsk - costAtOpening;

  const scaleMax = Math.max(buyerAskDays, walkAway.unlimited ? buyerAskDays : walkAway.walkAwayDays, supplier.openingAskDays) * 1.15;
  const pos = (d: number) => `${Math.min(100, (d / scaleMax) * 100)}%`;

  return (
    <Card
      eyebrow="01 · Cash gap"
      title="Walk-away line"
      aside={
        <Badge tone={affordable ? "good" : "bad"}>
          {affordable ? "Affordable outright" : "Beyond walk-away"}
        </Badge>
      }
    >
      <p className="text-sm text-ink-700">
        Carrying <span className="font-mono font-semibold">{buyer.name.replace(" (synthetic)", "")}</span>'s invoice at{" "}
        <span className="font-mono font-semibold">Net {buyerAskDays}</span> costs about{" "}
        <span className="font-mono font-semibold">{money(costAtAsk)}</span> — {money(gap)} more than{" "}
        {supplier.name.replace(" (synthetic)", "")}'s Net {supplier.openingAskDays} opening ask would.
      </p>

      <div className="mt-6 mb-2">
        <div className="relative h-2 rounded-full bg-slate-100">
          <div
            className={`absolute h-2 rounded-full ${affordable ? "bg-emerald-400" : "bg-rose-400"}`}
            style={{ width: pos(walkAway.unlimited ? scaleMax : walkAway.walkAwayDays) }}
          />
          {/* opening ask marker */}
          <div className="absolute -top-1.5 h-5 w-0.5 bg-ink-300" style={{ left: pos(supplier.openingAskDays) }} />
          {/* walk-away marker */}
          {!walkAway.unlimited && (
            <div className="absolute -top-1.5 h-5 w-0.5 bg-ink-900" style={{ left: pos(walkAway.walkAwayDays) }} />
          )}
          {/* buyer ask marker */}
          <div
            className="absolute -top-2 h-6 w-0.5 bg-brand-600"
            style={{ left: pos(Math.min(buyerAskDays, scaleMax)) }}
          />
        </div>
        <div className="relative mt-1 h-8 text-[11px] text-ink-500">
          <span className="absolute -translate-x-1/2" style={{ left: pos(supplier.openingAskDays) }}>
            Opening<br />Net {supplier.openingAskDays}
          </span>
          {!walkAway.unlimited && (
            <span className="absolute -translate-x-1/2 font-semibold text-ink-900" style={{ left: pos(walkAway.walkAwayDays) }}>
              Walk-away<br />Net {walkAway.walkAwayDays}
            </span>
          )}
          <span className="absolute -translate-x-1/2 font-semibold text-brand-700" style={{ left: pos(Math.min(buyerAskDays, scaleMax)) }}>
            Buyer's ask<br />Net {buyerAskDays}
          </span>
        </div>
      </div>

      <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-ink-700">
        {walkAway.unlimited
          ? `Other buyers' revenue already covers ${supplier.name.replace(" (synthetic)", "")}'s fixed monthly costs, so there's no cash-driven ceiling from this model at any realistic term.`
          : affordable
          ? `The business can carry this invoice all the way out to Net ${walkAway.walkAwayDays} before the cash buffer would run dry — Net ${buyerAskDays} fits comfortably inside that line.`
          : `Net ${buyerAskDays} runs ${buyerAskDays - walkAway.walkAwayDays} days past the Net ${walkAway.walkAwayDays} walk-away line — accepting it as-is would draw the cash buffer below zero before this invoice gets paid, unless a trade or financing fills the gap.`}
      </p>
    </Card>
  );
}
