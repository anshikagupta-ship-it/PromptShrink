import React from "react";

export default function AnalyticsPage() {
  const metrics = [
    { title: "Total Tokens Processed", value: "148,290", sub: "Last 30 days", color: "text-[#F5F5F5]" },
    { title: "Tokens Saved", value: "108,400", sub: "73.1% overall", color: "text-[#10B981]" },
    { title: "Average Reduction", value: "73.1%", sub: "Target >70% ✓", color: "text-[#10B981]" },
    { title: "Average Retention", value: "97.8%", sub: "Target ≥95% ✓", color: "text-indigo-400" },
    { title: "Estimated Cost Saved", value: "$2.16", sub: "API savings", color: "text-purple-400" },
  ];

  return (
    <div className="max-w-[900px] mx-auto p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-[#F5F5F5] tracking-tight">
          Analytics Overview
        </h1>
        <p className="text-xs text-[#A1A1AA] mt-1">
          Context compression throughput, token reduction metrics, and cost savings telemetry.
        </p>
      </div>

      {/* Top 5 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className="bg-[#17171A] border border-white/[0.08] p-3.5 rounded-xl space-y-1"
          >
            <div className="text-[11px] text-[#71717A] truncate font-medium">{m.title}</div>
            <div className={`text-lg font-mono font-bold ${m.color}`}>{m.value}</div>
            <div className="text-[10px] text-[#A1A1AA] font-mono">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Clean Minimal SaaS Telemetry Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Token Savings over time */}
        <div className="bg-[#17171A] border border-white/[0.08] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#F5F5F5]">Token Savings Over Time</span>
            <span className="text-[11px] text-[#71717A] font-mono">Last 7 Runs</span>
          </div>
          <div className="h-40 flex items-end justify-between gap-2 pt-4 px-2 border-b border-white/[0.06]">
            {[45, 65, 80, 72, 90, 85, 95].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <div
                  className="w-full bg-indigo-600/80 group-hover:bg-indigo-500 rounded-t-sm transition-all"
                  style={{ height: `${val}%` }}
                ></div>
                <span className="text-[10px] font-mono text-[#71717A]">R{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Compression & Retention Ratio */}
        <div className="bg-[#17171A] border border-white/[0.08] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#F5F5F5]">Compression vs Retention</span>
            <span className="text-[11px] text-[#71717A] font-mono">Target Check</span>
          </div>
          <div className="h-40 flex flex-col justify-center space-y-4 px-2">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-[#71717A]">Avg Compression</span>
                <span className="text-[#10B981] font-bold">73.1%</span>
              </div>
              <div className="w-full bg-[#111113] h-2 rounded-full overflow-hidden">
                <div className="bg-[#10B981] h-full rounded-full w-[73.1%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-[#71717A]">Avg Accuracy Retention</span>
                <span className="text-indigo-400 font-bold">97.8%</span>
              </div>
              <div className="w-full bg-[#111113] h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full w-[97.8%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
