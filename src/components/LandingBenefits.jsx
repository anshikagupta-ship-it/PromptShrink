import React from "react";

export default function LandingBenefits() {
  const benefits = [
    {
      title: "70%+ Token Reduction",
      description: "Automatically strips boilerplate, conversational filler, and redundant logs before sending prompts to LLMs.",
      icon: "📉",
    },
    {
      title: "Lower API Billing Costs",
      description: "Cutting input context token volume directly lowers monthly OpenAI, Claude, and Gemini API invoice costs.",
      icon: "💵",
    },
    {
      title: "Faster Response Times",
      description: "Fewer input context tokens reduce LLM Time-To-First-Token (TTFT) and overall inference generation latency.",
      icon: "⚡",
    },
    {
      title: "Preserve Exact Intent",
      description: "Algorithmic constraint protection locks error status codes, numerical values, IDs, and instructions.",
      icon: "🛡️",
    },
  ];

  return (
    <section className="py-16 px-6 max-w-5xl mx-auto font-sans">
      <div className="text-center space-y-2 mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#f5f5f5] tracking-tight">
          Built for Developers & AI Engineering Teams
        </h2>
        <p className="text-sm text-[#a3a3a3] max-w-xl mx-auto">
          ContextZero provides immediate cost optimization without sacrificing accuracy or modifying your downstream LLM prompt structures.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {benefits.map((b, idx) => (
          <div
            key={idx}
            className="bg-[#121212] border border-white/[0.07] hover:border-white/20 p-5 rounded-2xl space-y-3 transition group"
          >
            <div className="text-2xl">{b.icon}</div>
            <h3 className="text-sm font-semibold text-[#f5f5f5] group-hover:text-white transition">
              {b.title}
            </h3>
            <p className="text-xs text-[#a3a3a3] leading-relaxed">
              {b.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
