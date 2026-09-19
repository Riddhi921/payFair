# PayFair eval results

Generated 2026-09-19T16:39:45.598Z. Runs with no API key -- see `rubric.md` for what each check means.

## Summary (failures first)

Template message checks: **14 failing** out of 60 across 10 scenarios.
Chat fallback checks: **22 failing** out of 60 across 10 scenarios x 6 questions.

### Message checks, worst first
- **1. Specific dollar figure matching the engine**: 0/10 scenarios pass  ⚠️
- **3. Offers the buyer something in return**: 8/10 scenarios pass  ⚠️
- **2. Proposed term at or inside the walk-away line**: 9/10 scenarios pass  ⚠️
- **Advice consistent with the break-even check**: 9/10 scenarios pass  ⚠️
- **4. Polite tone, no ultimatums**: 10/10 scenarios pass
- **5. Under ~150 words**: 10/10 scenarios pass

### Chat checks, worst first
- **Q5 "Factoring vs. discounting cost?" answers with real numbers**: 0/10 scenarios pass  ⚠️
- **Q6 "Capital of France?" (no answer in context) admits it doesn't know**: 0/10 scenarios pass  ⚠️
- **Q4 "Should I offer a discount?" mentions a percentage**: 8/10 scenarios pass  ⚠️
- **Q1 "What should I do next?" names a specific term**: 10/10 scenarios pass
- **Q2 "Will the buyer accept?" refuses to predict**: 10/10 scenarios pass
- **Q3 "What's my walk-away term?" states it explicitly**: 10/10 scenarios pass

## Template path

### Message checks (scenario x check)

| Scenario | dollarFigure | termWithinWalkAway | offersSomething | tone | wordCount | adviceConsistency |
|---|---|---|---|---|---|---|
| `cascade-baseline` | ❌ FAIL | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass |
| `meridian-marginal` | ❌ FAIL | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass |
| `harbor-baseline` | ❌ FAIL | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass |
| `ironclad-baseline` | ❌ FAIL | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass |
| `no-workable-middle` | ❌ FAIL | ❌ FAIL | ✅ pass | ✅ pass | ✅ pass | ✅ pass |
| `empty-discount-band` | ❌ FAIL | ✅ pass | ❌ FAIL | ✅ pass | ✅ pass | ✅ pass |
| `high-concentration-high-risk` | ❌ FAIL | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ❌ FAIL |
| `buyer-already-fast` | ❌ FAIL | ✅ pass | ❌ FAIL | ✅ pass | ✅ pass | ✅ pass |
| `tiny-invoice` | ❌ FAIL | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass |
| `cash-rich-supplier` | ❌ FAIL | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ✅ pass |

### Chat checks (scenario x question)

| Scenario | next-step | will-accept | walk-away | discount-question | financing-fallback | out-of-scope |
|---|---|---|---|---|---|---|
| `cascade-baseline` | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ❌ FAIL | ❌ FAIL |
| `meridian-marginal` | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ❌ FAIL | ❌ FAIL |
| `harbor-baseline` | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ❌ FAIL | ❌ FAIL |
| `ironclad-baseline` | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ❌ FAIL | ❌ FAIL |
| `no-workable-middle` | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ❌ FAIL | ❌ FAIL |
| `empty-discount-band` | ✅ pass | ✅ pass | ✅ pass | ❌ FAIL | ❌ FAIL | ❌ FAIL |
| `high-concentration-high-risk` | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ❌ FAIL | ❌ FAIL |
| `buyer-already-fast` | ✅ pass | ✅ pass | ✅ pass | ❌ FAIL | ❌ FAIL | ❌ FAIL |
| `tiny-invoice` | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ❌ FAIL | ❌ FAIL |
| `cash-rich-supplier` | ✅ pass | ✅ pass | ✅ pass | ✅ pass | ❌ FAIL | ❌ FAIL |

### Generated messages and answers, per scenario

#### `cascade-baseline`

Normal case. Walk-away (169d) sits well past the buyer's ask (90d) -- fully affordable, no strain.

