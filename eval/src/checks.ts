import type { ActionPlan, BuyerProfile, LadderRung, WalkAwayResult } from "@payfair/engine";
import type { CheckResult } from "./types.js";

const WORD_LIMIT = 155; // rubric says "under ~150" -- small allowance for the tilde.

const BANNED_PHRASES = [
  "please pay faster",
  "or else",
  "final notice",
  "immediately",
  "asap",
  "failure to comply",
  "legal action",
  "no further extensions",
  "we will have no choice",
  "this is your final",
  "non-negotiable",
  "must pay",
];

function extractDollarFigures(message: string): number[] {
  return [...message.matchAll(/\$\s?([\d,]+(?:\.\d+)?)/g)].map((m) => Number(m[1].replace(/,/g, "")));
}

function extractProposedTerm(message: string): number | null {
  const m = message.match(/Net\s+(\d+)/i);
  return m ? Number(m[1]) : null;
}

// ---------------------------------------------------------------------------
// Message checks (rubric items 1-5)
// ---------------------------------------------------------------------------

export function checkDollarFigureMatchesEngine(
  message: string,
  rung: LadderRung,
  buyer: BuyerProfile
): CheckResult {
  const id = "dollarFigure";
  const label = "1. Specific dollar figure matching the engine";
  const found = extractDollarFigures(message);
  if (found.length === 0) {
    return { id, label, pass: false, detail: "No dollar figure ($N) found anywhere in the message." };
  }

  const candidates: { label: string; value: number }[] = [{ label: "carrying cost", value: rung.carryingCost }];
  if (rung.earlyPayDiscount?.feasible && rung.earlyPayDiscount.suggestedDiscountPct != null) {
    candidates.push({
      label: "discount dollar-equivalent",
      value: buyer.monthlyRevenue * rung.earlyPayDiscount.suggestedDiscountPct,
    });
  }
  if (rung.cashGapTrade) {
    candidates.push({ label: "cash-gap shortfall", value: rung.cashGapTrade.shortfallDollars });
  }

  const TOLERANCE = 1; // dollars
  const match = found
    .flatMap((f) => candidates.map((c) => ({ f, c, diff: Math.abs(f - c.value) })))
    .find((x) => x.diff <= TOLERANCE);

  if (match) {
    return {
      id,
      label,
      pass: true,
      detail: `Message states $${match.f}, matching engine's ${match.c.label} ($${match.c.value.toFixed(2)}).`,
    };
  }
  return {
    id,
    label,
    pass: false,
    detail: `Message states [${found.map((f) => `$${f}`).join(", ")}], none within $${TOLERANCE} of engine figures [${candidates
      .map((c) => `${c.label}=$${c.value.toFixed(2)}`)
      .join(", ")}].`,
  };
}

export function checkTermWithinWalkAway(message: string, walkAway: WalkAwayResult): CheckResult {
  const id = "termWithinWalkAway";
  const label = "2. Proposed term at or inside the walk-away line";
  const proposed = extractProposedTerm(message);
  if (proposed === null) {
    return { id, label, pass: false, detail: 'No "Net N" term found in the message.' };
  }
  const within = walkAway.unlimited || proposed <= walkAway.walkAwayDays;
  return {
    id,
    label,
    pass: within,
    detail: `Message proposes Net ${proposed}; walk-away is ${walkAway.unlimited ? "unlimited" : `Net ${walkAway.walkAwayDays}`}.`,
  };
}

export function checkOffersSomething(message: string): CheckResult {
  const id = "offersSomething";
  const label = "3. Offers the buyer something in return";
  const hasDiscount = /%/.test(message) && /discount/i.test(message);
  const hasAdjustment = /deposit|adjustment/i.test(message);
  const pass = hasDiscount || hasAdjustment;
  return {
    id,
    label,
    pass,
    detail: pass
      ? `Mentions ${hasDiscount ? "a percentage discount" : "a deposit/price adjustment"}.`
      : "Proposes a shorter term but offers nothing in exchange.",
  };
}

export function checkTone(message: string): CheckResult {
  const id = "tone";
  const label = "4. Polite tone, no ultimatums";
  const lower = message.toLowerCase();
  const hit = BANNED_PHRASES.find((p) => lower.includes(p));
  return {
    id,
    label,
    pass: !hit,
    detail: hit ? `Contains banned phrase: "${hit}".` : "No banned phrases found.",
  };
}

export function checkWordCount(message: string): CheckResult {
  const id = "wordCount";
  const label = "5. Under ~150 words";
  const words = message.trim().split(/\s+/).filter(Boolean).length;
  return { id, label, pass: words <= WORD_LIMIT, detail: `${words} words (limit ${WORD_LIMIT}).` };
}

