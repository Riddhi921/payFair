import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildCopilotSystemPrompt, buildDraftMessagePrompt, buildMessageDraft } from "@payfair/engine";
import { CHAT_QUESTIONS, runMessageChecks } from "./checks.js";
import { buildResultsMarkdown, type ScenarioReportData } from "./report.js";
import { loadScenarioDefs, resolveScenario } from "./scenarios.js";
import type { ImportedMessage } from "./types.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const EVAL_ROOT = path.join(here, "..");
const PROMPTS_DIR = path.join(EVAL_ROOT, "prompts");
const RESULTS_PATH = path.join(EVAL_ROOT, "results.md");

function parseArgs(argv: string[]): { messagesPath: string | null } {
  const idx = argv.indexOf("--messages");
  return { messagesPath: idx >= 0 ? argv[idx + 1] : null };
}

function loadImportedMessages(p: string | null): Map<string, string> {
  const map = new Map<string, string>();
  if (!p) return map;
  const resolved = path.isAbsolute(p) ? p : path.join(process.cwd(), p);
  if (!existsSync(resolved)) {
    console.warn(`[eval] --messages file not found: ${resolved} -- LLM path will report "Not run."`);
    return map;
  }
  const parsed = JSON.parse(readFileSync(resolved, "utf-8")) as ImportedMessage[];
  for (const entry of parsed) {
    if (!entry.scenarioId || typeof entry.message !== "string") {
      console.warn(`[eval] skipping malformed entry in ${p}:`, entry);
      continue;
    }
    map.set(entry.scenarioId, entry.message);
  }
  return map;
}

function main() {
  const { messagesPath } = parseArgs(process.argv.slice(2));
  const imported = loadImportedMessages(messagesPath);
  const llmImported = imported.size > 0;

  mkdirSync(PROMPTS_DIR, { recursive: true });

  const defs = loadScenarioDefs();
  const reportData: ScenarioReportData[] = [];

  defs.forEach((def, i) => {
    const resolved = resolveScenario(def);
    const { supplier, buyer, buyerAskDays, scenario } = resolved;
    const { walkAway, ladder, actionPlan } = scenario;
    const rung = ladder[actionPlan.leadRungIndex];

    // --- Template path ---
    const templateMessage = buildMessageDraft(supplier, buyer, rung, buyerAskDays);
    const templateMessageChecks = runMessageChecks(templateMessage, rung, buyer, walkAway, actionPlan);

    const chatAnswer = actionPlan.summary; // exactly what the server's offline fallback returns, for any question
    const chatChecks = CHAT_QUESTIONS.map((q) => q.check(chatAnswer, { walkAway }));

    // --- Export prompts for manual pasting ---
    const draftPrompt = buildDraftMessagePrompt(supplier, buyer, rung, buyerAskDays);
    const copilotSystem = buildCopilotSystemPrompt(
      supplier,
      buyer,
      buyerAskDays,
      resolved.costOfCapital,
      resolved.buyerReturnOnCash,
      scenario
    );
    const promptFile = [
      `SCENARIO: ${def.id}`,
      def.description,
      "",
      "=".repeat(78),
      "DRAFT-MESSAGE PROMPT (paste the system text as the system prompt, then send the user text as the message)",
      "=".repeat(78),
      "",
      "--- SYSTEM ---",
      draftPrompt.system,
      "",
      "--- USER ---",
      draftPrompt.user,
      "",
      "=".repeat(78),
      "COPILOT SYSTEM PROMPT (paste as the system prompt, then ask any of the 6 eval questions from rubric.md, or your own)",
      "=".repeat(78),
      "",
      copilotSystem,
      "",
    ].join("\n");
    writeFileSync(path.join(PROMPTS_DIR, `${i + 1}.txt`), promptFile, "utf-8");

    // --- LLM path (manual import) ---
    const llmMessage = imported.get(def.id);
    const llmMessageChecks = llmMessage
      ? runMessageChecks(llmMessage, rung, buyer, walkAway, actionPlan)
      : undefined;

    reportData.push({
      id: def.id,
      description: def.description,
      templateMessage,
      templateMessageChecks,
      chatAnswer,
      chatChecks,
      llmMessage,
      llmMessageChecks,
    });
  });

  const markdown = buildResultsMarkdown(reportData, llmImported);
  writeFileSync(RESULTS_PATH, markdown, "utf-8");

  // --- Console summary ---
  const totalMsgChecks = reportData.length * reportData[0].templateMessageChecks.length;
  const failedMsgChecks = reportData.reduce((n, s) => n + s.templateMessageChecks.filter((c) => !c.pass).length, 0);
  const totalChatChecks = reportData.length * 6;
  const failedChatChecks = reportData.reduce((n, s) => n + s.chatChecks.filter((c) => !c.pass).length, 0);

  console.log(`\nPayFair eval -- ${reportData.length} scenarios, no API key used.\n`);
  console.log(`Template message checks: ${totalMsgChecks - failedMsgChecks}/${totalMsgChecks} passed (${failedMsgChecks} failing)`);
  console.log(`Chat fallback checks:    ${totalChatChecks - failedChatChecks}/${totalChatChecks} passed (${failedChatChecks} failing)`);
  console.log(
    llmImported
      ? `LLM path: scored ${reportData.filter((s) => s.llmMessageChecks).length}/${reportData.length} imported messages`
      : "LLM path: not run (pass --messages <file> to score externally-generated messages)"
  );
  console.log(`\nFull report: ${path.relative(process.cwd(), RESULTS_PATH)}`);
  console.log(`Exported prompts: ${path.relative(process.cwd(), PROMPTS_DIR)}/1.txt .. ${reportData.length}.txt\n`);
}

main();
