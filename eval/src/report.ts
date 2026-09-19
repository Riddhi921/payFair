import type { CheckResult } from "./types.js";

function mark(pass: boolean): string {
  return pass ? "✅ pass" : "❌ FAIL";
}

/** Builds a scenario x check markdown table. Rows = scenarios, columns = checks (by id, in first row's order). */
function checkTable(scenarioIds: string[], checksByScenario: Record<string, CheckResult[]>): string {
  const checkIds = checksByScenario[scenarioIds[0]].map((c) => c.id);
  const header = `| Scenario | ${checkIds.join(" | ")} |`;
  const sep = `|---|${checkIds.map(() => "---").join("|")}|`;
  const rows = scenarioIds.map((id) => {
    const results = checksByScenario[id];
    return `| \`${id}\` | ${results.map((r) => mark(r.pass)).join(" | ")} |`;
  });
  return [header, sep, ...rows].join("\n");
}

/** Aggregate pass rate per check, worst-performing first -- "report failures first." */
function aggregateSummary(scenarioIds: string[], checksByScenario: Record<string, CheckResult[]>, total: number): string {
  const checkIds = checksByScenario[scenarioIds[0]].map((c) => c.id);
  const labels = Object.fromEntries(checksByScenario[scenarioIds[0]].map((c) => [c.id, c.label]));
  const rates = checkIds.map((id) => {
    const passed = scenarioIds.filter((sid) => checksByScenario[sid].find((c) => c.id === id)?.pass).length;
    return { id, label: labels[id], passed, total };
  });
  rates.sort((a, b) => a.passed / a.total - b.passed / b.total);
  return rates
    .map((r) => `- **${r.label}**: ${r.passed}/${r.total} scenarios pass${r.passed < r.total ? "  ⚠️" : ""}`)
    .join("\n");
}

export interface ScenarioReportData {
  id: string;
  description: string;
  templateMessage: string;
  templateMessageChecks: CheckResult[];
  chatAnswer: string;
  chatChecks: CheckResult[];
  llmMessage?: string;
  llmMessageChecks?: CheckResult[];
}

