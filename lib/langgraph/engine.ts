/**
 * Interview Engine — The State Machine Core
 * 
 * Implements the 4-node state machine from Phases.md:
 *   Node 1: SelectTopic  (Deterministic) → picks next curriculum day
 *   Node 2: GenerateQuestion (LLM + Breeth) → creates a targeted question
 *   Node 3: EvaluateResponse (LLM) → classifies APPLIED vs TEXTBOOK
 *   Node 4: GenerateScorecard (LLM) → produces final feedback JSON
 * 
 * KEY INVARIANTS (enforced here, NOT by the LLM):
 * - Question counter increments exactly by 1 per real question
 * - Brutal Pushback does NOT increment the counter (Rules.md Section 5)
 * - Skip-filtered topics never reach the LLM
 * - Termination triggers at questionsAsked >= 8 AND daysCovered >= 4
 * 
 * @see /FoundationalFiles/Phases.md Phase 3
 * @see /FoundationalFiles/Rules.md Section 5
 */

import type { SessionState, ChatMessage, Feedback } from "@/lib/schemas";
import { updateSession } from "@/lib/redis";
import { analyzeCandidate, selectNextTopic, buildCandidateContext } from "@/lib/candidate";
import { getCurriculumDay } from "@/lib/curriculum";
import {
  writeEpisode,
  searchCognitiveGaps,
  formatCognitiveGapsForLLM,
} from "@/lib/breeth";
import { generateText, generateJSON } from "@/lib/gemini";
import {
  buildQuestionPrompt,
  buildEvaluationPrompt,
  buildPushbackPrompt,
  buildScorecardPrompt,
} from "./prompts";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface InterviewTurnResult {
  reply: string;
  done: false;
  updatedSession: SessionState;
}

export interface InterviewFinalResult {
  reply: string;
  done: true;
  feedback: Feedback;
  updatedSession: SessionState;
}

export type InterviewResult = InterviewTurnResult | InterviewFinalResult;

interface EvaluationResult {
  classification: "APPLIED" | "TEXTBOOK";
  confidence: number;
  reasoning: string;
}

// ─────────────────────────────────────────────
// Node 1: Handle Initialization (First Turn)
// ─────────────────────────────────────────────

/**
 * Process the first turn — generate a greeting + first question.
 * Called when the session has just been created (init request).
 */
export async function handleInitialization(
  session: SessionState
): Promise<InterviewTurnResult> {
  const analysis = analyzeCandidate(session.candidate);
  const candidateContext = buildCandidateContext(analysis);

  // Select first topic (deterministic — weaknesses first)
  const selectedDay = selectNextTopic(analysis, []);
  const dayInfo = selectedDay ? getCurriculumDay(selectedDay) : null;

  if (!dayInfo || selectedDay === null) {
    // Edge case: no eligible topics
    return {
      reply: "Welcome! Let's begin your technical interview. Can you tell me about your experience with AI engineering concepts?",
      done: false,
      updatedSession: session,
    };
  }

  // Generate opening question with LLM
  const prompt = buildQuestionPrompt({
    candidateContext,
    dayTitle: dayInfo.title,
    dayNumber: dayInfo.day,
    objectives: dayInfo.objectives,
    tools: dayInfo.tools,
    isWeakness: analysis.weaknesses.some((w) => w.day === selectedDay),
    cognitiveGaps: null, // No gaps on first turn
    questionsAsked: 0,
    isFirstQuestion: true,
  });

  const reply = await generateText(prompt, {
    temperature: 0.7,
    maxTokens: 512,
  });

  // DETERMINISTIC: Increment counters
  const updatedSession = await updateSession({
    ...session,
    questionsAsked: 1,
    daysCovered: [selectedDay],
    messages: [
      ...session.messages,
      createMessage("assistant", reply),
    ],
  });

  return { reply, done: false, updatedSession };
}

// ─────────────────────────────────────────────
// Node 2 + 3: Handle Conversation Turn
// ─────────────────────────────────────────────

