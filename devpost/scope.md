---
doc: scope
status: approved
---

# RedFlag Dojo

A scam-spotting dojo for Indian freshers: paste a first-contact recruiter message, see evidence-backed risk signals and a checklist, then drill on short fictional chats and earn a belt.

## The Unique Kernel

It never says "scam" or "not scam." It shows the exact phrase that triggered a signal, names the tactic, explains why it matters, and says what to verify. The practice loop turns that into a drill: tap clause-sized chunks in fictional recruiter messages, submit, see caught/missed/false flags, and earn a session belt. The practice loop is the differentiator.

## Who It's For

A final-year B.Tech student or recent graduate in India fielding first-contact recruiter messages on WhatsApp, Telegram, LinkedIn, or email. Today they rely on gut feel, friend/group chats, or generic "beware of scams" posts. They need a fast second opinion and practice before a real message arrives.

## The Core Loop

**Analyze:** paste a recruiter message, optionally with a sender line — or press **Try an example** in the empty state to load a fictional suspicious message. The rule engine highlights matched phrases; each flag shows evidence, tactic, why it matters, and what to verify. A signal summary (few / some / many) and a checklist built only from triggered signals follow. No verdict.

**Practice:** a round is 3 scenarios drawn from a pool of 8 (6 suspicious, 2 clean), each split into 6–10 tappable clause chunks. Tap to toggle; submit; feedback shows caught, missed, and false flags with tactic explanations. Each message is worth 6 points (round max 18); cumulative score moves through White, Yellow, Brown, Black; belt progress is session-only and resets on refresh. Replays draw a different mix.

## Inspiration & Identity

Dojo / training hall: white-to-black belt progression, disciplined practice, high-contrast evidence highlights, a strong limited palette, one distinctive typeface, clear hierarchy. Mobile-first. No template dashboard, no default purple gradients, no identical rounded-card stacks. It should feel like a drill, not a report.

## Why This Matters to the Learner

Built for their own peer group: Indian freshers who actually meet recruiters this way. They want an honest, explainable tool — not a fake classifier — and want to understand every file well enough to explain it in the demo.

## What "Working" Looks Like

On a live URL, on phone and desktop: paste a suspicious recruiter message, see highlighted evidence with tactic explanations and a checklist; then play one 3-message round (2 suspicious, 1 clean), submit, and see the score and belt rank. The 2.5-minute demo tells that whole story: about 50 seconds analyzing, about 60 seconds practicing, plus intro and closing. A clean message earns full marks when left untouched, so the app teaches restraint as well as detection.

## The POC Boundary

- **Recruiter messages only:** first-contact message or short chat, WhatsApp / Telegram / LinkedIn DM / email body, optional sender line. No formal offer letters or long job descriptions.
- **Exactly 12 rules across 6 categories, 2 each, with tight phrase lists:** upfront fees; push to WhatsApp/Telegram; free/personal email domain (syntactic only); urgency/pressure; early Aadhaar/PAN/bank requests; vague role or unrealistic pay as stated in the message. Quality over quantity.
- **Transparent output:** rules in JSON; plain JavaScript rule engine; exact evidence, tactic, why it matters, what to verify; few/some/many summary; checklist only from triggered signals; clear disclaimer; never a scam/not-scam verdict or accuracy claim.
- **Practice:** 8 authored scenarios (6 suspicious, 2 clean), each 6–10 chunk taps; suspicious scenarios exactly 3 flagged chunks; tap-to-toggle; submit-only feedback; per-message max 6, round max 18; +2 per correct, −2 per false flag, misses cost nothing, floor 0; clean = +6 minus 2 per false tap, floor 0; cumulative session score with White 0 / Yellow 15 / Brown 40 / Black 80; belt progress is session-only and resets on refresh. Suspicious chunks reuse tactic IDs from the Analyze rules. Practice is plain data plus a pure scoring function, not the rule engine.
- **Tests:** about 2 written cases per rule; 2–3 clean fictional recruiter messages that should trigger zero or very few signals, as false-positive checks; scoring-function cases; and a data-validation test (suspicious = exactly 3 flagged chunks; clean = 0). Report "X of Y written cases behave as expected," never an accuracy figure.
- **Build:** React + Vite, client-side only, no backend/database/accounts/API keys; deploy a skeleton early; responsive; empty, error, and long-input states.
- **Share card:** cut now, not a stretch goal.

## Later

- Formal offer letters and long job descriptions.
- More scenarios and categories; tune belt thresholds from real play.
- Share card.
- Saved progress/history (needs accounts and storage).

## Explicitly Cut

- **Company verification and domain mismatch:** needs external knowledge and implies a verdict; the free/personal-domain check covers the useful syntactic case.
- **Any scam/not-scam verdict, risk score presented as truth, or accuracy claim:** honesty constraint; signals only.
- **AI/ML detection, paid APIs, API keys:** rules stay transparent and testable.
- **User accounts, saved history, backend, database:** static client-side build.
- **Free text selection in practice:** replaced by author-defined chunk taps for reliable mobile scoring.
- **Share card:** not needed to prove the kernel; cut now so it can't compete with deployment and polish.
