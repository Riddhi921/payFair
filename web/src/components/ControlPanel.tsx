import { carryingCost, type BuyerProfile, type SupplierProfile } from "@payfair/engine";
import { money, pct } from "../lib/format";

const ARCHETYPE_LABEL: Record<SupplierProfile["archetype"], string> = {
  parts_manufacturer: "Parts manufacturer",
  professional_services: "Professional services",
  distributor: "Distributor",
  subcontractor: "Subcontractor",
};

export function ControlPanel({
  suppliers,
  supplier,
  buyer,
  buyerAskDays,
  costOfCapital,
  buyerReturnOnCash,
  onSupplierChange,
  onBuyerChange,
  onBuyerAskDaysChange,
  onCostOfCapitalChange,
  onBuyerReturnOnCashChange,
  onResetAsk,
}: {
  suppliers: SupplierProfile[];
  supplier: SupplierProfile;
  buyer: BuyerProfile;
  buyerAskDays: number;
  costOfCapital: number;
  buyerReturnOnCash: number;
  onSupplierChange: (id: string) => void;
  onBuyerChange: (id: string) => void;
  onBuyerAskDaysChange: (n: number) => void;
  onCostOfCapitalChange: (n: number) => void;
  onBuyerReturnOnCashChange: (n: number) => void;
  onResetAsk: () => void;
}) {
  return (
    <aside className="lg:sticky lg:top-14 lg:self-start">
      <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">Supplier</label>
          <select
            value={supplier.id}
            onChange={(e) => onSupplierChange(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {ARCHETYPE_LABEL[s.archetype]}
              </option>
            ))}
          </select>
        </div>

        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-lg bg-slate-50 p-3 text-xs">
          <div>
            <dt className="text-ink-500">Cash buffer</dt>
            <dd className="font-mono font-semibold text-ink-900">{money(supplier.cashBuffer)}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Gross margin</dt>
            <dd className="font-mono font-semibold text-ink-900">{pct(supplier.grossMarginPct, 0)}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Opening ask</dt>
            <dd className="font-mono font-semibold text-ink-900">Net {supplier.openingAskDays}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Monthly fixed costs</dt>
            <dd className="font-mono font-semibold text-ink-900">
              {money(supplier.monthlyPayrollAmount + supplier.monthlyRent + supplier.monthlyVendorBills)}
            </dd>
          </div>
        </dl>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">Buyer</label>
          <select
            value={buyer.id}
            onChange={(e) => onBuyerChange(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            {supplier.buyers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} (asks Net {b.requestedTermDays})
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-ink-500">
            Pays {buyer.typicalDaysLatePastTerm === 0 ? "on time historically" : `~${buyer.typicalDaysLatePastTerm}d late on average`} · {money(buyer.monthlyRevenue)}/mo
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">Buyer's requested term</label>
            {buyerAskDays !== buyer.requestedTermDays && (
              <button onClick={onResetAsk} className="text-xs font-medium text-brand-600 hover:text-brand-700">
                Reset
              </button>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-3">
            <input
              type="range"
              min={15}
              max={150}
              step={1}
              value={buyerAskDays}
              onChange={(e) => onBuyerAskDaysChange(Number(e.target.value))}
              className="h-1.5 w-full flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-600"
            />
            <span className="w-16 shrink-0 rounded-md bg-brand-50 px-2 py-1 text-center font-mono text-sm font-bold text-brand-700">
              Net {buyerAskDays}
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-dashed border-slate-300 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Assumptions you can change</p>
          <p className="mt-1 text-[11px] leading-snug text-ink-500">
            These two sliders are the only numbers on this page that aren't fixed by the scenario — everything else
            (walk-away, the ladder, the risk check) recalculates live from whatever you set them to.
          </p>

          <div className="mt-3 space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-ink-900">Your cost of borrowing</span>
                <span className="font-mono font-semibold text-ink-900">{pct(costOfCapital, 1)}</span>
              </div>
              <p className="mt-0.5 text-[11px] leading-snug text-ink-500">
                The yearly interest rate this business would pay to borrow — its line-of-credit or credit-card rate.
                Higher rate = every day spent waiting to get paid costs more.
              </p>
              <input
                type="range"
                min={0.04}
                max={0.3}
                step={0.005}
                value={costOfCapital}
                onChange={(e) => onCostOfCapitalChange(Number(e.target.value))}
                className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-600"
              />
              <p className="mt-1.5 rounded-md bg-slate-50 px-2 py-1.5 font-mono text-[11px] text-ink-700">
                Example: at {pct(costOfCapital, 1)}, waiting an extra 30 days on a $10,000 invoice costs about{" "}
                <span className="font-semibold">{money(carryingCost(10000, costOfCapital, 30), 0)}</span>.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-ink-900">What the buyer could earn on their cash</span>
                <span className="font-mono font-semibold text-ink-900">{pct(buyerReturnOnCash, 1)}</span>
              </div>
              <p className="mt-0.5 text-[11px] leading-snug text-ink-500">
                A guess at what {buyer.name.replace(" (synthetic)", "")} gains by holding onto their cash a bit longer
                instead of paying you early. Nobody observes this directly — lower it and they'd accept a smaller
                discount to pay early; raise it and they'd want a bigger one.
              </p>
              <input
                type="range"
                min={0.01}
                max={0.2}
                step={0.005}
                value={buyerReturnOnCash}
                onChange={(e) => onBuyerReturnOnCashChange(Number(e.target.value))}
                className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-600"
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
