"use client";

import { useState } from "react";

interface InteractiveCodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export default function InteractiveCodeBlock({
  code,
  language = "typescript",
  filename,
}: InteractiveCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const displayFilename =
    filename || (language ? `snippet.${language}` : "code_snippet.ts");

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="my-4 rounded-sm border border-[#3a494a] bg-[#0c0e12] overflow-hidden shadow-lg font-mono text-xs">
      {/* Terminal Window Header */}
      <div className="bg-[#1a1c20] border-b border-[#3a494a] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[#849495] font-mono text-xs tracking-wider">
            {displayFilename}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={copyToClipboard}
            className="text-[10px] uppercase font-mono px-2 py-0.5 rounded border border-[#3a494a] text-[#849495] hover:text-[#00f5ff] hover:border-[#00f5ff] transition-colors"
          >
            {copied ? "✓ COPIED" : "COPY"}
          </button>
          {/* Window Control Dots */}
          <div className="flex items-center gap-1.5 opacity-60">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
          </div>
        </div>
      </div>

      {/* Code Area */}
      <pre className="p-4 overflow-x-auto leading-relaxed text-[#e2e2e8]">
        <code>{code}</code>
      </pre>
    </div>
  );
}
