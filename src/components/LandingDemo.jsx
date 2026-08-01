import React, { useState } from "react";

export default function LandingDemo() {
  const [activeTab, setActiveTab] = useState("logs");

  const samples = {
    logs: {
      title: "Server Incident Logs",
      origTokens: 1240,
      optTokens: 340,
      reduction: 72.6,
      originalText: `[2026-08-01 10:14:01] INFO [auth-service] Health check OK. Response time 12ms.
[2026-08-01 10:14:02] INFO [auth-service] User session validated for user_id=98214.
[2026-08-01 10:14:05] WARN [payment-gateway] Connection pool at 85% capacity. Retrying...
[2026-08-01 10:14:07] ERROR [payment-gateway] HTTP 429 Too Many Requests from upstream stripe-api /v1/charges.
[2026-08-01 10:14:07] ERROR [payment-gateway] Retry attempt 1 failed with status 429.
[2026-08-01 10:14:08] ERROR [payment-gateway] Retry attempt 2 failed with status 429.
[2026-08-01 10:14:10] CRITICAL [order-processor] DB Connection spike! Active: 450/500 connections. Backlog: 12,500 items.`,
      optimizedText: `[CONTEXTZERO OPTIMIZED - 72.6% Reduction]
ERROR [payment-gateway] HTTP 429 Too Many Requests on upstream endpoint /v1/charges. Retries 1-3 failed.
CRITICAL [order-processor] DB Connection pool spike 450/500. Queue backlog reached 12,500 items.`,
    },
    support: {
      title: "Customer Support History",
      origTokens: 1850,
      optTokens: 480,
      reduction: 74.1,
      originalText: `Customer (10:00 AM): Hello, is anyone available to help me today? Hope you're having a good morning!
Agent (10:01 AM): Hello! Thanks for reaching out to CloudSupport. My name is Alex. How can I assist you today?
Customer (10:02 AM): Hi Alex! I am trying to upgrade my database tier from Standard to Enterprise on subscription plan #941.
Agent (10:03 AM): I understand! Account ACC-88912 has a pending invoice INV-4402 from last month.
Customer (10:08 AM): I just paid invoice INV-4402 via credit card. Can you verify?
Agent (10:10 AM): Verified! Invoice INV-4402 is settled. Enterprise tier upgrade is active.`,
      optimizedText: `[CONTEXTZERO OPTIMIZED - 74.1% Reduction]
User ACC-88912 requested Enterprise upgrade for plan #941.
Blocked by pending invoice INV-4402. Invoice settled via credit card. Upgrade activated successfully.`,
    },
    docs: {
      title: "API Documentation",
      origTokens: 2100,
      optTokens: 520,
      reduction: 75.2,
      originalText: `General Requirements: All requests must include Bearer token authorization in the HTTP Header format: 'Authorization: Bearer <TOKEN>'.
Content-Type header must be strictly set to 'application/json'.
Rate Limiting: Each tenant is capped at 1,000 requests per minute per IP address.
Error Responses:
- 400 Bad Request: Returns JSON object {"error": "INVALID_PAYLOAD"}.
- 401 Unauthorized: Returns JSON object {"error": "MISSING_BEARER_TOKEN"}.
- 429 Too Many Requests: Returns JSON object {"error": "RATE_LIMIT_EXCEEDED"}.`,
      optimizedText: `[CONTEXTZERO OPTIMIZED - 75.2% Reduction]
Auth: Header 'Authorization: Bearer <TOKEN>', Content-Type: application/json. Rate Limit: 1,000 req/min/IP.
Errors: 400 INVALID_PAYLOAD, 401 MISSING_BEARER_TOKEN, 429 RATE_LIMIT_EXCEEDED.`,
    },
  };

  const sample = samples[activeTab];

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
              <span className="text-[#737373] font-mono">{sample.origTokens.toLocaleString()} tokens</span>
            </div>
            <div className="text-[#a3a3a3] leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
              {sample.originalText}
            </div>
          </div>

          {/* Right: ContextZero Optimized */}
          <div className="bg-[#1a1a1a] border border-[#10B981]/30 rounded-xl p-4 space-y-2 relative">
            <div className="flex items-center justify-between text-xs font-sans pb-1 border-b border-white/[0.06]">
              <span className="text-[#10B981] font-medium flex items-center gap-1.5">
                <span>✦ ContextZero Optimized</span>
              </span>
              <span className="text-[#10B981] font-mono font-bold">{sample.optTokens.toLocaleString()} tokens</span>
            </div>
            <div className="text-[#f5f5f5] leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto font-medium">
              {sample.optimizedText}
            </div>
          </div>
        </div>

        {/* Bottom Metrics Pill */}
        <div className="bg-[#1a1a1a] border border-white/[0.07] p-3 rounded-xl flex flex-wrap items-center justify-around text-center gap-4 text-xs">
          <div>
            <div className="text-xl font-bold font-mono text-[#10B981]">{sample.reduction}%</div>
            <div className="text-[11px] text-[#737373] font-sans">Fewer Tokens</div>
          </div>
          <div className="h-6 w-px bg-white/[0.08] hidden sm:block"></div>
          <div>
            <div className="text-xl font-bold font-mono text-[#f5f5f5]">100%</div>
            <div className="text-[11px] text-[#737373] font-sans">Same Intent</div>
          </div>
          <div className="h-6 w-px bg-white/[0.08] hidden sm:block"></div>
          <div>
            <div className="text-xl font-bold font-mono text-[#f5f5f5]">3.2x</div>
            <div className="text-[11px] text-[#737373] font-sans">Faster Response Time</div>
          </div>
        </div>
      </div>
    </section>
  );
}
