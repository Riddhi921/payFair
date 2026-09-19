import type { ActionPlan, LadderRung } from "@payfair/engine";
import { Badge } from "./Card";
import { money, pct } from "../lib/format";

export function ActionPlanCard({
  plan,
  ladder,
  onDraftRung,
}: {
  plan: ActionPlan;
  ladder: LadderRung[];
  onDraftRung: (index: number) => void;
}) {
  const lead = ladder[plan.leadRungIndex];
  const fallback = ladder[plan.fallbackRungIndex];

  return (
    <section className="rounded-xl border-2 border-brand-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-brand-600">What to do</div>
          <h2 className="mt-0.5 text-xl font-bold text-ink-900">Recommended action</h2>
        </div>
        <Badge tone={plan.risk.tier}>{plan.risk.label}</Badge>
      </div>

      <ol className="space-y-3">
        <li className="flex items-start gap-3 rounded-lg bg-emerald-50 p-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
            1
          </span>
          <div className="flex-1 text-sm text-ink-900">
            <span className="font-semibold">Lead with Net {lead.termDays}</span>
            {lead.earlyPayDiscount?.feasible && lead.earlyPayDiscount.suggestedDiscountPct != null && (
              <> — offer a ~{pct(lead.earlyPayDiscount.suggestedDiscountPct)} early-pay discount as the incentive.</>
            )}
          </div>
          <button
            onClick={() => onDraftRung(plan.leadRungIndex)}
            className="shrink-0 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
          >
            Draft this
          </button>
        </li>

        <li className="flex items-start gap-3 rounded-lg bg-amber-50 p-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
            2
          </span>
          <div className="flex-1 text-sm text-ink-900">
            <span className="font-semibold">If they push back, concede to Net {fallback.termDays}</span> — costs{" "}
            {money(fallback.carryingCost)} to carry, still within what the business can afford.
          </div>
          <button
            onClick={() => onDraftRung(plan.fallbackRungIndex)}
            className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-slate-50"
          >
            Draft this
          </button>
        </li>

        <li className="flex items-start gap-3 rounded-lg bg-rose-50 p-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white">
            3
          </span>
          <div className="text-sm text-ink-900">
            <span className="font-semibold">Hard limit: Net {plan.hardLimitDays}.</span> Don't agree to anything longer
            without a deposit or price premium attached to cover the gap.
          </div>
        </li>
      </ol>

      <p className="mt-4 border-t border-slate-100 pt-3 text-xs leading-relaxed text-ink-500">{plan.risk.copy}</p>
    </section>
  );
}
