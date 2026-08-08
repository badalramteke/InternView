# App Architecture, Flow & Structure Blueprint: AI Interview Agent

## 1. Tech Stack
* **Framework:** Next.js (App Router) — Handles both the frontend user interface and serverless backend API endpoints within a single repository.
* **Frontend UI:** React and Tailwind CSS — Renders the continuous chat interface, interactive components, and scorecard feedback.
* **Orchestration:** LangGraph.js — Manages the state machine logic, tracks question counts, maps curriculum days, and enforces minimum requirements.
* **Session Management:** Upstash Redis — Serverless data store optimized for tracking active `sessionId` states and chat histories.
* **Intent-Aware Memory:** Breeth API (`thebreeth.com`) — Stores candidate reasoning, cognitive patterns, and intent edges across interview turns for dynamic follow-ups and evaluation.
* **Environment:** Optimized Linux development environment for compilation and performance.

## 2. App Flow & Architecture
1. **Initialization:** 
   * The user opens the web application, which mounts a clean, sequential chat interface.
   * The client generates a unique `sessionId` and sends the `candidate.json` profile payload via a `POST /api/interview` request.
2. **The Conversational Loop:**
   * The user sends a response message.
   * The backend fetches active conversation history from Redis and queries Breeth for past cognitive gaps.
   * LangGraph validates the curriculum data (`curriculum.json`), filtering out skipped topics.
   * The agent generates the next targeted question or an adaptive follow-up.
3. **Dynamic Interaction & Trap Doors:**
   * If a coding question is triggered, the frontend renders an interactive UI element directly in the chat flow rather than static text.
   * Weak or vague answers push a confused intent edge to Breeth, which the agent later recalls during trap-door evaluation turns.
4. **Termination & Feedback Scorecard:**
   * Once the engine confirms `questions_asked >= 8` and `unique_days_covered >= 4`, the loop terminates.
   * The backend returns a structured JSON feedback payload containing a summary, strengths, gaps, and next steps, rendered immediately as an interactive scorecard at the base of the chat stream.

## 3. Folder & File Structure
```text
/
├── app/
│   ├── page.tsx                  # Main sequential chat interface entrypoint
│   └── api/
│       └── interview/
│           └── route.ts          # Required POST /api/interview endpoint
├── components/
│   ├── ChatWindow.tsx            # Message loop component and bubble renderers
│   ├── InteractiveCodeBlock.tsx  # Dynamic JS execution component for code questions
│   └── FeedbackScorecard.tsx     # Rich visual renderer for final JSON feedback
├── lib/
│   ├── langgraph/
│   │   ├── agent.ts              # State machine and question generation logic
│   │   └── tools.ts              # Attempt counters, skip filters, and validators
│   ├── breeth.ts                 # Breeth API/MCP intent-memory client integration
│   └── redis.ts                  # Upstash Redis session connection setup
├── data/
│   ├── candidates.json           # Candidate progress and attempt metrics dataset
│   └── curriculum.json           # 31-day curriculum topics, tools, and objectives
├── PROMPTS.md               # Mandatory hackathon prompt and tool usage log
└── tailwind.config.ts            # Tailwind styling configurations