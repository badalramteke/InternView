> 🤖 **SYSTEM INSTRUCTION FOR AI ASSISTANT:**
> When I command you to "Update the AI log," you must immediately append a new entry to the bottom of this file. Do not hallucinate. 
> 
> Every entry MUST contain:
> 1. **Timestamp:** The current date and phase we are working on.
> 2. **AI Tool:** Which tool generated the code (Cursor, Copilot, Gemini, etc.).
> 3. **The Prompt:** The exact prompt or context I gave you.
> 4. **The Output:** A 1-2 sentence summary of what you built (e.g., "Generated POST route with Zod validation").

# Generating Foundational Files

## 📁 Phase 0 — Foundation & Planning

---

### Entry 01 — PRD Initiation

- **Phase:** Phase 0: Foundation & Planning
- **AI Tool:** Gemini
- **The Prompt:**
  > lets make prd first
- **The Output:** Generated an initial Product Requirements Document covering the product vision, problem statement, scope, and core features of the AI Interview Agent.

---

### Entry 02 — PRD Scope Constraint

- **Phase:** Phase 0: Foundation & Planning
- **AI Tool:** Gemini
- **The Prompt:**
  > what to build, targeted user , features. only these three things in the file
- **The Output:** Produced a trimmed PRD with exactly three sections — What to Build, Targeted User, and Features — removing all other boilerplate.

---

### Entry 03 — PRD Feature Addition from Hackathon Brief

- **Phase:** Phase 0: Foundation & Planning
- **AI Tool:** Gemini
- **The Prompt:**
  > from this information add the features : Your Challenge Design and build an AI agent capable of conducting a realistic, multi-turn technical interview. The interview should: Assess the candidate's understanding of the concepts they have completed. Adapt naturally throughout the conversation. Ask intelligent follow-up questions. Maintain context across the interview. Provide actionable feedback at the end. The overall experience should resemble a real technical interview rather than a scripted questionnaire. Minimum Requirements Your solution must: Conduct a conversational technical interview. Ask a minimum of 8 questions covering at least 4 different curriculum days. Generate follow-up questions based on previous responses. Maintain conversation context throughout the interview. Produce structured feedback at the end of the interview. Expose the required HTTP endpoint defined in the Technical Specification.
- **The Output:** Updated the PRD features section by merging the official hackathon challenge requirements and minimum requirements directly into the document.

---

### Entry 04 — PRD Cool Features Brainstorm

- **Phase:** Phase 0: Foundation & Planning
- **AI Tool:** Gemini
- **The Prompt:**
  > any other features in mind that makes this project really cool
- **The Output:** Brainstormed a set of differentiating features including interactive code snippets, Trap Door follow-up questions, Brutal Pushback mechanics, and real-time session memory using Breeth.

---

### Entry 05 — PRD in Markdown Format

- **Phase:** Phase 0: Foundation & Planning
- **AI Tool:** Gemini
- **The Prompt:**
  > okay give me prd in md format
- **The Output:** Converted the PRD into a clean copy-paste ready Markdown file structure with proper headings and sections.

---

### Entry 06 — Detailed PRD for AI Context

- **Phase:** Phase 0: Foundation & Planning
- **AI Tool:** Gemini
- **The Prompt:**
  > give me md text for copy paste and the information should be in more detailed form so ai cant hallucinate it
- **The Output:** Produced a detailed, bulletproof PRD in Markdown where each feature is explained with enough mechanical depth that an AI coding assistant cannot hallucinate the implementation logic.

---

### Entry 07 — PRD Feature Details Correction

- **Phase:** Phase 0: Foundation & Planning
- **AI Tool:** Gemini
- **The Prompt:**
  > ITS GOOD till the 3 point like should be features and i said give in details so ai can hallucinate i have not said anti-hallucination guardrails what ever features we are trying to implement explain it details thats all how to implement it like information, dont tell here use this and that okay
- **The Output:** Rewrote the PRD features section to explain each feature's internal logic and flow in plain detail, removing all framework/library dictation and anti-hallucination framing.

---

### Entry 08 — App Flow & Architecture Brainstorm