/** Does the recommendation get more conservative as break-even risk rises? (Rubric: high-concentration case.) */
export function checkAdviceConsistency(plan: ActionPlan): CheckResult {
  const id = "adviceConsistency";
  const label = "Advice consistent with the break-even check";
  if (plan.risk.tier !== "bad") {
    return { id, label, pass: true, detail: `Risk tier is "${plan.risk.tier}" -- leading with the opening ask is fine.` };
  }
  const stillAggressive = plan.leadRungIndex === 0;
  return {
    id,
    label,
    pass: !stillAggressive,
    detail: stillAggressive
      ? 'Risk tier is "bad" (financing this term breaches the buyer\'s annual gross profit) but the plan still leads with the most aggressive opening ask -- the recommendation does not become more cautious as risk rises.'
      : "Plan avoids the most aggressive rung under high risk.",
  };
}

export function runMessageChecks(
  message: string,
  rung: LadderRung,
  buyer: BuyerProfile,
  walkAway: WalkAwayResult,
  plan: ActionPlan
): CheckResult[] {
  return [
    checkDollarFigureMatchesEngine(message, rung, buyer),
    checkTermWithinWalkAway(message, walkAway),
    checkOffersSomething(message),
    checkTone(message),
    checkWordCount(message),
    checkAdviceConsistency(plan),
  ];
}

// ---------------------------------------------------------------------------
// Chat / copilot checks -- run against the offline fallback answer, which is
// always the same actionPlan.summary regardless of the question asked.
// ---------------------------------------------------------------------------

export interface ChatQuestion {
  id: string;
  question: string;
  check: (answer: string, ctx: { walkAway: WalkAwayResult }) => CheckResult;
}

export const CHAT_QUESTIONS: ChatQuestion[] = [
  {
    id: "next-step",
    question: "What should I do next?",
    check: (answer) => {
      const pass = /Net\s+\d+/i.test(answer);
      return {
        id: "next-step",
        label: 'Q1 "What should I do next?" names a specific term',
        pass,
        detail: pass ? "Answer names a Net-N term." : "Answer does not name a specific term.",
      };
    },
  },
  {
    id: "will-accept",
    question: "Will the buyer accept this deal?",
    check: (answer) => {
      const predictive = /\b\d{1,3}\s*%\s*(chance|likely)|\bwill (definitely|certainly|probably|likely)?\s*accept\b|\blikely to accept\b/i.test(
        answer
      );
      return {
        id: "will-accept",
        label: 'Q2 "Will the buyer accept?" refuses to predict',
        pass: !predictive,
        detail: predictive ? "Answer contains acceptance-probability language." : "Answer does not predict acceptance.",
      };
    },
  },
  {
    id: "walk-away",
    question: "What's my walk-away term?",
    check: (answer, ctx) => {
      const pass = ctx.walkAway.unlimited
        ? /affordable outright|no hard wall|unlimited/i.test(answer)
        : answer.includes(`Net ${ctx.walkAway.walkAwayDays}`);
      return {
        id: "walk-away",
        label: 'Q3 "What\'s my walk-away term?" states it explicitly',
        pass,
        detail: pass ? "Answer states the walk-away term." : "Answer does not state the walk-away term explicitly.",
      };
    },
  },
  {
    id: "discount-question",
    question: "Should I offer the buyer an early-pay discount?",
    check: (answer) => {
      const pass = /%/.test(answer);
      return {
        id: "discount-question",
        label: 'Q4 "Should I offer a discount?" mentions a percentage',
        pass,
        detail: pass ? "Answer mentions a percentage." : "Answer does not mention any percentage.",
      };
    },
  },
  {
    id: "financing-fallback",
    question: "How much would factoring cost compared to dynamic discounting?",
    check: (answer) => {
      const pass = /factor|dynamic discount/i.test(answer) && /\$/.test(answer);
      return {
        id: "financing-fallback",
        label: 'Q5 "Factoring vs. discounting cost?" answers with real numbers',
        pass,
        detail: pass ? "Answer references financing-fallback figures." : "Answer does not mention factoring or dynamic discounting at all.",
      };
    },
  },
  {
    id: "out-of-scope",
    question: "What's the capital of France?",
    check: (answer) => {
      const pass = /don't know|do not know|not something i can|out of scope|no information|can'?t answer|cannot answer/i.test(
        answer
      );
      return {
        id: "out-of-scope",
        label: 'Q6 "Capital of France?" (no answer in context) admits it doesn\'t know',
        pass,
        detail: pass ? "Answer acknowledges it can't help." : "Answer does not acknowledge the question is out of scope -- it just restates the action plan regardless of what was asked.",
      };
    },
  },
];
