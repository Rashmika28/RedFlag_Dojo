---
doc: spec
status: approved
---

# RedFlag Dojo - Technical Specification

## 1) Tech Stack
| Item | Choice | Notes |
| :-- | :-- | :-- |
| Framework | React + Vite | Plain JavaScript (.jsx). No TypeScript. |
| Language | JavaScript (ES modules) | Readable, narrable in demo. |
| Styling | CSS (vanilla) | Dojo theme, mobile-first. No CSS frameworks. |
| Testing | Vitest | Unit tests for engine, scoring, and data validation. |
| Data | JSON | `src/data/rules.json`, `src/data/scenarios.json` (committed). |
| Backend | None | Pure client-side. No API keys, DB, accounts. |
| Hosting | Netlify (static) | Deploy skeleton first from GitHub repo. |

## 2) Repository Structure
```
redflag-dojo/
├── devpost/
│   ├── prd.md        (this PRD)
│   ├── scope.md
│   └── spec.md       (this spec)
├── public/           (static assets, fonts if self-hosted)
├── src/
│   ├── App.jsx
│   ├── components/
│   │   ├── AnalyzeView.jsx
│   │   ├── ResultsView.jsx
│   │   ├── PracticeView.jsx
│   │   ├── FeedbackView.jsx
│   │   ├── RoundSummary.jsx
│   │   └── BeltBadge.jsx
│   ├── data/
│   │   ├── rules.json
│   │   └── scenarios.json
│   ├── engine/
│   │   ├── analyze.js
│   │   └── scoring.js
│   ├── styles/
│   │   └── index.css
│   ├── utils/        (small helpers if needed, keep minimal)
│   └── main.jsx
├── tests/
│   ├── analyze.test.js
│   ├── scoring.test.js
│   └── dataValidation.test.js
├── index.html
├── package.json
├── vite.config.js
└── README.md
```
*Keep components small and easy to explain. Each source file must have a one-line comment at the top saying what it does.* 

## 3) Data Schemas

### 3.1 `src/data/rules.json`
Array of rule objects. Exactly 12 rules, 6 categories x 2.

```json
{
  "id": "fee-upfront-1",
  "tacticId": "upfront_fees",
  "category": "upfront_fees",
  "tacticName": "Upfront fees",
  "patterns": [
    "registration fee",
    "processing fee",
    "pay\s+(\w+\s+){0,4}fee"
  ],
  "patternType": "phraseOrRegex",
  "whyItMatters": "Legitimate recruiters do not ask freshers to pay to be considered for a first-contact opportunity.",
  "whatToVerify": "Verify the company's official careers page via a known URL, not a link sent in chat.",
  "checklistAction": "Ask for the official application link and confirm fee policy in writing from a verified channel."
}
```
**Notes:**
- `patterns` are case-insensitive. Support phrase match and simple regex where noted.
- `tacticId` is shared for the pair in a category (used by scenarios).
- `category` is one of: `upfront_fees`, `push_to_messaging`, `free_personal_email`, `urgency_pressure`, `early_pii_bank`, `vague_unrealistic_pay`.
- **Rules sharing the same `tacticId` must have identical `whyItMatters` and `whatToVerify` text.**
- Bound greedy regex patterns (e.g. `pay\s+(\w+\s+){0,4}fee`).

### 3.2 `src/data/scenarios.json`
Array of 8 scenarios. 6 suspicious, 2 clean. Each 6-10 chunks.

```json
{
  "id": "scen-sus-01",
  "type": "suspicious",
  "title": "Fictional Scenario 01",
  "chunks": [
    { "id": "c1", "text": "Hi, we came across your profile and have a role for you.", "suspicious": false },
    { "id": "c2", "text": "To process your profile you need to pay a small registration fee.", "suspicious": true, "tacticId": "upfront_fees" },
    { "id": "c3", "text": "Can you move this to WhatsApp right now?", "suspicious": true, "tacticId": "push_to_messaging" },
    { "id": "c4", "text": "We need your Aadhaar number to hold this slot.", "suspicious": true, "tacticId": "early_pii_bank" },
    { "id": "c5", "text": "...", "suspicious": false }
  ]
}
```
**Constraints:**
- `suspicious` === true count per suspicious scenario === **exactly 3**
- `suspicious` === true count per clean scenario === **0**
- Every `tacticId` on suspicious chunks must exist in `rules.json`
- All text must be clearly fictional, no real company names, no real URLs/domains that imply verification, no copied real scam messages
- 6-10 chunks per scenario

