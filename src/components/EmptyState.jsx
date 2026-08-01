import React from "react";
import { PRESET_SAMPLES } from "../services/api";

export default function EmptyState({ onSelectPreset }) {
  const suggestions = [
    {
      title: "Analyze server logs",
      desc: "HTTP 429 & DB spike logs",
      sample: PRESET_SAMPLES[0],
    },
    {
      title: "Summarize support history",
      desc: "Multi-turn chat history",
      sample: PRESET_SAMPLES[1],
    },
    {
      title: "Compress API documentation",
      desc: "Verbose microservices spec",
      sample: PRESET_SAMPLES[2],
    },
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto my-auto animate-fade-in font-sans">
      {/* Icon Logo */}
      <div className="w-10 h-10 rounded-xl bg-[#262626] border border-white/10 flex items-center justify-center font-semibold text-[#f5f5f5] text-sm mb-5 shadow-xs">
        CZ
      </div>

      {/* Heading */}
      <h1 className="text-2xl md:text-3xl font-bold text-[#f5f5f5] tracking-tight mb-3">
        Compress context. Keep the meaning.
      </h1>

      {/* Subheading */}
      <p className="text-sm text-[#a3a3a3] font-normal leading-relaxed mb-8 max-w-md">
        Reduce LLM input tokens while preserving intent, constraints and critical information.
      </p>

      {/* 3 Compact Suggestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mb-8">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPreset(item.sample)}
            className="p-4 rounded-2xl bg-[#1a1a1a] hover:bg-[#262626] border border-white/[0.07] text-left transition flex flex-col justify-between h-28 group cursor-pointer"
          >
            <div>
              <div className="text-xs font-semibold text-[#f5f5f5] group-hover:text-white transition mb-1">
                {item.title}
              </div>
              <div className="text-[11px] text-[#a3a3a3] line-clamp-2 leading-relaxed">
                {item.desc}
              </div>
            </div>
            <div className="text-[10px] font-mono text-[#a3a3a3] group-hover:text-[#f5f5f5] transition">
              ~72% Savings →
            </div>
          </button>
        ))}
      </div>

      {/* Subdued Footnote */}
      <div className="text-xs text-[#737373] font-normal">
        Typical reduction: 70%+ • Semantic retention monitored automatically
      </div>
    </div>
  );
}
