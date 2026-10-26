---
doc: learner-profile
status: complete
---

# Learner Profile

## Initial Idea
**RedFlag Dojo** — a scam-spotting trainer for final-year students and recent B.Tech graduates in India, not a fake-job classifier. One flow with two modes:
1. **Analyze:** paste a job/internship message or offer; a transparent, JSON-configured rule engine (~20–25 signals) highlights matched phrases. Each flag shows the matched evidence, the manipulation tactic, why it matters, and what to verify. Output is a signal summary (few / some / many risk signals) plus a checklist built only from triggered signals.
2. **Practice:** ~12 clearly fictional synthetic scenarios. The user taps suspicious phrases, gets scored, and sees what they missed and why. This practice loop is the stated core differentiator.
3. **Stretch:** shareable results card.

Learner's framing: honest "risk signals," never a "scam / not scam" verdict, never a claim that AI detects scams; clear disclaimer. The learner also supplied detailed India-focused category coverage, design direction, and hard constraints (see Notes).

> Starting point, not approved scope.

## Demonstrated Technical and Agent Experience
Reported: recent B.Tech CSE graduate (2026, 8.66 GPA), fresher. Strongest in Python and Django. Built REST APIs, authentication, and database models in a web-developer internship; deployed an e-commerce app on AWS Lightsail with Nginx, Gunicorn, and a custom domain. Also knows Java, JavaScript, SQL (MySQL, MongoDB), and Git. Projects include a React portfolio on Netlify, a Flask + MySQL social bot-detection project, and a Java Swing + JDBC price-comparison app. 200+ LeetCode problems; team lead on academic projects.

AI coding agents: ChatGPT, Gemini, GitHub Copilot, Claude, and Cursor, mostly for generating code, debugging, and speeding up development. Comfortable with JavaScript and React basics; wants short explanations there.

Evidence: "My strongest area is Python and Django… I'm comfortable with JavaScript and React basics, so keep those explanations short."
> Reported, not directly observed. `5-build` can calibrate against actual work.

## Planning-Workflow Experience
**New / informal.** Starts coding after a rough idea and fixes problems as they appear. Has not written a structured scope, requirements, and technical spec before building, and wants to learn the plan-first habit properly.

Evidence: "Usually I start coding after a rough idea and fix problems as they appear, so I want to learn the plan-first habit properly."

## Desired Learning Outcome
Learn the plan-first habit properly; be able to understand every file the agent writes so it can be explained in the demo video. Also build more familiarity with Vite, Vitest, and unit-testing a rules engine.

Evidence: "I want to understand every file the agent writes, so I can explain it in my demo video"; "I have less experience with Vite, Vitest and unit testing a rules engine, so please explain those more."

## Learning Moments
None recorded yet beyond stated intentions.

## Interests, Inspirations, and Goals
Not established beyond the project itself. The project is aimed at a real peer group (Indian freshers applying to jobs and internships) and is being built for the Build With AI: Basics hackathon. The learner wants a demo-explainable, genuinely useful proof of concept, not a fake classifier.

## Vocabulary and Concepts Likely to Need Explanation
- **Needs more explanation:** Vite, Vitest, unit testing a rules engine, structured spec-driven workflow.
- **Keep brief:** JavaScript and React basics; Python/Django, REST APIs, auth, database models, deployment are familiar.

## Collaboration and Communication Preferences
- One question at a time (explicit in the brief and follow-up).
- Short explanations for JavaScript/React; deeper explanations for Vite, Vitest, and rules-engine testing.
- Wants to understand every file the agent writes.
- Keep scope small for a roughly two-day timeline.
- Do not write application code until `scope.md`, `prd.md`, and `spec.md` are generated and explicitly approved.

## Areas Where the Learner Wants Ownership
- Approves the planning docs before any application code is written.
- Wants to be able to explain every file in the demo, so code should be understandable rather than merely generated.

## Likely Support Needs
- Setup and explanation of Vite, Vitest, and a transparent testable rules engine.
- Help time-boxing features; the brief already includes a cut order.
- Explaining how the pieces fit so the learner can narrate the app in a 1–3 minute video.

## Review Format

markdown

## Notes and Open Questions
Carried from onboarding (to be sharpened in `2-scope`, not re-asked):
- **Deadline:** submit by Oct 26, 2026. Official deadline 5:00 PM EDT = 2:30 AM IST on Oct 27. About two days of work.
- **Hard constraints:** no paid APIs, no API keys, no backend, no database; everything client-side on free static hosting (Cloudflare Pages, Netlify, Vercel, or GitHub Pages).
- **Originality:** no copied code, no real scam messages, real company names, or datasets. Scenarios are synthetic and authored for this project.
- **Docs committed:** `scope.md`, `prd.md`, `spec.md` must end up in the public repo.
- **Honesty:** show "risk signals," never a "scam / not scam" verdict; never claim AI detects scams; include a clear disclaimer.
- **Tech:** React + Vite, plain JavaScript rule engine, rules in JSON, Vitest tests with the learner's own written cases. Report "X of Y written cases behave as expected," never an accuracy figure. Deploy a skeleton early.
- **Design:** dojo/training-hall feel with white-to-black belt progression for practice scores; no default purple gradients, no identical rounded-card stacks, no template dashboard; strong limited palette, one distinctive typeface, high-contrast evidence highlights, clear hierarchy, mobile-friendly; include empty, error, and long-input states.
- **Demo:** one smooth story — paste a suspicious offer, see evidence flags, get the checklist, then play a practice round and see the score.
- **Must-haves:** Analyze flow, evidence highlighting with tactic explanations, checklist, practice mode with 12 scenarios and scoring.
- **Cut order:** share card first, then extra categories, then number of scenarios.
- **Open question for scope:** 20–25 rules + 12 scenarios + scoring + tests + custom design in ~2 days is tight; pressure-test the boundary and use the learner's cut order rather than silently expanding scope.
