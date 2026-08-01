import React from "react";
import { PRESET_SAMPLES } from "../services/api";

export default function BenchmarkPage({ onRunPreset }) {
  const benchmarks = [
    {
      id: "bm-1",
      title: "Server Incident Logs",
      category: "Infrastructure & DevOps",
      original: 4820,
      compressed: 1310,
      reduction: "72.8%",
      retention: "98.1%",
      sample: PRESET_SAMPLES[0],
    },
    {
      id: "bm-2",
      title: "Customer Support History",
      category: "Conversational Context",
      original: 1850,
      compressed: 480,
      reduction: "74.1%",
      retention: "97.5%",
      sample: PRESET_SAMPLES[1],
    },
    {
      id: "bm-3",
      title: "API Documentation",
      category: "Technical Specifications",
      original: 2100,
      compressed: 520,
      reduction: "75.2%",
      retention: "96.8%",
      sample: PRESET_SAMPLES[2],
    },
  ];

  return (
    <div className="max-w-[900px] mx-auto p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#F5F5F5] tracking-tight">
            Benchmark Suite
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Empirical evaluation datasets for context compression quality and token reduction benchmarks.
          </p>
        </div>
        <span className="text-xs font-mono text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 px-2.5 py-1 rounded-full font-medium">
          3/3 Benchmarks Passed ✓
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {benchmarks.map((bm) => (
          <div
            key={bm.id}
            className="bg-[#17171A] border border-white/[0.08] rounded-xl p-4 flex flex-col justify-between space-y-4 hover:border-white/[0.16] transition"
          >
            <div>
              <div className="text-[11px] font-mono text-[#71717A] mb-1">{bm.category}</div>
              <h3 className="font-semibold text-sm text-[#F5F5F5] mb-3">{bm.title}</h3>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#111113] p-2.5 rounded-lg border border-white/[0.06]">
                <div>
                  <div className="text-[10px] text-[#71717A]">Original</div>
                  <div className="text-[#F5F5F5] font-medium">{bm.original.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#71717A]">Compressed</div>
                  <div className="text-[#F5F5F5] font-medium">{bm.compressed.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#71717A]">Reduction</div>
                  <div className="text-[#10B981] font-medium">{bm.reduction}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#71717A]">Retention</div>
                  <div className="text-indigo-400 font-medium">{bm.retention}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
              <button
                onClick={() => onRunPreset(bm.sample)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium py-1.5 rounded-md transition"
              >
                Run benchmark
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
