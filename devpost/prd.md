---
doc: prd
status: approved
---

# RedFlag Dojo - Product Requirements Document

## 1) Problem Statement
Final-year B.Tech students and recent graduates in India are fielding first-contact recruiter messages on WhatsApp, Telegram, LinkedIn, or email. They rely on gut-feel or forwarded messages with no transparent way to learn *why* something is suspicious. Existing "scam checkers" imply a verdict. RedFlag Dojo must teach detection through evidence, restraint, and practice without ever classifying a message as "scam" or "safe". 

## 2) Goals
- **Analyze with evidence**: Paste a recruiter message (optionally with a sender line) and see only signal-based evidence. 
- **Teach restraint**: Reward leaving clean messages alone in practice (clean scenarios must earn full marks if untouched).
- **Drill, not report**: Turn identified tactics into a tap-based practice loop to build muscle memory.
- **Explainable by design**: Every flag must show phrase, tactic, why it matters, and what to verify. The entire app must be narrable file by file.
- **Honest**: Signals only, no verdict, no accuracy claim. 

## 3) Non-Goals
- Formal offer letters or long job descriptions (out of POC boundary)
- Company verification/domain reputation beyond the syntactic free/personal email domain check
- AI/ML, paid APIs, API keys
- User accounts, saved history, backend, or database
- Free-text selection in practice (replaced by author-defined clause chunks)
- Share card (cut now)
- Any "scam detected" / "safe" language

## 4) Users & Context
- **Primary**: Indian freshers (final-year B.Tech/recent graduates) fielding first-contact recruiter messages.
- **Context**: Mobile-first (must be readable at 360px, tap targets >= 44px). Often on WhatsApp/Telegram links.
- **Need**: A fast second opinion *and* practice before replying. 

## 5) Information Architecture & Navigation
Two top-level modes accessible from the header:
- **Analyze | Practice** switch (always visible)
- **Belt indicator** (small) in the header (based off session cumulative score; resets on refresh, shows White/0 initially)

Routes/Views (client-side only):
1. `AnalyzeView` (default/first screen)
2. `ResultsView` (after checking a message from Analyze)
3. `PracticeView` (round start + message screen)
4. `FeedbackView` (after submitting a practice message)
5. `RoundSummary` (end of 3-message round)

## 6) Core Flows

### 6.1 Analyze Flow
- **Empty state**: Paste box for message, optional sender line. "Check" button disabled with a hint until there is input. "Try an example" loads a fictional suspicious message. 
- **Check**: Calls `src/engine/analyze.js` (pure). 
- **Results**: See `ResultsView` with the elements listed below.
- **States**: Empty, very long input (cap at 3000 characters with a clear message), no signals found, error fallback (must not crash).

#### ResultsView Contents
- **Summary banner**: "none" / "few" / "some" / "many" based off of *distinct rule count* with thresholds 0 / 1-2 / 3-4 / 5+ (distinct rules). For 0 signals use copy: "No signals found. That doesn't mean the message is trustworthy. Verify the sender anyway." 
- **Annotated message**: The message with numbered markers over matched phrases (highlighted). Sender-line matches must be highlightable via `source: 'sender'`.
- **Evidence ledger**: Table/list entries for each match containing: *phrase*, *tactic*, *why it matters*, *what to verify*, and *source* context.
- **Checklist**: Capped at ~6 items, built *only* from triggered signals (no generic advice).
- **Bridge to Practice**: CTA to enter Practice.
- **Disclaimer**: Visible on Analyze and Results screens. Signals only. Never verdicts.

### 6.2 Practice Flow
Belt progress is **session-only** and **resets on refresh**. Cumulative score is tracked in React state only. 

#### Practice Start
- One-line instruction
- Current belt and cumulative score
- "Start round" button

On "Start round":
- Draw a different mix of 3 scenarios from `scenarios.json` with **exactly 2 suspicious, 1 clean** (no repeats of the same drawn mix preference beyond "different mix" on replay).
- Initialize round counters (message index = 1, round score = 0, per-message scores, caught/missed/false counts)

#### Practice Message Screen (Message 1 of 3, ..., Message 3 of 3)
- Progress: `"Message X of 3"`
- Message shown as **tappable clause chunks** (author-defined). Each chunk is tappable to toggle. Must have a **clear selected state**.
- **Submit button always visible**. No hints before submit.

#### Feedback Screen (after Submit)
For every chunk in context show its state:
- **Caught** = suspicious chunk that was selected (green)
- **Missed** = suspicious chunk that was *not* selected (red)
- **False flag** = clean chunk that was selected (grey outline)

For every *suspicious* chunk show: **tactic name** and **why it matters**. 
Show **message score out of 6**. 
Button: **"Next"**. If this is the last message of the round, the Next button must say **"See results"**. 

#### Round Summary (End of Round)
- **Round score out of 18** shown large
- **Cumulative session score** and **current belt**. If rank increased this round, show a **"belt up" moment**. Also show **points needed for the next belt**.
- **Breakdown**: total correct flags caught, missed, and false flags. Plus a **one-line per-message recap** (e.g. `"Message 2: 4/6, missed urgency pressure"`). When misses > 0, show tactic name of first missed suspicious chunk if possible.
- **Actions**: **"Play again"** (draws a different mix of 3: 2 suspicious, 1 clean) and **"Back to Analyze"**.
- Belt is session-only and resets on refresh.

