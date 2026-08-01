import {
  BarChart3,
  TrendingDown,
  Wallet,
  Clock3,
} from "lucide-react";

const stats = [
  {
    title: "Compression",
    value: "73%",
    color: "text-indigo-400",
  },
  {
    title: "Accuracy",
    value: "95%",
    color: "text-green-400",
  },
  {
    title: "Latency",
    value: "61%",
    color: "text-cyan-400",
  },
  {
    title: "Cost Saved",
    value: "60%",
    color: "text-yellow-400",
  },
];

export default function AnalyticsDashboard() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">

      <div className="text-center mb-12">

        <p className="text-indigo-400 font-semibold tracking-[0.25em] uppercase text-sm">
          Live Analytics
        </p>

        <h2 className="text-5xl font-black mt-3">
          Compression Insights
        </h2>

        <p className="text-slate-400 mt-4">
          Real-time performance of PromptShrink.
        </p>

      </div>

      <div className="grid md:grid-cols-4 gap-6">

        {stats.map((item) => (

          <div
            key={item.title}
            className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 hover:-translate-y-2 hover:border-indigo-500/40 transition duration-300"
          >

            <h3 className="text-slate-400">
              {item.title}
            </h3>

            <p className={`text-5xl font-black mt-4 ${item.color}`}>
              {item.value}
            </p>

          </div>

        ))}

      </div>

      {/* Fake Chart */}

      <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">

        <div className="flex justify-between items-center mb-8">

          <div>

            <h3 className="text-2xl font-bold">
              Compression Trend
            </h3>

            <p className="text-slate-400 mt-2">
              Average performance over recent runs
            </p>

          </div>

          <BarChart3 className="text-indigo-400" size={34} />

        </div>

        <div className="flex items-end justify-between h-64 gap-4">

          {[45,60,55,72,66,80,73].map((h,index)=>(

            <div
              key={index}
              className="flex-1 rounded-t-2xl bg-gradient-to-t from-indigo-600 to-cyan-400 hover:opacity-90 transition"
              style={{height:`${h}%`}}
            />

          ))}

        </div>

      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-12">

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">

          <TrendingDown className="text-cyan-400 mb-5"/>

          <h3 className="font-bold text-xl">
            Lower Latency
          </h3>

          <p className="text-slate-400 mt-3">
            Faster prompt execution through reduced context size.
          </p>

        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">

          <Wallet className="text-green-400 mb-5"/>

          <h3 className="font-bold text-xl">
            Lower API Cost
          </h3>

          <p className="text-slate-400 mt-3">
            Reduce token consumption and optimize LLM usage.
          </p>

        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">

          <Clock3 className="text-yellow-400 mb-5"/>

          <h3 className="font-bold text-xl">
            Faster Processing
          </h3>

          <p className="text-slate-400 mt-3">
            Improved response time without losing semantic meaning.
          </p>

        </div>

      </div>

    </section>
  );
}