**Drafted message (lead rung):**
```
Hi Highline Auto Systems team,

As we lock in terms for the next cycle, we'd like to propose Net 30 in place of Net 90.

To make that easy on your end, we're glad to offer a 1.37% discount for payment within 60 days of the invoice date.

This keeps things predictable on both sides and shouldn't meaningfully change your payables process.
Let me know if you'd like to walk through it.

Best,
[Your name]
Cascade Precision Parts
```
- ❌ FAIL — 1. Specific dollar figure matching the engine: No dollar figure ($N) found anywhere in the message.
- ✅ pass — 2. Proposed term at or inside the walk-away line: Message proposes Net 30; walk-away is Net 169.
- ✅ pass — 3. Offers the buyer something in return: Mentions a percentage discount.
- ✅ pass — 4. Polite tone, no ultimatums: No banned phrases found.
- ✅ pass — 5. Under ~150 words: 78 words (limit 155).
- ✅ pass — Advice consistent with the break-even check: Risk tier is "good" -- leading with the opening ask is fine.

**Chat fallback answer (identical for all 6 questions, per the current implementation):**
```
Lead with Net 30 with a 1.37% early-pay discount as the incentive. If they push back, you can concede to Net 169 (costs $5,116 to carry) and stay safe. Highline Auto Systems's own ask of Net 90 is already affordable outright, so there's no hard wall here -- but opening lower still saves real money. On profitability: Financing this term is cheap relative to what the relationship earns. Pushing is optional here, not urgent -- accepting and financing around it is a fine outcome.
```
- ✅ pass — Q1 "What should I do next?" names a specific term: Answer names a Net-N term.
- ✅ pass — Q2 "Will the buyer accept?" refuses to predict: Answer does not predict acceptance.
- ✅ pass — Q3 "What's my walk-away term?" states it explicitly: Answer states the walk-away term.
- ✅ pass — Q4 "Should I offer a discount?" mentions a percentage: Answer mentions a percentage.
- ❌ FAIL — Q5 "Factoring vs. discounting cost?" answers with real numbers: Answer does not mention factoring or dynamic discounting at all.
- ❌ FAIL — Q6 "Capital of France?" (no answer in context) admits it doesn't know: Answer does not acknowledge the question is out of scope -- it just restates the action plan regardless of what was asked.

#### `meridian-marginal`

Marginal case. Walk-away (56d) sits just under the buyer's ask (60d) -- a genuine close call, not a dramatic breach.

**Drafted message (lead rung):**
```
Hi Northfield Retail Group team,

As we lock in terms for the next cycle, we'd like to propose Net 15 in place of Net 60.

To make that easy on your end, we're glad to offer a 0.91% discount for payment within 45 days of the invoice date.

This keeps things predictable on both sides and shouldn't meaningfully change your payables process.
Let me know if you'd like to walk through it.

Best,
[Your name]
Meridian Ops Consulting
```
- ❌ FAIL — 1. Specific dollar figure matching the engine: No dollar figure ($N) found anywhere in the message.
- ✅ pass — 2. Proposed term at or inside the walk-away line: Message proposes Net 15; walk-away is Net 56.
- ✅ pass — 3. Offers the buyer something in return: Mentions a percentage discount.
- ✅ pass — 4. Polite tone, no ultimatums: No banned phrases found.
- ✅ pass — 5. Under ~150 words: 78 words (limit 155).
- ✅ pass — Advice consistent with the break-even check: Risk tier is "good" -- leading with the opening ask is fine.

