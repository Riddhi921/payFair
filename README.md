# PayFair

**A payment-terms advisor for small US B2B suppliers.**

Given a supplier's own obligations and a buyer's requested payment term, PayFair works out the supplier's cash gap and walk-away term, builds a priced negotiation ladder from an opening ask down to that walk-away line, runs a break-even check on whether pushing is even worth it, drafts a message for whichever rung is chosen, and shows the financing fallback (dynamic discounting vs. factoring) side by side.

**Live demo:** _[add your deployed URL here after following the deploy steps below]_

## ⚠️ Synthetic data only

Every supplier, buyer, and dollar figure in this project is fabricated. Nothing is real financial data, nothing is connected to an ERP, there is no login, and no message this tool drafts is ever sent anywhere — it only drafts; you review and send it yourself. See [`research/`](./research/payment-terms-research.html) for the real, sourced industry research the numbers are grounded in, and [`SPEC.md`](./SPEC.md) for the full product definition.

## What's in this repo

| Path | What it is |
|---|---|
| `engine/` | The calculation engine (TypeScript, 44 unit tests) and synthetic seed data — cash-gap math, the negotiation ladder, break-even risk, financing-fallback costs |
| `web/` | The interactive demo (React + Vite) — deployed at `/demo` |
| `research/` | The sourced research brief behind the numbers — deployed at `/research` |
| `docs/case-study-draft/` | Product decisions, corrections made, and eval findings — a draft, not part of the deployed site; the demo's "About this demo" link points at `CASE_STUDY_URL` in `web/src/lib/config.ts` once this has a home on the portfolio site |
| `server/` | Optional Express server for **live AI mode** (see below) — not required for the static demo |
| `eval/` | Offline evaluation harness for message drafting and the chat fallback — runs with no API key |

## Template mode vs. AI mode

PayFair works two ways, and it's always labeled honestly about which one is active:

| | **Template mode** (default) | **AI mode** (optional) |
|---|---|---|
| How messages are drafted | A deterministic template (`buildMessageDraft` in the engine) | Claude (`claude-sonnet-5`) via the server, given the same numbers |
| How chat questions are answered | The deterministic action-plan summary, the same regardless of what's asked | Claude, grounded in the scenario's real numbers |
| UI label | "Template-based drafting" / "Guided Q&A" | "Drafted by Claude" / "PayFair Copilot" |
| Requires | Nothing | `server/` running with `ANTHROPIC_API_KEY` set |
| Network calls | None | Calls the local/deployed server, which calls Anthropic |

**The static deployment (Vercel, GitHub Pages) runs template mode only.** There is no server to call, and the client is built so it never even attempts to — see "How the static build works" below. AI mode is for running the full stack yourself locally (or hosting the server separately).

## Running it locally

### Full stack, with optional AI mode

```bash
npm install
npm run dev     # starts the server (:8787) and the web app (:5173) together
```

Open http://localhost:5173. Works immediately in template mode. To enable AI drafting and the live copilot:

```bash
cd server
cp .env.example .env
# edit .env: ANTHROPIC_API_KEY=sk-ant-...
```

Restart `npm run dev` after adding the key.

### Just the static demo (no server)

```bash
npm run build:engine
cd web && VITE_ENABLE_SERVER=false npm run build && npm run preview
```

(`VITE_ENABLE_SERVER` defaults to off for any production build — see below.)

### Tests and eval

```bash
npm test    # engine unit tests (44, all hand-checked against manual math)
npm run eval                                          # offline eval, no API key -> eval/results.md
npm run eval -- --messages eval/llm-messages.json      # also score hand-pasted LLM messages
```

## How the static build works

`web/src/lib/config.ts` exports a single `SERVER_ENABLED` flag:

- In `vite dev`, it's always `true` (the dev server proxies `/api/*` to the local Express server).
- In a production build, it's `false` **unless** the build is run with `VITE_ENABLE_SERVER=true`.

`web/src/lib/api.ts` checks this flag before ever calling `fetch`. When it's `false`, the fetch call never happens — Vite's dead-code elimination removes the entire code path from the production bundle (verified: the built JS contains zero references to `/api/draft-message` or `/api/copilot`). There is no failed network request to see in the console, because no request is ever made. Every feature still works, via the same deterministic template/action-plan logic that ships in the engine.

If you deploy the server separately (or port it to a serverless function on the same domain) and want a static build to call it, build with `VITE_ENABLE_SERVER=true`.

## Routes and the static site build

`npm run build:site` (used by `vercel.json`) does, in order:

1. Builds the engine (`engine/dist`).
2. Builds the web app with `vite build` — Vite's `base` is set to `/demo/` for production builds, so the app's own assets resolve correctly once deployed under that path.
3. Assembles `/dist` at the repo root (`scripts/build-site.mjs`):
   - `dist/index.html` — landing page linking to the two sections
   - `dist/demo/` — the built React app
   - `dist/research/index.html` — the research brief
   - `dist/.nojekyll` — tells GitHub Pages not to run its Jekyll processor over the output

Each route is a **real file at a real path** (a small multi-page static site, not a single-page app with client-side routing) — `/demo` and `/research` both resolve and refresh correctly on any static host with zero rewrite rules required for that reason alone. `vercel.json` still sets `cleanUrls: true` and `trailingSlash: false` so the two routes resolve without a trailing slash or `.html` extension, matching how they're named throughout this README.

## Deploying

### Vercel

See the exact steps below (dashboard or CLI) — `vercel.json` is already configured with the build command, output directory, and clean URLs.

### GitHub Pages (best-effort)

Works cleanly when the Pages site is served from the domain root (a custom domain, or a `<user>.github.io` **user/org** site). Build and push `dist/` to the `gh-pages` branch (e.g. with the `gh-pages` npm package, or a GitHub Actions workflow that runs `npm run build:site` and publishes `dist/`), then enable Pages on that branch.

**Caveat:** if you deploy to a **project** Pages site instead (`<user>.github.io/<repo>/`, served from a subpath, not the root), every absolute path in this project (`/demo`, `/research`, the Vite `base`, the landing page's links) needs to be rewritten to include that subpath prefix. That parameterization isn't done here — this repo currently assumes the deployed site is served from `/`. Vercel doesn't have this problem (a Vercel deployment is always served from its own domain root), which is why it's the primary target.

## Exact deploy steps (Vercel)

1. Push this repo to GitHub (or GitLab/Bitbucket).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Vercel should auto-detect `vercel.json`. Confirm the settings it shows:
   - **Build Command:** `npm run build:site`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install && npm run install:site`
   - **Framework Preset:** Other
4. Leave environment variables empty (no `VITE_ENABLE_SERVER` -> static template mode). Click **Deploy**.
5. Once deployed, visit `<your-project>.vercel.app`, `/demo`, and `/research` to confirm all three resolve — including a hard refresh on each.
6. Paste the deployed URL into the "Live demo" line at the top of this README.

Equivalent via the CLI, from the repo root:

```bash
npm i -g vercel
vercel login
vercel            # first run: link/create the project, deploys a preview
vercel --prod     # promote to production
```

The CLI reads the same `vercel.json`, so no extra flags are needed.