export function buildResultsMarkdown(scenarios: ScenarioReportData[], llmImported: boolean): string {
  const scenarioIds = scenarios.map((s) => s.id);
  const templateMsgChecks = Object.fromEntries(scenarios.map((s) => [s.id, s.templateMessageChecks]));
  const chatChecksByScenario = Object.fromEntries(scenarios.map((s) => [s.id, s.chatChecks]));

  const templateFailCount = scenarios.reduce(
    (n, s) => n + s.templateMessageChecks.filter((c) => !c.pass).length,
    0
  );
  const chatFailCount = scenarios.reduce((n, s) => n + s.chatChecks.filter((c) => !c.pass).length, 0);

  const lines: string[] = [];
  lines.push("# PayFair eval results");
  lines.push("");
  lines.push(`Generated ${new Date().toISOString()}. Runs with no API key -- see \`rubric.md\` for what each check means.`);
  lines.push("");

  // --- Summary, failures first ---
  lines.push("## Summary (failures first)");
  lines.push("");
  lines.push(
    `Template message checks: **${templateFailCount} failing** out of ${scenarios.length * scenarios[0].templateMessageChecks.length} across ${scenarios.length} scenarios.`
  );
  lines.push(
    `Chat fallback checks: **${chatFailCount} failing** out of ${scenarios.length * 6} across ${scenarios.length} scenarios x 6 questions.`
  );
  lines.push("");
  lines.push("### Message checks, worst first");
  lines.push(aggregateSummary(scenarioIds, templateMsgChecks, scenarios.length));
  lines.push("");
  lines.push("### Chat checks, worst first");
  lines.push(aggregateSummary(scenarioIds, chatChecksByScenario, scenarios.length));
  lines.push("");

  // --- Template path ---
  lines.push("## Template path");
  lines.push("");
  lines.push("### Message checks (scenario x check)");
  lines.push("");
  lines.push(checkTable(scenarioIds, templateMsgChecks));
  lines.push("");
  lines.push("### Chat checks (scenario x question)");
  lines.push("");
  lines.push(checkTable(scenarioIds, chatChecksByScenario));
  lines.push("");
  lines.push("### Generated messages and answers, per scenario");
  lines.push("");
  for (const s of scenarios) {
    lines.push(`#### \`${s.id}\``);
    lines.push("");
    lines.push(s.description);
    lines.push("");
    lines.push("**Drafted message (lead rung):**");
    lines.push("```");
    lines.push(s.templateMessage);
    lines.push("```");
    for (const c of s.templateMessageChecks) {
      lines.push(`- ${mark(c.pass)} — ${c.label}: ${c.detail}`);
    }
    lines.push("");
    lines.push("**Chat fallback answer (identical for all 6 questions, per the current implementation):**");
    lines.push("```");
    lines.push(s.chatAnswer);
    lines.push("```");
    for (const c of s.chatChecks) {
      lines.push(`- ${mark(c.pass)} — ${c.label}: ${c.detail}`);
    }
    lines.push("");
  }

  // --- LLM path ---
  lines.push("## LLM path (manual)");
  lines.push("");
  if (!llmImported) {
    lines.push("Not run.");
    lines.push("");
    lines.push(
      "To score externally-generated messages (e.g. pasted from a chat using the exported prompts in `eval/prompts/`), create `eval/llm-messages.json` as an array of `{ \"scenarioId\": string, \"message\": string }` and run:"
    );
    lines.push("");
    lines.push("```");
    lines.push("npm run eval -- --messages eval/llm-messages.json");
    lines.push("```");
  } else {
    lines.push("### Message checks (scenario x check)");
    lines.push("");
    const withLlm = scenarios.filter((s) => s.llmMessageChecks);
    if (withLlm.length === 0) {
      lines.push("`eval/llm-messages.json` was provided but contained no entries matching a known scenario ID.");
    } else {
      lines.push(checkTable(withLlm.map((s) => s.id), Object.fromEntries(withLlm.map((s) => [s.id, s.llmMessageChecks!]))));
      lines.push("");
      for (const s of withLlm) {
        lines.push(`#### \`${s.id}\``);
        lines.push("");
        lines.push("**Imported message:**");
        lines.push("```");
        lines.push(s.llmMessage!);
        lines.push("```");
        for (const c of s.llmMessageChecks!) {
          lines.push(`- ${mark(c.pass)} — ${c.label}: ${c.detail}`);
        }
        lines.push("");
      }
      const missing = scenarios.filter((s) => !s.llmMessageChecks).map((s) => s.id);
      if (missing.length > 0) {
        lines.push(`No imported message for: ${missing.map((id) => `\`${id}\``).join(", ")}.`);
        lines.push("");
      }
    }
  }
  lines.push("");

  // --- Failure modes ---
  lines.push("## Failure modes");
  lines.push("");
  lines.push(...failureModeNotes(scenarios));

  return lines.join("\n");
}

function failureModeNotes(scenarios: ScenarioReportData[]): string[] {
  const notes: string[] = [];

  const allDollarFail = scenarios.every((s) => !s.templateMessageChecks.find((c) => c.id === "dollarFigure")?.pass);
  if (allDollarFail) {
    notes.push(
      "- **`dollarFigure` fails on every scenario.** `buildMessageDraft` (the deterministic template) only ever states percentages (discount %, price-premium %) -- it never converts them to a dollar amount in the message body itself. The rubric requires a specific dollar figure, so the template categorically cannot pass this check as written today. The AI-drafted path (`buildDraftMessagePrompt`) is explicitly instructed to include one and is fed a ready-made dollar figure, so this is a template-specific gap, not a product-wide one. Not fixed here per instructions -- reported."
    );
  }

  const outOfScopeFail = scenarios.every((s) => !s.chatChecks.find((c) => c.id === "out-of-scope")?.pass);
  if (outOfScopeFail) {
    notes.push(
      '- **The out-of-scope chat check fails on every scenario.** The offline copilot fallback is `scenario.actionPlan.summary` -- a fixed string computed from the scenario alone, independent of the question asked. Ask it about the capital of France and it confidently restates the negotiation plan. It never recognizes a question is outside what it can answer. This is the most important finding in this eval: the fallback path has no query understanding at all, only scenario-to-summary mapping.'
    );
  }

  const financingFail = scenarios.every((s) => !s.chatChecks.find((c) => c.id === "financing-fallback")?.pass);
  if (financingFail) {
    notes.push(
      "- **The factoring-vs-discounting chat question fails on every scenario.** `actionPlan.summary` never includes the financing-fallback numbers (dynamic discounting ceiling, factoring cost) -- those are computed separately in `FinancingFallbackCard` / the server's scenario briefing for the *live* copilot, but not folded into the deterministic summary the offline fallback returns. A user asking about financing options offline gets an answer about the negotiation ladder instead."
    );
  }

  const concentrationScenario = scenarios.find((s) => s.id === "high-concentration-high-risk");
  if (concentrationScenario && !concentrationScenario.templateMessageChecks.find((c) => c.id === "adviceConsistency")?.pass) {
    notes.push(
      '- **`high-concentration-high-risk` fails `adviceConsistency`.** `buildActionPlan` always sets `leadRungIndex = 0` (the most aggressive opening ask), regardless of the break-even risk tier or how concentrated the buyer is. There is no signal anywhere in the engine for "this buyer is most of my revenue" -- `breakEvenRisk`\'s ratio is provably independent of `annualRevenueFromBuyer` (it cancels out algebraically; see `engine/tests/formulas.test.ts`), so revenue concentration cannot even be inferred from the risk ratio. The recommendation is exactly as aggressive for a buyer who is 90% of revenue as for one who is 5%.'
    );
  }

  const middleScenario = scenarios.find((s) => s.id === "no-workable-middle");
  if (middleScenario && !middleScenario.templateMessageChecks.find((c) => c.id === "termWithinWalkAway")?.pass) {
    notes.push(
      "- **`no-workable-middle` fails `termWithinWalkAway`.** When the cash buffer is thin enough that even the supplier's own opening ask exceeds the walk-away line, the lead recommendation still proposes that opening-ask term -- there is no rung that is genuinely safe, and the system has no \"none of these are affordable, do not lead with a term at all\" branch. It picks the least-bad option and presents it the same way it would present a comfortable one."
    );
  }

  const fastScenario = scenarios.find((s) => s.id === "buyer-already-fast");
  if (fastScenario && !fastScenario.templateMessageChecks.find((c) => c.id === "offersSomething")?.pass) {
    notes.push(
      '- **`buyer-already-fast` fails `offersSomething`.** When the buyer\'s ask already equals the supplier\'s opening ask, there are zero "days early" to price a discount against, so the template has nothing to offer and says so implicitly by omission. The rubric still marks this a failure since the message asks for a term without offering anything in return -- arguably correct behavior given there\'s nothing left to concede, but worth a human read rather than trusting the checkbox.'
    );
  }

  if (notes.length === 0) {
    notes.push("- No systemic failure patterns detected across all scenarios.");
  }

  return notes;
}
