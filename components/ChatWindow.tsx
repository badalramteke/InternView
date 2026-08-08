"use client";

import InteractiveCodeBlock from "./InteractiveCodeBlock";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  isPushback?: boolean;
}

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  candidateName?: string;
}

function parseAndRenderContent(content: string) {
  const parts = content.split(/(```[\s\S]*?```)/g);

  return parts.map((part, i) => {
    const codeMatch = part.match(/```(\w+)?\n?([\s\S]*?)```/);
    if (codeMatch) {
      const lang = codeMatch[1] || "typescript";
      const code = codeMatch[2].trim();
      return <InteractiveCodeBlock key={i} code={code} language={lang} />;
    }

    return (
      <div key={i} className="whitespace-pre-wrap leading-relaxed">
        {renderInlineFormatting(part)}
      </div>
    );
  });
}

function renderInlineFormatting(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-[#00f5ff] font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="font-mono text-xs px-1.5 py-0.5 rounded bg-[#0c0e12] border border-[#3a494a] text-[#00f5ff]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function ChatWindow({
  messages,
  isLoading,
  candidateName = "CANDIDATE",
}: ChatWindowProps) {
  return (
    <div className="space-y-6 relative pl-12 pr-4 py-2">
      {messages.map((msg) => (
        <div key={msg.id} className="relative group">
          {/* Node Ring on the Stitch Line */}
          {msg.role === "assistant" && (
            <div
              className={`stitch-node-ring ${
                msg.isPushback ? "stitch-node-ring-pushback" : ""
              }`}
            />
          )}

          {msg.role === "assistant" && (
            <AssistantNode message={msg} />
          )}

          {msg.role === "user" && (
            <UserNode message={msg} candidateName={candidateName} />
          )}

          {msg.role === "system" && <SystemNode message={msg} />}
        </div>
      ))}

      {/* Typing / Thinking Indicator */}
      {isLoading && (
        <div className="relative pl-0">
          <div className="stitch-node-ring animate-node-pulse" />
          <div className="bg-[#1a1c20] border border-[#00f5ff]/40 rounded-sm p-4 max-w-xl">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-[#00f5ff] tracking-wider uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00f5ff] animate-ping" />
                AGENT_PROCESSING // REASONING_ENGINE
              </span>
            </div>
            <p className="font-mono text-xs text-[#849495] mt-2">
              Evaluating parameters & searching intent vectors...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Agent Node (Normal vs Pushback)
// ─────────────────────────────────────────────

function AssistantNode({ message }: { message: ChatMessage }) {
  if (message.isPushback) {
    return (
      <div className="bg-[#1e1c18] border-l-4 border-l-[#ffb86b] border border-[#583300] rounded-sm p-5 max-w-2xl text-sm relative shadow-xl">
        {/* Pushback Tag Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#583300]">
          <span className="font-mono text-xs font-bold text-[#ffb86b] tracking-widest uppercase flex items-center gap-1.5">
            <span>⚠</span> COGNITIVE_GAP_DETECTED
          </span>
          <span className="font-mono text-[10px] font-bold bg-[#ed9000] text-[#000] px-2 py-0.5 rounded-sm tracking-wider uppercase">
            PUSHBACK
          </span>
        </div>
        <div className="text-[#e2e2e8] text-sm">
          {parseAndRenderContent(message.content)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1c20] border border-[#3a494a] hover:border-[#00f5ff]/40 transition-colors rounded-sm p-5 max-w-2xl text-sm shadow-md">
      {/* Node Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#3a494a]/60">
        <span className="font-mono text-xs text-[#849495] tracking-widest uppercase flex items-center gap-2">
          <span className="text-[#00f5ff]">⚙</span> AGENT_NODE // SYS_PROMPT
        </span>
        <span className="font-mono text-[10px] text-[#849495]">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </span>
      </div>
      <div className="text-[#e2e2e8] text-sm">
        {parseAndRenderContent(message.content)}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Candidate Node (Right aligned block)
// ─────────────────────────────────────────────

function UserNode({
  message,
  candidateName,
}: {
  message: ChatMessage;
  candidateName: string;
}) {
  return (
    <div className="flex justify-end my-2">
      <div className="bg-[#1e2024] border border-[#3a494a] hover:border-[#849495] transition-colors rounded-sm p-5 max-w-2xl text-sm shadow-md">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#3a494a]/60">
          <span className="font-mono text-[10px] text-[#849495]">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span className="font-mono text-xs text-[#849495] tracking-widest uppercase flex items-center gap-1.5">
            {candidateName.toUpperCase().replace(/\s+/g, "_")} {"// CANDIDATE 👤"}
          </span>
        </div>
        <div className="text-[#e2e2e8] text-sm">
          {parseAndRenderContent(message.content)}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// System Node
// ─────────────────────────────────────────────

function SystemNode({ message }: { message: ChatMessage }) {
  return (
    <div className="my-2 p-3 bg-[#111318] border border-[#ff4d4d]/40 rounded-sm font-mono text-xs text-[#ffb4ab] text-center">
      [SYSTEM_LOG] {message.content}
    </div>
  );
}
