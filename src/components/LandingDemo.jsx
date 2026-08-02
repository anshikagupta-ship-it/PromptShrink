import React, { useState } from "react";
import { estimateTokens, PRESET_SAMPLES } from "../services/api";

/**
 * Safely constructs demo sample objects with full try/catch exception handling,
 * type sanitization, and graceful metric fallbacks.
 */
function buildDemoSample(title = "Sample Prompt", originalText = "", rawOptimizedText = "") {
  try {
    const safeOrigText = String(originalText || "");
    const safeOptText = String(rawOptimizedText || "");

    const origTokens = Math.max(
      0,
      typeof estimateTokens === "function"
        ? estimateTokens(safeOrigText)
        : Math.ceil(safeOrigText.length / 3.8)
    );

    const optTokens = Math.max(
      0,
      typeof estimateTokens === "function"
        ? estimateTokens(safeOptText)
        : Math.ceil(safeOptText.length / 3.8)
    );

    const saved = Math.max(0, origTokens - optTokens);
    const reduction = origTokens > 0 ? parseFloat(((saved / origTokens) * 100).toFixed(1)) : 0;
    const speedup = origTokens > 0 ? `${(origTokens / Math.max(1, optTokens)).toFixed(1)}x` : "1.0x";

    return {
      title: title || "Demo Context",
      origTokens,
      optTokens,
      reduction,
      speedup,
      originalText: safeOrigText,
      optimizedText: safeOptText,
    };
  } catch (err) {
    console.error("[LandingDemo] Exception constructing demo sample:", err);
    return {
      title: title || "Demo Context",
      origTokens: 0,
      optTokens: 0,
      reduction: 0,
      speedup: "1.0x",
      originalText: String(originalText || ""),
      optimizedText: String(rawOptimizedText || ""),
    };
  }
}