- **Phase:** Phase 0: Foundation & Planning
- **AI Tool:** Gemini
- **The Prompt:**
  > lets brainstorm it : app flow & architecture , folder and file structure , tech stack
- **The Output:** Generated a complete architecture breakdown including tech stack selection, folder/file structure, app flow from frontend to backend, and state machine design.

---

### Entry 09 — Breeth Integration + Hackathon Rules Review

- **Phase:** Phase 0: Foundation & Planning
- **AI Tool:** Gemini
- **The Prompt:**
  > this is an hackathon project so they have give me the breeth.com so where i can use it and also a rules for the hackathon and also tell me any changes according to the rules in my prd and here "Hackathon Rules and Evaluation Process To ensure a fair competition, every submission goes through a four-stage evaluation process. Automated verification is completed before judging so that judges only review valid submissions. 1 Stage 1: Eligibility Verification Automatic Verification | Pass / Fail All submissions are automatically verified during submission and rechecked after the submission deadline. A submission must satisfy all of the following requirements: Repository must be publicly accessible. Repository URL must be valid and accessible. Live Demo URL must be functional and return a working application. AI Usage Log must be included and accessible. Submission must belong to a registered team. Submission must be received before the official deadline. Any submission that fails one or more of the above requirements will not proceed to judging. 2 Stage 2: Authenticity Review Automated Analysis + Manual Review This stage verifies that the project was genuinely created during the hackathon. The following indicators may trigger a manual review or even disqualification: Repository was created before the official hackathon kickoff. The first commit already contains most of the project, indicating an imported codebase. Commit history shows little or no development activity during the hackathon, followed by a large final commit. The AI Usage Log does not reasonably correspond to the implemented features. Prompt history appears incomplete, generic, or unrelated to the submitted project. 3 Stage 3: Project Judging Two Independent Judges | 100 Points Eligible submissions are evaluated independently by the judges using the published judging rubric. Each judge scores the project separately. Judges do not see each other's scores. The final score is the average of both judges' scores. If the difference between the two scores exceeds 15 points, a third judge will evaluate the project. In such cases, the median score of the three judges becomes the final score. Only submissions that successfully complete Stages 1 and 2 are evaluated by judges. 4 Stage 4: Live Steer Challenge Final Round | Top 6 Teams The six highest-scoring teams qualify for the Live Steer Challenge. Each finalist team will: Join a live video call. Share their screen throughout the challenge. Receive the same previously unseen feature request. Implement the feature within 20 minutes using their own repository. Use any AI tools they used during the hackathon. The Live Steer Challenge ensures that finalists can demonstrate the same AI-assisted development skills used throughout the hackathon. All verification and judging decisions made by the organizers are final."
- **The Output:** Identified where Breeth fits in the architecture as the intent-aware memory layer and flagged required PRD changes to ensure compliance with all four hackathon evaluation stages.

---

### Entry 10 — Architecture Redo (Clean Pass)

- **Phase:** Phase 0: Foundation & Planning
- **AI Tool:** Gemini
- **The Prompt:**
  > now back to app flow & architecture , folder and file structure , tech stack
- **The Output:** Produced a clean, finalized architecture document covering the full request lifecycle, folder structure, and tech stack with Live Steer Challenge survivability in mind.

---

### Entry 11 — Architecture in Markdown File

- **Phase:** Phase 0: Foundation & Planning
- **AI Tool:** Gemini
- **The Prompt:**
  > give this info in md file copy paste structure
- **The Output:** Converted the architecture, folder structure, and tech stack into a single copy-paste ready Markdown file (`ARCHITECTURE.md`).

---

### Entry 12 — Rules & Execution Guide

- **Phase:** Phase 0: Foundation & Planning
- **AI Tool:** Gemini
- **The Prompt:**
  > what to do, what to avoid , which libraries to use , how to do error handling, boundries of ai on the project according to rules of hackathon
- **The Output:** Generated a five-section execution guide covering Do's, Don'ts, Library choices, Error Handling strategy, and AI boundary definitions relative to hackathon rules.

---

### Entry 13 — Breeth Placement in Rules (Clarification)

