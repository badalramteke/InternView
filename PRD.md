
# Product Requirements Document (PRD): AI Interview Agent

## 1. Product Vision & Scope
**What:** An API-driven, intent-aware AI Interview Agent that conducts a dynamic, multi-turn technical assessment.

**Why:** To evaluate candidates on a 31-day AI engineering curriculum through realistic technical dialogue rather than rigid scripts.

**Goal:** Deliver a realistic technical interview that adapts to candidate progress, tracks cognitive patterns using intent memory, and produces structured feedback.

## 2. Target User & Data Dependencies
**User:** AI Cohort program participants.
**Data Dependencies:**
* `candidates.json`: Candidate progress, skipped modules, attempt history.
* `curriculum.json`: 31-day topics, tools, and objectives.
* `Breeth API / MCP`: Intent-aware memory store for tracking candidate reasoning and cognitive patterns across interview turns.

## 3. Core Features (Detailed Mechanics)

### A. Intent-Aware State & Context Management (Powered by Breeth)
* **How it works:** On every candidate response, the backend sends the response along with extracted intent edges to Breeth (`thebreeth.com`). Breeth records `cognitive_patterns` (e.g., "confuses vector indexing methods") and `why_connected` reasoning. This prevents context drift and retains exact candidate knowledge state throughout the interview.

### B. Volume Control & Curriculum Coverage
* **How it works:** The system maintains strict counters in session state.
* The interview loop cannot finish until `questions_asked >= 8` and `unique_days_covered >= 4`.
* Questions are mapped directly to completed days in `curriculum.json`.

### C. Dynamic Adaptation (Respecting Skips)
* **How it works:** The system inspects the candidate's profile in `candidates.json`. Any module with `"skipped": true` is filtered out of the active question pool. Questions are strictly selected from completed days.

### D. Targeted Weakness Deep-Dive
* **How it works:** Missions in `candidates.json` with high attempt counts (e.g., `attempts > 2`) are flagged as focus areas. The agent prioritizes these topics for in-depth technical evaluation.

## 4. Differentiator Features (Detailed Mechanics)

### A. Interactive Code Snippets
* **How it works:** For technical code challenges, the system supplies a dynamic JavaScript implementation that responds to user touch and interaction directly within the UI, rather than static markdown text.

### B. Unified Chat Architecture
* **How it works:** Multi-screen workflows and evaluation metrics render directly inside the continuous, sequential chat interface. Final scorecard feedback displays as a rich message within the chat stream.

### C. The Trap Door & Brutal Pushback Mechanisms
* **The Brutal Pushback (Immediate Reaction):** If a candidate provides a superficial, textbook definition or uses buzzwords without context, the LLM is instructed to immediately reject the answer. It interrupts the standard flow, flags the UI with a warning state, and demands engineering trade-offs (e.g., "That's the textbook definition of RAG. Now tell me how you handle chunking strategies when your context window is overflowing").
* **The Trap Door (Delayed Reaction):** Powered by Breeth intent memory. When a candidate demonstrates a subtle misunderstanding, the agent does not immediately correct them. It logs the `cognitive_pattern`. 2 to 3 turns later, the agent pivots and fires a highly specific, complex question targeting that exact previously logged gap.

## 5. API Specification & Contract
Expose exactly one endpoint: `POST /api/interview`.

**State 1: Initialization**
* **Request:** `{ "sessionId": "string", "candidate": { ... } }`
* **Response:** `{ "reply": "string", "done": false }`

**State 2: Conversation Turn**
* **Request:** `{ "sessionId": "string", "message": "string" }`
* **Response:** `{ "reply": "string", "done": false }`

**State 3: Termination & Feedback**
* **Condition:** Triggered when `questions_asked >= 8` and `unique_days_covered >= 4`.
* **Response:**
  ```json
  {
    "reply": "string",
    "done": true,
    "feedback": {
      "summary": "string",
      "strengths": ["string"],
      "gaps": ["string"],
      "next": ["string"]
    }
  }