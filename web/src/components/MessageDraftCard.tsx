import { useEffect, useState } from "react";
import { buildMessageDraft, type BuyerProfile, type LadderRung, type SupplierProfile } from "@payfair/engine";
import { Badge, Card } from "./Card";
import { draftMessage } from "../lib/api";
import { SERVER_ENABLED } from "../lib/config";

export function MessageDraftCard({
  supplier,
  buyer,
  rung,
  rungIndex,
  buyerAskDays,
  costOfCapital,
  buyerReturnOnCash,
}: {
  supplier: SupplierProfile;
  buyer: BuyerProfile;
  rung: LadderRung;
  rungIndex: number;
  buyerAskDays: number;
  costOfCapital: number;
  buyerReturnOnCash: number;
}) {
  const templateDraft = buildMessageDraft(supplier, buyer, rung, buyerAskDays);
  const [draft, setDraft] = useState(templateDraft);
  const [source, setSource] = useState<"ai" | "template">("template");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setDraft(templateDraft);
    setSource("template");
    setLoading(true);

    draftMessage({
      supplierId: supplier.id,
      buyerId: buyer.id,
      buyerAskDays,
      costOfCapital,
      buyerReturnOnCash,
      rungIndex,
    }).then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (res) {
        setDraft(res.message);
        setSource(res.source);
      }
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplier.id, buyer.id, rungIndex, buyerAskDays, costOfCapital, buyerReturnOnCash]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API can be unavailable -- fail quietly, the text is still selectable.
    }
  }

  return (
    <Card
      eyebrow="05 · Message draft"
      title={`For the "${rung.label}" rung — Net ${rung.termDays}`}
      aside={
        <div className="flex items-center gap-2">
          {loading ? (
            <Badge tone="neutral">Drafting…</Badge>
          ) : (
            <Badge tone={source === "ai" ? "good" : "neutral"}>
              {source === "ai" ? "Drafted by Claude" : "Template-based drafting"}
            </Badge>
          )}
          <button
            onClick={handleCopy}
            className="rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700"
          >
            {copied ? "Copied" : "Copy draft"}
          </button>
        </div>
      }
    >
      <textarea
        readOnly
        value={draft}
        rows={9}
        className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-relaxed text-ink-900 focus:outline-none"
      />
      <p className="mt-3 text-[11px] leading-relaxed text-ink-500">
        Draft only — PayFair never sends this anywhere. Copy it, edit it, and send it yourself if it's right.{" "}
        {source === "template" &&
          !loading &&
          (SERVER_ENABLED
            ? "(AI drafting needs ANTHROPIC_API_KEY set on the server — this is the deterministic fallback.)"
            : "(This deployment runs template-based drafting only — no server, no AI calls.)")}
      </p>
    </Card>
  );
}