**Chat fallback answer (identical for all 6 questions, per the current implementation):**
```
Lead with Net 15 with a 0.91% early-pay discount as the incentive. If they push back, you can concede to Net 56 (costs $540 to carry) and stay safe. Don't go past Net 56 without adding a deposit or price premium to cover the gap -- that's the point your cash buffer runs out before this invoice would be paid. That cash-timing wall is separate from profitability, though: Financing this term is cheap relative to what the relationship earns. Pushing is optional here, not urgent -- accepting and financing around it is a fine outcome.
```
- ✅ pass — Q1 "What should I do next?" names a specific term: Answer names a Net-N term.
- ✅ pass — Q2 "Will the buyer accept?" refuses to predict: Answer does not predict acceptance.
- ✅ pass — Q3 "What's my walk-away term?" states it explicitly: Answer states the walk-away term.
- ✅ pass — Q4 "Should I offer a discount?" mentions a percentage: Answer mentions a percentage.
- ❌ FAIL — Q5 "Factoring vs. discounting cost?" answers with real numbers: Answer does not mention factoring or dynamic discounting at all.
- ❌ FAIL — Q6 "Capital of France?" (no answer in context) admits it doesn't know: Answer does not acknowledge the question is out of scope -- it just restates the action plan regardless of what was asked.

#### `harbor-baseline`

Normal case for the fastest-cycle archetype. Other buyers' revenue nearly covers fixed costs, so walk-away is capped at the model's 180-day ceiling.

**Drafted message (lead rung):**
```
Hi Union Hardware Retail team,

As we lock in terms for the next cycle, we'd like to propose Net 15 in place of Net 60.

To make that easy on your end, we're glad to offer a 0.85% discount for payment within 45 days of the invoice date.

This keeps things predictable on both sides and shouldn't meaningfully change your payables process.
Let me know if you'd like to walk through it.

Best,
[Your name]
Harbor Point Distribution
```
- ❌ FAIL — 1. Specific dollar figure matching the engine: No dollar figure ($N) found anywhere in the message.
- ✅ pass — 2. Proposed term at or inside the walk-away line: Message proposes Net 15; walk-away is Net 180.
- ✅ pass — 3. Offers the buyer something in return: Mentions a percentage discount.
- ✅ pass — 4. Polite tone, no ultimatums: No banned phrases found.
- ✅ pass — 5. Under ~150 words: 78 words (limit 155).
- ✅ pass — Advice consistent with the break-even check: Risk tier is "good" -- leading with the opening ask is fine.

**Chat fallback answer (identical for all 6 questions, per the current implementation):**
```
Lead with Net 15 with a 0.85% early-pay discount as the incentive. If they push back, you can concede to Net 180 (costs $7,397 to carry) and stay safe. Union Hardware Retail's own ask of Net 60 is already affordable outright, so there's no hard wall here -- but opening lower still saves real money. On profitability: Financing this term is cheap relative to what the relationship earns. Pushing is optional here, not urgent -- accepting and financing around it is a fine outcome.
```
- ✅ pass — Q1 "What should I do next?" names a specific term: Answer names a Net-N term.
- ✅ pass — Q2 "Will the buyer accept?" refuses to predict: Answer does not predict acceptance.
- ✅ pass — Q3 "What's my walk-away term?" states it explicitly: Answer states the walk-away term.
- ✅ pass — Q4 "Should I offer a discount?" mentions a percentage: Answer mentions a percentage.
- ❌ FAIL — Q5 "Factoring vs. discounting cost?" answers with real numbers: Answer does not mention factoring or dynamic discounting at all.
- ❌ FAIL — Q6 "Capital of France?" (no answer in context) admits it doesn't know: Answer does not acknowledge the question is out of scope -- it just restates the action plan regardless of what was asked.

#### `ironclad-baseline`

Flagship binding case. Walk-away (39d) is well short of the buyer's ask (100d) -- the archetype with the longest realized DSO in the research is also the one the model flags as most cash-strained.

**Drafted message (lead rung):**
```
Hi Summit General Contractors team,

As we lock in terms for the next cycle, we'd like to propose Net 30 in place of Net 100.

To make that easy on your end, we're glad to offer a 1.78% discount for payment within 70 days of the invoice date.

This keeps things predictable on both sides and shouldn't meaningfully change your payables process.
Let me know if you'd like to walk through it.

Best,
[Your name]
Ironclad Electrical Subcontracting
```
- ❌ FAIL — 1. Specific dollar figure matching the engine: No dollar figure ($N) found anywhere in the message.
- ✅ pass — 2. Proposed term at or inside the walk-away line: Message proposes Net 30; walk-away is Net 39.
- ✅ pass — 3. Offers the buyer something in return: Mentions a percentage discount.
- ✅ pass — 4. Polite tone, no ultimatums: No banned phrases found.
- ✅ pass — 5. Under ~150 words: 78 words (limit 155).
- ✅ pass — Advice consistent with the break-even check: Risk tier is "good" -- leading with the opening ask is fine.

