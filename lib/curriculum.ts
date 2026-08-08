/**
 * Curriculum Data Parser
 * 
 * Loads and indexes curriculum.json for fast lookups.
 * Maps day numbers to their topics, tools, objectives, and parent modules.
 * 
 * @see /FoundationalFiles/Phases.md Phase 2, Step 1
 */

import curriculumData from "@/data/curriculum.json";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface CurriculumDay {
  day: number;
  title: string;
  type: string;
  tools: string[];
  objectives: string[];
  module: {
    number: number;
    title: string;
  };
}

export interface CurriculumModule {
  number: number;
  title: string;
  dayRange: [number, number];
}

// ─────────────────────────────────────────────
// Pre-computed Indexes (built once at import time)
// ─────────────────────────────────────────────

/** Map of day number → CurriculumDay with full details */
const dayIndex = new Map<number, CurriculumDay>();

/** Map of module number → CurriculumModule */
const moduleIndex = new Map<number, CurriculumModule>();

// Build module index
for (const mod of curriculumData.modules) {
  moduleIndex.set(mod.n, {
    number: mod.n,
    title: mod.title,
    dayRange: mod.days as [number, number],
  });
}

// Build day index with module association
for (const day of curriculumData.days) {
  // Find which module this day belongs to
  let parentModule: CurriculumModule | undefined;
  for (const [, mod] of moduleIndex) {
    if (day.day >= mod.dayRange[0] && day.day <= mod.dayRange[1]) {
      parentModule = mod;
      break;
    }
  }

  dayIndex.set(day.day, {
    day: day.day,
    title: day.title,
    type: day.type,
    tools: day.tools,
    objectives: day.objectives,
    module: parentModule
      ? { number: parentModule.number, title: parentModule.title }
      : { number: 0, title: "Unknown" },
  });
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

/**
 * Get a specific curriculum day by number.
 */
export function getCurriculumDay(dayNumber: number): CurriculumDay | undefined {
  return dayIndex.get(dayNumber);
}

/**
 * Get all curriculum days as an array (sorted by day number).
 */
export function getAllDays(): CurriculumDay[] {
  return Array.from(dayIndex.values()).sort((a, b) => a.day - b.day);
}

/**
 * Get all modules.
 */
export function getAllModules(): CurriculumModule[] {
  return Array.from(moduleIndex.values()).sort(
    (a, b) => a.number - b.number
  );
}

/**
 * Get all days within a specific module.
 */
export function getDaysByModule(moduleNumber: number): CurriculumDay[] {
  const mod = moduleIndex.get(moduleNumber);
  if (!mod) return [];
  return getAllDays().filter(
    (d) => d.day >= mod.dayRange[0] && d.day <= mod.dayRange[1]
  );
}

/**
 * Get the cohort description string.
 */
export function getCohortName(): string {
  return curriculumData.cohort;
}

/**
 * Total number of days in the curriculum.
 */
export const TOTAL_DAYS = dayIndex.size;

/**
 * Total number of modules in the curriculum.
 */
export const TOTAL_MODULES = moduleIndex.size;
