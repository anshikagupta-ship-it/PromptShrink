import React from "react";

export default function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="py-16 px-6 max-w-5xl mx-auto font-sans scroll-mt-20">
      <div className="text-center space-y-2 mb-12">
        <span className="text-xs font-mono text-[#737373] uppercase tracking-wider">Pipeline</span>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#f5f5f5] tracking-tight">
          How It Works
        </h2>
        <p className="text-sm text-[#a3a3a3] max-w-md mx-auto">
          ContextZero sits between your prompt and the model, optimizing context before it is sent.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
        {/* Step 1 */}
        <div className="bg-[#121212] border border-white/[0.07] p-5 rounded-2xl space-y-3 relative">
          <div className="text-xs font-mono text-[#737373] font-bold">01</div>
          <h3 className="text-sm font-semibold text-[#f5f5f5]">YOUR PROMPT</h3>
          <p className="text-xs text-[#a3a3a3] leading-relaxed">
            Raw user prompt, long context, log output, or support thread.
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-[#121212] border border-white/20 p-5 rounded-2xl space-y-3 relative shadow-md">
          <div className="text-xs font-mono text-[#10B981] font-bold">02</div>
          <h3 className="text-sm font-semibold text-[#10B981]">CONTEXTZERO</h3>
          <ul className="text-xs text-[#a3a3a3] space-y-1.5 font-mono pt-1">
            <li className="flex items-center gap-1.5">
              <span className="text-[#10B981]">├─</span> Detect redundancy
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-[#10B981]">├─</span> Compress wording
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-[#10B981]">├─</span> Preserve constraints
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-[#10B981]">└─</span> Preserve intent
            </li>
          </ul>
        </div>

        {/* Step 3 */}
        <div className="bg-[#121212] border border-white/[0.07] p-5 rounded-2xl space-y-3 relative">
          <div className="text-xs font-mono text-[#737373] font-bold">03</div>
          <h3 className="text-sm font-semibold text-[#f5f5f5]">OPTIMIZED PROMPT</h3>
          <p className="text-xs text-[#a3a3a3] leading-relaxed">
            Streamlined prompt containing only essential instructions and facts.
          </p>
        </div>

        {/* Step 4 */}
        <div className="bg-[#121212] border border-white/[0.07] p-5 rounded-2xl space-y-3 relative">
          <div className="text-xs font-mono text-[#737373] font-bold">04</div>
          <h3 className="text-sm font-semibold text-[#f5f5f5]">YOUR LLM</h3>
          <p className="text-xs text-[#a3a3a3] leading-relaxed">
            Target LLM processes fewer tokens and produces accurate responses.
          </p>
        </div>
      </div>
    </section>
  );
}
