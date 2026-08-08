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
  * Created `AI_USAGE_LOG.md` template for Stage 1/2 compliance.
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
  * Updated `AI_USAGE_LOG.md` with first entry.

---

## 🟡 2. CURRENTLY WORKING ON
* **Active Phase:** Phase 1 — API Contract & Type Safety (Zod Schemas)
* **Active File(s):**
  * `app/api/interview/route.ts` *(Status: Pending creation)*
  * `lib/redis.ts` *(Status: Pending creation)*
* **Current Objective:** Create the POST /api/interview endpoint with Zod validation and Upstash Redis session management.

---

## 🔴 3. UPCOMING ROADMAP

### Phase 2: Core API & Memory Pluggables
* [ ] Create `app/api/interview/route.ts` handling `POST` requests.
* [ ] Integrate Upstash Redis for `sessionId` state in `lib/redis.ts`.
* [ ] Build Breeth API native `fetch` client in `lib/breeth.ts` with fail-safe error handling.
* [ ] Implement Zod schemas for incoming and outgoing payloads.

### Phase 3: LangGraph State Machine
* [ ] Define `InterviewState` tracking `questionsAsked` and `daysCovered`.
* [ ] Implement skip-filtering logic based on `candidates.json`.
* [ ] Program weakness targeting for high attempt counts (`attempts > 2`).
* [ ] Connect LLM node for question generation and pushback logic.
### Phase 3: LangGraph State Machine
* [ ] Define `InterviewState` tracking `questionsAsked` and `daysCovered`.
* [ ] Implement skip-filtering logic based on `candidates.json`.
* [ ] **Build `EvaluateResponse` Node:** Implement the `TEXTBOOK` vs `APPLIED` classifier.
* [ ] **Build Brutal Pushback Logic:** Route `TEXTBOOK` answers to a pushback prompt without incrementing the question counter.
* [ ] **Build Trap Door Logic:** Configure the `GenerateQuestion` node to check Breeth for unresolved gaps before drafting new questions. 
### Phase 4: Threaded UI & Interactive Components
* [ ] Build continuous chat feed with vertical dashed "Stitch" line in `app/page.tsx`.
* [ ] Create dynamic code component (`components/InteractiveCode.tsx`).
* [ ] Build final JSON feedback dashboard (`components/Scorecard.tsx`).

### Phase 5: Verification & Live Steer Prep
* [ ] Verify Breeth cognitive gap recall (Trap Door questions).
* [ ] Run end-to-end simulation of 8-question minimum constraint.
* [ ] Complete final review of `AI_USAGE_LOG.md`.

---

## 🗝️ 4. KEY DECISIONS & TECHNICAL CONSTRAINTS
* **API Route:** `POST /api/interview` only.
* **Auto-Start:** Conversation is initiated automatically by the client on mount; user does not type "start".
* **Fail-Safe Memory:** All Breeth API calls must be wrapped in `try/catch` to degrade silently to Redis if network drops.
* **No Deprecated CSS:** Tailwind CSS only (Stitches CSS-in-JS strictly banned due to App Router incompatibility).