/**
 * Process a conversation turn — evaluate the answer, then either
 * push back (TEXTBOOK) or generate the next question (APPLIED).
 */
export async function handleConversationTurn(
  session: SessionState,
  userMessage: string
): Promise<InterviewResult> {
  const analysis = analyzeCandidate(session.candidate);
  const candidateContext = buildCandidateContext(analysis);

  // Store user message
  let currentSession = await updateSession({
    ...session,
    messages: [
      ...session.messages,
      createMessage("user", userMessage),
    ],
  });

  // ─── Write to Breeth (fail-safe) ───
  writeEpisode(
    session.sessionId,
    session.candidate.member.name,
    userMessage,
    { turn: String(session.questionsAsked) }
  ).catch(() => {}); // Fire-and-forget, never crash

  // ─── Get the last question asked (for evaluation context) ───
  const lastAssistantMsg = getLastAssistantMessage(currentSession);
  const lastTopicDay = currentSession.daysCovered[currentSession.daysCovered.length - 1];
  const topicInfo = lastTopicDay ? getCurriculumDay(lastTopicDay) : null;

  // ─── Node 3: Evaluate Response (LLM) ───
  const evaluation = await evaluateResponse(
    userMessage,
    lastAssistantMsg,
    topicInfo?.title || "AI Engineering"
  );

  // ─── TEXTBOOK → Brutal Pushback (does NOT increment counter) ───
  if (evaluation.classification === "TEXTBOOK" && evaluation.confidence > 0.6) {
    const pushback = await generatePushback(
      userMessage,
      lastAssistantMsg,
      topicInfo?.title || "AI Engineering",
      evaluation.reasoning
    );

    // Store the pushback — flag it in Breeth as a weak response
    writeEpisode(
      session.sessionId,
      session.candidate.member.name,
      `[TEXTBOOK ANSWER DETECTED] Topic: ${topicInfo?.title}. Reasoning: ${evaluation.reasoning}`,
      { type: "cognitive_gap", classification: "TEXTBOOK" }
    ).catch(() => {});

    const updatedSession = await updateSession({
      ...currentSession,
      messages: [
        ...currentSession.messages,
        createMessage("assistant", pushback),
      ],
      // Add to flagged topics for deeper questioning later
      flaggedTopics: [
        ...currentSession.flaggedTopics,
        topicInfo?.title || `Day ${lastTopicDay}`,
      ],
    });

    // CRITICAL: No counter increment for Brutal Pushback (Rules.md Section 5)
    return { reply: pushback, done: false, updatedSession };
  }

  // ─── APPLIED → Check termination, then generate next question ───

  // Write applied response to Breeth with intent extraction
  writeEpisode(
    session.sessionId,
    session.candidate.member.name,
    `[APPLIED ANSWER] Topic: ${topicInfo?.title}. Answer: ${userMessage}`,
    { type: "applied_knowledge", classification: "APPLIED" }
  ).catch(() => {});

  // ─── Check if interview should terminate ───
  if (
    currentSession.questionsAsked >= 8 &&
    currentSession.daysCovered.length >= 4
  ) {
    return await handleTermination(currentSession, candidateContext);
  }

  // ─── Node 2: Select Topic & Generate Next Question ───
  const selectedDay = selectNextTopic(analysis, currentSession.daysCovered);
  const dayInfo = selectedDay ? getCurriculumDay(selectedDay) : null;

  if (!dayInfo || selectedDay === null) {
    // Fallback: re-use any previous topic
    return await generateFallbackQuestion(currentSession, candidateContext, analysis);
  }

  // Query Breeth for cognitive gaps (Trap Door mechanic)
  const cognitiveGaps = await searchCognitiveGaps(
    session.sessionId,
    session.candidate.member.name,
    `weak areas and misunderstandings for ${topicInfo?.title}`
  );
  const gapsContext = formatCognitiveGapsForLLM(cognitiveGaps);

  const prompt = buildQuestionPrompt({
    candidateContext,
    dayTitle: dayInfo.title,
    dayNumber: dayInfo.day,
    objectives: dayInfo.objectives,
    tools: dayInfo.tools,
    isWeakness: analysis.weaknesses.some((w) => w.day === selectedDay),
    cognitiveGaps: gapsContext,
    questionsAsked: currentSession.questionsAsked,
    isFirstQuestion: false,
  });

  const reply = await generateText(prompt, {
    temperature: 0.7,
    maxTokens: 512,
  });

  // DETERMINISTIC: Increment counters
  const newDaysCovered = currentSession.daysCovered.includes(selectedDay)
    ? currentSession.daysCovered
    : [...currentSession.daysCovered, selectedDay];

  const updatedSession = await updateSession({
    ...currentSession,
    questionsAsked: currentSession.questionsAsked + 1,
    daysCovered: newDaysCovered,
    cognitiveGaps: cognitiveGaps.length > 0
      ? [...currentSession.cognitiveGaps, ...cognitiveGaps.map((g) => g.content)]
      : currentSession.cognitiveGaps,
    messages: [
      ...currentSession.messages,
      createMessage("assistant", reply),
    ],
  });

  // ─── Post-question termination check ───
  if (updatedSession.questionsAsked >= 8 && updatedSession.daysCovered.length >= 4) {
    // Don't terminate yet — let the candidate answer this question first.
    // Termination will happen on the NEXT turn.
  }

  return { reply, done: false, updatedSession };
}

