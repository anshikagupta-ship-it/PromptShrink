import React from "react";

export default function LandingRealResults() {
  const testedResults = [
    {
      category: "CODING PROMPT",
      originalTokens: 421,
      optimizedTokens: 253,
      tokensRemoved: 168,
      reductionRatio: 39.9,
      origWidth: 100,
      optWidth: 60.1,
    },
    {
      category: "RESEARCH PROMPT",
      originalTokens: 612,
      optimizedTokens: 391,
      tokensRemoved: 221,
      reductionRatio: 36.1,
      origWidth: 100,
      optWidth: 63.9,
    },
    {
      category: "LOG ANALYSIS PROMPT",
      originalTokens: 1240,
      optimizedTokens: 340,
      tokensRemoved: 900,
      reductionRatio: 72.6,
      origWidth: 100,
      optWidth: 27.4,
    },
  ];

  return (
    <section id="results" className="py-16 px-6 max-w-5xl mx-auto font-sans scroll-mt-20">
      <div className="text-center space-y-2 mb-12">
        <span className="text-xs font-mono text-[#737373] uppercase tracking-wider">Empirical Evidence</span>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#f5f5f5] tracking-tight">
          Real Before vs After Results
        </h2>
        <p className="text-sm text-[#a3a3a3] max-w-md mx-auto">
          Actual test prompt runs executed through the ContextZero compression pipeline.
        </p>
      </div>

      <div className="space-y-6">
        {testedResults.map((res, idx) => (
          <div
            key={idx}
            className="bg-[#121212] border border-white/[0.07] p-6 rounded-2xl space-y-4"
          >
            {/* Category Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#f5f5f5] uppercase tracking-wider">
                {res.category}
              </span>
              <span className="text-xs font-mono text-[#10B981] font-bold">
                {res.reductionRatio}% REDUCTION
              </span>
            </div>

            {/* Visual Token Bars Comparison */}
            <div className="space-y-3 font-mono text-xs">
              {/* Original Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[#737373] text-[11px]">
                  <span>Original Context</span>
                  <span>{res.originalTokens} tokens</span>
                </div>
                <div className="w-full bg-[#1a1a1a] h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-[#333333] h-full rounded-full"
                    style={{ width: `${res.origWidth}%` }}
                  ></div>
                </div>
              </div>

              {/* Optimized Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[#10B981] text-[11px]">
                  <span>Optimized Context</span>
                  <span>{res.optimizedTokens} tokens</span>
                </div>
                <div className="w-full bg-[#1a1a1a] h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-[#10B981] h-full rounded-full transition-all duration-700"
                    style={{ width: `${res.optWidth}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Measurement Summary */}
            <div className="text-center pt-2 border-t border-white/[0.06] text-xs font-mono text-[#a3a3a3]">
              <span className="text-[#10B981] font-bold">{res.tokensRemoved} tokens removed</span> ({res.reductionRatio}% savings)
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
