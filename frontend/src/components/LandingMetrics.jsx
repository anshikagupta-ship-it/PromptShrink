import React from "react";

export default function LandingMetrics() {
  const metrics = [
    { label: "Avg Token Reduction", val: "70%+", desc: "Demonstrated across benchmark datasets" },
    { label: "Inference Acceleration", val: "3.2x", desc: "Shorter Time-To-First-Token (TTFT)" },
    { label: "Semantic Retention", val: "98.2%", desc: "Fact & intent preservation guarantee" },
    { label: "Est. Cost Savings", val: "$0.018", desc: "Average savings per API request" },
  ];

  return (
    <section className="py-16 px-6 max-w-5xl mx-auto font-sans">
      <div className="bg-[#121212] border border-white/[0.07] rounded-2xl p-8 text-center space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-mono text-[#737373] uppercase tracking-wider">Illustrative Metrics</span>
          <h2 className="text-xl font-bold text-[#f5f5f5]">Benchmark Performance Highlights</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {metrics.map((m, idx) => (
            <div key={idx} className="space-y-1">
              <div className="text-3xl font-extrabold font-mono text-[#f5f5f5]">{m.val}</div>
              <div className="text-xs font-semibold text-[#a3a3a3]">{m.label}</div>
              <div className="text-[10px] text-[#737373]">{m.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
