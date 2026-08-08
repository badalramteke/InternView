/**
 * Zod Schemas for the AI Interview Agent API
 * 
 * Defines strict validation for:
 * - Candidate profile (matching candidates.json structure)
 * - Init & Turn request payloads
 * - Ongoing & Final response payloads
 * - Session state stored in Redis
 * 
 * @see /data/technical-spec.md for the API contract
 * @see /FoundationalFiles/PRD.md Section 5 for payload shapes
 */

import { z } from "zod/v4";

// ─────────────────────────────────────────────
// Candidate Profile Schemas (mirrors candidates.json)
// ─────────────────────────────────────────────

export const MemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  jobRole: z.string(),
  yearsExperience: z.number(),
  education: z.string(),
  status: z.string(),
});

/** Mission that was completed (passed or failed) */
export const CompletedMissionSchema = z.object({
  day: z.number(),
  title: z.string(),
  passed: z.boolean(),
  attempts: z.number(),
});

/** Mission that was skipped */
export const SkippedMissionSchema = z.object({
  day: z.number(),
  title: z.string(),
  skipped: z.literal(true),
});

/** A mission is either completed or skipped */
export const MissionSchema = z.union([CompletedMissionSchema, SkippedMissionSchema]);

export const SignalsSchema = z.object({
  commitDays: z.number(),
  missionsCompleted: z.number(),
  missionsFirstTry: z.number(),
});

export const CandidateSchema = z.object({
  member: MemberSchema,
  missions: z.array(MissionSchema),
  signals: SignalsSchema,
});

// ─────────────────────────────────────────────
// Request Schemas
// ─────────────────────────────────────────────

/** State 1: Initialize a new interview session */
export const InitRequestSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required"),
  candidate: CandidateSchema,
});

/** State 2: Conversation turn with candidate response */
export const TurnRequestSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required"),
  message: z.string().optional(),
  action: z.enum(["force_scorecard", "continue"]).optional(),
});

/** Discriminated request — init has `candidate`, turn has `message` */
export const RequestSchema = z.union([InitRequestSchema, TurnRequestSchema]);

// ─────────────────────────────────────────────
// Response Schemas
// ─────────────────────────────────────────────

/** Standard ongoing response during interview */
export const OngoingResponseSchema = z.object({
  reply: z.string(),
  done: z.literal(false),
  questionsAsked: z.number().optional(),
  maxQuestions: z.number().optional(),
});

export const FeedbackSchema = z.object({
  summary: z.string(),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  next: z.array(z.string()),
  domain_scores: z.record(z.string(), z.number()),
  role_fit: z.string(),
});

/** Final response when interview is complete */
export const FinalResponseSchema = z.object({
  reply: z.string(),
  done: z.literal(true),
  feedback: FeedbackSchema,
  questionsAsked: z.number().optional(),
  maxQuestions: z.number().optional(),
});

/** Any valid API response */
export const ResponseSchema = z.union([OngoingResponseSchema, FinalResponseSchema]);

// ─────────────────────────────────────────────
// Session State Schema (stored in Redis)
// ─────────────────────────────────────────────

/** A single message in the conversation history */
export const ChatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
  timestamp: z.number(),
});

/** Full session state persisted in Redis under sessionId */
export const SessionStateSchema = z.object({
  sessionId: z.string(),
  candidate: CandidateSchema,
  messages: z.array(ChatMessageSchema),
  questionsAsked: z.number().default(0),
  daysCovered: z.array(z.number()).default([]),
  flaggedTopics: z.array(z.string()).default([]),
  cognitiveGaps: z.array(z.string()).default([]),
  followUpsOnCurrentTopic: z.number().default(0),
  isDone: z.boolean().default(false),
  hasReceivedScorecard: z.boolean().default(false),
  createdAt: z.number(),
  updatedAt: z.number(),
});

// ─────────────────────────────────────────────
// Type Exports (inferred from schemas)
// ─────────────────────────────────────────────

export type Member = z.infer<typeof MemberSchema>;
export type CompletedMission = z.infer<typeof CompletedMissionSchema>;
export type SkippedMission = z.infer<typeof SkippedMissionSchema>;
export type Mission = z.infer<typeof MissionSchema>;
export type Signals = z.infer<typeof SignalsSchema>;
export type Candidate = z.infer<typeof CandidateSchema>;
export type InitRequest = z.infer<typeof InitRequestSchema>;
export type TurnRequest = z.infer<typeof TurnRequestSchema>;
export type OngoingResponse = z.infer<typeof OngoingResponseSchema>;
export type Feedback = z.infer<typeof FeedbackSchema>;
export type FinalResponse = z.infer<typeof FinalResponseSchema>;
export type ApiResponse = z.infer<typeof ResponseSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type SessionState = z.infer<typeof SessionStateSchema>;