- **Phase:** Phase 0: Foundation & Planning
- **AI Tool:** Gemini
- **The Prompt:**
  > i said where that breeth stands here what to do, what to avoid , which libraries to use , how to do error handling, boundries of ai on the project according to rules of hackathon
- **The Output:** Clarified and mapped Breeth's exact role across each of the five execution guide categories without turning it into a standalone Breeth explainer.

---

### Entry 14 — Breeth Fully Integrated into Execution Guide

- **Phase:** Phase 0: Foundation & Planning
- **AI Tool:** Gemini
- **The Prompt:**
  > where breeth is used in libraries i said not giving all about breeth [followed by full pasted execution guide with all 5 sections already written]
- **The Output:** Rewrote the complete five-section execution guide with Breeth seamlessly placed only inside the Libraries section, without bloating other sections.

---

### Entry 15 — Execution Guide in Markdown

- **Phase:** Phase 0: Foundation & Planning
- **AI Tool:** Gemini
- **The Prompt:**
  > md
- **The Output:** Exported the complete execution guide as a clean Markdown file (`RULES.md` / `EXECUTION_GUIDE.md`) ready for copy-paste into the repo.

---

### Entry 16 — Phases Roadmap

- **Phase:** Phase 0: Foundation & Planning
- **AI Tool:** Gemini
- **The Prompt:**
  > now we will phases in how much phase we build the application
- **The Output:** Generated a 5-phase development roadmap covering repo setup, core API build, memory/state integration, frontend, and polish/testing.

---

### Entry 17 — AI Usage Log Requirement Flagged

- **Phase:** Phase 0: Foundation & Planning
- **AI Tool:** Gemini
- **The Prompt:**
  > i think we need to make ai usage log from the first
- **The Output:** Confirmed the AI Usage Log must be created on the very first commit and generated a starter `AI_USAGE_LOG.md` template with the required format.

---

### Entry 18 — Phases Redo (Including AI Log in Phase 1)

- **Phase:** Phase 0: Foundation & Planning
- **AI Tool:** Gemini
- **The Prompt:**
  > i said in phases
- **The Output:** Regenerated the phases roadmap in structured Markdown format with the AI Usage Log creation explicitly included inside Phase 1 as a required step.

---

### Entry 19 — Master Blueprint (Deep, End-to-End)

- **Phase:** Phase 0: Foundation & Planning
- **AI Tool:** Gemini
- **The Prompt:**
  > go more deeply and make more detailed end to end from features to backend to all phases help to ai building so he wont hallucinate
- **The Output:** Generated the master zero-hallucination blueprint document covering every feature's exact mechanics, backend flow, state machine rules, and phase-by-phase build instructions as a single AI coding assistant input file.

---

### Entry 20 — Design System: Color, Theme, Typography

- **Phase:** Phase 0: Foundation & Planning
- **AI Tool:** Gemini
- **The Prompt:**
  > color and theme fonts typography use stitch
- **The Output:** Advised against the Stitches CSS-in-JS library due to App Router incompatibility and recommended Tailwind CSS with a defined color palette and typography system instead.

---

### Entry 21 — UI/UX Prompt Generation for Design Tools

- **Phase:** Phase 0: Foundation & Planning
- **AI Tool:** Gemini
- **The Prompt:**
  > give me prompt of what is my app about for generating its ui/ux dont mention colors and all just give idea what it is and a style of ui this type of ui "Design this website using a 'Luxury Editorial Web Design' style (also known as 'Boutique Editorial' or 'High-End Magazine' design). Apply these general layout, typography, and styling rules: 1. EDITORIAL TYPOGRAPHY... 2. MINIMALIST STRUCTURE & FINE BORDERS... 3. SOPHISTICATED ATMOSPHERE & LIGHTING... 4. PREMIUM COLOR SYSTEMS..."
- **The Output:** Generated a ready-to-paste UI/UX prompt describing the app's product mechanics and applying the Luxury Editorial design style for use in tools like v0, Cursor, or Midjourney.

---

### Entry 22 — Memory / Progress Tracking File

