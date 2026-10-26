# RedFlag Dojo

A scam-signal trainer for Indian freshers. Paste a first-contact recruiter message and see the exact phrases that tripped a transparent rule, the tactic behind each one, why it matters, and what to verify. Then drill the same tactics in short fictional practice rounds and earn a session belt.

Signals only. RedFlag Dojo never issues a verdict, never claims to detect scams with AI, and never reports an accuracy figure.

## Deployment

Status: not deployed yet. This is a static client-side build with no backend, database, accounts, secrets, or environment variables.

Vite settings: build command `npm run build`, output directory `dist`. Netlify reads the committed `netlify.toml` (Node 20, SPA fallback, basic security headers).

Netlify:

1. Push this repository to GitHub.
2. Import the repository in Netlify. Keep the detected settings (`npm run build`, `dist`).
3. Deploy and verify the live URL manually.

Cloudflare Pages:

1. Connect the repository, choose the Vite preset.
2. Use build command `npm run build` and output directory `dist`.
3. No environment variables are required.

Do not claim a live URL until the deploy succeeds and the checks below pass on the live site.

Manual live-site checks:

- Load the site on a phone-sized viewport and at desktop width.
- Press **Try an example**, confirm marks, ledger, checklist, and disclaimer.
- Complete a three-message round, then use **Play again** and **Back to Analyze**.
- Confirm no horizontal scrolling at 320px and no console errors.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Test

```bash
npm test        # watch mode
npm run test:run
```

The suite covers each rule's intended phrase, sender-line offsets, overlapping matches, malformed input, clean-message false-positive checks, the example message, checklist capping, the full Analyze-to-Practice flow, over-limit input, scoring floors, false-flag costs, the clean-message rule, belt thresholds and belt-up, scenario selection, and data constraints.

Current run: **106 of 106 written cases behave as expected.** This is a written test count, not an accuracy claim.

## Build

```bash
npm run build
npm run preview
```

## How it works

- **Analyze**: paste a message and optional sender line, or press **Try an example**. The engine returns matches with start/end positions, a source (`text` or `sender`), distinct rule count, a summary level (`none`, `few`, `some`, `many`), and a capped checklist built only from triggered signals.
- **Results**: numbered marks on the message, an evidence ledger (phrase, tactic, why it matters, what to verify), the checklist, and a bridge to Practice.
- **Practice**: a round is 3 scenarios with exactly 2 suspicious and 1 clean. Each message has 6-10 tappable clauses. Submit to see caught, missed, and false-flag states, then finish the round for a score out of 18, a cumulative session score, and a belt. Replays avoid repeating the previous mix when another mix is available.
- **Belts**: White 0, Yellow 15, Brown 40, Black 80. The full progression rail is visible on the practice start and round summary screens. Session-only; refresh resets to White.

## Scoring

- Suspicious message: +2 per caught suspicious clause, -2 per false flag, misses cost nothing, floor 0, max 6.
- Clean message: 6 minus 2 per false tap, floor 0. Leaving it untouched earns 6.
- Round: sum of 3 message scores, max 18.

## Code map

- `src/App.jsx` - root view state and session state.
- `src/components/AnalyzeView.jsx` - paste, sender, character counter, example.
- `src/components/ResultsView.jsx` - summary, annotated message, evidence ledger, checklist.
- `src/components/PracticeView.jsx` - round start and tappable clause screen.
- `src/components/FeedbackView.jsx` - caught/missed/false-flag feedback.
- `src/components/RoundSummary.jsx` - score, belt, belt-up, recap.
- `src/components/BeltBadge.jsx` - compact belt indicator.
- `src/components/BeltTrack.jsx` - four-rank belt progression rail.
- `src/components/ErrorBoundary.jsx` - render-error recovery screen.
- `src/data/rules.json` - 12 rules across 6 categories.
- `src/data/scenarios.json` - 8 fictional scenarios (6 suspicious, 2 clean).
- `src/data/example.js` - the fictional Analyze demo message.
- `src/engine/analyze.js` - pure rule-matching engine.
- `src/engine/scoring.js` - pure scoring and belt functions.
- `src/utils/draw.js` - draws 2 suspicious + 1 clean scenario per round.
- `src/utils/rules.js` - tactic lookup for practice feedback.
- `src/styles/index.css` - dojo theme and responsive layout.
- `tests/` - Vitest suites for analysis, scoring, scenario drawing, app flow, error recovery, and data validation.

## Data rules

- Six categories, two rules each: upfront fees; push to WhatsApp/Telegram; free/personal email domain; urgency/pressure; early Aadhaar/PAN/bank requests; vague role or unrealistic pay.
- Rules that share a `tacticId` carry identical `whyItMatters` and `whatToVerify` text.
- Suspicious scenarios have exactly 3 suspicious chunks. Clean scenarios have 0.
- Every suspicious chunk reuses a `tacticId` from `rules.json`.
- All scenarios are fictional. No real company names, no copied messages.

## Notes

- React + Vite, plain JavaScript, no backend, database, accounts, API keys, or browser storage.
- Practice progress is held in React state only and resets on refresh.
- Empty, long-input (3000-character cap), no-signal, and error-fallback states are handled.
- The free/personal email check is syntactic only. It does not verify a company.
