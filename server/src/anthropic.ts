import Anthropic from "@anthropic-ai/sdk";
import {
  buildCopilotSystemPrompt,
  buildDraftMessagePrompt,
  type BuyerProfile,
  type LadderRung,
  type Scenario,
  type SupplierProfile,
} from "@payfair/engine";

const MODEL = "claude-sonnet-5";

export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function client(): Anthropic {
  // Constructed only when a key is present -- callers must check isAiConfigured() first.
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

/**
 * Drafts a short negotiation message for one ladder rung. Throws on any
 * failure (bad key, rate limit, network) -- the caller is expected to fall
 * back to the deterministic template.
 */
export async function draftMessageWithClaude(
  supplier: SupplierProfile,
  buyer: BuyerProfile,
  rung: LadderRung,
  buyerAskDays: number
): Promise<string> {
  const { system, user } = buildDraftMessagePrompt(supplier, buyer, rung, buyerAskDays);

  const response = await client().messages.create({
    model: MODEL,
    max_tokens: 500,
    output_config: { effort: "low" },
    system,
    messages: [{ role: "user", content: user }],
  });

  const text = response.content.find((b) => b.type === "text");
  if (!text || text.type !== "text" || !text.text.trim()) {
    throw new Error("Claude returned no text content");
  }
  return text.text.trim();
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

/**
 * Answers a free-form question grounded in the current scenario's real
 * numbers. Throws on failure -- the caller falls back to the action plan's
 * deterministic summary.
 */
export async function answerCopilotQuestion(
  supplier: SupplierProfile,
  buyer: BuyerProfile,
  buyerAskDays: number,
  costOfCapital: number,
  buyerReturnOnCash: number,
  scenario: Scenario,
  question: string,
  history: ChatTurn[]
): Promise<string> {
  const system = buildCopilotSystemPrompt(supplier, buyer, buyerAskDays, costOfCapital, buyerReturnOnCash, scenario);

  const messages: Anthropic.MessageParam[] = [
    ...history.slice(-6).map((h) => ({ role: h.role, content: h.content }) as Anthropic.MessageParam),
    { role: "user", content: question },
  ];

  const response = await client().messages.create({
    model: MODEL,
    max_tokens: 600,
    output_config: { effort: "low" },
    system,
    messages,
  });

  const text = response.content.find((b) => b.type === "text");
  if (!text || text.type !== "text" || !text.text.trim()) {
    throw new Error("Claude returned no text content");
  }
  return text.text.trim();
}
