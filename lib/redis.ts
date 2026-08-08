/**
 * Session Manager with Upstash Redis + In-Memory Fallback
 * 
 * Uses Upstash Redis when UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
 * are configured. Falls back to an in-memory Map otherwise (dev mode).
 * 
 * @see /FoundationalFiles/Phases.md Phase 1, Step 4
 * @see /FoundationalFiles/Rules.md Section 4 — Fail-safe strategy
 */

import {
  SessionStateSchema,
  type SessionState,
  type Candidate,
  type ChatMessage,
} from "./schemas";

// ─────────────────────────────────────────────
// Storage Backend Interface
// ─────────────────────────────────────────────

interface SessionStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
}

// ─────────────────────────────────────────────
// In-Memory Fallback Store (for dev / when Redis is unavailable)
// ─────────────────────────────────────────────

class InMemoryStore implements SessionStore {
  private store = new Map<string, { value: string; expiresAt: number }>();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}

// ─────────────────────────────────────────────
// Upstash Redis Store
// ─────────────────────────────────────────────

class UpstashStore implements SessionStore {
  private redis: import("@upstash/redis").Redis;

  constructor() {
    // Dynamic import to avoid issues when Redis isn't configured
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Redis } = require("@upstash/redis") as typeof import("@upstash/redis");
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  async get(key: string): Promise<string | null> {
    const raw = await this.redis.get<string>(key);
    return raw ?? null;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.redis.set(key, value, { ex: ttlSeconds });
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
}

// ─────────────────────────────────────────────
// Store Initialization
// ─────────────────────────────────────────────

function createStore(): SessionStore {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    console.log("[Session] Using Upstash Redis store");
    return new UpstashStore();
  }

  console.warn(
    "[Session] ⚠️  UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set. Using in-memory store (dev mode)."
  );
  return new InMemoryStore();
}

const store = createStore();

/** Key prefix for session state */
const SESSION_PREFIX = "interview:session:";

function sessionKey(sessionId: string): string {
  return `${SESSION_PREFIX}${sessionId}`;
}

/** Session TTL: 2 hours */
const SESSION_TTL = 7200;

// ─────────────────────────────────────────────
// Session CRUD Operations
// ─────────────────────────────────────────────

/**
 * Create a new interview session.
 * Called on the initial POST /api/interview with candidate data.
 */
export async function createSession(
  sessionId: string,
  candidate: Candidate
): Promise<SessionState> {
  const now = Date.now();

  const session: SessionState = {
    sessionId,
    candidate,
    messages: [],
    questionsAsked: 0,
    daysCovered: [],
    flaggedTopics: [],
    cognitiveGaps: [],
    followUpsOnCurrentTopic: 0,
    isDone: false,
    hasReceivedScorecard: false,
    createdAt: now,
    updatedAt: now,
  };

  await store.set(sessionKey(sessionId), JSON.stringify(session), SESSION_TTL);
  return session;
}

/**
 * Retrieve an existing session.
 * Returns null if session doesn't exist or has expired.
 */
export async function getSession(
  sessionId: string
): Promise<SessionState | null> {
  const raw = await store.get(sessionKey(sessionId));
  if (!raw) return null;

  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return SessionStateSchema.parse(parsed);
  } catch (err) {
    console.error(`[Session] Failed to parse session: ${sessionId}`, err);
    return null;
  }
}

/**
 * Update an existing session.
 * Automatically bumps the updatedAt timestamp.
 */
export async function updateSession(
  session: SessionState
): Promise<SessionState> {
  const updated: SessionState = {
    ...session,
    updatedAt: Date.now(),
  };

  await store.set(
    sessionKey(session.sessionId),
    JSON.stringify(updated),
    SESSION_TTL
  );
  return updated;
}

/**
 * Append a message to the session's conversation history.
 */
export async function appendMessage(
  session: SessionState,
  message: ChatMessage
): Promise<SessionState> {
  return updateSession({
    ...session,
    messages: [...session.messages, message],
  });
}

/**
 * Record that a question was asked on a specific curriculum day.
 * Increments questionsAsked and adds the day to daysCovered (if unique).
 */
export async function recordQuestion(
  session: SessionState,
  day: number
): Promise<SessionState> {
  const daysCovered = session.daysCovered.includes(day)
    ? session.daysCovered
    : [...session.daysCovered, day];

  return updateSession({
    ...session,
    questionsAsked: session.questionsAsked + 1,
    daysCovered,
  });
}

/**
 * Check if the interview termination conditions are met.
 * Requirements: >= 8 questions asked AND >= 4 unique days covered.
 * 
 * This is DETERMINISTIC — the LLM never controls this logic.
 * @see /FoundationalFiles/Rules.md Section 5
 */
export function isInterviewComplete(session: SessionState): boolean {
  return session.questionsAsked >= 8 && session.daysCovered.length >= 4;
}

/**
 * Delete a session (cleanup).
 */
export async function deleteSession(sessionId: string): Promise<void> {
  await store.del(sessionKey(sessionId));
}
