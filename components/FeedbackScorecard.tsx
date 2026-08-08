"use client";

import type { Feedback } from "@/lib/schemas";

interface FeedbackScorecardProps {
  feedback: Feedback;
  candidateName: string;
}

export default function FeedbackScorecard({
  feedback,
  candidateName,
}: FeedbackScorecardProps) {
  return (
    <div className="bg-[#1a1c20] border border-[#00f5ff] rounded-sm p-6 space-y-6 shadow-2xl my-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#3a494a] pb-4">
        <div>
          <div className="font-mono text-xs text-[#00f5ff] tracking-widest uppercase">
            // FINAL_EVALUATION_SCORECARD
          </div>
          <h3 className="text-xl font-bold font-mono text-[#e2e2e8] mt-1">
            CANDIDATE: {candidateName.toUpperCase()}
          </h3>
        </div>
        <div className="font-mono text-xs px-3 py-1 bg-[#00f5ff]/10 text-[#00f5ff] border border-[#00f5ff]/40 rounded-sm tracking-wider uppercase">
          ● ASSESSMENT_COMPLETE
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-2 bg-[#0c0e12] p-4 rounded-sm border border-[#3a494a]">
        <div className="font-mono text-xs text-[#849495] tracking-wider uppercase">
          EVALUATION_SUMMARY
        </div>
        <p className="text-sm leading-relaxed text-[#e2e2e8]">
          {feedback.summary}
        </p>
      </div>

      {/* Role Fit */}
      <div className="space-y-2 bg-[#0c0e12] p-4 rounded-sm border border-[#4edea3]/30">
        <div className="font-mono text-xs text-[#4edea3] tracking-wider uppercase">
          ROLE_ALIGNMENT
        </div>
        <p className="text-sm leading-relaxed text-[#e2e2e8]">
          {feedback.role_fit || "No role alignment data provided."}
        </p>
      </div>

      {/* Domain Scores Grid */}
      <div className="bg-[#0c0e12] p-4 rounded-sm border border-[#00f5ff]/30 space-y-3">
        <div className="font-mono text-xs text-[#00f5ff] uppercase tracking-wider">
          DOMAIN_SCORES
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(feedback.domain_scores || {}).map(([domain, score]) => (
            <div key={domain} className="space-y-1">
              <div className="text-[10px] text-[#849495] uppercase tracking-wider truncate" title={domain}>{domain.replace(/_/g, " ")}</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-[#1e2024] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#00f5ff]" 
                    style={{ width: `${((score as number) / 10) * 100}%` }}
                  />
                </div>
                <div className="text-xs font-mono text-[#e2e2e8]">{score as number}/10</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Gaps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="bg-[#0c0e12] p-4 rounded-sm border border-[#4edea3]/30 space-y-3">
          <div className="flex items-center gap-2 font-mono text-xs text-[#4edea3] uppercase tracking-wider">
            <span>✓</span> STRENGTHS_VERIFIED
          </div>
          <ul className="space-y-2">
            {feedback.strengths.map((item, idx) => (
              <li
                key={idx}
                className="text-xs flex items-start gap-2 text-[#e2e2e8]"
              >
                <span className="font-mono text-[#4edea3]">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Gaps */}
        <div className="bg-[#0c0e12] p-4 rounded-sm border border-[#ffb86b]/30 space-y-3">
          <div className="flex items-center gap-2 font-mono text-xs text-[#ffb86b] uppercase tracking-wider">
            <span>⚠</span> COGNITIVE_GAPS_FLAGGED
          </div>
          <ul className="space-y-2">
            {feedback.gaps.map((item, idx) => (
              <li
                key={idx}
                className="text-xs flex items-start gap-2 text-[#e2e2e8]"
              >
                <span className="font-mono text-[#ffb86b]">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-[#0c0e12] p-4 rounded-sm border border-[#00f5ff]/30 space-y-3">
        <div className="flex items-center gap-2 font-mono text-xs text-[#00f5ff] uppercase tracking-wider">
          <span>➔</span> RECOMMENDED_CURRICULUM_ACTION
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {feedback.next.map((item, idx) => (
            <li
              key={idx}
              className="text-xs flex items-start gap-2 text-[#e2e2e8]"
            >
              <span className="font-mono text-[#00f5ff]">➔</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
