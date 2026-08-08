import React from "react";

interface CandidateSidebarProps {
  candidate: {
    id: string;
    name: string;
    jobRole: string;
    yearsExperience: number;
    education: string;
    status: string;
    raw: {
      missions: Array<{
        day: number;
        title: string;
        passed?: boolean;
        skipped?: boolean;
        attempts?: number;
      }>;
      signals: {
        commitDays: number;
        missionsCompleted: number;
        missionsFirstTry: number;
      };
    };
  };
}

export default function CandidateSidebar({ candidate }: CandidateSidebarProps) {
  // Derive strengths
  const strengths: string[] = [];
  if (candidate.raw.signals.missionsFirstTry >= 20) {
    strengths.push("Fast Learner (High first-try success rate)");
  }
  if (candidate.raw.signals.commitDays >= 28) {
    strengths.push("Highly Consistent (Frequent daily commits)");
  }
  if (candidate.raw.signals.missionsCompleted >= 30) {
    strengths.push("Strong Finisher (Completed almost all tasks)");
  }
  if (candidate.raw.signals.missionsCompleted > 0 && strengths.length === 0) {
    strengths.push("Solid foundation in core topics");
  }

  // Derive weaknesses
  const weaknesses: string[] = [];
  if (candidate.raw.signals.commitDays < 20) {
    weaknesses.push("Inconsistent Activity (Low commit days)");
  }
  candidate.raw.missions.forEach((mission) => {
    if (mission.skipped) {
      weaknesses.push(`Skipped: ${mission.title}`);
    } else if (mission.attempts && mission.attempts >= 4) {
      weaknesses.push(`Struggled with: ${mission.title} (${mission.attempts} attempts)`);
    }
  });

  if (weaknesses.length === 0) {
    weaknesses.push("No major weaknesses identified in performance data");
  }

  return (
    <aside className="w-80 bg-[#0c0e12] border-l border-[#3a494a] flex flex-col z-20 shrink-0 overflow-y-auto">
      <div className="p-4 border-b border-[#3a494a] bg-[#1a1c20] sticky top-0">
        <h2 className="font-mono text-sm font-bold tracking-wider text-[#00f5ff] uppercase">
          CANDIDATE PROFILE
        </h2>
      </div>

      <div className="p-4 space-y-6 text-[#e2e2e8] text-sm font-sans">
        {/* Basic Info */}
        <div className="space-y-3">
          <div>
            <h3 className="font-mono text-xs text-[#849495] tracking-wider uppercase mb-1">
              Identity
            </h3>
            <div className="font-semibold text-lg text-[#00f5ff]">
              {candidate.name}
            </div>
            <div className="text-xs text-[#849495] font-mono">
              ID: {candidate.id}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <div className="font-mono text-[10px] text-[#849495] uppercase">Role</div>
              <div className="text-xs mt-0.5">{candidate.jobRole}</div>
            </div>
            <div>
              <div className="font-mono text-[10px] text-[#849495] uppercase">Experience</div>
              <div className="text-xs mt-0.5">{candidate.yearsExperience} Years</div>
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] text-[#849495] uppercase">Education</div>
            <div className="text-xs mt-0.5">{candidate.education}</div>
          </div>
        </div>

        {/* Signals Overview */}
        <div className="bg-[#1a1c20] border border-[#3a494a] rounded-sm p-3">
           <h3 className="font-mono text-xs text-[#00f5ff] tracking-wider uppercase mb-2">
              Performance Signals
            </h3>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-[#849495]">Commit Days:</span>
              <span className="font-mono">{candidate.raw.signals.commitDays}/31</span>
            </div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-[#849495]">Completed:</span>
              <span className="font-mono">{candidate.raw.signals.missionsCompleted}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#849495]">First Try:</span>
              <span className="font-mono">{candidate.raw.signals.missionsFirstTry}</span>
            </div>
        </div>

        {/* Strengths */}
        <div>
          <h3 className="font-mono text-xs text-[#27c93f] tracking-wider uppercase mb-2 flex items-center gap-1.5">
            <span className="text-lg">⊕</span> Strengths
          </h3>
          <ul className="space-y-1.5">
            {strengths.map((str, i) => (
              <li key={i} className="text-xs bg-[#27c93f]/10 border border-[#27c93f]/30 px-2.5 py-1.5 rounded-sm">
                {str}
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div>
          <h3 className="font-mono text-xs text-[#ff5f56] tracking-wider uppercase mb-2 flex items-center gap-1.5">
            <span className="text-lg">⊖</span> Weaknesses
          </h3>
          <ul className="space-y-1.5">
            {weaknesses.map((wk, i) => (
              <li key={i} className="text-xs bg-[#ff5f56]/10 border border-[#ff5f56]/30 px-2.5 py-1.5 rounded-sm">
                {wk}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
