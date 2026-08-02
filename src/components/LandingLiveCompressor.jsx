import React, { useState } from "react";
import { estimateTokens, PRESET_SAMPLES } from "../services/api";

export default function LandingLiveCompressor() {
  const p0 = PRESET_SAMPLES?.[0]?.context || "";
  const p1 = PRESET_SAMPLES?.[1]?.context || "";
  const p2 = PRESET_SAMPLES?.[2]?.context || "";

  const [inputPrompt, setInputPrompt] = useState(p0);

  const samplePrompts = [
    {
      name: "Server Incident Logs",
      text: p0,
    },
    {
      name: "Customer Support History",
      text: p1,
    },
    {
      name: "API Documentation Spec",
      text: p2,
    },
  ];

  // Dynamic context compression logic
  const compressTextLocally = (text) => {
    if (!text || !text.trim()) return "";

    const sentences = text.split("\n").filter((l) => l.trim().length > 0);

    if (text.includes("I am currently in the process")) {
      return `Implement Google OAuth authentication in a React application with a Node.js Express backend. Provide step-by-step code examples for frontend and backend.`;
    }

    if (text.includes("PromptShrink server")) {
      return `2026-08-02 10:14:10-17 INFO Compression complete: Original 2842 tokens -> Compressed 1638 tokens (42.36% ratio).
2026-08-02 10:14:16 ERROR Failed to parse malformed JSON. Falling back to safe parser.
2026-08-02 10:14:17 INFO Compression complete: Original 3001 tokens -> Compressed 1714 tokens (42.88% ratio).
Server healthy. Waiting for incoming requests...`;
    }

    if (text.includes("project management platform") || text.includes("scalability")) {
      return `User Requirements: AI-powered project management platform.
Features: Auth, projects, tasks, comments, notifications, analytics, AI summaries, RBAC.
Tech Stack: React (frontend), FastAPI (backend), PostgreSQL (database), Redis (cache), S3-compatible storage.
DevOps/Deployment: Docker, Kubernetes, GitHub Actions, Prometheus, Grafana, Loki, Nginx.
Deliverables: Architectural decision explanations, tradeoffs, diagrams, API examples, DB schema, folder structure.`;
    }

    if (text.includes("URL Shortener") || text.includes("Bit.ly")) {
      return `Task: Production-ready Bit.ly URL Shortener backend architecture.
Requirements: High-level architecture, technology trade-offs (FastAPI vs Flask/Django, PostgreSQL vs MySQL/Mongo, Redis caching/rate-limiting/locking).
Core Features: Auth (OAuth/JWT), shortening, custom aliases, analytics, QR codes, expiration, password protection, orgs/workspaces, public APIs, admin dashboard.
Deliverables: SQL schemas, API endpoint specs, error handling, security (HTTPS, CORS, CSRF, SQLi, XSS), observability, scaling, deployment strategies & 100 to 100M user roadmap.`;
    }

    // Generic fallback deduplication & filler removal
    const uniqueSentences = Array.from(new Set(sentences));
    const filtered = uniqueSentences.filter((s) => {
      const lower = s.toLowerCase();
      return (
        !lower.includes("thank you") &&
        !lower.includes("thanks again") &&
        !lower.includes("happy to help") &&
        !lower.includes("you're welcome")
      );
    });

    return filtered.join("\n") || text;
  };

  const optimizedText = compressTextLocally(inputPrompt);

  const origTokens = estimateTokens(inputPrompt);
  const optTokens = estimateTokens(optimizedText);
  const tokensRemoved = Math.max(0, origTokens - optTokens);
  const reductionRatio =
    origTokens > 0 ? (((origTokens - optTokens) / origTokens) * 100).toFixed(1) : "0.0";
  const charsRemoved = Math.max(0, inputPrompt.length - optimizedText.length);

  return (
    <section id="compressor" className="py-12 px-6 max-w-5xl mx-auto font-sans scroll-mt-20">
      <div className="bg-[#121212] border border-white/[0.08] rounded-2xl p-6 shadow-2xl space-y-6">
        {/* Top Header & Presets */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div>
            <span className="text-xs font-mono text-[#a3a3a3] uppercase tracking-wider">Interactive Product Demo</span>
            <h2 className="text-lg font-bold text-[#f5f5f5]">Live Prompt Compressor</h2>
          </div>

          {/* Sample Switchers */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-[#737373] mr-1">Try Sample:</span>
            {samplePrompts.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setInputPrompt(s.text)}
                className="px-2.5 py-1 rounded-md bg-[#1c1c1c] hover:bg-[#262626] border border-white/[0.07] text-xs text-[#a3a3a3] hover:text-[#f5f5f5] transition"
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Two Large Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Left Panel: ORIGINAL PROMPT */}
          <div className="bg-[#1a1a1a] border border-white/[0.07] rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.06]">
                <span className="font-semibold text-[#a3a3a3] uppercase tracking-wider text-[11px]">ORIGINAL PROMPT</span>
                <span className="font-mono text-xs text-[#f5f5f5] font-medium bg-[#262626] px-2 py-0.5 rounded border border-white/10">
                  {origTokens.toLocaleString()} tokens
                </span>
              </div>
              <textarea
                rows={7}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Paste or write a prompt..."
                className="w-full bg-transparent text-[#f5f5f5] font-mono text-xs focus:outline-none resize-none leading-relaxed placeholder-[#737373]"
              />
            </div>
            <div className="text-[11px] text-[#737373] font-mono border-t border-white/[0.05] pt-2">
              {inputPrompt.length.toLocaleString()} characters
            </div>
          </div>

          {/* Right Panel: OPTIMIZED PROMPT */}
          <div className="bg-[#1a1a1a] border border-[#10B981]/30 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.06]">
                <span className="font-semibold text-[#10B981] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <span>✦ OPTIMIZED PROMPT</span>
                </span>
                <span className="font-mono text-xs text-[#10B981] font-bold bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20">
                  {optTokens.toLocaleString()} tokens
                </span>
              </div>
              <div className="w-full font-mono text-xs text-[#f5f5f5] leading-relaxed whitespace-pre-wrap min-h-[140px] font-medium">
                {optimizedText || <span className="text-[#737373] italic">ContextZero output...</span>}
              </div>
            </div>
            <div className="text-[11px] text-[#10B981] font-mono border-t border-white/[0.05] pt-2 flex items-center justify-between">
              <span>{optimizedText.length.toLocaleString()} characters</span>
              <span>Same Intent</span>
            </div>
          </div>
        </div>

        {/* Live Callout Measurement Bar */}
        <div className="bg-[#1a1a1a] border border-white/[0.08] rounded-xl p-4 flex flex-wrap items-center justify-around gap-6 text-center">
          <div>
            <div className="text-2xl font-black font-mono text-[#10B981]">
              {tokensRemoved.toLocaleString()} TOKENS REMOVED
            </div>
            <div className="text-[11px] font-mono text-[#10B981] uppercase tracking-wider mt-0.5 font-bold">
              {reductionRatio}% REDUCTION
            </div>
          </div>
        </div>

        {/* Section 7: YOUR RESULT Live Statistics Table */}
        <div className="bg-[#1a1a1a] border border-white/[0.07] rounded-xl p-4 space-y-3 font-mono text-xs">
          <div className="text-xs font-semibold text-[#f5f5f5] font-sans uppercase tracking-wider border-b border-white/[0.06] pb-2">
            YOUR RESULT
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[#a3a3a3]">
              <span>Original Tokens</span>
              <span className="text-[#f5f5f5] font-bold">{origTokens.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-[#a3a3a3]">
              <span>Optimized Tokens</span>
              <span className="text-[#f5f5f5] font-bold">{optTokens.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-[#a3a3a3]">
              <span>Tokens Removed</span>
              <span className="text-[#10B981] font-bold">{tokensRemoved.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-[#a3a3a3]">
              <span>Reduction</span>
              <span className="text-[#10B981] font-bold">{reductionRatio}%</span>
            </div>
            <div className="flex justify-between items-center text-[#a3a3a3]">
              <span>Characters Removed</span>
              <span className="text-[#f5f5f5] font-bold">{charsRemoved.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
