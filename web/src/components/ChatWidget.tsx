import { useEffect, useRef, useState } from "react";
import { askCopilot } from "../lib/api";
import { SERVER_ENABLED } from "../lib/config";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  source?: "ai" | "template" | "offline";
}

export function ChatWidget({
  supplierId,
  buyerId,
  buyerAskDays,
  costOfCapital,
  buyerReturnOnCash,
  fallbackAnswer,
}: {
  supplierId: string;
  buyerId: string;
  buyerAskDays: number;
  costOfCapital: number;
  buyerReturnOnCash: number;
  fallbackAnswer: string;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Ask me anything about this scenario — what to propose, whether to push, or what a number means.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  // Never claim "AI" up front -- only once a real AI-sourced answer has actually
  // arrived in this session. Stays false for the lifetime of a static deployment.
  const [aiConfirmed, setAiConfirmed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function handleSend() {
    const question = input.trim();
    if (!question || loading) return;

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setLoading(true);

    const res = await askCopilot({
      supplierId,
      buyerId,
      buyerAskDays,
      costOfCapital,
      buyerReturnOnCash,
      question,
      history,
    });

    setLoading(false);
    if (res) {
      if (res.source === "ai") setAiConfirmed(true);
      setMessages((prev) => [...prev, { role: "assistant", content: res.answer, source: res.source }]);
    } else {
      const content = SERVER_ENABLED
        ? `Couldn't reach the copilot server, so here's the deterministic recommendation instead: ${fallbackAnswer}`
        : `This deployment runs guided Q&A only (no server, no live AI). Deterministic recommendation: ${fallbackAnswer}`;
      setMessages((prev) => [...prev, { role: "assistant", content, source: "offline" }]);
    }
  }

  const title = aiConfirmed ? "PayFair Copilot" : "Guided Q&A";
  const subtitle = aiConfirmed
    ? "Grounded in this scenario's numbers only"
    : "Deterministic answers from this scenario's numbers — no live AI";

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open && (
        <div className="mb-3 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <div className="text-sm font-bold text-ink-900">{title}</div>
              <div className="text-[11px] text-ink-500">{subtitle}</div>
            </div>
            <button onClick={() => setOpen(false)} className="text-ink-500 hover:text-ink-900" aria-label="Close chat">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user" ? "bg-brand-600 text-white" : "bg-slate-100 text-ink-900"
                  }`}
                >
                  {m.content}
                  {m.source && (
                    <div className="mt-1 text-[10px] text-ink-500">
                      {m.source === "ai" ? "via Claude" : m.source === "offline" ? "guided answer (offline)" : "guided answer"}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-ink-500">Thinking…</div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-slate-200 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="e.g. Should I push past Net 60?"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="shrink-0 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-700"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path
            fillRule="evenodd"
            d="M2 10c0-3.517 3.75-6.25 8-6.25s8 2.733 8 6.25-3.75 6.25-8 6.25a9.7 9.7 0 01-2.4-.3c-.65.58-1.8 1.3-3.3 1.3a.75.75 0 01-.53-1.28c.34-.35.72-.9.9-1.55C3.03 13.3 2 11.75 2 10z"
            clipRule="evenodd"
          />
        </svg>
        {open ? "Close" : title}
      </button>
    </div>
  );
}
