import React from "react";

export default function LandingWhatIsRemoved() {
  return (
    <section className="py-16 px-6 max-w-5xl mx-auto font-sans">
      <div className="text-center space-y-2 mb-12">
        <span className="text-xs font-mono text-[#737373] uppercase tracking-wider">Analysis</span>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#f5f5f5] tracking-tight">
          What Gets Removed vs Preserved
        </h2>
      </div>

      <div className="bg-[#121212] border border-white/[0.07] rounded-2xl p-6 space-y-8">
        {/* Sentence Transformation Example Box */}
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-[#1a1a1a] border border-white/[0.06] p-4 rounded-xl space-y-1.5">
            <span className="text-[10px] text-[#737373] font-sans uppercase tracking-wider">Original Sentence</span>
            <p className="text-[#a3a3a3] leading-relaxed">
              <span className="bg-red-500/20 text-red-300 line-through px-1 rounded">I am currently in the process of developing</span> a React application <span className="bg-red-500/20 text-red-300 line-through px-1 rounded">and I would like to know how I can</span> implement Google OAuth authentication.
            </p>
          </div>

          <div className="text-center text-xs text-[#737373]">↓ ContextZero Pre-Processor ↓</div>

          <div className="bg-[#1a1a1a] border border-[#10B981]/30 p-4 rounded-xl space-y-1.5">
            <span className="text-[10px] text-[#10B981] font-sans uppercase tracking-wider">Compressed Result</span>
            <p className="text-[#f5f5f5] font-medium leading-relaxed">
              Implement Google OAuth authentication in a React application.
            </p>
          </div>
        </div>

        {/* 2 Grid Columns: Removed vs Preserved */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Removed Column */}
          <div className="bg-[#1a1a1a] border border-red-500/20 p-5 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-red-400 font-sans">
              <span>✕</span>
              <span>Removed</span>
            </div>
            <ul className="text-xs text-[#a3a3a3] space-y-2 font-mono">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                <span>Redundant phrasing & pleasantries</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                <span>Repeated log lines & boilerplate</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                <span>Unnecessary conversational filler</span>
              </li>
            </ul>
          </div>

          {/* Preserved Column */}
          <div className="bg-[#1a1a1a] border border-[#10B981]/30 p-5 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#10B981] font-sans">
              <span>✓</span>
              <span>Preserved</span>
            </div>
            <ul className="text-xs text-[#a3a3a3] space-y-2 font-mono">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                <span>Task & primary user instruction</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                <span>Technical terms & code identifiers</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                <span>Error status codes & constraints</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