- **Phase:** Phase 0: Foundation & Planning
- **AI Tool:** Gemini
- **The Prompt:**
  > now memory file where what has been completed which file is currently been worked update it regularly
- **The Output:** Generated a `PROGRESS.md` template to serve as the project's live memory file, tracking completed tasks, current work, and remaining items.

---

### Entry 23 — PROGRESS.md Operational Instructions

- **Phase:** Phase 0: Foundation & Planning
- **AI Tool:** Gemini
- **The Prompt:**
  > i said write instructions here what to do in this file
- **The Output:** Added explicit operational instructions at the top of `PROGRESS.md` detailing when and how to read, update, and maintain the file during the build, both for human and AI use.

---

### Entry 24 — Master Blueprint Consolidation

- **Phase:** Phase 0: Foundation & Planning
- **AI Tool:** Gemini
- **The Prompt:**
  > WHAT EVER YOU HAVE GIVEN from this and give me to add from this 'Design and build an AI agent capable of conducting a realistic, multi-turn technical interview. The interview should: Assess the candidate's understanding of the concepts they have completed. Adapt naturally throughout the conversation. Ask intelligent follow-up questions. Maintain context across the interview. Provide actionable feedback at the end. The overall experience should resemble a real technical interview rather than a scripted questionnaire.'
- **The Output:** Produced a consolidated Master System Specification document that merged all previously generated architecture, PRD, and rules content with the official hackathon challenge description.

---

### Entry 25 — Feature Gap Verification

- **Phase:** Phase 0: Foundation & Planning
- **AI Tool:** Gemini
- **The Prompt:**
  > did we miss any of this means feature concept in our mds Design and build an AI agent capable of conducting a realistic, multi-turn technical interview. The interview should: Assess the candidate's understanding of the concepts they have completed. Adapt naturally throughout the conversation. Ask intelligent follow-up questions. Maintain context across the interview. Provide actionable feedback at the end. The overall experience should resemble a real technical interview rather than a scripted questionnaire.
- **The Output:** Verified that every required hackathon feature was covered in the existing documentation and mapped each official requirement to its corresponding implementation mechanic in the blueprint.

---

### Entry 26 — Intelligent Follow-Up Questions Feature Discussion

- **Phase:** Phase 0: Foundation & Planning
- **AI Tool:** Gemini
- **The Prompt:**
  > i have not given this as feature "Ask intelligent follow-up questions." How we hit it: The Trap Door Question & Brutal Pushback. If they give a vague textbook answer, the agent interrupts and demands engineering trade-offs.
- **The Output:** Clarified that the Trap Door and Brutal Pushback mechanics were AI-generated solutions to the "intelligent follow-up" requirement, not user-defined features, and explained the distinction.

---

### Entry 27 — Trap Door & Brutal Pushback Feature in All MDs

- **Phase:** Phase 0: Foundation & Planning
- **AI Tool:** Gemini
- **The Prompt:**
  > okay give for all md file for this feature to add the details about it
- **The Output:** Generated detailed Trap Door and Brutal Pushback mechanics to be added across all foundational documentation files (PRD, Architecture, Master Blueprint) as a standardized feature spec.

---

### Entry 28 — AI Usage Log Instruction Block

- **Phase:** Phase 0: Foundation & Planning
- **AI Tool:** Gemini
- **The Prompt:**
  > give me a small text in that ai log tell to what add here
- **The Output:** Generated the system instruction block to be pasted at the top of `AI_USAGE_LOG.md`, telling any AI coding assistant exactly what format and fields to fill when commanded to update the log.

---

### Entry 1 — Phase 0: Project Scaffolding & Data Setup
- **Timestamp:** 2026-08-08, Phase 0
- **AI Tool:** Gemini (Antigravity IDE)
- **The Prompt:** "Read all foundational docs, then start Phase 0 — scaffold Next.js in the current Intern-View directory with TypeScript, Tailwind, App Router."
- **The Output:** Scaffolded Next.js 16.3.0 project with TypeScript, Tailwind CSS v4, and App Router. Copied `candidates.json` (20 candidates) and `curriculum.json` (31-day, 8-module syllabus) from `resources/` to `data/`. Verified dev server starts on localhost:3000.
