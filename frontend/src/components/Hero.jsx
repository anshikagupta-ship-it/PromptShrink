import React from "react";

export default function Hero({ onStartClick }) {
  return (
    <section className="relative overflow-hidden pt-36 pb-20">
      {/* Glow gradient backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#4f46e530,#0b1220_70%)] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 rounded-full text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Gen AI Hackathon • 1-Click Prompt Engine
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
            Compress Context. <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-200 bg-clip-text text-transparent">
              Preserve Meaning.
            </span>
          </h1>

          <p className="text-gray-400 text-base md:text-lg mt-6 leading-relaxed">
            PromptShrink automatically strips redundancy, locks critical constraints, and reduces prompt tokens by over 70% before sending context to LLMs—lowering API costs and accelerating inference speed.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <button
              type="button"
              onClick={onStartClick}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 transition transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>Launch Compressor Playground</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* 4 Metric Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
          <div className="bg-[#111927]/80 border border-white/10 p-5 rounded-2xl backdrop-blur-md text-center">
            <div className="text-3xl font-black text-white font-mono">&gt;70%</div>
            <div className="text-xs text-gray-400 mt-1">Prompt Compression Target</div>
          </div>

          <div className="bg-[#111927]/80 border border-white/10 p-5 rounded-2xl backdrop-blur-md text-center">
            <div className="text-3xl font-black text-emerald-400 font-mono">≥95%</div>
            <div className="text-xs text-gray-400 mt-1">Accuracy Retention</div>
          </div>

          <div className="bg-[#111927]/80 border border-white/10 p-5 rounded-2xl backdrop-blur-md text-center">
            <div className="text-3xl font-black text-indigo-400 font-mono">3.2x</div>
            <div className="text-xs text-gray-400 mt-1">Inference Latency Speedup</div>
          </div>

          <div className="bg-[#111927]/80 border border-white/10 p-5 rounded-2xl backdrop-blur-md text-center">
            <div className="text-3xl font-black text-purple-400 font-mono">72%+</div>
            <div className="text-xs text-gray-400 mt-1">API Cost Saved</div>
          </div>
        </div>
      </div>
    </section>
  );
}