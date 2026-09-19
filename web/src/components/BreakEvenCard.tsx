import { riskVerdict, type BreakEvenRiskResult } from "@payfair/engine";
import { Badge, Card } from "./Card";
import { money, pct } from "../lib/format";

export function BreakEvenCard({
  risk,
  buyerAskDays,
  buyerName,
}: {
  risk: BreakEvenRiskResult;
  buyerAskDays: number;
  buyerName: string;
}) {
  const v = riskVerdict(risk.ratio);
  const pctOfBar = Math.min(100, risk.ratio * 100);

  return (
    <Card eyebrow="03 · Relationship break-even" title="Is pushing worth it?" aside={<Badge tone={v.tier}>{v.label}</Badge>}>
      <p className="text-sm text-ink-700">
        If {buyerName.replace(" (synthetic)", "")}'s Net {buyerAskDays} ask is simply accepted and financed, that costs{" "}
        <span className="font-mono font-semibold">{money(risk.annualTermCost)}</span> a year — against{" "}
        <span className="font-mono font-semibold">{money(risk.annualGrossProfit)}</span> of annual gross profit this
        buyer generates.
      </p>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-ink-500">
          <span>0%</span>
          <span className="font-mono font-bold text-ink-900">{pct(risk.ratio, 1)} of annual gross profit</span>
          <span>100%+</span>
        </div>
        <div className="mt-1 h-2.5 rounded-full bg-slate-100">
          <div
            className={`h-2.5 rounded-full ${v.tier === "good" ? "bg-emerald-400" : v.tier === "warn" ? "bg-amber-400" : "bg-rose-500"}`}
            style={{ width: `${pctOfBar}%` }}
          />
        </div>
      </div>

      <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-ink-700">{v.copy}</p>

      <p className="mt-3 text-[11px] leading-relaxed text-ink-500">
        This is a break-even comparison, not a forecast — PayFair does not estimate the odds this buyer accepts any
        particular ask. That judgment call is yours.
      </p>
    </Card>
  );
}