## 4) Engine

### 4.1 `src/engine/analyze.js` (pure)
Takes message text and optional sender line. Returns analysis object.

```js
/**
 * analyzeMessage({ text, sender } = {}) 
 * @returns {
 *   matches: Array<{
 *     ruleId: string,
 *     tacticId: string,
 *     tacticName: string,
 *     category: string,
 *     phrase: string,        // exact matched phrase found
 *     start: number,         // index in text/sender
 *     end: number,
 *     whyItMatters: string,
 *     whatToVerify: string,
 *     checklistAction: string,
 *     source: 'text'|'sender'
 *   }>,
 *   distinctRuleCount: number,
 *   summaryLevel: 'none'|'few'|'some'|'many', // 0 none, 1-2 few, 3-4 some, 5+ many
 *   rulesTriggered: string[],          // distinct ruleIds
 *   checklist: string[],              // capped at ~6, built only from triggered signals
 *   hasInput: boolean,
 *   isLong: boolean,                  // > 3000
 *   length: number
 * }
 */
```
**Behavior:**
- Case-insensitive matching against rule patterns
- Return `start/end` positions for highlighting (annotated message). Sender-line matches must use `source: 'sender'`.
- `distinctRuleCount` = number of distinct rules triggered (for summary banner)
- `summaryLevel`: `none` (0), `few` (1-2), `some` (3-4), `many` (5+). For `none`, use copy: "No signals found. That doesn't mean the message is trustworthy. Verify the sender anyway."
- `checklist` built only from triggered signals, **capped at ~6** (deduplicate by action where reasonable), ordered by first appearance of distinct rules
- Handle empty input, >3000 chars (`isLong: true` with a clear message), no signals found (return empty matches, checklist empty, `summaryLevel: 'none'`)
- **Handle overlapping matches**: When matches overlap, keep the longest match or the earliest match and skip overlaps. Must have a test for overlapping matches.
- Pure function, no side effects
- Sender line may be considered for `free_personal_email` (syntactic only). Add `source: 'sender'` for those matches. 

### 4.2 `src/engine/scoring.js` (pure)
All scoring logic with named constants.

```js
export const BELT_THRESHOLDS = {
  WHITE: 0,
  YELLOW: 15,
  BROWN: 40,
  BLACK: 80
};

export const BELT_ORDER = ['WHITE', 'YELLOW', 'BROWN', 'BLACK'];

/**
 * scoreMessage({ chunks, selectedChunkIds, scenarioType }) 
 * chunks: scenario.chunks
 * selectedChunkIds: set/list of chunk ids user selected
 * scenarioType: 'suspicious' | 'clean'
 * returns {
 *   messageScore: number, // 0-6
 *   correctCaught: number,
 *   missed: number,
 *   falseFlags: number,
 *   details: { caught:[], missed:[], falseFlag:[] }
 * }
 */
```
**Rules:**
- For each suspicious chunk: if selected -> caught (+2 contribution towards message score), else missed
- For each clean chunk: if selected -> false flag (-2 per false tap)
- **Suspicious messages**: `messageScore = min(6, max(0, (correctCaught*2) + (falseFlags * -2)))` (misses cost nothing). 
- **Clean messages**: `messageScore = min(6, max(0, 6 + (falseFlags * -2)))` (i.e. `6 minus 2 per false tap`, floor 0). Selecting all chunks gives 0. Leaving untouched = 6.
- Add test for clean message with all chunks selected (must be 0).
- Return breakdown for feedback screen.

