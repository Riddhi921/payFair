# PayFair — Product Specification

Status: draft v1 · 2026-09-19
Source research: [`/research/payment-terms-research.html`](./research/payment-terms-research.html)

## Problem statement

Small and mid-sized US B2B suppliers usually accept Net-60/90 terms from large buyers because they need the business. They then absorb the working-capital cost by borrowing, factoring, or discounting — without knowing what the term actually costs them or what they could realistically ask for instead. Existing tools (C2FO, Taulia, FundThrough, eCapital, PrimeRevenue) help a supplier get paid faster on a term that's *already signed*. None of them help a supplier plan the term beforehand, or negotiate it, without risking the customer relationship.

## User

The owner, controller, or finance lead at a small or mid-sized US B2B supplier, facing a buyer who is asking for long payment terms.

## Solution

**PayFair is a payment-terms advisor**, not a financing product. Given a supplier's own obligations and a buyer's requested term, it produces five outputs:

1. **Cash gap + walk-away term** — the longest payment term the supplier can actually afford before it breaches its own cash buffer.
2. **Negotiation ladder** — a priced sequence of asks from opening position to walk-away line. Each rung carries a specific trade: an early-pay discount inside the supplier–buyer band, a deposit split, or a price premium.
3. **Relationship break-even check** — weighs the cost of pushing the negotiation against the cost of accepting the term and financing around it instead. It can recommend "don't push — accept and finance."
4. **Buyer-friendly message draft** — drafted text for whichever ladder rung the supplier chooses.
5. **Financing fallback comparison** — dynamic discounting vs. factoring, shown side by side, so accepting a long term isn't a dead end.

## Scope & hard constraints

| Constraint | Detail |
|---|---|
| Data | Synthetic seed data only — no real supplier or buyer data |
| Integration | No ERP connection |
| Auth | No login |
| Sending | Drafts messages; **never sends** them |
| Labeling | All output is explicitly labeled as simulated |
| Probabilities | Never invents a probability of buyer acceptance |

## Functional detail

### 1. Cash gap + walk-away term

**Inputs:** payables schedule, payroll obligations, cash buffer, cost of capital, gross margin, and the buyer's requested term.

**Logic:** model the supplier's cash conversion cycle to find the point at which the buyer's requested term would draw the cash buffer below a safety floor. The **walk-away term** is the longest term the supplier can sustain without breaching that floor — a hard, calculable number, not a negotiating trick.

### 2. Negotiation ladder

A small number of rungs (e.g., 3–5) between the supplier's opening ask and its walk-away term. Each rung specifies:
- The term being offered at that rung
- The $ cost or benefit of that rung relative to the buyer's original ask
- One attached trade: an early-pay discount priced *within* the supplier–buyer band (not copied from a generic dynamic-discounting rate), a deposit/split-payment structure, or a price premium that offsets the working-capital cost

### 3. Relationship break-even check

Compares two costs directly:
- **Cost of accepting** the buyer's requested term and financing the resulting gap (via dynamic discounting or factoring, using the corrected rate ranges in the research)
- **Cost of pushing** — expressed as a break-even question ("how much would this relationship have to be worth for pushing to not be worth it"), never as a probability-weighted expected value, since PayFair has no way to observe or predict actual buyer behavior from seed data

Output is advisory: it can say "the math favors accepting and financing around it" — the human still decides.

### 4. Buyer-friendly message draft

Plain-language message for the chosen rung, written to sound collaborative rather than adversarial. Draft only; no send capability exists in this scope.

### 5. Financing fallback comparison

Side-by-side dynamic discounting vs. factoring, using the corrected figures from the research brief (see below) — cost range, who holds the credit risk, advance rate, and whether it requires buyer opt-in.

## Data model (seed/synthetic only)

- **Supplier profile:** payables schedule, payroll cadence, cash buffer, cost of capital, gross margin
- **Buyer request:** requested term, invoice amount, qualitative relationship context (e.g., "strategic account," "new account") — never a numeric acceptance probability
- **Financing benchmarks:** dynamic discounting rate range (0.5–2%) and factoring rate range (1–5%/month), pulled from `/research`

## Explicit non-goals (this scope)

- No ERP integration
- No login / auth / multi-user accounts
- No sending of drafted messages
- No modeling or display of buyer-acceptance probability
- No live/real customer or accounting data

## Key product decisions (for the case study)

**US market over India.** The research base — net-terms norms, DSO benchmarks, dynamic-discounting/factoring players (C2FO, Taulia, FundThrough, eCapital), and the academic literature on buyer–supplier bargaining power — is US-specific and well documented. Building for the US market keeps the product grounded in real, sourced numbers rather than extrapolated ones.

**From message writer to term advisor.** A tool that only drafts a "please pay us faster" email doesn't help a supplier know what to ask for, or what it can afford to concede. The actual decision-support value is the cash-gap analysis and the priced ladder; the message draft is just the last-mile output of that decision, not the product itself.

**No invented acceptance probabilities.** PayFair cannot observe or reliably predict how a specific buyer will respond to a specific ask from seed data alone. Presenting a fabricated probability (e.g., "68% likely to accept") would manufacture false confidence. Instead, the relationship break-even check reframes the decision as a break-even question and leaves the judgment call to the human who actually knows the relationship.

**Seed data labeled as synthetic.** With no ERP and no login, every supplier and buyer profile in the product is fabricated but realistic. Every screen must say so explicitly, so demo output is never mistaken for real financial advice on real numbers.

## Research corrections applied (2026-09-19)

Three errors were found and fixed in `/research/payment-terms-research.html`:

1. **Annualized discount-rate example.** The page previously claimed a 2% discount for 20 days early is ~36% annualized on Net 30 terms but only ~14–15% on Net 60 terms. That's wrong — the annualized-rate formula (`d/(1-d) × 365/days accelerated`) depends only on the discount and the number of days paid early, not on the length of the underlying term. Corrected: 2% for 20 days early is ~37% annualized regardless of whether the base term is Net 30 or Net 60.
2. **Murfin & Njoroge "6x" interest-rate gap.** Previously presented as if it applied broadly to small suppliers vs. large buyers. It's specific to that study's sample — 40 major public retail buyers (big-box-scale) and their suppliers — and is now labeled as such everywhere it appears (dashboard tile, negotiation section, research Q&A).
3. **C2FO 5.82% vs. ~65% online-lender APR comparison.** Removed as a headline stat. The two numbers price different products and different risk; presenting them side by side implied a like-for-like comparison that isn't accurate.

## Open questions / next steps

- Exact input fields and validation for the supplier-profile form
- Ladder rung-pricing algorithm (how many rungs, how trade values are computed)
- What qualitative relationship-context inputs the break-even check accepts, and how it's worded to avoid reading as a probability
- Whether financing-fallback numbers should be static (from `/research`) or parameterized per supplier profile
