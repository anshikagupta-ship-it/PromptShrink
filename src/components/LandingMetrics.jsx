import React from "react";

export default function LandingMetrics({ latestResult }) {
  const result = latestResult || {};
  const hasResult = !!latestResult && (latestResult.originalTokens > 0 || latestResult.reductionRatio > 0);

  const originalTokens = result.originalTokens ?? 0;
  const compressedTokens = result.compressedTokens ?? 0;
  const reductionRatio = result.reductionRatio ?? 0;
  const costSavedEst = result.costSavedEst ?? null;
  const speedupFactor =
    result.speedupFactor ||
    result.latencyMs?.speedupFactor ||
    (originalTokens > 0 ? `${(originalTokens / Math.max(1, compressedTokens)).toFixed(1)}x` : null);

  const metrics = [
    {
      label: "Avg Token Reduction",
      val: hasResult ? `${reductionRatio}%` : "Calculated on run",
      desc: hasResult ? `${(result.tokensSaved ?? 0).toLocaleString()} tokens removed` : "Real-time token reduction per prompt",
    },
    {
      label: "Inference Acceleration",
      val: hasResult && speedupFactor ? speedupFactor : "Calculated on run",
      desc: "Shorter Time-To-First-Token (TTFT)",
    },
    {
      label: "Semantic Retention",
      val: "Coming soon",
      desc: "Fact & intent preservation guarantee",
    },
    {
      label: "Est. Cost Savings",
      val: hasResult && costSavedEst ? `$${costSavedEst}` : "Calculated on run",
      desc: hasResult ? "Estimated API savings for this run" : "Calculated live per request",
    },
  ];

  return (
    <section className="py-16 px-6 max-w-5xl mx-auto font-sans">
      <div className="bg-[#121212] border border-white/[0.07] rounded-2xl p-8 text-center space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-mono text-[#737373] uppercase tracking-wider">
            {hasResult ? "Live Execution Metrics" : "Dynamic Telemetry"}
          </span>
          <h2 className="text-xl font-bold text-[#f5f5f5]">
            {hasResult ? "Execution Performance Results" : "Real-Time Calculated Metrics"}
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {metrics.map((m, idx) => (
            <div key={idx} className="space-y-1">
              <div className="text-2xl lg:text-3xl font-extrabold font-mono text-[#f5f5f5]">{m.val}</div>
              <div className="text-xs font-semibold text-[#a3a3a3]">{m.label}</div>
              <div className="text-[10px] text-[#737373]">{m.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