// ─────────────────────────────────────────────
// Node 3: Evaluate Response (LLM)
// ─────────────────────────────────────────────

async function evaluateResponse(
  candidateAnswer: string,
  questionAsked: string,
  topicTitle: string
): Promise<EvaluationResult> {
  try {
    const prompt = buildEvaluationPrompt({
      candidateAnswer,
      questionAsked,
      topicTitle,
    });

    const result = await generateJSON<EvaluationResult>(prompt, {
      temperature: 0.3, // Low temp for consistent classification
      maxTokens: 256,
    });

    // Validate the result shape
    if (
      result.classification === "APPLIED" ||
      result.classification === "TEXTBOOK"
    ) {
      return result;
    }

    // Default to APPLIED if classification is unclear
    return {
      classification: "APPLIED",
      confidence: 0.5,
      reasoning: "Classification unclear — defaulting to APPLIED.",
    };
  } catch {
    // FAIL-SAFE: If evaluation fails, assume APPLIED (don't punish the candidate)
    console.error("[Engine] Evaluation failed — defaulting to APPLIED");
    return {
      classification: "APPLIED",
      confidence: 0.5,
      reasoning: "Evaluation error — defaulting to APPLIED.",
    };
  }
}

// ─────────────────────────────────────────────
// Brutal Pushback Generator
// ─────────────────────────────────────────────

async function generatePushback(
  candidateAnswer: string,
  questionAsked: string,
  topicTitle: string,
  evaluationReasoning: string
): Promise<string> {
  const prompt = buildPushbackPrompt({
    candidateAnswer,
    questionAsked,
    topicTitle,
    evaluationReasoning,
  });

  return generateText(prompt, {
    temperature: 0.8, // Slightly higher for more natural pushback
    maxTokens: 256,
  });
}

// ─────────────────────────────────────────────
// Node 4: Generate Scorecard (Termination)
// ─────────────────────────────────────────────

