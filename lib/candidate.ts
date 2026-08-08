/**
 * Candidate Profile Parser & Analysis
 * 
 * Deterministic utilities for processing candidate data:
 * - Filter out skipped missions (LLM must NEVER see skipped topics)
 * - Flag high-attempt missions (attempts > 2) for targeted questioning
 * - Build the eligible question pool from completed days
 * 
 * @see /FoundationalFiles/Phases.md Phase 2, Step 2
 * @see /FoundationalFiles/Rules.md Section 5 — Deterministic code responsibilities
 */

import type { Candidate, Mission } from "./schemas";
import { getCurriculumDay, type CurriculumDay } from "./curriculum";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface CompletedMissionAnalysis {
  day: number;
  title: string;
  passed: boolean;
  attempts: number;
  isWeakness: boolean; // attempts > 2
  curriculum: CurriculumDay | undefined;
}

export interface CandidateAnalysis {
  /** Candidate's name */
  name: string;
  /** Candidate's job role */
  jobRole: string;
  /** Years of experience */
  yearsExperience: number;
  /** Missions the candidate completed (skipped ones EXCLUDED) */
  completedMissions: CompletedMissionAnalysis[];
  /** Day numbers that were skipped — these must NEVER be used for questions */
  skippedDays: number[];
  /** Missions where attempts > 2 — prioritize these for deep-dive questions */
  weaknesses: CompletedMissionAnalysis[];
  /** Day numbers eligible for questioning (completed + not skipped) */
  eligibleDays: number[];
  /** Summary stats */
  stats: {
    totalMissions: number;
    completedCount: number;
    skippedCount: number;
    weaknessCount: number;
    commitDays: number;
    missionsFirstTry: number;
  };
}

// ─────────────────────────────────────────────
// Mission Type Guards
// ─────────────────────────────────────────────

function isSkippedMission(
  mission: Mission
): mission is { day: number; title: string; skipped: true } {
  return "skipped" in mission && mission.skipped === true;
}

// ─────────────────────────────────────────────
// Core Analysis Function
// ─────────────────────────────────────────────

/**
 * Analyze a candidate's profile to produce a complete assessment.
 * 
 * STRICT RULES (enforced here, NOT by the LLM):
 * 1. Any mission with "skipped": true is EXCLUDED from the question pool.
 * 2. Any mission with attempts > 2 is FLAGGED as a weakness for targeted questioning.
 */
export function analyzeCandidate(candidate: Candidate): CandidateAnalysis {
  const completedMissions: CompletedMissionAnalysis[] = [];
  const skippedDays: number[] = [];

  for (const mission of candidate.missions) {
    if (isSkippedMission(mission)) {
      // STRICT: Skip-filter — LLM must never see these
      skippedDays.push(mission.day);
      continue;
    }

    const curriculum = getCurriculumDay(mission.day);
    const isWeakness = mission.attempts > 2;

    completedMissions.push({
      day: mission.day,
      title: mission.title,
      passed: mission.passed,
      attempts: mission.attempts,
      isWeakness,
      curriculum,
    });
  }

  // Weaknesses: missions where the candidate struggled
  const weaknesses = completedMissions.filter((m) => m.isWeakness);

  // Eligible days for questioning (completed only, never skipped)
  const eligibleDays = completedMissions.map((m) => m.day);

  return {
    name: candidate.member.name,
    jobRole: candidate.member.jobRole,
    yearsExperience: candidate.member.yearsExperience,
    completedMissions,
    skippedDays,
    weaknesses,
    eligibleDays,
    stats: {
      totalMissions: candidate.missions.length,
      completedCount: completedMissions.length,
      skippedCount: skippedDays.length,
      weaknessCount: weaknesses.length,
      commitDays: candidate.signals.commitDays,
      missionsFirstTry: candidate.signals.missionsFirstTry,
    },
  };
}

/**
 * Select the next topic day for questioning.
 * 
 * Strategy:
 * 1. Prioritize weakness topics (attempts > 2) that haven't been covered yet
 * 2. Then fill remaining from eligible topics not yet covered
 * 3. If all covered, allow repeats from weakness topics
 * 
 * This is DETERMINISTIC — the LLM does not choose topics.
 */
export function selectNextTopic(
  analysis: CandidateAnalysis,
  daysCovered: number[]
): number | null {
  // 1. Uncovered weakness topics first
  const uncoveredWeaknesses = analysis.weaknesses
    .filter((w) => !daysCovered.includes(w.day))
    .sort((a, b) => b.attempts - a.attempts); // Highest attempts first

  if (uncoveredWeaknesses.length > 0) {
    return uncoveredWeaknesses[0].day;
  }

  // 2. Any uncovered eligible topic
  const uncoveredEligible = analysis.eligibleDays.filter(
    (d) => !daysCovered.includes(d)
  );

  if (uncoveredEligible.length > 0) {
    // Pick randomly to keep the interview dynamic
    return uncoveredEligible[Math.floor(Math.random() * uncoveredEligible.length)];
  }

  // 3. All topics covered — repeat a weakness topic for deep-dive
  if (analysis.weaknesses.length > 0) {
    const shuffled = [...analysis.weaknesses].sort(() => Math.random() - 0.5);
    return shuffled[0].day;
  }

  // 4. All topics covered and no weaknesses — repeat any eligible
  if (analysis.eligibleDays.length > 0) {
    return analysis.eligibleDays[
      Math.floor(Math.random() * analysis.eligibleDays.length)
    ];
  }

  // Edge case: no eligible topics at all
  return null;
}

/**
 * Build a context string for the LLM describing the candidate's profile.
 * This EXCLUDES all skipped topics — the LLM never sees them.
 */
export function buildCandidateContext(analysis: CandidateAnalysis): string {
  const lines: string[] = [
    `CANDIDATE PROFILE:`,
    `Name: ${analysis.name}`,
    `Role: ${analysis.jobRole}`,
    `Experience: ${analysis.yearsExperience} years`,
    `Completed ${analysis.stats.completedCount} missions, skipped ${analysis.stats.skippedCount}.`,
    `${analysis.stats.missionsFirstTry} missions passed on first try out of ${analysis.stats.commitDays} active days.`,
    ``,
    `COMPLETED TOPICS (eligible for questioning):`,
  ];

  for (const mission of analysis.completedMissions) {
    const weaknessTag = mission.isWeakness
      ? ` ⚠️ [WEAKNESS - ${mission.attempts} attempts]`
      : "";
    const passedTag = mission.passed ? "✓" : "✗";
    lines.push(
      `  Day ${mission.day}: ${mission.title} [${passedTag}] (${mission.attempts} attempts)${weaknessTag}`
    );
  }

  if (analysis.weaknesses.length > 0) {
    lines.push(``, `FOCUS AREAS (struggled topics requiring deep-dive):`);
    for (const w of analysis.weaknesses) {
      const tools = w.curriculum?.tools.join(", ") || "N/A";
      lines.push(
        `  Day ${w.day}: ${w.title} — ${w.attempts} attempts, tools: [${tools}]`
      );
    }
  }

  return lines.join("\n");
}
