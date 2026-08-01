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