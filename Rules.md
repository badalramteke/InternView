# AI Interview Agent: Execution Guide & Breeth Integration 🚀

## 1. What to Do 🟢
* **Create Repo After Kickoff:** Start your public Git repository strictly after the official hackathon kickoff time. 🕒
* **Commit Regularly:** Make small, frequent commits with clear messages to prove genuine development history. 🔨
* **Maintain `AI_USAGE_LOG.md`:** Document your prompts, AI assistant interactions, Breeth memory integration, and tool usage continuously in the project root. 📝
* **Enforce API Contract:** Implement `POST /api/interview` exactly as defined in the spec document[cite: 3]. 🔌
* **Enforce Rules in Code:** Use deterministic code to track the 8-question and 4-day curriculum minimums. 📊
* **Leverage Breeth for Intent Memory:** Store candidate reasoning trends and cognitive patterns in Breeth (`thebreeth.com`) on every turn. 🧠
* **Build Modular Code:** Keep your API, state machine, Breeth memory layer, and UI components separated to survive the 20-minute Live Steer Challenge. ⚡

## 2. What to Avoid 🔴
* **No Early Repositories:** Do not use a repository created before the hackathon starts. ❌
* **No Single Giant Commit:** Do not dump a finished codebase in one massive initial commit. ❌
* **No Missing Logs:** Do not forget to include the `AI_USAGE_LOG.md` file in your repository. ❌
* **No Leaked Tokens:** Never commit Breeth Bearer tokens (`ck_live_...`) to GitHub. Keep them safely inside `.env`. 🔑
* **No Memory for Counter Logic:** Do not use Breeth or LLMs to track question counts or covered days. Use code for math. 🛑
* **No Out-of-Scope Features:** Do not waste time on authentication, voice features, or mobile apps. 🚫
* **No Uncontrolled LLMs:** Do not let the LLM guess state transitions or skip candidate checks. 🛑

## 3. Which Libraries to Use 📚
* **`next` & `react`:** Full-stack web framework and component architecture. ⚛️
* **`tailwindcss`:** Utility-first CSS framework for fast UI design. 🎨
* **`@langchain/langgraph`:** State machine orchestration for controlling interview flow. 🧠
* **Native `fetch` API:** Lightweight REST client to interact with Breeth's API without bloated dependencies. 🌐
* **`@modelcontextprotocol/sdk` (Optional):** MCP SDK if connecting Breeth directly through MCP protocol. 🔌
* **`@ai-sdk/openai` or `@google/genai`:** Fast SDK integrations for LLM generation. 💡
* **`@upstash/redis`:** Serverless database for tracking active session state. ⚡
* **`zod`:** Schema validation for API payloads and structured outputs[cite: 3]. 🛡️
* **`lucide-react`:** Icons for the frontend chat interface. 🖼️

## 4. How to Do Error Handling 🛡️
* **Validate Inputs with Zod:** Validate incoming request bodies (`sessionId`, `candidate`, `message`) on every request. Return a `400 Bad Request` if payload structure is wrong[cite: 3]. 🛑
* **Breeth Fail-Safe Strategy:** Wrap all Breeth HTTP requests in `try/catch` blocks. If Breeth drops or times out, fall back silently to local array memory so the interview never crashes. 🔌
* **LLM Call Retries & Timeouts:** Wrap LLM API calls with execution timeouts. If an API call fails, retry once or return a friendly fallback turn. ⏱️
* **Catch-All API Error Responses:** Enclose the `POST /api/interview` handler in a top-level `try/catch` block. Return a clean `500 Internal Server Error` JSON object instead of crashing the process. 💥

## 5. Boundaries of AI on the Project 🤖
* **What the AI Engine & Breeth Do:**
  * **AI Model:** Generates technical questions, evaluates answers, and pushes back on weak responses. 💬
  * **Breeth Engine:** Extracts intent edges, stores `cognitive_pattern` data, and flags recurring candidate misunderstandings. 🧠
  * **AI Model + Breeth:** Pulls stored cognitive gaps to execute trap-door questions and generate the final structured feedback scorecard[cite: 3]. 📊
* **What Deterministic Code Does:**
  * Counts total questions asked (must reach 8 minimum). 🔢
  * Tracks unique curriculum days covered (must reach 4 minimum). 🗓️
  * Filters out candidate skipped topics before feeding prompts to the AI. 🚫
  * Enforces state transitions and routes API responses[cite: 3]. 🛑
  * Validates JSON schemas and endpoint request formats[cite: 3]. 🛡️
* **What You (The Developer) Do:**
  * Write the system architecture, state machine logic, and UI components. 🖥️
  * Connect Breeth REST endpoints inside helper utility files. 🔗
  * Use AI coding assistants (Cursor, Copilot, Gemini) to accelerate building. ⚡
  * Document all major prompts and AI tools in `AI_USAGE_LOG.md` for authenticity verification. 📝

  ## 5. Boundaries of AI on the Project 🤖
* **What the AI Engine & Breeth Do:**
  * **Answer Classification:** The LLM strictly classifies user answers as applied engineering or superficial textbook knowledge.
  * **Brutal Pushback:** The LLM interrupts superficial answers to demand trade-offs, strictly adopting a "tough technical lead" persona.
  * **Trap Door:** Breeth flags cognitive gaps. The LLM recalls them 2-3 turns later to test retention.
* **What Deterministic Code Does:**
  * **Counter Protection:** Code ensures that Brutal Pushback turns *do not* count toward the 8-question minimum (the candidate must survive 8 *real* questions).
  * Enforces state routing, JSON validation, and skip-filtering.