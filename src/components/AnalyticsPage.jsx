import React, { useMemo } from "react";

/**
 * AnalyticsPage — computes all metrics from real session history.
 * Receives `history` (array of conversation objects with messages).
 */
export default function AnalyticsPage({ history = [] }) {
  // Extract all compression results from conversation history
  const allResults = useMemo(() => {
    const results = [];
    for (const convo of history) {
      if (!convo.messages) continue;
      for (const msg of convo.messages) {
        if (msg.sender === "assistant" && msg.result) {
          results.push(msg.result);
        }
      }
    }
    return results;
  }, [history]);

  // Compute aggregate stats from real results
  const stats = useMemo(() => {
    if (allResults.length === 0) {
      return {
        totalTokensIn: 0,
        totalTokensSaved: 0,
        avgReduction: 0,
        avgRetention: 0,
        totalCostSaved: 0,
        runCount: 0,
      };
    }
    const totalTokensIn = allResults.reduce((s, r) => s + (r.originalTokens || 0), 0);
    const totalTokensSaved = allResults.reduce((s, r) => s + (r.tokensSaved || 0), 0);
    const avgReduction = allResults.reduce((s, r) => s + (r.reductionRatio || 0), 0) / allResults.length;
    const avgRetention = allResults.reduce((s, r) => s + (r.accuracyRetention || 0), 0) / allResults.length;
    const totalCostSaved = allResults.reduce((s, r) => s + parseFloat(r.costSavedEst || 0), 0);
    return {
      totalTokensIn,
      totalTokensSaved,
      avgReduction: parseFloat(avgReduction.toFixed(1)),
      avgRetention: parseFloat(avgRetention.toFixed(1)),
      totalCostSaved: totalCostSaved.toFixed(4),
      runCount: allResults.length,
    };
  }, [allResults]);

  // Last 7 reduction ratios for the bar chart (or zeros if fewer runs)
  const chartValues = useMemo(() => {
    const last7 = allResults.slice(-7).map((r) => r.reductionRatio || 0);
    while (last7.length < 7) last7.unshift(0);
    return last7;
  }, [allResults]);

  const hasData = stats.runCount > 0;

  const metrics = [
    {
      title: "Total Tokens Processed",
      value: hasData ? stats.totalTokensIn.toLocaleString() : "—",
      sub: hasData ? `Across ${stats.runCount} run${stats.runCount !== 1 ? "s" : ""}` : "No runs yet",
      color: "text-[#F5F5F5]",
    },
    {
      title: "Tokens Saved",
      value: hasData ? stats.totalTokensSaved.toLocaleString() : "—",
      sub: hasData ? `${stats.avgReduction}% overall` : "Submit a prompt",
      color: "text-[#10B981]",
    },
    {
      title: "Average Reduction",
      value: hasData ? `${stats.avgReduction}%` : "—",
      sub: hasData ? (stats.avgReduction >= 70 ? "Target >70% ✓" : "Below target") : "No data",
      color: hasData && stats.avgReduction >= 70 ? "text-[#10B981]" : "text-amber-400",
    },
    {
      title: "Average Retention",
      value: hasData ? `${stats.avgRetention}%` : "—",
      sub: hasData ? (stats.avgRetention >= 95 ? "Target ≥95% ✓" : "Below target") : "No data",
      color: hasData && stats.avgRetention >= 95 ? "text-indigo-400" : "text-amber-400",
    },
    {
      title: "Estimated Cost Saved",
      value: hasData ? `$${stats.totalCostSaved}` : "—",
      sub: "API savings (GPT-4 rate)",
      color: "text-purple-400",
    },
  ];

  return (
    <div className="max-w-[900px] mx-auto p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-[#F5F5F5] tracking-tight">
          Analytics Overview
        </h1>
        <p className="text-xs text-[#A1A1AA] mt-1">
          Context compression throughput, token reduction metrics, and cost savings telemetry.
          {hasData && (
            <span className="ml-2 text-[#10B981] font-mono font-medium">
              Live • {stats.runCount} compression{stats.runCount !== 1 ? "s" : ""} recorded
            </span>
          )}
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

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Token Savings over time */}
        <div className="bg-[#17171A] border border-white/[0.08] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#F5F5F5]">Token Reduction Over Time</span>
            <span className="text-[11px] text-[#71717A] font-mono">
              Last {hasData ? Math.min(allResults.length, 7) : 0} Runs
            </span>
          </div>
          <div className="h-40 flex items-end justify-between gap-2 pt-4 px-2 border-b border-white/[0.06]">
            {chartValues.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <div
                  className={`w-full rounded-t-sm transition-all ${
                    val > 0
                      ? "bg-indigo-600/80 group-hover:bg-indigo-500"
                      : "bg-white/5"
                  }`}
                  style={{ height: `${val > 0 ? val : 4}%` }}
                  title={val > 0 ? `${val}%` : "No data"}
                />
                <span className="text-[10px] font-mono text-[#71717A]">
                  R{chartValues.length - 6 + i}
                </span>
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
                <span
                  className={`font-bold ${
                    hasData && stats.avgReduction >= 70 ? "text-[#10B981]" : "text-amber-400"
                  }`}
                >
                  {hasData ? `${stats.avgReduction}%` : "—"}
                </span>
              </div>
              <div className="w-full bg-[#111113] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#10B981] h-full rounded-full transition-all duration-700"
                  style={{ width: hasData ? `${Math.min(stats.avgReduction, 100)}%` : "0%" }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-[#71717A]">Avg Accuracy Retention</span>
                <span
                  className={`font-bold ${
                    hasData && stats.avgRetention >= 95 ? "text-indigo-400" : "text-amber-400"
                  }`}
                >
                  {hasData ? `${stats.avgRetention}%` : "—"}
                </span>
              </div>
              <div className="w-full bg-[#111113] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-700"
                  style={{ width: hasData ? `${Math.min(stats.avgRetention, 100)}%` : "0%" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* No data empty state */}
      {!hasData && (
        <div className="text-center py-10 text-[#404040]">
          <div className="text-3xl mb-2">📊</div>
          <div className="text-sm">Submit a prompt in the chat to see live analytics</div>
        </div>
      )}
    </div>
  );
}
