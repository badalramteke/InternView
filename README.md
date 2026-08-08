<div align="center">
  <div style="background: #00f5ff; width: 48px; height: 48px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-family: monospace; color: #003739; font-size: 24px; margin-bottom: 16px;">
    IV
  </div>
  <h1>Intern-View</h1>
  <p><strong>Intent-Aware AI Technical Interview Agent</strong></p>
  <p><em>V2.0.4-STABLE — Built for the Agentic Coding Hackathon</em></p>
</div>

---

## 📁 Key Project Documents (Judges Start Here!)

To get a clear understanding of the project's requirements, architectural decisions, and AI assistance history, please review the following core documents before exploring the codebase:
- **[PROMPTS.md](./PROMPTS.md)**: A complete, chronologically tracked record of all AI interactions and prompts used to build this project (as required for the Stage 1 & 2 Authenticity Review).
- **[FoundationalFiles/](./FoundationalFiles/)**: Contains the core context driving the agent's logic.
  - **`PRD.md`**: The Product Requirements Document outlining the core problem, features, and target experience.
  - **`Architecture.md`**: The high-level technical design, data flows, and state machine diagram.
  - **`Rules.md`**: The strict deterministic rules and constraints the agent operates under.
  - **`Memory.md`**: The strategy for managing conversation history and the Breeth integration.

---

## 📖 Overview

**Intern-View** is an intelligent, dynamic, and constraint-bound AI technical interviewing agent. It evaluates candidates based on their prior curriculum progress, dynamically generates technical questions, detects generic "textbook" answers to push back on them, and leverages **Breeth** to identify and test long-term cognitive gaps.

Unlike standard chatbots, Intern-View operates via a deterministic **LangGraph state machine** to completely eliminate LLM hallucination over the interview flow and strict requirement constraints.

## 🚀 Key Features

- **The State Machine Engine:** The AI model *does not* control the interview routing. A strict LangGraph state machine enforces topic selection, question limits (8-question minimum), and curriculum coverage (4-day minimum) via deterministic code.
- **Trap Door Logic:** Before asking questions, the agent queries Breeth for candidate cognitive gaps and constructs "Trap Door" questions that specifically target their weaknesses.
- **Brutal Pushback:** The LLM actively evaluates answers as `APPLIED` or `TEXTBOOK`. If a candidate gives a generic definition, the agent triggers a high-contrast warning (the "Brutal Pushback") and demands engineering trade-offs, *without* incrementing the question counter.
- **Weakness Priority Targeting:** The candidate dataset is analyzed on load. Topics where the candidate struggled (e.g., `attempts > 2`) are prioritized, while `skipped` topics are rigorously filtered out so the LLM never sees them.
- **Cyber-Minimalism UI:** A fully bespoke, dark-mode Threaded Developer Workspace layout featuring an interactive code terminal, vertical stitch connectors, and rich end-of-interview feedback scorecards.

---

## 🛠️ Technology Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Core Framework** | [Next.js (App Router)](https://nextjs.org/) | Full-stack React framework (Frontend UI + Server API) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Bespoke "Cyber-Minimalism" design system & token definitions |
| **Agent Engine** | [LangGraph.js](https://langchain-ai.github.io/langgraphjs/) | Deterministic state machine orchestration (Node routing) |
| **LLM Provider** | [Google Gemini](https://ai.google.dev/) | Model inference for question generation and classification |
| **Intent Memory** | [Breeth API](https://thebreeth.com/) | Storage and retrieval of cognitive patterns and intent edges |
| **Session DB** | [Upstash Redis](https://upstash.com/) | Serverless state persistence for active interview sessions |
| **Validation** | [Zod](https://zod.dev/) | Strict API payload schemas and LLM JSON output validation |

---

## 🧠 System Architecture

The core of the application resides in `app/api/interview/route.ts` which delegates all interview logic to the **LangGraph State Machine** (`lib/langgraph/engine.ts`).

### The 4-Node State Machine
1. **Node 1: Select Topic (Deterministic)**
   - Computes whether termination conditions are met (`questionsAsked >= 8` AND `daysCovered >= 4`).
   - If not complete, selects the next un-asked curriculum day, heavily prioritizing weakness topics.
2. **Node 2: Generate Question (LLM + Breeth)**
   - Queries Breeth for active cognitive gaps.
   - Generates an applied engineering question injected with the candidate's context.
3. **Node 3: Evaluate Response (LLM + Logic)**
   - Classifies the candidate's answer (`APPLIED` vs `TEXTBOOK`).
   - If `TEXTBOOK`, issues a "Brutal Pushback" warning to the UI and does **not** increment the question counter.
4. **Node 4: Generate Scorecard (LLM)**
   - Triggered at the end of the session to compile all feedback into a structured JSON scorecard.

---

## 💻 Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/badalramteke/InternView.git
cd InternView
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory. Do not commit this file.
```env
GEMINI_MODEL="gemini-3.5-flash"
GOOGLE_GENERATIVE_AI_API_KEY="your_google_api_key"
BREETH_BEARER_TOKEN="your_breeth_live_token"
UPSTASH_REDIS_REST_URL="your_upstash_url"
UPSTASH_REDIS_REST_TOKEN="your_upstash_token"
```
*(Note: If Upstash Redis is not configured, the app will gracefully degrade to an in-memory session store for local development.)*

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🛡️ Hackathon Constraints & Verification

This project was built under strict constraints. A comprehensive test script (`scripts/test-phase5.ts`) proves the system's deterministic compliance:

- **Constraint:** Interview MUST reach 8 questions.
  - *Proof:* `questionsAsked >= 8` is mathematically enforced in `isInterviewComplete`.
- **Constraint:** Interview MUST cover 4 distinct curriculum days.
  - *Proof:* `daysCovered.length >= 4` is mathematically enforced.
- **Constraint:** "Brutal Pushback" turns do NOT count as questions.
  - *Proof:* Counter logic in `engine.ts` prevents incrementing on `TEXTBOOK` classifications.
- **Constraint:** The LLM must not see skipped topics.
  - *Proof:* `analyzeCandidate` strictly filters out any day where `skipped: true`.

Run the automated test suite to verify all constraints:
```bash
npx tsx scripts/test-phase5.ts
```

---

## 📝 Activity Log

The progression of this project and all AI architectural prompts used during development have been thoroughly documented in the mandatory [PROMPTS.md](./PROMPTS.md) file in the repository root.

---

<div align="center">
  <p>Built for the Agentic Coding Hackathon.</p>
</div>