## 7) Rules & Scoring Requirements
- **Rules**: 12 rules total, 6 categories x 2. Categories: upfront fees; push to WhatsApp/Telegram; free/personal email domain (syntactic only); urgency/pressure; early Aadhaar/PAN/bank requests; vague role or unrealistic pay. Each rule must have id, tactic id, patterns (case-insensitive phrase or regex list), why it matters, what to verify, and a checklist action.
- **Rule consistency**: Rules sharing the same `tacticId` must have identical `whyItMatters` and `whatToVerify` text (so tactic lookup from a chunk is unambiguous).
- **Patterns**: Bound greedy regex (e.g. `pay\s+(\w+\s+){0,4}fee`). 
- **Scenarios**: 8 fictional scenarios (6 suspicious, 2 clean), each 6-10 chunks. Chunks: `{ text, suspicious: boolean, tacticId?: string }`. **Suspicious scenarios MUST have exactly 3 suspicious chunks. Clean scenarios MUST have 0.** Every suspicious chunk's `tacticId` must exist in `rules.json`.
- **Message scoring (per message, max 6)**:
  - `+2` per correct flag (caught)
  - `-2` per false flag (selected a clean chunk)
  - Misses cost nothing
  - Floor `0` 
  - Clean message rule: `6 minus 2 per false tap` (i.e. `6 + (falseFlags * -2)`), floor `0` (leaving untouched = 6). Selecting all chunks on a clean message must give 0.
- **Round**: max 18 (sum of 3 messages)
- **Belt thresholds (cumulative session score)**: `White 0`, `Yellow 15`, `Brown 40`, `Black 80`. These are named constants in `scoring.js`. "Points needed for next belt" must be computed from current cumulative score and thresholds.

## 8) Design Requirements
- **Mood**: Dojo/training-hall. Dark ink background with warm paper-coloured text. 
- **Accent**: One strong accent colour for evidence highlights.
- **Typography**: One distinctive typeface pair (bold display for headings, readable body face).
- **Aesthetic**: No purple gradients, no identical rounded-card stacks, no template dashboard. 
- **Responsive**: Mobile-first, readable at 360px width, tap targets >= 44px.
- **States**: Empty, long input (3000 char cap), no signals found, error fallback.
- **Honesty**: Disclaimer on Analyze and Results. Never "scam detected" or "safe". Signals only.

## 9) Constraints
- React + Vite, plain JavaScript (no TypeScript), no backend/database/accounts/API keys. Pure client-side.
- Static deploy (Netlify) from GitHub repo. Deploy skeleton first.
- No real company names, no real scam messages/datasets. All scenarios and examples must be clearly fictional.
- Free/personal email domain check is syntactic only.
- Practice uses author-defined chunks (no free text selection).
- Belt progress session-only (resets on refresh). No browser storage.
- Report "X of Y written cases behave as expected", never an accuracy figure.
- Don't use `maxLength` on textarea; use character counter and disable Check with clear message when over 3000.

## 10) Success Criteria (Definition of "Working")
On a live URL (mobile + desktop), a user can:
1. Paste a suspicious fictional recruiter message and see highlighted evidence with tactic, why it matters, what to verify, signal summary (few/some/many), and a checklist (<=6) built only from triggered signals with a visible disclaimer. The "Try an example" must trigger 4-5 rules across different categories to show "Some risk signals" with a full evidence ledger.
2. Play one 3-message practice round (2 suspicious, 1 clean). Tap chunks, submit, see caught/missed/false flag states with tactic explanations for suspicious chunks, per-message score out of 6. Finish round and see round score out of 18, cumulative score, belt, belt-up moment (if applicable), points to next belt, breakdown, per-message recap, and Play again/Back to Analyze.
3. See a clean message earn full marks when left untouched in practice (6). Selecting all chunks on clean message gives 0.

## 11) Build Order (4-build)
1. Skeleton + deploy
2. rules.json + engine + tests
3. Analyze and Results UI
4. scenarios + scoring + tests
5. Practice UI
6. Dojo styling and mobile pass
7. README and final checks

## 12) Open Questions / Flags (for review)
- **Header belt indicator**: Show belt indicator in header based off session cumulative score (starts at White/0, resets on refresh). 
- **"Try an example"**: Must load a fictional suspicious message that triggers 4-5 rules across different categories to demonstrate "Some risk signals" with full evidence ledger.
- **Checklist cap**: If >6 distinct signals triggered, must cap without dropping the most relevant evidence (order of first appearance of distinct rules).
- **Long input**: No `maxLength` on textarea. Show character counter and disable Check with clear message when over 3000 chars. Prevent processing over cap.
- **No hints before submit**: Practice message screen must not show tactic names/highlights before submit.
- **Last message copy**: Feedback Next button becomes "See results" on message 3 of 3.
- **Points to next belt**: Must be shown on round summary.
- **"Different mix" on Play again**: Must ensure the 2s/1c split is preserved and it's a different draw from previous round when possible.
- **Overlap handling**: Engine must handle overlapping matches (keep longest or earliest match and skip overlaps). Add test.
- **Source field**: Add `source` ('text' or 'sender') to each match.
- **Tactic consistency**: Rules sharing tacticId must have identical whyItMatters and whatToVerify.
- **No "safe" word**: Never use "safe" in UI copy.
- **File comments**: Add one-line comment at top of each source file saying what it does.
