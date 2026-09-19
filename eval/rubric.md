# Message-drafting rubric

Applies to any drafted negotiation message — the deterministic template path or a manually-pasted LLM response. Automated checks in `src/checks.ts` implement each criterion below as literally as a regex/number comparison can; they're a floor, not a substitute for reading the actual message in `results.md`.

## A good message

| # | Criterion | Automated as |
|---|---|---|
| 1 | Includes a **specific dollar figure that matches the engine's own numbers** for that rung (carrying cost, discount-dollar-equivalent, or cash-gap shortfall) — not a vague estimate or a number the message invented. | Extract every `$N` in the message; pass if at least one is within $1 of an engine-computed candidate for that rung. |
| 2 | Proposes a **specific, realistic term** — a `Net N` days figure — **at or inside the walk-away line** the engine computed for this scenario. | Extract `Net N` from the message; pass if `N <= walkAwayDays` (or walk-away is unlimited). |
| 3 | **Offers the buyer something** in return — an early-pay discount, a deposit/price adjustment, or equivalent — not just a bare request. | Pass if the message mentions a `%` alongside "discount", or mentions "deposit"/"adjustment". |
| 4 | **Polite tone, no ultimatums.** Collaborative framing, no pressure tactics, no threats. | Pass if none of a banned-phrase list appears (see `src/checks.ts` — "immediately", "or else", "final notice", "legal action", "non-negotiable", etc.) |
| 5 | **Under ~150 words.** The "~" gets a small allowance in the automated check (155) since a hand-written or LLM message will rarely land on exactly 150. | Word count <= 155. |

## A bad message

- **Generic** — "please pay faster" with no term, no number, no offer.
- **An ultimatum** — "pay by Friday or we stop shipping," "this is non-negotiable," etc.
- **Proposes a term past the walk-away line** — asks for something the business can't actually afford to wait for.
- **Pushes hard on a high-concentration buyer** without acknowledging the relationship risk — see `high-concentration-high-risk` in `scenarios.json`. The rubric's position: when one buyer represents most of a supplier's revenue and/or the break-even check shows financing their term would breach annual gross profit, a message (and the recommendation behind it) that still leads with the most aggressive possible ask is a failure, regardless of how well-worded it is.

## What this eval does NOT grade

- **Persuasiveness or prose quality.** A message can pass every check and still read stiffly, or fail a check and still read fine. That's a human judgment call — see the actual generated text in `results.md`, not just the pass/fail grid.
- **Whether the buyer will actually agree.** Out of scope by product decision (see `/SPEC.md`) — no probability of acceptance is ever modeled, drafted, or graded.

## Chat / copilot rubric

The copilot's offline fallback (no API key) always returns the deterministic action-plan summary, regardless of the question asked. Six fixed questions probe whether that's an acceptable answer for each:

1. **"What should I do next?"** — should name a specific term. (Generic action-oriented question the summary is built for.)
2. **"Will the buyer accept this deal?"** — must **refuse to predict** acceptance. No percentages, no "likely to accept."
3. **"What's my walk-away term?"** — should state the walk-away term explicitly when one is binding.
4. **"Should I offer the buyer an early-pay discount?"** — should mention a percentage when a discount is feasible for the recommended rung.
5. **"How much would factoring cost compared to dynamic discounting?"** — out of scope for the summary text; expected to fail (see Failure modes in `results.md`).
6. **"What's the capital of France?"** — a question with **no answer anywhere in the scenario context**. A good answer says it doesn't know. Since the offline fallback is question-agnostic, it never does — expected to fail universally, and that failure is the most important finding this eval produces.
