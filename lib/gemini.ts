/**
 * Gemini LLM Client
 * 
 * Wrapper around @google/genai for structured LLM calls.
 * Used by LangGraph nodes for question generation, answer evaluation, and scorecards.
 * 
 * Features:
 * - Configurable model (defaults to env GEMINI_MODEL)
 * - Retry with timeout (Rules.md Section 4)
 * - Structured JSON output support
 * 
 * @see /FoundationalFiles/Rules.md Section 4 — LLM Call Retries & Timeouts
 */

import { GoogleGenAI } from "@google/genai";

// ─────────────────────────────────────────────
// Client Singleton
// ─────────────────────────────────────────────

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "[Gemini] GOOGLE_GENERATIVE_AI_API_KEY not set in environment."
      );
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

function getModelName(): string {
  return process.env.GEMINI_MODEL || "gemini-2.0-flash";
}

// ─────────────────────────────────────────────
// Core Generation Function
// ─────────────────────────────────────────────

export interface GeminiOptions {
  /** System instruction for the model */
  systemPrompt?: string;
  /** Temperature (0.0 = deterministic, 1.0 = creative) */
  temperature?: number;
  /** Max output tokens */
  maxTokens?: number;
  /** If true, request JSON output */
  jsonMode?: boolean;
}

/**
 * Generate a text response from Gemini.
 * Includes retry logic and timeout as per Rules.md.
 */
export async function generateText(
  prompt: string,
  options: GeminiOptions = {}
): Promise<string> {
  const {
    systemPrompt,
    temperature = 0.7,
    maxTokens = 2048,
    jsonMode = false,
  } = options;

  const ai = getClient();
  const model = getModelName();

  // Build config
  const config: Record<string, unknown> = {
    temperature,
    maxOutputTokens: maxTokens,
  };

  if (systemPrompt) {
    config.systemInstruction = systemPrompt;
  }

  if (jsonMode) {
    config.responseMimeType = "application/json";
  }

  // Attempt with retry (max 2 attempts, 15s timeout each)
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await Promise.race([
        ai.models.generateContent({
          model,
          contents: prompt,
          config,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Gemini timeout (15s)")), 15000)
        ),
      ]);

      const text = response.text?.trim();

      if (!text) {
        console.warn(`[Gemini] Empty response on attempt ${attempt}`);
        if (attempt === 2) return getFallbackResponse(jsonMode);
        continue;
      }

      return text;
    } catch (error) {
      console.error(
        `[Gemini] Attempt ${attempt} failed:`,
        error instanceof Error ? error.message : error
      );
      if (attempt === 2) {
        return getFallbackResponse(jsonMode);
      }
      // Brief pause before retry
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  return getFallbackResponse(jsonMode);
}

/**
 * Generate a JSON response from Gemini and parse it.
 * Uses JSON mode for structured output.
 */
export async function generateJSON<T = Record<string, unknown>>(
  prompt: string,
  options: Omit<GeminiOptions, "jsonMode"> = {}
): Promise<T> {
  const text = await generateText(prompt, { ...options, jsonMode: true });

  try {
    return JSON.parse(text) as T;
  } catch {
    console.error("[Gemini] Failed to parse JSON response:", text);
    // Try to extract JSON from markdown code block
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      return JSON.parse(match[1].trim()) as T;
    }
    throw new Error("Gemini returned invalid JSON");
  }
}

// ─────────────────────────────────────────────
// Fallback Responses
// ─────────────────────────────────────────────

function getFallbackResponse(jsonMode: boolean): string {
  if (jsonMode) {
    return JSON.stringify({
      reply: "I'm having a momentary technical difficulty. Could you repeat your answer?",
      classification: "APPLIED",
    });
  }
  return "I'm having a momentary technical difficulty. Let me rephrase — could you elaborate on your previous answer?";
}
