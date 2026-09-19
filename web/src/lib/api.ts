import { SERVER_ENABLED } from "./config";

export interface DraftMessageRequest {
  supplierId: string;
  buyerId: string;
  buyerAskDays: number;
  costOfCapital: number;
  buyerReturnOnCash: number;
  rungIndex: number;
}

export interface DraftMessageResponse {
  message: string;
  source: "ai" | "template";
}

export interface CopilotRequest {
  supplierId: string;
  buyerId: string;
  buyerAskDays: number;
  costOfCapital: number;
  buyerReturnOnCash: number;
  question: string;
  history: { role: "user" | "assistant"; content: string }[];
}

export interface CopilotResponse {
  answer: string;
  source: "ai" | "template";
}

const TIMEOUT_MS = 15000;

async function postJson<TResponse>(path: string, body: unknown): Promise<TResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`${path} responded ${res.status}`);
    return (await res.json()) as TResponse;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Returns null on any failure (server disabled at build time, server not
 * running, network error, timeout) -- caller supplies a local fallback.
 * When SERVER_ENABLED is false, this never issues a network request at all.
 */
export async function draftMessage(req: DraftMessageRequest): Promise<DraftMessageResponse | null> {
  if (!SERVER_ENABLED) return null;
  try {
    return await postJson<DraftMessageResponse>("/api/draft-message", req);
  } catch {
    return null;
  }
}

export async function askCopilot(req: CopilotRequest): Promise<CopilotResponse | null> {
  if (!SERVER_ENABLED) return null;
  try {
    return await postJson<CopilotResponse>("/api/copilot", req);
  } catch {
    return null;
  }
}
