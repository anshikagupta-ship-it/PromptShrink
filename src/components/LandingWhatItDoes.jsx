import React from "react";

export default function LandingWhatItDoes() {
  const concepts = [
    {
      title: "Remove Redundancy",
      desc: "Cuts repetition, unnecessary wording, and context that doesn't contribute to the request.",
      icon: "✂️",
    },
    {
      title: "Preserve Intent",
      desc: "Keeps instructions, constraints, facts, and information required to answer the prompt.",
      icon: "🛡️",
    },
    {
      title: "Measure Reduction",
      desc: "Shows exactly how many tokens entered and how many remain after optimization.",
      icon: "📊",
    },
  ];

  return (
    <section className="py-14 px-6 max-w-5xl mx-auto font-sans">
      <div className="text-center space-y-2 mb-10">
        <span className="text-xs font-mono text-[#737373] uppercase tracking-wider">Core Capabilities</span>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#f5f5f5] tracking-tight">
          What ContextZero Does
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {concepts.map((c, idx) => (
          <div
            key={idx}
            className="bg-[#121212] border border-white/[0.07] p-6 rounded-2xl space-y-3 hover:border-white/20 transition"
          >
            <div className="text-2xl mb-1">{c.icon}</div>
            <h3 className="text-base font-semibold text-[#f5f5f5]">{c.title}</h3>
            <p className="text-xs text-[#a3a3a3] leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
