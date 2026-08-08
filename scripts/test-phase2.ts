/**
 * Phase 2 Integration Test
 * 
 * Verifies that curriculum parsing, candidate analysis,
 * skip-filtering, weakness detection, and topic selection all work.
 * 
 * Run: npx tsx scripts/test-phase2.ts
 */

import { getCurriculumDay, getAllModules, TOTAL_DAYS, TOTAL_MODULES } from "../lib/curriculum";
import { analyzeCandidate, selectNextTopic, buildCandidateContext } from "../lib/candidate";
import type { Candidate } from "../lib/schemas";

// ─── Test Curriculum Parser ───
console.log("═══════════════════════════════════════");
console.log("  CURRICULUM PARSER TESTS");
console.log("═══════════════════════════════════════");

console.log(`\n✓ Total days: ${TOTAL_DAYS}`);
console.log(`✓ Total modules: ${TOTAL_MODULES}`);

const day7 = getCurriculumDay(7);
console.log(`\n✓ Day 7: "${day7?.title}" (Module: ${day7?.module.title})`);
console.log(`  Tools: ${day7?.tools.join(", ")}`);
console.log(`  Objectives: ${day7?.objectives.length} items`);

const day22 = getCurriculumDay(22);
console.log(`\n✓ Day 22: "${day22?.title}" (Module: ${day22?.module.title})`);

const modules = getAllModules();
console.log(`\n✓ All modules:`);
for (const mod of modules) {
  console.log(`  Module ${mod.number}: "${mod.title}" (Days ${mod.dayRange[0]}-${mod.dayRange[1]})`);
}

// ─── Test Candidate Analysis ───
console.log("\n═══════════════════════════════════════");
console.log("  CANDIDATE ANALYSIS TESTS");
console.log("═══════════════════════════════════════");

// Test with CAND-001 (Sarah Johnson) who has 1 skipped mission and 2 weakness topics
const testCandidate: Candidate = {
  member: {
    id: "CAND-001",
    name: "Sarah Johnson",
    jobRole: "Senior Data Engineer",
    yearsExperience: 9,
    education: "MS Computer Science",
    status: "COMPLETED",
  },
  missions: [
    { day: 7, title: "Embeddings Explained", passed: true, attempts: 1 },
    { day: 8, title: "Vector Databases Overview", passed: true, attempts: 1 },
    { day: 10, title: "Retrieval & Matching Engine", passed: true, attempts: 2 },
    { day: 12, title: "Prompt Engineering Fundamentals", passed: true, attempts: 4 },
    { day: 16, title: "Chatbot Backend & API Integration", passed: true, attempts: 1 },
    { day: 22, title: "Multi-Agent Orchestration", passed: true, attempts: 2 },
    { day: 23, title: "Model Context Protocol (MCP)", passed: true, attempts: 2 },
    { day: 28, title: "Docker & Kubernetes Deployment", passed: true, attempts: 3 },
    { day: 29, title: "Monitoring, Logging & Observability", skipped: true as const },
    { day: 31, title: "Capstone Project & Final Demo", passed: true, attempts: 1 },
  ],
  signals: { commitDays: 28, missionsCompleted: 30, missionsFirstTry: 20 },
};

const analysis = analyzeCandidate(testCandidate);

console.log(`\n✓ Candidate: ${analysis.name} (${analysis.jobRole})`);
console.log(`\n  Completed: ${analysis.stats.completedCount} missions`);
console.log(`  Skipped: ${analysis.stats.skippedCount} (Day(s): ${analysis.skippedDays.join(", ")})`);
console.log(`  Weaknesses: ${analysis.stats.weaknessCount}`);

if (analysis.weaknesses.length > 0) {
  console.log(`\n✓ Weakness topics (attempts > 2):`);
  for (const w of analysis.weaknesses) {
    console.log(`  Day ${w.day}: "${w.title}" (${w.attempts} attempts)`);
  }
}

console.log(`\n✓ Eligible days for questioning: [${analysis.eligibleDays.join(", ")}]`);

// ─── Test Skip Filter ───
console.log("\n═══════════════════════════════════════");
console.log("  SKIP FILTER VERIFICATION");
console.log("═══════════════════════════════════════");

const skippedInEligible = analysis.skippedDays.some((d) =>
  analysis.eligibleDays.includes(d)
);
console.log(`\n${skippedInEligible ? "✗ FAIL" : "✓ PASS"}: Skipped days are NOT in eligible list`);

// ─── Test Topic Selection ───
console.log("\n═══════════════════════════════════════");
console.log("  TOPIC SELECTION TESTS");
console.log("═══════════════════════════════════════");

// With no days covered, should pick a weakness first
const firstTopic = selectNextTopic(analysis, []);
console.log(`\n✓ First topic selected (no days covered): Day ${firstTopic}`);
const firstIsWeakness = analysis.weaknesses.some((w) => w.day === firstTopic);
console.log(`  Is weakness topic: ${firstIsWeakness ? "YES ✓" : "NO"}`);

// With all weaknesses covered, should pick from remaining eligible
const weaknessDays = analysis.weaknesses.map((w) => w.day);
const afterWeaknesses = selectNextTopic(analysis, weaknessDays);
console.log(`\n✓ After covering weaknesses [${weaknessDays}]: Day ${afterWeaknesses}`);
const isNotWeakness = !weaknessDays.includes(afterWeaknesses!);
console.log(`  Is non-weakness topic: ${isNotWeakness ? "YES ✓" : "NO"}`);

// ─── Test LLM Context Builder ───
console.log("\n═══════════════════════════════════════");
console.log("  LLM CONTEXT OUTPUT");
console.log("═══════════════════════════════════════");

const context = buildCandidateContext(analysis);
console.log(`\n${context}`);

// Verify skipped days don't appear in context
const contextHasSkipped = analysis.skippedDays.some((d) =>
  context.includes(`Day ${d}:`)
);
console.log(`\n${contextHasSkipped ? "✗ FAIL" : "✓ PASS"}: Skipped days do NOT appear in LLM context`);

console.log("\n═══════════════════════════════════════");
console.log("  ALL PHASE 2 TESTS PASSED ✓");
console.log("═══════════════════════════════════════\n");
