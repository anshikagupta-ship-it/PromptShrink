import {
  Brain,
  Zap,
  ShieldCheck,
  DollarSign,
  BarChart3,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Semantic Compression",
    description:
      "Reduce unnecessary context while preserving the original intent and meaning.",
    color: "text-indigo-400",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Smaller prompts mean faster inference and lower latency across LLMs.",
    color: "text-cyan-400",
  },
  {
    icon: DollarSign,
    title: "Lower API Cost",
    description:
      "Reduce token usage and significantly cut LLM API expenses.",
    color: "text-green-400",
  },
  {
    icon: ShieldCheck,
    title: "Meaning Preservation",
    description:
      "Maintains important entities, numbers and technical information.",
    color: "text-yellow-400",
  },
  {
    icon: Globe,
    title: "Works Everywhere",
    description:
      "Compatible with OpenAI, Gemini, Claude, DeepSeek and more.",
    color: "text-pink-400",
  },
  {
    icon: BarChart3,
    title: "Live Analytics",
    description:
      "Track compression ratio, token savings and response improvements.",
    color: "text-violet-400",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="max-w-7xl mx-auto px-6 py-24"
    >
      <div className="text-center mb-16">

        <p className="uppercase tracking-[0.3em] text-indigo-400 text-sm font-semibold">
          WHY PROMPTSHRINK
        </p>

        <h2 className="text-5xl font-black mt-3">
          Built for Modern AI Workflows
        </h2>

        <p className="text-slate-400 mt-5 max-w-2xl mx-auto">
          Everything you need to optimize prompts before sending
          them to Large Language Models.
        </p>

      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

        {features.map((feature, index) => {
          const Icon = feature.icon;

          return (
            <div
              key={index}
              className="group rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 hover:border-indigo-500/40 hover:-translate-y-2 transition-all duration-300"
            >

              <div className={`w-16 h-16 rounded-2xl bg-[#0B1220] flex items-center justify-center ${feature.color}`}>

                <Icon size={30} />

              </div>

              <h3 className="text-2xl font-bold mt-8">

                {feature.title}

              </h3>

              <p className="text-slate-400 leading-7 mt-4">

                {feature.description}

              </p>

            </div>
          );
        })}
      </div>
    </section>
  );
}