export default function LandingDemo() {
  const [activeTab, setActiveTab] = useState("logs");

  let samples = {};
  try {
    const p0 = PRESET_SAMPLES?.[0]?.context || "";
    const p1 = PRESET_SAMPLES?.[1]?.context || "";
    const p2 = PRESET_SAMPLES?.[2]?.context || "";

    samples = {
      logs: buildDemoSample(
        "Server Incident Logs",
        p0,
        `2026-08-02 10:14:10-17 INFO Compression complete: Original 2842 tokens -> Compressed 1638 tokens (42.36% ratio).
2026-08-02 10:14:16 ERROR Failed to parse malformed JSON. Falling back to safe parser.
2026-08-02 10:14:17 INFO Compression complete: Original 3001 tokens -> Compressed 1714 tokens (42.88% ratio).
Server healthy. Waiting for incoming requests...`
      ),
      support: buildDemoSample(
        "Customer Support History",
        p1,
        `User Requirements: AI-powered project management platform.
Features: Auth, projects, tasks, comments, notifications, analytics, AI summaries, RBAC.
Tech Stack: React (frontend), FastAPI (backend), PostgreSQL (database), Redis (cache), S3-compatible storage.
DevOps/Deployment: Docker, Kubernetes, GitHub Actions, Prometheus, Grafana, Loki, Nginx.
Deliverables: Architectural decision explanations, tradeoffs, diagrams, API examples, DB schema, folder structure.`
      ),
      docs: buildDemoSample(
        "API Documentation",
        p2,
        `Task: Production-ready Bit.ly URL Shortener backend architecture.
Requirements: High-level architecture, technology trade-offs (FastAPI vs Flask/Django, PostgreSQL vs MySQL/Mongo, Redis caching/rate-limiting/locking).
Core Features: Auth (OAuth/JWT), shortening, custom aliases, analytics, QR codes, expiration, password protection, orgs/workspaces, public APIs, admin dashboard.
Deliverables: SQL schemas, API endpoint specs, error handling, security (HTTPS, CORS, CSRF, SQLi, XSS), observability, scaling, deployment strategies & 100 to 100M user roadmap.`
      ),
    };
  } catch (err) {
    console.error("[LandingDemo] Error initializing demo samples:", err);
  }

  const sample = (samples && samples[activeTab]) || {
    title: "Demo Context",
    origTokens: 0,
    optTokens: 0,
    reduction: 0,
    speedup: "1.0x",
    originalText: "",
    optimizedText: "",
  };

  return (
    <section id="product" className="py-12 px-6 max-w-5xl mx-auto font-sans">
      {/* Container Box */}
      <div className="bg-[#121212] border border-white/[0.08] rounded-2xl p-6 shadow-2xl space-y-6">
        {/* Header & Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div>
            <span className="text-xs font-mono text-[#a3a3a3] uppercase tracking-wider">Live Engine Demonstration</span>
            <h3 className="text-lg font-bold text-[#f5f5f5]">{sample.title}</h3>
          </div>

          <div className="flex items-center p-1 bg-[#1a1a1a] rounded-lg border border-white/[0.08] text-xs">
            <button
              onClick={() => setActiveTab("logs")}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                activeTab === "logs" ? "bg-[#262626] text-[#f5f5f5]" : "text-[#737373] hover:text-[#a3a3a3]"
              }`}
            >
              Server Logs
            </button>
            <button
              onClick={() => setActiveTab("support")}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                activeTab === "support" ? "bg-[#262626] text-[#f5f5f5]" : "text-[#737373] hover:text-[#a3a3a3]"
              }`}
            >
              Support History
            </button>
            <button
              onClick={() => setActiveTab("docs")}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                activeTab === "docs" ? "bg-[#262626] text-[#f5f5f5]" : "text-[#737373] hover:text-[#a3a3a3]"
              }`}
            >
              API Docs
            </button>
          </div>
        </div>

        {/* Side by Side Visual Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {/* Left: Original Prompt */}
          <div className="bg-[#1a1a1a] border border-white/[0.07] rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-sans pb-1 border-b border-white/[0.06]">
              <span className="text-[#a3a3a3] font-medium">Original Prompt</span>
              <span className="text-[#737373] font-mono">{(sample.origTokens || 0).toLocaleString()} tokens</span>
            </div>
            <div className="text-[#a3a3a3] leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
              {sample.originalText || "No text available"}
            </div>
          </div>

          {/* Right: ContextZero Optimized */}
          <div className="bg-[#1a1a1a] border border-[#10B981]/30 rounded-xl p-4 space-y-2 relative">
            <div className="flex items-center justify-between text-xs font-sans pb-1 border-b border-white/[0.06]">
              <span className="text-[#10B981] font-medium flex items-center gap-1.5">
                <span>✦ ContextZero Optimized</span>
              </span>
              <span className="text-[#10B981] font-mono font-bold">{(sample.optTokens || 0).toLocaleString()} tokens</span>
            </div>
            <div className="text-[#f5f5f5] leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto font-medium">
              {sample.optimizedText || "No optimized text available"}
            </div>
          </div>
        </div>

        {/* Bottom Metrics Pill */}
        <div className="bg-[#1a1a1a] border border-white/[0.07] p-3 rounded-xl flex flex-wrap items-center justify-around text-center gap-4 text-xs">
          <div>
            <div className="text-xl font-bold font-mono text-[#10B981]">{sample.reduction || 0}%</div>
            <div className="text-[11px] text-[#737373] font-sans">Fewer Tokens</div>
          </div>
          <div className="h-6 w-px bg-white/[0.08] hidden sm:block"></div>
          <div>
            <div className="text-sm font-bold font-mono text-[#a3a3a3]">Coming Soon</div>
            <div className="text-[11px] text-[#737373] font-sans">Semantic Retention</div>
          </div>
          <div className="h-6 w-px bg-white/[0.08] hidden sm:block"></div>
          <div>
            <div className="text-xl font-bold font-mono text-[#f5f5f5]">{sample.speedup || "1.0x"}</div>
            <div className="text-[11px] text-[#737373] font-sans">Faster Response Time</div>
          </div>
        </div>
      </div>
    </section>
  );
}
