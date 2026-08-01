import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#4f46e540,transparent_60%)]"></div>

      <div className="max-w-7xl mx-auto px-8 pt-44 pb-32 relative">

        <motion.span

          initial={{ opacity: 0 }}

          animate={{ opacity: 1 }}

          className="inline-flex border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 rounded-full text-indigo-300 text-sm"

        >
          Ultra-Low Resource LLM Context Compression
        </motion.span>

        <motion.h1

          initial={{ opacity: 0, y: 20 }}

          animate={{ opacity: 1, y: 0 }}

          transition={{ delay: 0.2 }}

          className="text-7xl font-black leading-tight mt-8"

        >
          Compress Context.

          <br />

          Preserve Meaning.

        </motion.h1>

        <motion.p

          initial={{ opacity: 0, y: 20 }}

          animate={{ opacity: 1, y: 0 }}

          transition={{ delay: 0.4 }}

          className="text-gray-400 text-xl mt-8 max-w-2xl leading-9"

        >
          PromptShrink intelligently removes redundant information,
          preserves semantic meaning, and reduces token usage before
          sending prompts to Large Language Models.
        </motion.p>

        <motion.div

          initial={{ opacity: 0 }}

          animate={{ opacity: 1 }}

          transition={{ delay: 0.6 }}

          className="flex gap-4 mt-12"

        >
          <button className="bg-indigo-600 hover:bg-indigo-500 px-8 py-4 rounded-2xl font-semibold text-lg transition">

            Launch Playground

          </button>

          <button className="border border-white/10 hover:bg-white/5 px-8 py-4 rounded-2xl font-semibold transition">

            Documentation

          </button>

        </motion.div>

        <div className="grid grid-cols-4 gap-6 mt-24">

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">

            <h2 className="text-5xl font-bold">70%</h2>

            <p className="text-gray-400 mt-2">
              Average Compression
            </p>

          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">

            <h2 className="text-5xl font-bold">95%</h2>

            <p className="text-gray-400 mt-2">
              Accuracy Retention
            </p>

          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">

            <h2 className="text-5xl font-bold">40%</h2>

            <p className="text-gray-400 mt-2">
              Lower Latency
            </p>

          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">

            <h2 className="text-5xl font-bold">60%</h2>

            <p className="text-gray-400 mt-2">
              API Cost Saved
            </p>

          </div>

        </div>

      </div>

    </section>
  );
}