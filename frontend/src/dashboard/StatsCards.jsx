<<<<<<< HEAD
import {
  Coins,
  TimerReset,
  Gauge,
  ShieldCheck,
} from "lucide-react";

const cards = [
  {
    title: "Compression",
    value: "73%",
    icon: Gauge,
    color: "from-indigo-500 to-purple-600",
  },
  {
    title: "Tokens Saved",
    value: "4,812",
    icon: ShieldCheck,
    color: "from-emerald-500 to-green-600",
  },
  {
    title: "Cost Saved",
    value: "$0.038",
    icon: Coins,
    color: "from-amber-500 to-orange-500",
  },
  {
    title: "Latency",
    value: "-61%",
    icon: TimerReset,
    color: "from-cyan-500 to-blue-500",
  },
];

export default function StatsCards() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-12">

      <h2 className="text-3xl font-bold text-white mb-8">
        Compression Results
      </h2>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

        {cards.map((card) => {

          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-3xl border border-slate-800 bg-[#111827] p-6 hover:-translate-y-2 duration-300"
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-r ${card.color}`}
              >
                <Icon className="text-white" />
              </div>

              <h3 className="text-slate-400 mt-6">
                {card.title}
              </h3>

              <h1 className="text-4xl font-bold text-white mt-2">
                {card.value}
              </h1>
            </div>
          );

        })}

      </div>

    </section>
  );
}
=======
import React from "react";

export default function StatsCards({ result }) {
  if (!result) return null;

  const cards = [
    {
      title: "Tokens Saved",
      value: `${result.tokensSaved.toLocaleString()}`,
      subtext: `${result.originalTokens.toLocaleString()} → ${result.compressedTokens.toLocaleString()} tokens`,
      color: "from-indigo-500/20 to-indigo-600/10",
      borderColor: "border-indigo-500/30",
      textColor: "text-indigo-400",
      badge: "Target Met",
      icon: (
        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      title: "Prompt Reduction",
      value: `${result.reductionRatio}%`,
      subtext: `Official requirement >70% ✓`,
      color: "from-emerald-500/20 to-emerald-600/10",
      borderColor: "border-emerald-500/30",
      textColor: "text-emerald-400",
      badge: `${result.reductionRatio}% Reduction`,
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      title: "Estimated Cost Saved",
      value: `${result.reductionRatio}%`,
      subtext: `~$${result.costSavedEst} per request saved`,
      color: "from-purple-500/20 to-purple-600/10",
      borderColor: "border-purple-500/30",
      textColor: "text-purple-400",
      badge: "API Cost Cut",
      icon: (
        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Accuracy Retention",
      value: `${result.accuracyRetention}%`,
      subtext: `Target ≥95% retention achieved ✓`,
      color: "from-blue-500/20 to-blue-600/10",
      borderColor: "border-blue-500/30",
      textColor: "text-blue-400",
      badge: "Quality Safe",
      icon: (
        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`bg-gradient-to-br ${card.color} border ${card.borderColor} rounded-2xl p-5 shadow-xl backdrop-blur-md relative overflow-hidden group hover:scale-[1.02] transition-all`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">{card.title}</span>
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">{card.icon}</div>
          </div>

          <div className={`text-3xl font-black ${card.textColor} tracking-tight font-mono mb-1`}>
            {card.value}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{card.subtext}</span>
            <span className="text-[10px] font-mono bg-white/10 text-white px-2 py-0.5 rounded-full border border-white/10">
              {card.badge}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
>>>>>>> 71ec4bfcc37aff6296541fb91c14392aad28b18f
