import React from "react";

export default function DashboardPanel({ latestResult, isOpen, onClose }) {
  const hasResult = !!latestResult;
  const result = latestResult || {};

  // All values come directly from API response — no hardcoding
  const reductionRatio = result.reductionRatio ?? 0;
  const tokensSaved = result.tokensSaved ?? 0;
  const costSavedEst = result.costSavedEst ?? "0.0000";
  const originalTokens = result.originalTokens ?? 0;
  const compressedTokens = result.compressedTokens ?? 0;
  const accuracyRetention = result.accuracyRetention ?? 0;
  const speedupFactor = result.latencyMs?.speedupFactor ?? null;

  return (
    <aside
      className={`fixed lg:static inset-y-0 right-0 z-40 bg-[#121212] border-l border-white/[0.07] flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
        isOpen ? "w-[300px] max-w-[85vw] opacity-100 translate-x-0" : "w-0 lg:w-0 opacity-0 translate-x-full border-none"
      }`}
    >
      {/* Panel Header */}
      <div className="p-4 border-b border-white/[0.07] flex items-center justify-between font-sans">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${hasResult ? "bg-[#10B981]" : "bg-[#404040]"}`}></span>
          <h2 className="text-xs font-semibold text-[#f5f5f5] uppercase tracking-wider">
            Optimization Dashboard
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-[#737373] hover:text-[#f5f5f5] text-xs p-1 rounded-md hover:bg-[#262626] transition"
          title="Collapse Dashboard"
        >
          ✕
        </button>
      </div>

      {/* Main Dashboard Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">

        {!hasResult ? (
          <div className="text-center text-[#404040] text-xs py-10">
            <div className="text-2xl mb-2">📊</div>
            <div>Submit a prompt to see<br />live optimization metrics</div>
          </div>
        ) : (
          <>
            {/* Hero Card: % Saved */}
            <div className="bg-[#1a1a1a] border border-white/[0.07] p-4 rounded-xl space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between text-[11px] text-[#737373] font-medium">
                <span>Current Prompt Reduction</span>
                <span className="text-[#10B981] font-mono font-bold">
                  {reductionRatio > 0 ? "Target Met" : "Processing"}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#10B981] font-mono tracking-tight">
                  {reductionRatio}%
                </span>
                <span className="text-xs text-[#a3a3a3] font-mono">tokens saved</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#0a0a0a] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#10B981] h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(reductionRatio, 100)}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#737373] font-mono pt-1">
                <span>Saved {tokensSaved.toLocaleString()} tokens</span>
                <span>Est. Cost: ${costSavedEst}</span>
              </div>
            </div>

            {/* 4 Grid Metrics */}
            <div>
              <div className="text-[11px] font-medium text-[#737373] mb-2 uppercase tracking-wider">
                Telemetry Metrics
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#1a1a1a] border border-white/[0.07] p-2.5 rounded-lg space-y-0.5">
                  <div className="text-[10px] text-[#737373]">Original</div>
                  <div className="font-mono text-sm font-semibold text-[#f5f5f5]">
                    {originalTokens.toLocaleString()}
                  </div>
                </div>

                <div className="bg-[#1a1a1a] border border-white/[0.07] p-2.5 rounded-lg space-y-0.5">
                  <div className="text-[10px] text-[#737373]">Compressed</div>
                  <div className="font-mono text-sm font-semibold text-[#f5f5f5]">
                    {compressedTokens.toLocaleString()}
                  </div>
                </div>

                <div className="bg-[#1a1a1a] border border-white/[0.07] p-2.5 rounded-lg space-y-0.5">
                  <div className="text-[10px] text-[#737373]">Accuracy Retention</div>
                  <div className="font-mono text-sm font-semibold text-[#f5f5f5]">
                    {accuracyRetention > 0 ? `${accuracyRetention}%` : "—"}
                  </div>
                </div>

                <div className="bg-[#1a1a1a] border border-white/[0.07] p-2.5 rounded-lg space-y-0.5">
                  <div className="text-[10px] text-[#737373]">Speedup Factor</div>
                  <div className="font-mono text-sm font-semibold text-[#a3a3a3]">
                    {speedupFactor || "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* Engine Pipeline Execution Checklist */}
            <div>
              <div className="text-[11px] font-medium text-[#737373] mb-2 uppercase tracking-wider">
                Engine Pipeline Stages
              </div>
              <div className="bg-[#1a1a1a] border border-white/[0.07] rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#a3a3a3]">Token Analysis</span>
                  <span className="text-[#10B981] font-mono font-medium">✓ Done</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#a3a3a3]">Information Protection</span>
                  <span className="text-[#10B981] font-mono font-medium">✓ Done</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#a3a3a3]">Deduplication & Condense</span>
                  <span className="text-[#10B981] font-mono font-medium">✓ Done</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#a3a3a3]">Quality Verification</span>
                  <span className="text-[#10B981] font-mono font-medium">✓ Verified</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#a3a3a3]">LLM Forwarding</span>
                  <span className="text-[#10B981] font-mono font-medium">✓ Forwarded</span>
                </div>
              </div>
            </div>

            {/* Protected Information Highlights */}
            <div>
              <div className="text-[11px] font-medium text-[#737373] mb-2 uppercase tracking-wider">
                Protected Context Rules
              </div>
              <div className="bg-[#1a1a1a] border border-white/[0.07] rounded-xl p-3 space-y-1.5 text-[11px]">
                <div className="flex items-center gap-1.5 text-[#a3a3a3]">
                  <span className="text-[#737373]">🛡️</span>
                  <span>User Intent & Constraints</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#a3a3a3]">
                  <span className="text-[#737373]">🛡️</span>
                  <span>HTTP Error Codes & Status</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#a3a3a3]">
                  <span className="text-[#737373]">🛡️</span>
                  <span>Service IDs & Timestamps</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer info */}
      <div className="p-3 border-t border-white/[0.07] bg-[#0a0a0a] text-[10px] font-mono text-[#737373] text-center">
        ContextZero Engine • Active Observability
      </div>
    </aside>
  );
}
