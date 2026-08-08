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
      <div className="bg-[#0c0e12] p-6 rounded-sm border border-[#00f5ff]/30 space-y-4 relative overflow-hidden group shadow-lg">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00f5ff] to-transparent opacity-70"></div>
        <div className="font-mono text-sm font-bold text-[#00f5ff] uppercase tracking-widest flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          DOMAIN_PERFORMANCE_METRICS
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {Object.entries(feedback.domain_scores || {}).map(([domain, score]) => (
            <div key={domain} className="space-y-2 group/item">
              <div className="flex justify-between items-end">
                <div className="text-[11px] font-bold text-[#849495] uppercase tracking-wider truncate group-hover/item:text-[#00f5ff] transition-colors" title={domain}>
                  {domain.replace(/_/g, " ")}
                </div>
                <div className="text-sm font-bold font-mono text-[#e2e2e8]">
                  {score as number}<span className="text-[#849495] text-[10px]">/10</span>
                </div>
              </div>
              <div className="relative h-2 bg-[#1e2024] rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#006c71] to-[#00f5ff] rounded-full shadow-[0_0_10px_rgba(0,245,255,0.8)] transition-all duration-1000 ease-out" 
                  style={{ width: `${((score as number) / 10) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Gaps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-gradient-to-br from-[#0c0e12] to-[#0a1511] p-5 rounded-sm border border-[#4edea3]/30 space-y-4 hover:border-[#4edea3]/60 transition-colors">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#4edea3] uppercase tracking-wider">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#4edea3]/20 text-[#4edea3]">✓</span> 
            STRENGTHS_VERIFIED
          </div>
          <ul className="space-y-3">
            {feedback.strengths.map((item, idx) => (
              <li
                key={idx}
                className="text-sm flex items-start gap-3 text-[#e2e2e8]"
              >
                <span className="font-mono text-[#4edea3] mt-0.5 opacity-70">▹</span>
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Gaps */}
        <div className="bg-gradient-to-br from-[#0c0e12] to-[#15100a] p-5 rounded-sm border border-[#ffb86b]/30 space-y-4 hover:border-[#ffb86b]/60 transition-colors">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#ffb86b] uppercase tracking-wider">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#ffb86b]/20 text-[#ffb86b]">⚠</span> 
            COGNITIVE_GAPS_FLAGGED
          </div>
          <ul className="space-y-3">
            {feedback.gaps.map((item, idx) => (
              <li
                key={idx}
                className="text-sm flex items-start gap-3 text-[#e2e2e8]"
              >
                <span className="font-mono text-[#ffb86b] mt-0.5 opacity-70">▹</span>
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-[#003739]/50 to-[#0c0e12] p-6 rounded-sm border border-[#00f5ff]/30 space-y-4 hover:border-[#00f5ff]/60 transition-colors shadow-inner">
        <div className="flex items-center gap-3 font-mono text-sm font-bold text-[#00f5ff] uppercase tracking-wider">
          <span className="flex items-center justify-center w-6 h-6 rounded bg-[#00f5ff]/20 text-[#00f5ff]">➔</span> 
          RECOMMENDED_CURRICULUM_ACTION
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedback.next.map((item, idx) => (
            <li
              key={idx}
              className="text-sm flex items-start gap-3 text-[#e2e2e8] bg-[#111318] p-3 rounded border border-[#1a1c20]"
            >
              <span className="font-mono text-[#00f5ff] mt-0.5">»</span>
              <span className="leading-snug">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