**Chat fallback answer (identical for all 6 questions, per the current implementation):**
```
Lead with Net 30 with a 1.78% early-pay discount as the incentive. If they push back, you can concede to Net 39 (costs $1,122 to carry) and stay safe. Don't go past Net 39 without adding a deposit or price premium to cover the gap -- that's the point your cash buffer runs out before this invoice would be paid. That cash-timing wall is separate from profitability, though: Financing this term is cheap relative to what the relationship earns. Pushing is optional here, not urgent -- accepting and financing around it is a fine outcome.
```
- ✅ pass — Q1 "What should I do next?" names a specific term: Answer names a Net-N term.
- ✅ pass — Q2 "Will the buyer accept?" refuses to predict: Answer does not predict acceptance.
- ✅ pass — Q3 "What's my walk-away term?" states it explicitly: Answer states the walk-away term.
- ✅ pass — Q4 "Should I offer a discount?" mentions a percentage: Answer mentions a percentage.
- ❌ FAIL — Q5 "Factoring vs. discounting cost?" answers with real numbers: Answer does not mention factoring or dynamic discounting at all.
- ❌ FAIL — Q6 "Capital of France?" (no answer in context) admits it doesn't know: Answer does not acknowledge the question is out of scope -- it just restates the action plan regardless of what was asked.

#### `no-workable-middle`

EDGE CASE: cash buffer slashed to $5,000. Walk-away collapses to ~5 days -- even the supplier's own opening ask (Net 30) is already past it. There is no rung on the ladder that is genuinely safe; the lead recommendation itself proposes a term the business can't actually carry.

**Drafted message (lead rung):**
```
Hi Summit General Contractors team,

As we lock in terms for the next cycle, we'd like to propose Net 30 in place of Net 100.

To make that easy on your end, we're glad to offer a 1.78% discount for payment within 70 days of the invoice date.

We'd also propose a small adjustment -- roughly 1.03%, or a deposit of about that amount at signing -- to smooth the transition on our side. Happy to structure it however works best for your team.

This keeps things predictable on both sides and shouldn't meaningfully change your payables process.
Let me know if you'd like to walk through it.

Best,
[Your name]
Ironclad Electrical Subcontracting
```
- ❌ FAIL — 1. Specific dollar figure matching the engine: No dollar figure ($N) found anywhere in the message.
- ❌ FAIL — 2. Proposed term at or inside the walk-away line: Message proposes Net 30; walk-away is Net 5.
- ✅ pass — 3. Offers the buyer something in return: Mentions a percentage discount.
- ✅ pass — 4. Polite tone, no ultimatums: No banned phrases found.
- ✅ pass — 5. Under ~150 words: 114 words (limit 155).
- ✅ pass — Advice consistent with the break-even check: Risk tier is "good" -- leading with the opening ask is fine.

**Chat fallback answer (identical for all 6 questions, per the current implementation):**
```
Lead with Net 30 with a 1.78% early-pay discount as the incentive. If they push back, you can concede to Net 5 (costs $144 to carry) and stay safe. Don't go past Net 5 without adding a deposit or price premium to cover the gap -- that's the point your cash buffer runs out before this invoice would be paid. That cash-timing wall is separate from profitability, though: Financing this term is cheap relative to what the relationship earns. Pushing is optional here, not urgent -- accepting and financing around it is a fine outcome.
```
- ✅ pass — Q1 "What should I do next?" names a specific term: Answer names a Net-N term.
- ✅ pass — Q2 "Will the buyer accept?" refuses to predict: Answer does not predict acceptance.
- ✅ pass — Q3 "What's my walk-away term?" states it explicitly: Answer states the walk-away term.
- ✅ pass — Q4 "Should I offer a discount?" mentions a percentage: Answer mentions a percentage.
- ❌ FAIL — Q5 "Factoring vs. discounting cost?" answers with real numbers: Answer does not mention factoring or dynamic discounting at all.
- ❌ FAIL — Q6 "Capital of France?" (no answer in context) admits it doesn't know: Answer does not acknowledge the question is out of scope -- it just restates the action plan regardless of what was asked.

