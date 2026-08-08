/**
 * Breeth API Client — Intent-Aware Memory Layer
 * 
 * Native fetch client for Breeth REST API (https://api.thebreeth.com).
 * Used to:
 *  - WRITE: Store candidate responses with cognitive pattern extraction
 *  - READ: Query for candidate's active cognitive gaps before generating questions
 * 
 * FAIL-SAFE: All calls wrapped in try/catch. If Breeth is down,
 * returns empty/fallback values so the interview NEVER crashes.
 * 
 * @see /FoundationalFiles/Phases.md Phase 2, Step 3
 * @see /FoundationalFiles/Rules.md Section 4 — Error handling
 */

// ─────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────

const BREETH_API_BASE = "https://api.thebreeth.com";
const BREETH_API_VERSION = "v1";

function getApiUrl(path: string): string {
  return `${BREETH_API_BASE}/${BREETH_API_VERSION}${path}`;
}

function getHeaders(): Record<string, string> {
  const token = process.env.BREETH_BEARER_TOKEN;
  if (!token) {
    console.warn("[Breeth] ⚠️  BREETH_BEARER_TOKEN not set. Breeth calls will be no-ops.");
  }
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface BreethEpisodePayload {
  /** The content to store (candidate's answer + context) */
  content: string;
  /** Enable cognitive pattern extraction */
  extract_intent?: boolean;
  /** Optional metadata tags */
  metadata?: Record<string, string>;
}

export interface BreethSearchPayload {
  /** The search query */
  query: string;
  /** Max results to return */
  limit?: number;
  /** Optional metadata filter */
  metadata?: Record<string, string>;
}

export interface BreethSearchResult {
  content: string;
  score: number;
  metadata?: Record<string, string>;
  cognitive_pattern?: string;
}

export interface BreethWriteResult {
  success: boolean;
  episode_id?: string;
  error?: string;
}

// ─────────────────────────────────────────────
// WRITE: Store Candidate Response as Episode
// ─────────────────────────────────────────────

/**
 * Write a candidate's response to Breeth with intent extraction enabled.
 * This stores the response as an "episode" and extracts cognitive patterns.
 * 
 * FAIL-SAFE: Returns { success: false } if Breeth is unavailable.
 */
export async function writeEpisode(
  sessionId: string,
  candidateName: string,
  content: string,
  additionalMetadata?: Record<string, string>
): Promise<BreethWriteResult> {
  try {
    const token = process.env.BREETH_BEARER_TOKEN;
    if (!token) {
      console.warn("[Breeth] No token — skipping write.");
      return { success: false, error: "No Breeth token configured" };
    }

    const payload: BreethEpisodePayload = {
      content: `[Session: ${sessionId}] [Candidate: ${candidateName}] ${content}`,
      extract_intent: true,
      metadata: {
        session_id: sessionId,
        candidate_name: candidateName,
        source: "intern-view-interview",
        ...additionalMetadata,
      },
    };

    const response = await fetch(getApiUrl("/episodes"), {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error(`[Breeth] Write failed (${response.status}): ${errorText}`);
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }

    const result = await response.json();
    console.log(`[Breeth] Episode written for session ${sessionId}`);
    return {
      success: true,
      episode_id: result.uuid || result.id || "unknown",
    };
  } catch (error) {
    // FAIL-SAFE: Log and return gracefully
    console.error("[Breeth] Write error (falling back silently):", error);
    return { success: false, error: String(error) };
  }
}

// ─────────────────────────────────────────────
// READ: Search for Candidate's Cognitive Gaps
// ─────────────────────────────────────────────

/**
 * Query Breeth for the candidate's cognitive patterns and gaps.
 * Used before generating a question to enable Trap Door mechanics.
 * 
 * FAIL-SAFE: Returns empty array if Breeth is unavailable.
 */
export async function searchCognitiveGaps(
  sessionId: string,
  candidateName: string,
  query?: string
): Promise<BreethSearchResult[]> {
  try {
    const token = process.env.BREETH_BEARER_TOKEN;
    if (!token) {
      console.warn("[Breeth] No token — skipping search.");
      return [];
    }

    const searchQuery =
      query ||
      `cognitive gaps and misunderstandings for candidate ${candidateName} in session ${sessionId}`;

    const payload: BreethSearchPayload = {
      query: searchQuery,
      limit: 5,
      metadata: {
        session_id: sessionId,
        candidate_name: candidateName,
      },
    };

    const response = await fetch(getApiUrl("/search"), {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000), // 8s timeout
    });

    if (!response.ok) {
      console.error(`[Breeth] Search failed (${response.status})`);
      return [];
    }

    const result = await response.json();

    // Normalize the response — Breeth may return results in different shapes
    const results: BreethSearchResult[] = Array.isArray(result)
      ? result
      : Array.isArray(result.results)
        ? result.results
        : Array.isArray(result.facts)
          ? result.facts
          : [];

    console.log(
      `[Breeth] Found ${results.length} cognitive gap(s) for ${candidateName}`
    );
    return results;
  } catch (error) {
    // FAIL-SAFE: Log and return empty — interview continues without Breeth data
    console.error("[Breeth] Search error (falling back silently):", error);
    return [];
  }
}

// ─────────────────────────────────────────────
// HELPER: Build Cognitive Gap Context for LLM
// ─────────────────────────────────────────────

/**
 * Format Breeth search results into a context string for the LLM.
 * This is injected into the system prompt to enable Trap Door questions.
 */
export function formatCognitiveGapsForLLM(
  gaps: BreethSearchResult[]
): string | null {
  if (gaps.length === 0) return null;

  const lines: string[] = [
    "COGNITIVE GAPS (from previous turns — use for Trap Door questions):",
  ];

  for (const gap of gaps) {
    const pattern = gap.cognitive_pattern
      ? ` | Pattern: ${gap.cognitive_pattern}`
      : "";
    lines.push(`  - ${gap.content}${pattern}`);
  }

  return lines.join("\n");
}

/**
 * Check if Breeth is configured and reachable.
 * Useful for health checks.
 */
export async function isBreethAvailable(): Promise<boolean> {
  try {
    const token = process.env.BREETH_BEARER_TOKEN;
    if (!token) return false;

    // Simple ping by trying to search for nothing
    const response = await fetch(getApiUrl("/search"), {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ query: "ping", limit: 1 }),
      signal: AbortSignal.timeout(5000),
    });

    return response.ok;
  } catch {
    return false;
  }
}