```js
/**
 * scoreRound(messageScores: number[]) // length 3, each 0-6
 * @returns { roundScore: number } // sum, max 18
 */

/**
 * getBelt(cumulativeScore: number) 
 * @returns { belt: 'WHITE'|'YELLOW'|'BROWN'|'BLACK', beltIndex: number }
 * Determine belt by thresholds (>= threshold? belt is current rank based off cumulative score)
 */

/**
 * getBeltProgress({ prevCumulative, newCumulative }) 
 * @returns {
 *   beltUp: boolean,
 *   currentBelt: string,
 *   prevBelt: string,
 *   pointsToNext: number|null,
 *   nextBelt: string|null
 * }
 */
```
**Notes:**
- Belt thresholds as named constants. `pointsToNext` = max(0, next threshold - newCumulative). If already BLACK, `pointsToNext: null`, `nextBelt: null`.
- "Belt up" moment = rank increased this round (prevBelt index < currentBelt index).

## 5) Component Specifications

| Component | Purpose | Notes |
| :-- | :-- | :-- |
| `App.jsx` | Root. Manages view state, session state (cumulative score, current round, etc). No browser storage. Must have one-line comment at top. | Header with "Analyze \| Practice" switch and small belt indicator. Disclaimer awareness. |
| `AnalyzeView.jsx` | Paste box, sender line (optional), character counter, "Check", "Try an example", states (empty/long/error). Must have one-line comment at top. | **No `maxLength` on textarea**. Show character counter. Disable Check with clear message when over 3000. "Try an example" must trigger 4-5 rules across different categories. |
| `ResultsView.jsx` | Summary banner ("none"/"few"/"some"/"many" with no-signals copy), annotated message (numbered markers, source-aware), evidence ledger, checklist (<=6), bridge to Practice, disclaimer. Must have one-line comment at top. | Only show checklist from triggered signals. "Signals only". Never use word "safe". |
| `PracticeView.jsx` | Start screen + message screen. Manages chunk selection (toggle), progress "Message X of 3", always-visible Submit. Must have one-line comment at top. | No hints before submit. Clear selected state per chunk. Draw 2 suspicious + 1 clean per round (different mix on Play again). |
| `FeedbackView.jsx` | Show every chunk in context with states (caught green, missed red, false flag grey outline). For suspicious chunks show tactic name and why it matters. Message score out of 6. Next/"See results". Must have one-line comment at top. | Must follow exact copy: last message shows "See results". Pull tactic info from rules via tacticId. |
| `RoundSummary.jsx` | Large round score /18, cumulative + belt, belt-up moment, points to next belt, breakdown (caught/missed/false), per-message recap, "Play again" and "Back to Analyze". Must have one-line comment at top. | Session-only. "Play again" redraws different mix of 3: 2 suspicious, 1 clean. |
| `BeltBadge.jsx` | Display current belt (White/Yellow/Brown/Black). Small, used in header and summary. Must have one-line comment at top. | Pure presentational. | 

**Session state (in React state):**
- `mode`: 'analyze' | 'practice'
- `cumulativeScore`: number (starts 0)
- `currentRound`: { scenarios: [...3...], index: 0, messageScores: [], caughtTotal: 0, missedTotal: 0, falseTotal: 0, perMessageRecap: [] } | null
- `analyzeState`: { text: '', sender: '', result: null, error: null, isLong: false }

No `localStorage`/`sessionStorage`. Resets on refresh by design.

## 6) Testing Requirements (Vitest)
Location: `tests/`

### `analyze.test.js`
- ~2 written cases per rule (>= 24 cases total) covering each of the 12 rules
- Ensure matches return start/end, tacticId, whyItMatters, whatToVerify, checklistAction, **source** ('text' or 'sender')
- Distinct rule count and summaryLevel (none/few/some/many) thresholds
- No signals found case -> `summaryLevel: 'none'` with expected copy behavior
- Long input case (>3000) behavior
- Sender line + syntactic free/personal email domain case (minimal), source 'sender'
- Checklist capped at ~6 if triggered > 6 (test behavior)
- **Overlapping matches test** (keep longest/earliest, skip overlaps)
- **"Try an example" test**: example message triggers 4-5 rules across different categories

