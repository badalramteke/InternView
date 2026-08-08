/**
 * POST /api/interview — The single API endpoint for the AI Interview Agent
 * 
 * Handles three states:
 * 1. Initialization: { sessionId, candidate } → creates session, LLM greeting + first question
 * 2. Conversation Turn: { sessionId, message } → evaluates answer, generates next question
 * 3. Termination: auto-triggered when questionsAsked >= 8 && daysCovered >= 4
 * 
 * All interview logic is delegated to the LangGraph engine (lib/langgraph/engine.ts).
 * This route handles request validation, session persistence, and response formatting.
 * 
 * @see /data/technical-spec.md for the full API contract
 * @see /FoundationalFiles/PRD.md Section 5 for payload specs
 * @see /FoundationalFiles/Rules.md for deterministic counter rules
 */

import { NextRequest, NextResponse } from "next/server";
import {
  InitRequestSchema,
  TurnRequestSchema,
  type InitRequest,
  type TurnRequest,
  type ChatMessage,
} from "@/lib/schemas";
import {
  createSession,
  getSession,
  appendMessage,
} from "@/lib/redis";
import {
  handleInitialization,
  handleConversationTurn,
} from "@/lib/langgraph/engine";

// ─────────────────────────────────────────────
// Request Type Detection
// ─────────────────────────────────────────────

function isInitRequest(body: unknown): body is InitRequest {
  return (
    typeof body === "object" &&
    body !== null &&
    "candidate" in body &&
    !("message" in body)
  );
}

function isTurnRequest(body: unknown): body is TurnRequest {
  return (
    typeof body === "object" &&
    body !== null &&
    "message" in body &&
    !("candidate" in body)
  );
}

// ─────────────────────────────────────────────
// POST Handler
// ─────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // Parse the raw JSON body
    const body = await request.json();

    // ─── State 1: Initialization ───
    if (isInitRequest(body)) {
      const parsed = InitRequestSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          {
            error: "Invalid initialization payload",
            details: parsed.error.issues.map((i) => i.message),
          },
          { status: 400 }
        );
      }

      const { sessionId, candidate } = parsed.data;

      // Check if session already exists
      const existing = await getSession(sessionId);
      if (existing) {
        return NextResponse.json(
          { error: "Session already exists. Use a different sessionId." },
          { status: 409 }
        );
      }

      // Create new session in Redis
      const session = await createSession(sessionId, candidate);

      // Store initial system context as first message
      const systemMessage: ChatMessage = {
        role: "system",
        content: `Interview initialized for ${candidate.member.name} (${candidate.member.jobRole}).`,
        timestamp: Date.now(),
      };
      const sessionWithSystem = await appendMessage(session, systemMessage);

      // ─── LangGraph Engine: Generate greeting + first question ───
      const result = await handleInitialization(sessionWithSystem);

      return NextResponse.json(
        { 
          reply: result.reply, 
          done: false,
          questionsAsked: result.updatedSession.questionsAsked,
          maxQuestions: 8
        },
        { status: 200 }
      );
    }

    // ─── State 2: Conversation Turn ───
    if (isTurnRequest(body)) {
      const parsed = TurnRequestSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          {
            error: "Invalid turn payload",
            details: parsed.error.issues.map((i) => i.message),
          },
          { status: 400 }
        );
      }

      const { sessionId, message } = parsed.data;

      // Fetch existing session
      const session = await getSession(sessionId);
      if (!session) {
        return NextResponse.json(
          { error: "Session not found. Initialize first with candidate data." },
          { status: 404 }
        );
      }

      // Check if interview is already done
      if (session.isDone) {
        return NextResponse.json(
          { error: "Interview has already concluded for this session." },
          { status: 410 }
        );
      }

      // ─── LangGraph Engine: Evaluate answer + generate next turn ───
      const result = await handleConversationTurn(session, message);

      if (result.done) {
        // State 3: Termination & Feedback
        return NextResponse.json(
          {
            reply: result.reply,
            done: true,
            feedback: result.feedback,
            questionsAsked: result.updatedSession.questionsAsked,
            maxQuestions: 8
          },
          { status: 200 }
        );
      }

      // Ongoing conversation
      return NextResponse.json(
        { 
          reply: result.reply, 
          done: false,
          questionsAsked: result.updatedSession.questionsAsked,
          maxQuestions: 8
        },
        { status: 200 }
      );
    }

    // ─── Invalid Request ───
    return NextResponse.json(
      {
        error: "Invalid request. Must include either 'candidate' (init) or 'message' (turn), along with 'sessionId'.",
      },
      { status: 400 }
    );
  } catch (error) {
    // Top-level catch-all as required by Rules.md Section 4
    console.error("[POST /api/interview] Unhandled error:", error);

    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