#### `empty-discount-band`

EDGE CASE: buyer's assumed return on cash (35%) is set far above the supplier's cost of capital (10%). Since the ceiling/floor bands share the same formula shape, the buyer's floor discount exceeds the supplier's ceiling discount at every rung -- no early-pay discount is ever feasible.

**Drafted message (lead rung):**
```
Hi Coastal Builders Supply team,

As we lock in terms for the next cycle, we'd like to propose Net 15 in place of Net 45.

This keeps things predictable on both sides and shouldn't meaningfully change your payables process.
Let me know if you'd like to walk through it.

Best,
[Your name]
Harbor Point Distribution
```
- ❌ FAIL — 1. Specific dollar figure matching the engine: No dollar figure ($N) found anywhere in the message.
- ✅ pass — 2. Proposed term at or inside the walk-away line: Message proposes Net 15; walk-away is unlimited.
- ❌ FAIL — 3. Offers the buyer something in return: Proposes a shorter term but offers nothing in exchange.
- ✅ pass — 4. Polite tone, no ultimatums: No banned phrases found.
- ✅ pass — 5. Under ~150 words: 55 words (limit 155).
- ✅ pass — Advice consistent with the break-even check: Risk tier is "good" -- leading with the opening ask is fine.

**Chat fallback answer (identical for all 6 questions, per the current implementation):**
```
Lead with Net 15. If they push back, you can concede to Net 180 (costs $4,685 to carry) and stay safe. Coastal Builders Supply's own ask of Net 45 is already affordable outright, so there's no hard wall here -- but opening lower still saves real money. On profitability: Financing this term is cheap relative to what the relationship earns. Pushing is optional here, not urgent -- accepting and financing around it is a fine outcome.
```
- ✅ pass — Q1 "What should I do next?" names a specific term: Answer names a Net-N term.
- ✅ pass — Q2 "Will the buyer accept?" refuses to predict: Answer does not predict acceptance.
- ✅ pass — Q3 "What's my walk-away term?" states it explicitly: Answer states the walk-away term.
- ❌ FAIL — Q4 "Should I offer a discount?" mentions a percentage: Answer does not mention any percentage.
- ❌ FAIL — Q5 "Factoring vs. discounting cost?" answers with real numbers: Answer does not mention factoring or dynamic discounting at all.
- ❌ FAIL — Q6 "Capital of France?" (no answer in context) admits it doesn't know: Answer does not acknowledge the question is out of scope -- it just restates the action plan regardless of what was asked.

#### `high-concentration-high-risk`

EDGE CASE: this buyer is inflated to dominate the supplier's revenue (300000/mo vs ~58000/mo from everyone else combined) on a thin-margin engagement (2% margin) with an unusually long ask (200d). Break-even risk breaches 100% of annual gross profit. Tests whether the recommendation becomes more cautious for a buyer the business can't afford to lose -- expected finding: it does not, because the engine has no concentration-awareness signal at all.

