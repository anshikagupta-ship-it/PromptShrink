import React from "react";

export default function LandingWhyTokensMatter() {
  return (
    <section className="py-16 px-6 max-w-5xl mx-auto font-sans">
      <div className="bg-[#121212] border border-white/[0.07] rounded-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono text-[#737373] uppercase tracking-wider">Fundamentals</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#f5f5f5] tracking-tight">
            Why Token Reduction Matters
          </h2>
          <p className="text-sm text-[#a3a3a3] max-w-md mx-auto">
            LLMs process prompts as tokens. Removing unnecessary tokens means less context needs to be sent and processed.
          </p>
        </div>

        {/* Simple Visual Flow Diagram */}
        <div className="max-w-md mx-auto bg-[#1a1a1a] border border-white/[0.06] rounded-xl p-5 font-mono text-xs text-[#a3a3a3] space-y-3">
          <div className="text-[#737373] font-bold text-center">MORE TOKENS</div>
          <div className="pl-4 space-y-1 border-l border-white/10 text-[11px]">
            <div>├─ More context processed</div>
            <div>├─ Larger prompts</div>
            <div>└─ More input-token usage</div>
          </div>
          <div className="text-center text-xs text-[#10B981] font-bold py-1">
            ↓ CONTEXTZERO OPTIMIZATION ↓
          </div>
          <div className="text-[#10B981] font-bold text-center">FEWER TOKENS</div>
        </div>
      </div>
    </section>
  );
}
