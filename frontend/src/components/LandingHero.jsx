import React from "react";

export default function LandingHero() {
  return (
    <section className="pt-20 pb-12 px-6 text-center max-w-3xl mx-auto space-y-6 font-sans animate-fade-in">
      {/* Top Tag */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171717] border border-white/[0.08] text-[11px] font-mono text-[#a3a3a3]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
        <span>Prompt Context Compression</span>
      </div>

      {/* Headline */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#f5f5f5] tracking-tight leading-[1.1]">
        Less context. <br className="hidden sm:inline" />
        <span className="text-[#a3a3a3]">Same intent.</span>
      </h1>

      {/* Description */}
      <p className="text-base sm:text-lg text-[#a3a3a3] max-w-xl mx-auto leading-relaxed font-normal">
        ContextZero removes redundant tokens from your prompts while preserving the information that matters.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <a
          href="#compressor"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#f5f5f5] text-black hover:bg-white font-medium text-sm transition shadow-md active:scale-95 flex items-center justify-center gap-1.5"
        >
          <span>Try It Now</span>
          <span>→</span>
        </a>
        <a
          href="#how-it-works"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#171717] hover:bg-[#262626] border border-white/[0.08] text-[#f5f5f5] font-medium text-sm transition flex items-center justify-center gap-1.5"
        >
          <span>How It Works</span>
          <span>↓</span>
        </a>
      </div>
    </section>
  );
}