**Drafted message (lead rung):**
```
Hi Petra Logistics team,

As we lock in terms for the next cycle, we'd like to propose Net 15 in place of Net 200.

To make that easy on your end, we're glad to offer a 3.63% discount for payment within 185 days of the invoice date.

This keeps things predictable on both sides and shouldn't meaningfully change your payables process.
Let me know if you'd like to walk through it.

Best,
[Your name]
Meridian Ops Consulting
```
- ❌ FAIL — 1. Specific dollar figure matching the engine: No dollar figure ($N) found anywhere in the message.
- ✅ pass — 2. Proposed term at or inside the walk-away line: Message proposes Net 15; walk-away is Net 162.
- ✅ pass — 3. Offers the buyer something in return: Mentions a percentage discount.
- ✅ pass — 4. Polite tone, no ultimatums: No banned phrases found.
- ✅ pass — 5. Under ~150 words: 77 words (limit 155).
- ❌ FAIL — Advice consistent with the break-even check: Risk tier is "bad" (financing this term breaches the buyer's annual gross profit) but the plan still leads with the most aggressive opening ask -- the recommendation does not become more cautious as risk rises.

**Chat fallback answer (identical for all 6 questions, per the current implementation):**
```
Lead with Net 15 with a 3.63% early-pay discount as the incentive. If they push back, you can concede to Net 162 (costs $14,647 to carry) and stay safe. Don't go past Net 162 without adding a deposit or price premium to cover the gap -- that's the point your cash buffer runs out before this invoice would be paid. On top of the cash-timing problem: Financing this term for a year costs more than the relationship earns. Accepting it as-is likely isn't sustainable -- push hard, restructure the deal, or reconsider the account.
```
- ✅ pass — Q1 "What should I do next?" names a specific term: Answer names a Net-N term.
- ✅ pass — Q2 "Will the buyer accept?" refuses to predict: Answer does not predict acceptance.
- ✅ pass — Q3 "What's my walk-away term?" states it explicitly: Answer states the walk-away term.
- ✅ pass — Q4 "Should I offer a discount?" mentions a percentage: Answer mentions a percentage.
- ❌ FAIL — Q5 "Factoring vs. discounting cost?" answers with real numbers: Answer does not mention factoring or dynamic discounting at all.
- ❌ FAIL — Q6 "Capital of France?" (no answer in context) admits it doesn't know: Answer does not acknowledge the question is out of scope -- it just restates the action plan regardless of what was asked.

#### `buyer-already-fast`

EDGE CASE: buyer's ask (Net 30) is overridden down to match the supplier's own opening ask exactly, and they historically pay 5 days EARLY. There is no room to ask for anything shorter -- zero days-early exist to price a discount against.

**Drafted message (lead rung):**
```
Hi Brightline Builders team,

As we lock in terms for the next cycle, we'd like to propose Net 30 in place of Net 30.

This keeps things predictable on both sides and shouldn't meaningfully change your payables process.
Let me know if you'd like to walk through it.

Best,
[Your name]
Ironclad Electrical Subcontracting
```
- ❌ FAIL — 1. Specific dollar figure matching the engine: No dollar figure ($N) found anywhere in the message.
- ✅ pass — 2. Proposed term at or inside the walk-away line: Message proposes Net 30; walk-away is unlimited.
- ❌ FAIL — 3. Offers the buyer something in return: Proposes a shorter term but offers nothing in exchange.
- ✅ pass — 4. Polite tone, no ultimatums: No banned phrases found.
- ✅ pass — 5. Under ~150 words: 54 words (limit 155).
- ✅ pass — Advice consistent with the break-even check: Risk tier is "good" -- leading with the opening ask is fine.

**Chat fallback answer (identical for all 6 questions, per the current implementation):**
```
Lead with Net 30. If they push back, you can concede to Net 180 (costs $2,219 to carry) and stay safe. Brightline Builders's own ask of Net 30 is already affordable outright, so there's no hard wall here -- but opening lower still saves real money. On profitability: Financing this term is cheap relative to what the relationship earns. Pushing is optional here, not urgent -- accepting and financing around it is a fine outcome.
```
- ✅ pass — Q1 "What should I do next?" names a specific term: Answer names a Net-N term.
- ✅ pass — Q2 "Will the buyer accept?" refuses to predict: Answer does not predict acceptance.
- ✅ pass — Q3 "What's my walk-away term?" states it explicitly: Answer states the walk-away term.
- ❌ FAIL — Q4 "Should I offer a discount?" mentions a percentage: Answer does not mention any percentage.
- ❌ FAIL — Q5 "Factoring vs. discounting cost?" answers with real numbers: Answer does not mention factoring or dynamic discounting at all.
- ❌ FAIL — Q6 "Capital of France?" (no answer in context) admits it doesn't know: Answer does not acknowledge the question is out of scope -- it just restates the action plan regardless of what was asked.

#### `tiny-invoice`

EDGE CASE: invoice size shrunk to $500/mo. Stress-tests rounding: dollar figures on discounts and carrying cost round to single dollars or cents, where a template's phrasing ('roughly $X') can look silly or vanish to $0.

**Drafted message (lead rung):**
```
Hi Ashford Health Systems team,

As we lock in terms for the next cycle, we'd like to propose Net 15 in place of Net 45.

To make that easy on your end, we're glad to offer a 0.57% discount for payment within 30 days of the invoice date.

This keeps things predictable on both sides and shouldn't meaningfully change your payables process.
Let me know if you'd like to walk through it.

Best,
[Your name]
Meridian Ops Consulting
```
- ❌ FAIL — 1. Specific dollar figure matching the engine: No dollar figure ($N) found anywhere in the message.
- ✅ pass — 2. Proposed term at or inside the walk-away line: Message proposes Net 15; walk-away is Net 77.
- ✅ pass — 3. Offers the buyer something in return: Mentions a percentage discount.
- ✅ pass — 4. Polite tone, no ultimatums: No banned phrases found.
- ✅ pass — 5. Under ~150 words: 78 words (limit 155).
- ✅ pass — Advice consistent with the break-even check: Risk tier is "good" -- leading with the opening ask is fine.

**Chat fallback answer (identical for all 6 questions, per the current implementation):**
```
Lead with Net 15 with a 0.57% early-pay discount as the incentive. If they push back, you can concede to Net 77 (costs $12 to carry) and stay safe. Ashford Health Systems's own ask of Net 45 is already affordable outright, so there's no hard wall here -- but opening lower still saves real money. On profitability: Financing this term is cheap relative to what the relationship earns. Pushing is optional here, not urgent -- accepting and financing around it is a fine outcome.
```
- ✅ pass — Q1 "What should I do next?" names a specific term: Answer names a Net-N term.
- ✅ pass — Q2 "Will the buyer accept?" refuses to predict: Answer does not predict acceptance.
- ✅ pass — Q3 "What's my walk-away term?" states it explicitly: Answer states the walk-away term.
- ✅ pass — Q4 "Should I offer a discount?" mentions a percentage: Answer mentions a percentage.
- ❌ FAIL — Q5 "Factoring vs. discounting cost?" answers with real numbers: Answer does not mention factoring or dynamic discounting at all.
- ❌ FAIL — Q6 "Capital of France?" (no answer in context) admits it doesn't know: Answer does not acknowledge the question is out of scope -- it just restates the action plan regardless of what was asked.

#### `cash-rich-supplier`

Same relationship as ironclad-baseline and no-workable-middle, cash buffer raised to $2M. Walk-away is capped at the model's 180-day ceiling -- fully affordable despite being the archetype the research flags as most cash-strained. Deliberately the same pair as the other two Ironclad scenarios, isolating cash buffer as the only variable.

**Drafted message (lead rung):**
```
Hi Summit General Contractors team,

As we lock in terms for the next cycle, we'd like to propose Net 30 in place of Net 100.

To make that easy on your end, we're glad to offer a 1.78% discount for payment within 70 days of the invoice date.

This keeps things predictable on both sides and shouldn't meaningfully change your payables process.
Let me know if you'd like to walk through it.

Best,
[Your name]
Ironclad Electrical Subcontracting
```
- ❌ FAIL — 1. Specific dollar figure matching the engine: No dollar figure ($N) found anywhere in the message.
- ✅ pass — 2. Proposed term at or inside the walk-away line: Message proposes Net 30; walk-away is Net 180.
- ✅ pass — 3. Offers the buyer something in return: Mentions a percentage discount.
- ✅ pass — 4. Polite tone, no ultimatums: No banned phrases found.
- ✅ pass — 5. Under ~150 words: 78 words (limit 155).
- ✅ pass — Advice consistent with the break-even check: Risk tier is "good" -- leading with the opening ask is fine.

**Chat fallback answer (identical for all 6 questions, per the current implementation):**
```
Lead with Net 30 with a 1.78% early-pay discount as the incentive. If they push back, you can concede to Net 180 (costs $5,178 to carry) and stay safe. Summit General Contractors's own ask of Net 100 is already affordable outright, so there's no hard wall here -- but opening lower still saves real money. On profitability: Financing this term is cheap relative to what the relationship earns. Pushing is optional here, not urgent -- accepting and financing around it is a fine outcome.
```
- ✅ pass — Q1 "What should I do next?" names a specific term: Answer names a Net-N term.
- ✅ pass — Q2 "Will the buyer accept?" refuses to predict: Answer does not predict acceptance.
- ✅ pass — Q3 "What's my walk-away term?" states it explicitly: Answer states the walk-away term.
- ✅ pass — Q4 "Should I offer a discount?" mentions a percentage: Answer mentions a percentage.
- ❌ FAIL — Q5 "Factoring vs. discounting cost?" answers with real numbers: Answer does not mention factoring or dynamic discounting at all.
- ❌ FAIL — Q6 "Capital of France?" (no answer in context) admits it doesn't know: Answer does not acknowledge the question is out of scope -- it just restates the action plan regardless of what was asked.

## LLM path (manual)

Not run.

To score externally-generated messages (e.g. pasted from a chat using the exported prompts in `eval/prompts/`), create `eval/llm-messages.json` as an array of `{ "scenarioId": string, "message": string }` and run:

```
npm run eval -- --messages eval/llm-messages.json
```

## Failure modes

- **`dollarFigure` fails on every scenario.** `buildMessageDraft` (the deterministic template) only ever states percentages (discount %, price-premium %) -- it never converts them to a dollar amount in the message body itself. The rubric requires a specific dollar figure, so the template categorically cannot pass this check as written today. The AI-drafted path (`buildDraftMessagePrompt`) is explicitly instructed to include one and is fed a ready-made dollar figure, so this is a template-specific gap, not a product-wide one. Not fixed here per instructions -- reported.
- **The out-of-scope chat check fails on every scenario.** The offline copilot fallback is `scenario.actionPlan.summary` -- a fixed string computed from the scenario alone, independent of the question asked. Ask it about the capital of France and it confidently restates the negotiation plan. It never recognizes a question is outside what it can answer. This is the most important finding in this eval: the fallback path has no query understanding at all, only scenario-to-summary mapping.
- **The factoring-vs-discounting chat question fails on every scenario.** `actionPlan.summary` never includes the financing-fallback numbers (dynamic discounting ceiling, factoring cost) -- those are computed separately in `FinancingFallbackCard` / the server's scenario briefing for the *live* copilot, but not folded into the deterministic summary the offline fallback returns. A user asking about financing options offline gets an answer about the negotiation ladder instead.
- **`high-concentration-high-risk` fails `adviceConsistency`.** `buildActionPlan` always sets `leadRungIndex = 0` (the most aggressive opening ask), regardless of the break-even risk tier or how concentrated the buyer is. There is no signal anywhere in the engine for "this buyer is most of my revenue" -- `breakEvenRisk`'s ratio is provably independent of `annualRevenueFromBuyer` (it cancels out algebraically; see `engine/tests/formulas.test.ts`), so revenue concentration cannot even be inferred from the risk ratio. The recommendation is exactly as aggressive for a buyer who is 90% of revenue as for one who is 5%.
- **`no-workable-middle` fails `termWithinWalkAway`.** When the cash buffer is thin enough that even the supplier's own opening ask exceeds the walk-away line, the lead recommendation still proposes that opening-ask term -- there is no rung that is genuinely safe, and the system has no "none of these are affordable, do not lead with a term at all" branch. It picks the least-bad option and presents it the same way it would present a comfortable one.
- **`buyer-already-fast` fails `offersSomething`.** When the buyer's ask already equals the supplier's opening ask, there are zero "days early" to price a discount against, so the template has nothing to offer and says so implicitly by omission. The rubric still marks this a failure since the message asks for a term without offering anything in return -- arguably correct behavior given there's nothing left to concede, but worth a human read rather than trusting the checkbox.