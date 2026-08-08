# 📍 PROJECT PROGRESS & STATE TRACKER

> **OPERATIONAL INSTRUCTIONS FOR AI & DEVELOPERS:**
> 1. **Check First:** Before starting any new task or generating code, read the **CURRENTLY WORKING ON** section to confirm active context.
> 2. **Update After Every Task:** As soon as a file is created, modified, or tested, immediately update the status of that file in this document.
> 3. **Log Target Files:** Always list the exact file paths currently being edited so work never gets overwritten or duplicated.
> 4. **Maintain Rules:** Ensure all work aligns with the PRD, the 8-question / 4-day minimum rules, and the "Stitch" UI theme.

---

## 🟢 1. WORKING ON THIS
* [x] **Hackathon Strategy & Rules**
  * Evaluated 4-stage judging criteria and Live Steer Challenge requirements.
  * Created `PROMPTS.md` template for Stage 1/2 compliance.
* [x] **Product Requirements Document (PRD)**
  * Locked in 8-question / 4-day curriculum minimum limits.
  * Defined Breeth (`thebreeth.com`) intent-memory mechanics and Trap Door feature.
  * Specified single-endpoint API contract (`POST /api/interview`).
* [x] **System Architecture & Stack**
  * Confirmed Next.js (App Router), LangGraph.js, Upstash Redis, Tailwind CSS, Zod.
* [x] **UI/UX Design System**
  * Finalized "Threaded Developer Workspace" theme (The "Stitch" motif).
* [x] **Phase 0: Project Scaffolding & Data Setup**
  * Scaffolded Next.js 16.3.0 with TypeScript, Tailwind CSS v4, App Router.
  * Copied `candidates.json` and `curriculum.json` to `data/`.
  * Verified dev server starts on localhost:3000.
  * Updated `PROMPTS.md` with first entry.
* [x] **Phase 1: API Contract & Type Safety (Zod Schemas)**
  * Created `lib/schemas.ts` — Zod v4 schemas for candidate, request, response, and session state.
  * Created `lib/redis.ts` — Upstash Redis + in-memory fallback session store.
  * Created `app/api/interview/route.ts` — POST endpoint with init/turn/termination flow.
  * Installed `@upstash/redis`. TypeScript compiles clean. API tested: 200, 400, 404 all correct.
* [x] **Phase 2: Data Ingestion & Intent Memory (Breeth)**
  * Created `lib/curriculum.ts` — pre-indexes 31 days + 8 modules with day→module mapping.
  * Created `lib/candidate.ts` — skip-filter, weakness detection (attempts > 2), topic selection, LLM context builder.
  * Created `lib/breeth.ts` — native fetch client for episodes + search with 10s timeouts and try/catch fail-safe.
  * Upstash Redis confirmed working with real credentials. All Phase 2 tests pass.
* [x] **Phase 3: LangGraph State Machine (Anti-Hallucination Core)**
  * Created `lib/gemini.ts` — Gemini client with retry (2 attempts, 15s timeout), JSON mode, fallback responses.
  * Created `lib/langgraph/prompts.ts` — All LLM prompts: persona, question gen, APPLIED/TEXTBOOK classifier, Brutal Pushback, scorecard.
  * Created `lib/langgraph/engine.ts` — 4-node state machine: SelectTopic (deterministic), GenerateQuestion (LLM+Breeth), EvaluateResponse (APPLIED/TEXTBOOK), GenerateScorecard.
  * Updated `app/api/interview/route.ts` — Replaced placeholders with engine calls.
  * Installed `@langchain/langgraph`, `@langchain/core`, `@google/genai`.
  * E2E tested: LLM questions, Brutal Pushback (no counter increment), topic advancement, Redis + Breeth + Gemini all confirmed.
* [x] **Phase 4: Single-Screen Chat UI**
  * Created design system in `app/globals.css` with Technical Modernism palette, typography, `stitch-line`, pushback state.
  * Updated `app/layout.tsx` with Inter + JetBrains Mono fonts and metadata.
  * Created `app/page.tsx` with candidate selector grid and chat interface.
  * Created `components/ChatWindow.tsx` with threaded messages and `isPushback` warning indicator.
  * Created `components/InteractiveCodeBlock.tsx` with copy-to-clipboard.
  * Created `components/FeedbackScorecard.tsx` to render executive summary, strengths, gaps, and next steps.
  * Passed full Next.js production build (`npm run build`).

* [x] **Phase 5: Verification & Live Steer Challenge Prep**
  * Fixed component isolation: removed unused server-side imports from `app/page.tsx`.
  * Created and passed comprehensive test suite (`scripts/test-phase5.ts`).
  * Verified 8-question & 4-day minimum constraints.
  * Verified Brutal Pushback does not increment counters.
  * Verified skipped topics never appear.
  * Verified Zod API schemas and structure.
  * Confirmed `.env*` safety in `.gitignore` (no leaked tokens).
  * Passed final Next.js production build (`npm run build`).
  * Updated AI system prompts (`lib/langgraph/prompts.ts`) to strictly enforce no hand-holding, Type A/B question formats, and Brutal Pushback.

---

## 🟡 2. CURRENTLY WORKING ON
* **Active Phase:** ALL PHASES COMPLETE
* **Current Objective:** Ready for Live Steer Challenge / Judging.

---

## 🔴 3. UPCOMING ROADMAP

* 🎉 Hackathon requirements complete. Project ready for deployment and submission.

---

## 🗝️ 4. KEY DECISIONS & TECHNICAL CONSTRAINTS
* **API Route:** `POST /api/interview` only.
* **Auto-Start:** Conversation is initiated automatically by the client on mount; user does not type "start".
* **Fail-Safe Memory:** All Breeth API calls must be wrapped in `try/catch` to degrade silently to Redis if network drops.
* **No Deprecated CSS:** Tailwind CSS only (Stitches CSS-in-JS strictly banned due to App Router incompatibility).