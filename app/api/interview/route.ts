/**
 * POST /api/interview — The single API endpoint for the AI Interview Agent
 * 
 * Handles three states:
 * 1. Initialization: { sessionId, candidate } → creates session, returns greeting
 * 2. Conversation Turn: { sessionId, message } → processes answer, returns next question
 * 3. Termination: auto-triggered when questionsAsked >= 8 && daysCovered >= 4
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
  type OngoingResponse,
  type ChatMessage,
} from "@/lib/schemas";
import {
  createSession,
  getSession,
  updateSession,
  appendMessage,
  isInterviewComplete,
} from "@/lib/redis";

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
      await appendMessage(session, systemMessage);

      // Placeholder reply — will be replaced by LLM in Phase 3
      const greeting = `Welcome, ${candidate.member.name}. I'll be conducting your technical interview today based on your progress through the AI Engineering curriculum. Let's get started.`;

      // Store the assistant's greeting
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: greeting,
        timestamp: Date.now(),
      };
      const updatedSession = await getSession(sessionId);
      if (updatedSession) {
        await appendMessage(updatedSession, assistantMessage);
      }

      const response: OngoingResponse = {
        reply: greeting,
        done: false,
      };

      return NextResponse.json(response, { status: 200 });
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

      // Store the candidate's message
      const userMessage: ChatMessage = {
        role: "user",
        content: message,
        timestamp: Date.now(),
      };
      const sessionWithUserMsg = await appendMessage(session, userMessage);

      // ─── Check termination conditions (deterministic, not LLM) ───
      if (isInterviewComplete(sessionWithUserMsg)) {
        // Mark session as done
        const finalSession = await updateSession({
          ...sessionWithUserMsg,
          isDone: true,
        });

        // Placeholder feedback — will be replaced by LLM scorecard in Phase 3
        const response = {
          reply: "Thank you for completing the interview. Here is your feedback.",
          done: true as const,
          feedback: {
            summary: `Interview completed for ${finalSession.candidate.member.name}. ${finalSession.questionsAsked} questions asked across ${finalSession.daysCovered.length} curriculum days.`,
            strengths: ["Placeholder — LLM-generated strengths will appear here in Phase 3"],
            gaps: ["Placeholder — LLM-generated gaps will appear here in Phase 3"],
            next: ["Placeholder — LLM-generated next steps will appear here in Phase 3"],
          },
        };

        return NextResponse.json(response, { status: 200 });
      }

      // Placeholder reply — will be replaced by LangGraph state machine in Phase 3
      const reply = `I've noted your response. Let's continue with the next question. (Questions asked: ${sessionWithUserMsg.questionsAsked}, Days covered: ${sessionWithUserMsg.daysCovered.length})`;

      // Store assistant reply
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: reply,
        timestamp: Date.now(),
      };
      await appendMessage(sessionWithUserMsg, assistantMessage);

      const response: OngoingResponse = {
        reply,
        done: false,
      };

      return NextResponse.json(response, { status: 200 });
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