### `scoring.test.js`
- +2 correct, -2 false flag, misses cost nothing
- Floor 0
- Max 6 per message
- **Clean message**: 6 minus 2 per false tap, floor 0 (test leaving untouched = 6, all selected = 0)
- Round total max 18
- Belt thresholds (White 0, Yellow 15, Brown 40, Black 80)
- Belt up detection
- Points to next belt

### `dataValidation.test.js`
- `rules.json` has exactly 12 rules, 6 categories x 2
- Each rule has required fields
- **Rules sharing tacticId have identical whyItMatters and whatToVerify**
- `scenarios.json` has exactly 8 scenarios (6 suspicious, 2 clean)
- Every suspicious scenario has exactly 3 suspicious chunks
- Every clean scenario has 0 suspicious chunks
- Each chunk has required fields
- Every suspicious chunk `tacticId` exists in `rules.json`
- All scenarios 6-10 chunks
- All scenario text is non-empty (and no obvious real identifiers)

**Reporting**: Tests should be written cases. Output in CI/locally should allow reporting "X of Y written cases behave as expected", never an accuracy figure. 

## 7) UX Details & States
| State | Behavior |
| :-- | :-- |
| Empty paste (Analyze) | "Check" disabled, hint shown. "Try an example" enabled. Character counter shown. |
| Long input (>3000) | **No maxLength on textarea**. Show character counter. Disable Check with clear message (e.g. "Message too long (max 3000 characters). Please shorten.") when over 3000 chars. Do not process over cap. |
| No signals found (Analyze) | Show ResultsView with summary banner "No signals found. That doesn't mean the message is trustworthy. Verify the sender anyway." No evidence ledger entries, checklist empty, disclaimer visible. Still allow bridge to Practice. Never use word "safe". |
| Error fallback | Catch errors in analyze/flow, show error screen so nothing crashes. Provide way back to Analyze. |
| Practice before submit | No hints, no tactic names revealed. Only chunks visible and tappable. |
| Feedback | Every chunk shown in context with correct state color/outline. Tactic name and why it matters only for suspicious chunks. Pull from rules via tacticId. |
| Last message feedback | Next button text becomes "See results". |

## 8) Build, Deploy, & README
- **package.json scripts**: `dev`, `build`, `preview`, `test`, `test:run` (or equivalent). Use Vite defaults.
- **vite.config.js**: Standard for React + JS.
- **Deploy**: Netlify static deploy from GitHub repo. Deploy skeleton (step 1) early.
- **README.md**: Explain project, how to run (dev/build/test), dojo rules briefly, disclaimer, "signals only" note, and note that belt progress is session-only. Keep it readable so learner can narrate.
- **Explain files**: When writing files, explain each briefly as requested. Keep code readable.
- **No comments unless asked**: Follow code style - add exactly **one-line comment at the top of each source file** saying what it does (as requested). Do not add other comments unless explicitly requested. 

## 9) Implementation Notes
- **Pure functions**: `analyze.js` and `scoring.js` must be pure (no React imports). Easy to unit test.
- **Tappable chunks**: In Practice, render chunks as buttons/divs with >=44px tap targets. Track selected chunk ids in component state.
- **Highlighting**: In Results, use numbered markers over matched phrases using start/end positions from analyze results. Support source 'text' and 'sender'.
- **Checklist cap**: Enforce `checklist.slice(0, 6)`. Prioritize based off order of first appearance of distinct rules.
- **Data drafting**: Phrase lists for rules and all 8 scenarios must be written during build as clearly fictional examples with no real company names. Write rules.json and scenarios.json in one pass each.
- **Session-only**: All practice state in memory. Refresh = reset to White/0.
- **Copy constraints**: Never use "scam detected", "safe", or accuracy claims anywhere in UI copy.
- **File comments**: Every source file (js/jsx/css) needs one-line comment at top saying what it does.
- **Commit after every build step**: Commit after completing each step in the build order. 
- **Tests first**: Run tests after writing rules.json+engine+tests and after scenarios+scoring+tests.
- **"Try an example" requirement**: Must trigger 4-5 rules across different categories.
