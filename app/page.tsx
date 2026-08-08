"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ChatWindow from "@/components/ChatWindow";
import FeedbackScorecard from "@/components/FeedbackScorecard";
import candidatesData from "@/data/candidates.json";
import type { Feedback } from "@/lib/schemas";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  isPushback?: boolean;
}

interface CandidateOption {
  id: string;
  name: string;
  jobRole: string;
  yearsExperience: number;
  education: string;
  status: string;
  raw: (typeof candidatesData.candidates)[number];
}

const candidatesList: CandidateOption[] = candidatesData.candidates.map((c) => ({
  id: c.member.id,
  name: c.member.name,
  jobRole: c.member.jobRole,
  yearsExperience: c.member.yearsExperience,
  education: c.member.education,
  status: c.member.status,
  raw: c,
}));

function generateSessionId(): string {
  const hex = Math.floor(Math.random() * 0xffff).toString(16).toUpperCase();
  return `0x${hex.padStart(4, "0")}`;
}

export default function Home() {
  // Default to first candidate automatically
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateOption>(
    candidatesList[0]
  );
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInterviewDone, setIsInterviewDone] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Settings & View state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"THREAD" | "TERMINAL" | "METRICS" | "RECORDS">("THREAD");
  const [showRightPanel, setShowRightPanel] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ─── Timer ───
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // ─── Start / Reset Interview Session ───
  const startInterviewSession = useCallback(
    async (cand: CandidateOption) => {
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      setIsLoading(true);
      setIsInterviewDone(false);
      setFeedback(null);
      setQuestionsAsked(0);
      setElapsedSeconds(0);

      try {
        const response = await fetch("/api/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: newSessionId,
            candidate: cand.raw,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          const assistantMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            role: "assistant",
            content: data.reply,
            timestamp: Date.now(),
          };
          setMessages([assistantMsg]);
          setQuestionsAsked(1);
        } else {
          setMessages([
            {
              id: `err-${Date.now()}`,
              role: "system",
              content: `Init error: ${data.error || "Failed to initialize"}`,
              timestamp: Date.now(),
            },
          ]);
        }
      } catch {
        setMessages([
          {
            id: `err-${Date.now()}`,
            role: "system",
            content: "Network error connecting to interview endpoint.",
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Auto-start on mount with default candidate
  useEffect(() => {
    startInterviewSession(selectedCandidate);
    // eslint-disable-next-deps
  }, []);

  // ─── Auto-scroll ───
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // ─── Switch Candidate from Settings ───
  const handleSelectCandidate = (cand: CandidateOption) => {
    setSelectedCandidate(cand);
    setIsSettingsOpen(false);
    startInterviewSession(cand);
  };

  // ─── Send Message ───
  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading || isInterviewDone) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: userMsg.content,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const isPushback =
          data.reply?.includes("textbook") ||
          data.reply?.includes("That's the textbook") ||
          data.reply?.includes("surface-level") ||
          data.reply?.includes("dodges my question");

        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: "assistant",
          content: data.reply,
          timestamp: Date.now(),
          isPushback,
        };

        setMessages((prev) => [...prev, assistantMsg]);

        if (!isPushback) {
          setQuestionsAsked((prev) => prev + 1);
        }

        if (data.done) {
          setIsInterviewDone(true);
          setFeedback(data.feedback || null);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "system",
            content: data.error || "Turn error",
            timestamp: Date.now(),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "system",
          content: "Network error during conversation turn.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [inputValue, isLoading, isInterviewDone, sessionId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Candidate metrics analysis
  const candidateMissions = selectedCandidate.raw.missions;
  const completedMissions = candidateMissions.filter(
    (m: Record<string, unknown>) => !("skipped" in m && m.skipped)
  );
  const skippedMissions = candidateMissions.filter(
    (m: Record<string, unknown>) => "skipped" in m && m.skipped
  );
  const weaknessMissions = completedMissions.filter(
    (m: Record<string, unknown>) => typeof m.attempts === "number" && m.attempts > 2
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#111318] text-[#e2e2e8] font-sans">
      {/* ─────────────────────────────────────────────
          LEFT SIDEBAR (Threaded Workspace Navigation)
         ───────────────────────────────────────────── */}
      <aside className="w-56 bg-[#0c0e12] border-r border-[#3a494a] flex flex-col justify-between select-none z-20 shrink-0">
        {/* Brand */}
        <div className="p-4 border-b border-[#3a494a]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-sm bg-[#00f5ff] text-[#003739] flex items-center justify-center font-mono font-bold text-xs">
              IV
            </div>
            <div>
              <h1 className="font-mono text-sm font-bold tracking-wider text-[#e2e2e8]">
                INTERN-VIEW
              </h1>
              <p className="font-mono text-[10px] text-[#849495]">V2.0.4-STABLE</p>
            </div>
          </div>
        </div>

        {/* Main Nav Items */}
        <nav className="p-2 space-y-1">
          {[
            { id: "THREAD", label: "THREAD", icon: "💬" },
            { id: "TERMINAL", label: "TERMINAL", icon: "💻" },
            { id: "METRICS", label: "METRICS", icon: "📊" },
            { id: "RECORDS", label: "RECORDS", icon: "📜" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm font-mono text-xs tracking-wider text-left transition-colors ${
                activeTab === tab.id
                  ? "bg-[#1a1c20] text-[#00f5ff] border-l-2 border-[#00f5ff] font-semibold"
                  : "text-[#849495] hover:text-[#e2e2e8] hover:bg-[#1a1c20]/50"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Bottom Nav */}
        <div className="p-3 border-t border-[#3a494a] space-y-2">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-1.5 font-mono text-xs text-[#849495] hover:text-[#00f5ff] transition-colors"
          >
            <span>⚙</span>
            <span>PROFILE SETTINGS</span>
          </button>
          <button
            onClick={() => startInterviewSession(selectedCandidate)}
            className="w-full py-2 bg-[#ffb4ab]/10 border border-[#ff4d4d]/30 text-[#ffb4ab] hover:bg-[#ff4d4d]/20 font-mono text-xs uppercase tracking-wider rounded-sm transition-colors text-center"
          >
            RESET SESSION
          </button>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────
          RIGHT MAIN AREA (Header + Thread + Metadata Panel)
         ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP HEADER BAR */}
        <header className="h-12 bg-[#1a1c20] border-b border-[#3a494a] px-6 flex items-center justify-between select-none z-10 shrink-0">
          <div className="font-mono text-xs text-[#00f5ff] tracking-widest uppercase flex items-center gap-3">
            <span>INTERN-VIEW AI INTERVIEW</span>
            <span className="text-[#3a494a]">|</span>
            <span className="text-[#849495]">MODEL: GEMINI 2.0 FLASH</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Badges */}
            <div className="font-mono text-[11px] bg-[#0c0e12] border border-[#3a494a] px-2.5 py-1 rounded-sm text-[#849495]">
              SESSION_ID: <span className="text-[#e2e2e8]">{sessionId}</span>
            </div>
            <div className="font-mono text-[11px] bg-[#0c0e12] border border-[#3a494a] px-2.5 py-1 rounded-sm text-[#849495]">
              CANDIDATE_ID: <span className="text-[#00f5ff]">{selectedCandidate.id}</span>
            </div>
            <div className="font-mono text-[11px] bg-[#0c0e12] border border-[#00f5ff]/40 text-[#00f5ff] px-2.5 py-1 rounded-sm font-semibold">
              {formatTimer(elapsedSeconds)}
            </div>

            {/* Gear Button to open Settings */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              title="Candidate Profile Settings"
              className="p-1.5 rounded bg-[#282a2e] border border-[#3a494a] text-[#e2e2e8] hover:text-[#00f5ff] hover:border-[#00f5ff] transition-colors"
            >
              ⚙
            </button>

            {/* Toggle Right Panel */}
            <button
              onClick={() => setShowRightPanel((prev) => !prev)}
              title="Toggle Auxiliary Panel"
              className="p-1.5 rounded bg-[#282a2e] border border-[#3a494a] text-[#e2e2e8] hover:text-[#00f5ff] transition-colors"
            >
              📊
            </button>
          </div>
        </header>

        {/* WORKSPACE CONTENT AREA */}
        <div className="flex-1 flex overflow-hidden">
          {/* CENTER CHAT THREAD (8 Columns on desktop) */}
          <main className="flex-1 flex flex-col min-w-0 bg-[#111318] stitch-thread overflow-hidden">
            {/* Thread Scroll Container */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="max-w-3xl mx-auto">
                <ChatWindow
                  messages={messages}
                  isLoading={isLoading}
                  candidateName={selectedCandidate.name}
                />
                {isInterviewDone && feedback && (
                  <FeedbackScorecard
                    feedback={feedback}
                    candidateName={selectedCandidate.name}
                  />
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* TERMINAL INPUT FOOTER */}
            <footer className="p-4 bg-[#0c0e12] border-t border-[#3a494a] shrink-0">
              <div className="max-w-3xl mx-auto flex items-center gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading || isInterviewDone}
                    rows={1}
                    placeholder={
                      isInterviewDone
                        ? "Interview complete. View scorecard above."
                        : isLoading
                        ? "Agent analyzing answer..."
                        : "Type your technical response or paste code..."
                    }
                    className="w-full bg-[#1e2024] border border-[#3a494a] focus:border-[#00f5ff] focus:outline-none focus:ring-1 focus:ring-[#00f5ff] rounded-sm px-4 py-3 font-mono text-xs text-[#e2e2e8] placeholder-[#849495] resize-none transition-all disabled:opacity-50"
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isLoading || isInterviewDone}
                  className="h-10 px-5 bg-[#00f5ff] hover:bg-[#00dce5] text-[#003739] font-mono font-bold text-xs uppercase tracking-wider rounded-sm disabled:opacity-30 transition-colors shrink-0 flex items-center gap-1"
                >
                  <span>SEND</span>
                  <span>➔</span>
                </button>
              </div>
              <div className="max-w-3xl mx-auto mt-2 flex justify-between items-center text-[10px] font-mono text-[#849495]">
                <span>PRESS ENTER TO TRANSMIT · SHIFT+ENTER FOR NEWLINE</span>
                <span>STATUS: {isInterviewDone ? "TERMINATED" : "CONNECTED"}</span>
              </div>
            </footer>
          </main>

          {/* AUXILIARY METADATA PANEL (4 Columns) */}
          {showRightPanel && (
            <aside className="w-80 bg-[#0c0e12] border-l border-[#3a494a] flex flex-col select-none overflow-y-auto shrink-0">
              {/* Panel Header */}
              <div className="p-4 border-b border-[#3a494a] bg-[#1a1c20]">
                <h2 className="font-mono text-xs font-bold text-[#00f5ff] tracking-widest uppercase">
                  // CANDIDATE_TELEMETRY
                </h2>
              </div>

              {/* Active Profile Info */}
              <div className="p-4 border-b border-[#3a494a] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#e2e2e8]">
                    {selectedCandidate.name}
                  </span>
                  <span className="font-mono text-[10px] bg-[#00f5ff]/10 text-[#00f5ff] px-2 py-0.5 rounded border border-[#00f5ff]/30">
                    {selectedCandidate.id}
                  </span>
                </div>
                <p className="font-mono text-xs text-[#849495]">
                  {selectedCandidate.jobRole} · {selectedCandidate.yearsExperience}y exp
                </p>
                <div className="text-xs text-[#849495] font-mono">
                  Edu: {selectedCandidate.education}
                </div>
              </div>

              {/* Curriculum Progress */}
              <div className="p-4 border-b border-[#3a494a] space-y-3">
                <div className="font-mono text-xs text-[#849495] uppercase tracking-wider flex justify-between">
                  <span>CURRICULUM_STATS</span>
                  <span className="text-[#00f5ff]">
                    {completedMissions.length}/{candidateMissions.length}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-[#849495]">Completed Days:</span>
                    <span className="text-[#4edea3] font-bold">
                      {completedMissions.length}
                    </span>
                  </div>
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-[#849495]">Skipped Days:</span>
                    <span className="text-[#ffb4ab] font-bold">
                      {skippedMissions.length}
                    </span>
                  </div>
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-[#849495]">Target Weaknesses:</span>
                    <span className="text-[#ffb86b] font-bold">
                      {weaknessMissions.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Focus Weakness Topics */}
              <div className="p-4 border-b border-[#3a494a] space-y-3">
                <div className="font-mono text-xs text-[#ffb86b] uppercase tracking-wider">
                  ⚠ FOCUS_AREAS (ATTEMPTS &gt; 2)
                </div>
                {weaknessMissions.length === 0 ? (
                  <p className="font-mono text-xs text-[#849495]">None detected</p>
                ) : (
                  <div className="space-y-2">
                    {weaknessMissions.map((m: any) => (
                      <div
                        key={m.day}
                        className="p-2 bg-[#1e1c18] border border-[#583300] rounded-sm text-xs"
                      >
                        <div className="font-mono text-[#ffb86b] font-semibold">
                          Day {m.day}: {m.title}
                        </div>
                        <div className="font-mono text-[10px] text-[#849495] mt-1">
                          Attempts: {m.attempts} (High priority)
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Memory State */}
              <div className="p-4 space-y-3">
                <div className="font-mono text-xs text-[#00f5ff] uppercase tracking-wider">
                  🧠 INTENT_MEMORY_STATE
                </div>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[#849495]">Questions Asked:</span>
                    <span className="text-[#00f5ff] font-bold">
                      {questionsAsked}/8
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#849495]">Breeth Sync:</span>
                    <span className="text-[#4edea3]">ACTIVE</span>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          CANDIDATE SETTINGS MODAL
         ───────────────────────────────────────────── */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1c20] border border-[#00f5ff] rounded-sm max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#3a494a] pb-3">
              <h3 className="font-mono text-sm font-bold text-[#00f5ff] tracking-widest uppercase">
                ⚙ PROFILE_SETTINGS // SELECT_CANDIDATE
              </h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-[#849495] hover:text-[#e2e2e8] font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <p className="font-mono text-xs text-[#849495]">
              Select a candidate from <code className="text-[#00f5ff]">candidates.json</code> to start a new interview session:
            </p>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {candidatesList.map((cand) => {
                const isSelected = selectedCandidate.id === cand.id;
                return (
                  <button
                    key={cand.id}
                    onClick={() => handleSelectCandidate(cand)}
                    className={`w-full text-left p-3 rounded-sm border font-mono text-xs transition-colors flex items-center justify-between ${
                      isSelected
                        ? "bg-[#00f5ff]/10 border-[#00f5ff] text-[#e2e2e8]"
                        : "bg-[#0c0e12] border-[#3a494a] text-[#849495] hover:text-[#e2e2e8] hover:border-[#849495]"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-[#e2e2e8]">
                        {cand.name} ({cand.id})
                      </div>
                      <div className="text-[11px] text-[#849495] mt-0.5">
                        {cand.jobRole} · {cand.yearsExperience}y exp
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-[#00f5ff] font-bold text-xs">
                        ● ACTIVE
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#3a494a]">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 bg-[#282a2e] hover:bg-[#333539] text-[#e2e2e8] font-mono text-xs rounded-sm"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
