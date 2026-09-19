import "dotenv/config";
import cors from "cors";
import express from "express";
import { buildMessageDraft, computeScenario, type SupplierProfile } from "@payfair/engine";
import { monthlyFixedOutflows, monthlyOtherInflow, suppliers } from "@payfair/engine/seed";
import { answerCopilotQuestion, draftMessageWithClaude, isAiConfigured, type ChatTurn } from "./anthropic.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT ?? 8787);

function findSupplierAndBuyer(supplierId: unknown, buyerId: unknown) {
  const supplier = suppliers.find((s) => s.id === supplierId);
  if (!supplier) return { error: `unknown supplierId: ${String(supplierId)}` as const };
  const buyer = supplier.buyers.find((b) => b.id === buyerId);
  if (!buyer) return { error: `unknown buyerId: ${String(buyerId)} for supplier ${supplier.id}` as const };
  return { supplier, buyer };
}

function resolveScenario(
  supplier: SupplierProfile,
  buyerId: string,
  buyerAskDays: number,
  costOfCapital: number,
  buyerReturnOnCash: number
) {
  const buyer = supplier.buyers.find((b) => b.id === buyerId)!;
  return computeScenario({
    supplier,
    buyer,
    buyerAskDays,
    costOfCapital,
    buyerReturnOnCash,
    monthlyFixedOutflows: monthlyFixedOutflows(supplier),
    monthlyOtherInflow: monthlyOtherInflow(supplier, buyerId),
  });
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, aiConfigured: isAiConfigured() });
});

app.post("/api/draft-message", async (req, res) => {
  const { supplierId, buyerId, buyerAskDays, costOfCapital, buyerReturnOnCash, rungIndex } = req.body ?? {};

  const found = findSupplierAndBuyer(supplierId, buyerId);
  if ("error" in found) return res.status(400).json({ error: found.error });
  const { supplier, buyer } = found;

  if (typeof buyerAskDays !== "number" || typeof costOfCapital !== "number" || typeof buyerReturnOnCash !== "number") {
    return res.status(400).json({ error: "buyerAskDays, costOfCapital, and buyerReturnOnCash must be numbers" });
  }

  const scenario = resolveScenario(supplier, buyer.id, buyerAskDays, costOfCapital, buyerReturnOnCash);
  const idx = Math.min(Math.max(Number(rungIndex) || 0, 0), scenario.ladder.length - 1);
  const rung = scenario.ladder[idx];

  if (isAiConfigured()) {
    try {
      const message = await draftMessageWithClaude(supplier, buyer, rung, buyerAskDays);
      return res.json({ message, source: "ai" });
    } catch (err) {
      console.warn("[draft-message] Claude call failed, falling back to template:", (err as Error).message);
    }
  }

  const message = buildMessageDraft(supplier, buyer, rung, buyerAskDays);
  res.json({ message, source: "template" });
});

app.post("/api/copilot", async (req, res) => {
  const { supplierId, buyerId, buyerAskDays, costOfCapital, buyerReturnOnCash, question, history } = req.body ?? {};

  const found = findSupplierAndBuyer(supplierId, buyerId);
  if ("error" in found) return res.status(400).json({ error: found.error });
  const { supplier, buyer } = found;

  if (typeof question !== "string" || !question.trim()) {
    return res.status(400).json({ error: "question is required" });
  }
  if (typeof buyerAskDays !== "number" || typeof costOfCapital !== "number" || typeof buyerReturnOnCash !== "number") {
    return res.status(400).json({ error: "buyerAskDays, costOfCapital, and buyerReturnOnCash must be numbers" });
  }

  const scenario = resolveScenario(supplier, buyer.id, buyerAskDays, costOfCapital, buyerReturnOnCash);
  const chatHistory: ChatTurn[] = Array.isArray(history)
    ? history.filter((h): h is ChatTurn => h && (h.role === "user" || h.role === "assistant") && typeof h.content === "string")
    : [];

  if (isAiConfigured()) {
    try {
      const answer = await answerCopilotQuestion(
        supplier,
        buyer,
        buyerAskDays,
        costOfCapital,
        buyerReturnOnCash,
        scenario,
        question,
        chatHistory
      );
      return res.json({ answer, source: "ai" });
    } catch (err) {
      console.warn("[copilot] Claude call failed, falling back to the deterministic action plan:", (err as Error).message);
    }
  }

  res.json({ answer: scenario.actionPlan.summary, source: "template" });
});

app.listen(PORT, () => {
  console.log(`PayFair server listening on http://localhost:${PORT}`);
  console.log(`AI drafting/copilot: ${isAiConfigured() ? "ENABLED (ANTHROPIC_API_KEY set)" : "using template fallback (no ANTHROPIC_API_KEY)"}`);
});