async function handleTermination(
  session: SessionState,
  candidateContext: string
): Promise<InterviewFinalResult> {
  // Build conversation summary from messages
  const conversationSummary = session.messages
    .filter((m) => m.role !== "system")
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .slice(-20) // Last 20 messages max for context window
    .join("\n\n");

  // Query Breeth for final cognitive profile
  const finalGaps = await searchCognitiveGaps(
    session.sessionId,
    session.candidate.member.name,
    "overall cognitive patterns and gaps"
  );
  const gapsContext = formatCognitiveGapsForLLM(finalGaps);

  const prompt = buildScorecardPrompt({
    candidateContext,
    conversationSummary,
    questionsAsked: session.questionsAsked,
    daysCovered: session.daysCovered,
    cognitiveGaps: gapsContext,
  });

  let feedback: Feedback;
  try {
    feedback = await generateJSON<Feedback>(prompt, {
      temperature: 0.5,
      maxTokens: 1024,
    });

    // Validate the feedback shape
    if (
      !feedback.summary ||
      !Array.isArray(feedback.strengths) ||
      !Array.isArray(feedback.gaps) ||
      !Array.isArray(feedback.next)
    ) {
      throw new Error("Invalid feedback shape");
    }
  } catch {
    // Fallback feedback if LLM fails
    feedback = {
      summary: `Interview completed for ${session.candidate.member.name}. ${session.questionsAsked} questions were asked across ${session.daysCovered.length} curriculum areas.`,
      strengths: ["Completed the full interview process", "Engaged with technical topics"],
      gaps: ["Some areas showed surface-level understanding", "Could benefit from more practical experience"],
      next: ["Review flagged topics in depth", "Practice implementing concepts in real projects"],
    };
  }

  // Mark session as done
  const updatedSession = await updateSession({
    ...session,
    isDone: true,
    messages: [
      ...session.messages,
      createMessage(
        "assistant",
        `Interview complete. Here is your feedback:\n\n**Summary:** ${feedback.summary}`
      ),
    ],
  });

  return {
    reply: `Thank you for completing this interview, ${session.candidate.member.name}. I've assessed your performance across ${session.daysCovered.length} curriculum areas. Here's your detailed feedback.`,
    done: true,
    feedback,
    updatedSession,
  };
}

// ─────────────────────────────────────────────
// Fallback Question (when no new topics available)
// ─────────────────────────────────────────────

async function generateFallbackQuestion(
  session: SessionState,
  candidateContext: string,
  analysis: ReturnType<typeof analyzeCandidate>
): Promise<InterviewTurnResult> {
  // Pick a random covered day for a deeper dive
  const randomDay =
    session.daysCovered[Math.floor(Math.random() * session.daysCovered.length)];
  const dayInfo = randomDay ? getCurriculumDay(randomDay) : null;

  if (!dayInfo) {
    const reply =
      "Let's dig deeper into your experience. Can you walk me through a challenging AI engineering problem you've solved recently?";
    const updatedSession = await updateSession({
      ...session,
      questionsAsked: session.questionsAsked + 1,
      messages: [...session.messages, createMessage("assistant", reply)],
    });
    return { reply, done: false, updatedSession };
  }

  const prompt = buildQuestionPrompt({
    candidateContext,
    dayTitle: dayInfo.title,
    dayNumber: dayInfo.day,
    objectives: dayInfo.objectives,
    tools: dayInfo.tools,
    isWeakness: analysis.weaknesses.some((w) => w.day === randomDay),
    cognitiveGaps: null,
    questionsAsked: session.questionsAsked,
    isFirstQuestion: false,
  });

  const reply = await generateText(prompt, {
    temperature: 0.8,
    maxTokens: 512,
  });

  const updatedSession = await updateSession({
    ...session,
    questionsAsked: session.questionsAsked + 1,
    messages: [...session.messages, createMessage("assistant", reply)],
  });

  return { reply, done: false, updatedSession };
}

// ─────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────

function createMessage(
  role: "system" | "user" | "assistant",
  content: string
): ChatMessage {
  return { role, content, timestamp: Date.now() };
}

function getLastAssistantMessage(session: SessionState): string {
  for (let i = session.messages.length - 1; i >= 0; i--) {
    if (session.messages[i].role === "assistant") {
      return session.messages[i].content;
    }
  }
  return "Tell me about your experience with this topic.";
}
