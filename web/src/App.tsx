import { useMemo, useRef, useState } from "react";
import { computeScenario } from "@payfair/engine";
import { monthlyFixedOutflows, monthlyOtherInflow, suppliers } from "@payfair/engine/seed";
import { SyntheticBanner } from "./components/SyntheticBanner";
import { Header } from "./components/Header";
import { ControlPanel } from "./components/ControlPanel";
import { ActionPlanCard } from "./components/ActionPlanCard";
import { CashGapCard } from "./components/CashGapCard";
import { LadderCard } from "./components/LadderCard";
import { BreakEvenCard } from "./components/BreakEvenCard";
import { FinancingFallbackCard } from "./components/FinancingFallbackCard";
import { MessageDraftCard } from "./components/MessageDraftCard";
import { ChatWidget } from "./components/ChatWidget";
import { CASE_STUDY_URL } from "./lib/config";

function App() {
  const [supplierId, setSupplierId] = useState(suppliers[0].id);
  const supplier = suppliers.find((s) => s.id === supplierId)!;

  const [buyerId, setBuyerId] = useState(
    [...supplier.buyers].sort((a, b) => b.requestedTermDays - a.requestedTermDays)[0].id
  );
  const buyer = supplier.buyers.find((b) => b.id === buyerId) ?? supplier.buyers[0];

  const [buyerAskDays, setBuyerAskDays] = useState(buyer.requestedTermDays);
  const [costOfCapital, setCostOfCapital] = useState(supplier.costOfCapital);
  const [buyerReturnOnCash, setBuyerReturnOnCash] = useState(buyer.buyerReturnOnCashAssumption);
  const [selectedRungIndex, setSelectedRungIndex] = useState(2); // default: Midpoint

  const messageCardRef = useRef<HTMLDivElement>(null);

  function handleSupplierChange(id: string) {
    const next = suppliers.find((s) => s.id === id)!;
    const nextBuyer = [...next.buyers].sort((a, b) => b.requestedTermDays - a.requestedTermDays)[0];
    setSupplierId(id);
    setBuyerId(nextBuyer.id);
    setBuyerAskDays(nextBuyer.requestedTermDays);
    setCostOfCapital(next.costOfCapital);
    setBuyerReturnOnCash(nextBuyer.buyerReturnOnCashAssumption);
    setSelectedRungIndex(2);
  }

  function handleBuyerChange(id: string) {
    const nextBuyer = supplier.buyers.find((b) => b.id === id)!;
    setBuyerId(id);
    setBuyerAskDays(nextBuyer.requestedTermDays);
    setBuyerReturnOnCash(nextBuyer.buyerReturnOnCashAssumption);
    setSelectedRungIndex(2);
  }

  const scenario = useMemo(
    () =>
      computeScenario({
        supplier,
        buyer,
        buyerAskDays,
        costOfCapital,
        buyerReturnOnCash,
        monthlyFixedOutflows: monthlyFixedOutflows(supplier),
        monthlyOtherInflow: monthlyOtherInflow(supplier, buyer.id),
      }),
    [supplier, buyer, buyerAskDays, costOfCapital, buyerReturnOnCash]
  );

  const { walkAway, ladder, risk, actionPlan } = scenario;
  const safeRungIndex = Math.min(selectedRungIndex, ladder.length - 1);

  function selectAndScrollToRung(index: number) {
    setSelectedRungIndex(index);
    messageCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SyntheticBanner />
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[320px_1fr] lg:gap-6 lg:px-8 lg:py-8">
        <ControlPanel
          suppliers={suppliers}
          supplier={supplier}
          buyer={buyer}
          buyerAskDays={buyerAskDays}
          costOfCapital={costOfCapital}
          buyerReturnOnCash={buyerReturnOnCash}
          onSupplierChange={handleSupplierChange}
          onBuyerChange={handleBuyerChange}
          onBuyerAskDaysChange={setBuyerAskDays}
          onCostOfCapitalChange={setCostOfCapital}
          onBuyerReturnOnCashChange={setBuyerReturnOnCash}
          onResetAsk={() => setBuyerAskDays(buyer.requestedTermDays)}
        />

        <div className="mt-6 space-y-5 lg:mt-0">
          <ActionPlanCard plan={actionPlan} ladder={ladder} onDraftRung={selectAndScrollToRung} />

          <details className="group rounded-xl border border-slate-200 bg-white shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between p-4 text-sm font-semibold text-ink-700 marker:content-none">
              Show the full breakdown (cash gap, ladder detail, break-even math, financing fallback)
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4 text-ink-500 transition group-open:rotate-180"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </summary>
            <div className="space-y-5 border-t border-slate-100 p-4 pt-5">
              <CashGapCard
                supplier={supplier}
                buyer={buyer}
                buyerAskDays={buyerAskDays}
                walkAway={walkAway}
                costOfCapital={costOfCapital}
              />
              <LadderCard
                rungs={ladder}
                buyerAskDays={buyerAskDays}
                selectedIndex={safeRungIndex}
                onSelect={setSelectedRungIndex}
              />
              <BreakEvenCard risk={risk} buyerAskDays={buyerAskDays} buyerName={buyer.name} />
              <FinancingFallbackCard buyer={buyer} buyerAskDays={buyerAskDays} costOfCapital={costOfCapital} />
            </div>
          </details>

          <div ref={messageCardRef}>
            <MessageDraftCard
              supplier={supplier}
              buyer={buyer}
              rung={ladder[safeRungIndex]}
              rungIndex={safeRungIndex}
              buyerAskDays={buyerAskDays}
              costOfCapital={costOfCapital}
              buyerReturnOnCash={buyerReturnOnCash}
            />
          </div>
        </div>
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-24 pt-4 text-center text-xs text-ink-500 sm:px-6 lg:px-8">
        Built on synthetic seed data. See <code className="font-mono">/research</code> for sourcing and{" "}
        <code className="font-mono">/SPEC.md</code> for the product definition. No accounts, no ERP connection, no
        messages are ever sent.
        {CASE_STUDY_URL && (
          <>
            {" "}
            <a
              href={CASE_STUDY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand-600 hover:underline"
            >
              About this demo
            </a>
            .
          </>
        )}
      </footer>

      <ChatWidget
        key={`${supplier.id}-${buyer.id}`}
        supplierId={supplier.id}
        buyerId={buyer.id}
        buyerAskDays={buyerAskDays}
        costOfCapital={costOfCapital}
        buyerReturnOnCash={buyerReturnOnCash}
        fallbackAnswer={actionPlan.summary}
      />
    </div>
  );
}

export default App;
