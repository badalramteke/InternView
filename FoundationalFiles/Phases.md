# 🛑 SYSTEM PROMPT & END-TO-END EXECUTION BLUEPRINT
**Target:** AI Interview Agent (Next.js App Router + LangGraph + Breeth)
**Directive to AI Assistant:** Read this entire document before generating code. Do not hallucinate logic. Follow the exact phases and deterministic rules outlined below.

## 🏁 PHASE 0: Hackathon Rules & Repository Setup
**Goal:** Establish compliance before writing a single line of logic.
1.  **Initialize Git:** Start tracking immediately. Make small, atomic commits. 
2.  **Create `PROMPTS.md`:** This must be the very first commit. Track every generated snippet here.
3.  **Project Scaffold:** Run `npx create-next-app@latest`. Use TypeScript, Tailwind CSS, and App Router.
4.  **Mock Data:** Create `/data/candidates.json` and `/data/curriculum.json`. The AI must parse these files locally.

---

## ⚙️ PHASE 1: API Contract & Type Safety (Strict Zod Schemas)
**Goal:** Expose the exact API required by the spec. The AI must not invent new endpoints.
1.  **The Route:** Create `app/api/interview/route.ts`. It must handle `POST` requests exclusively[cite: 3].
2.  **Request Schemas (Zod):**
    *   `InitRequest`: Requires `sessionId` (string) and `candidate` (object matching `candidates.json`)[cite: 3].
    *   `TurnRequest`: Requires `sessionId` (string) and `message` (string)[cite: 3].
3.  **Response Schemas (Zod):**
    *   `OngoingResponse`: Returns `{ reply: string, done: false }`[cite: 3].
    *   `FinalResponse`: Returns `{ reply: string, done: true, feedback: { summary: string, strengths: string[], gaps: string[], next: string[] } }`[cite: 3].
4.  **Session Memory:** Connect to Upstash Redis. Store `messages`, `questions_asked`, `days_covered`, and `flagged_topics` under the `sessionId` key.

---

## 🧠 PHASE 2: Data Ingestion & Intent Memory (Breeth)
**Goal:** Wire up external systems deterministically.
1.  **Parse Curriculum:** Write a utility to load `curriculum.json`. Map out every day and its associated toolset[cite: 2].
2.  **Parse Candidate Profile:** Write a utility to load `candidates.json`. 
    *   **Strict Rule:** Filter out any mission where `"skipped": true`[cite: 1]. The LLM must never see skipped topics.
    *   **Strict Rule:** Identify missions where `"attempts" > 2`. Flag these for targeted questioning[cite: 1].
3.  **Breeth Integration (`lib/breeth.ts`):** Write a native `fetch` client to hit the Breeth REST API.
    *   *Write Action:* After a user message, send it to Breeth to extract `cognitive_pattern`.
    *   *Read Action:* Before generating a question, query Breeth to fetch the candidate's active cognitive gaps. 
    *   *Fail-Safe:* Wrap all Breeth calls in `try/catch`. If it fails, degrade gracefully to Redis chat history. Do not crash.

---

## 🤖 PHASE 3: The LangGraph State Machine (Anti-Hallucination Core)
**Goal:** The LLM does NOT control the interview flow. The state machine controls the LLM.
1.  **Define the State Object:**
    ```typescript
    interface InterviewState {
      messages: BaseMessage[];
      questionsAsked: number; // Must increment exactly by 1 per question
      daysCovered: number[];  // Must append unique day IDs
      candidateData: any;
      isDone: boolean;
    }
    ```
2.  **Node 1: Select Topic (Deterministic)**
    *   Check `questionsAsked` and `daysCovered.length`.
    *   If `questionsAsked >= 8` AND `daysCovered.length >= 4`, set `isDone = true` and route to Node 4[cite: 2, 3].
    *   Otherwise, select a non-skipped day from the filtered curriculum list.
3.  **Node 2: Generate Question (LLM)**
    *   Inject the selected day's objective and tools into the system prompt[cite: 2].
    *   Inject Breeth's cognitive gaps (if any) to trigger a "Trap Door" question.
    *   LLM outputs the question text. Increment `questionsAsked`. Add day to `daysCovered`.
4.  **Node 3: Evaluate Response (LLM + Logic)**
    *   LLM reads user answer. If it's a generic textbook answer, trigger the "Brutal Pushback" prompt (demand engineering trade-offs).
5.  **Node 4: Generate Scorecard (LLM)**
    *   Triggered only when the loop ends. 
    *   Query Breeth's compressed profile. Force the LLM to output strict JSON matching the `FinalResponse` Zod schema[cite: 3].
'## 🤖 PHASE 3: The LangGraph State Machine (Anti-Hallucination Core)
1. **Define the State Object:** Track `messages`, `questionsAsked`, `daysCovered`, and `cognitiveGaps`.
2. **Node 1: Topic Selection:** Check `questionsAsked >= 8` limit. Select a non-skipped day.
3. **Node 2: Evaluate Response (The Pushback Node):** 
   * LLM reads the user's answer and classifies it as `APPLIED` or `TEXTBOOK`.
   * If `TEXTBOOK`: Trigger Brutal Pushback. Ask for trade-offs. Do NOT increment question counters.
   * If `APPLIED`: Send response to Breeth to extract intent edges.
4. **Node 3: Generate Question (The Trap Door Node):**
   * Check Breeth memory. If an unresolved `cognitive_pattern` exists from past turns, construct a Trap Door question targeting that specific weakness.
   * Otherwise, generate a standard curriculum question. Increment counters.
5. **Node 4: Generate Scorecard:** Loop ends. Query Breeth for the final JSON payload.
'
---

## 🎨 PHASE 4: Single-Screen Chat UI
**Goal:** Build a continuous, immersive chat experience. No routing to other pages.
1.  **Main Chat Component (`app/page.tsx`):**
    *   Generate a UUID for `sessionId` on mount.
    *   Render a standard chat bubble interface using Tailwind CSS.
2.  **Interactive Code Blocks (`components/InteractiveCode.tsx`):**
    *   If the LLM response contains a specific code tag, render a dynamic, clickable UI component instead of static Markdown. 
3.  **Feedback Scorecard (`components/Scorecard.tsx`):**
    *   When the API returns `done: true`, stop the chat input. 
    *   Render the `summary`, `strengths`, `gaps`, and `next` arrays as a highly visual, styled dashboard at the bottom of the chat feed[cite: 3].

---

## 🚨 PHASE 5: Live Steer Challenge Prep
**Goal:** Ensure the codebase is ready for Stage 4 judging (live 20-minute coding).
1.  **Component Isolation:** Ensure `route.ts`, the LangGraph agent, and the UI components do not share tangled logic. 
2.  **Log Final Prompts:** Ensure the `PROMPTS.md` is fully updated with all architectural prompts.
3.  **Test the Constraints:** Manually verify that the interview NEVER ends at 7 questions, and NEVER ends covering only 3 days.