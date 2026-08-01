<<<<<<< HEAD
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Zap,
  ShieldCheck,
  Brain,
  Cpu,
} from "lucide-react";

export default function Hero() {
  const stats = [
    { value: "73%", label: "Compression" },
    { value: "95%", label: "Accuracy" },
    { value: "61%", label: "Latency ↓" },
    { value: "60%", label: "Cost Saved" },
  ];

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#030712]">

      {/* Background Glow */}
      <div className="absolute -top-40 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[160px]" />
      <div className="absolute bottom-0 right-0 h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[140px]" />

      <div className="relative mx-auto flex min-h-[75vh] max-w-7xl items-center px-6 pt-24 lg:px-10">

        <div className="grid w-full gap-20 lg:grid-cols-2">

          {/* LEFT */}

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: .8 }}
          >

            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-5 py-2 text-sm text-indigo-300">

              <Sparkles size={16} />

              Ultra-Low Resource LLM Context Compression

            </div>

            <h1 className="mt-8 text-6xl font-black leading-[1.05] text-white lg:text-5xl lg:text-6xl">

              Compress

              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                {" "}
                Context
              </span>

              <br />

              Preserve Intelligence.

            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-slate-400">

              PromptShrink intelligently removes redundant context while
              preserving semantic meaning, reducing token usage and API cost
              before prompts reach Large Language Models.

            </p>

            <div className="mt-12 flex flex-wrap gap-4">

              <button className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-8 py-4 font-semibold transition hover:scale-105">

                Launch Playground

                <ArrowRight
                  size={18}
                  className="transition group-hover:translate-x-1"
                />

              </button>

              <button className="rounded-2xl border border-slate-700 bg-white/5 px-8 py-4 font-semibold backdrop-blur-xl transition hover:bg-white/10">

                Documentation

              </button>

            </div>

            {/* Feature Pills */}

            <div className="mt-14 flex flex-wrap gap-4">

              <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#111827]/70 px-4 py-3">
                <Brain size={18} className="text-cyan-400" />
                <span className="text-sm text-slate-300">
                  Semantic Compression
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#111827]/70 px-4 py-3">
                <ShieldCheck size={18} className="text-green-400" />
                <span className="text-sm text-slate-300">
                  95% Accuracy
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#111827]/70 px-4 py-3">
                <Zap size={18} className="text-yellow-400" />
                <span className="text-sm text-slate-300">
                  Faster Responses
                </span>
              </div>

            </div>

          </motion.div>

          {/* RIGHT */}

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: .8 }}
            className="relative"
          >

            <div className="rounded-[32px] border border-white/10 bg-[#111827]/80 p-8 shadow-2xl backdrop-blur-xl">

              <div className="mb-8 flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-400">
                    PromptShrink Dashboard
                  </p>

                  <h3 className="mt-2 text-2xl font-bold">
                    Live Compression
                  </h3>

                </div>

                <div className="rounded-full bg-green-500/20 px-4 py-2 text-sm text-green-400">

                  ● Online

                </div>

              </div>

              <div className="space-y-6">

                {stats.map((item) => (

                  <div key={item.label}>

                    <div className="mb-2 flex justify-between">

                      <span className="text-slate-300">
                        {item.label}
                      </span>

                      <span className="font-bold text-white">
                        {item.value}
                      </span>

                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-800">

                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: item.value }}
                        transition={{ duration: 1.5 }}
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                      />

                    </div>

                  </div>

                ))}

              </div>

              <div className="mt-10 rounded-2xl border border-slate-700 bg-[#0B1220] p-6">

                <div className="mb-4 flex items-center gap-3">

                  <Cpu className="text-indigo-400" />

                  <h4 className="font-semibold">
                    AI Compression Engine
                  </h4>

                </div>

                <div className="space-y-4">

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">
                      Semantic Analysis
                    </span>

                    <span className="text-green-400">
                      Completed
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">
                      Token Optimization
                    </span>

                    <span className="text-green-400">
                      Completed
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">
                      Prompt Validation
                    </span>

                    <span className="text-yellow-400">
                      Running...
                    </span>
                  </div>

                </div>

              </div>

            </div>

          </motion.div>

=======
import React from "react";

export default function Hero({ onStartClick }) {
  return (
    <section className="relative overflow-hidden pt-36 pb-20">
      {/* Glow gradient backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#4f46e530,#0b1220_70%)] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 rounded-full text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Gen AI Hackathon • 1-Click Prompt Engine
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
            Compress Context. <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-200 bg-clip-text text-transparent">
              Preserve Meaning.
            </span>
          </h1>

          <p className="text-gray-400 text-base md:text-lg mt-6 leading-relaxed">
            PromptShrink automatically strips redundancy, locks critical constraints, and reduces prompt tokens by over 70% before sending context to LLMs—lowering API costs and accelerating inference speed.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <button
              type="button"
              onClick={onStartClick}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 transition transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>Launch Compressor Playground</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
>>>>>>> 71ec4bfcc37aff6296541fb91c14392aad28b18f
        </div>

        {/* 4 Metric Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
          <div className="bg-[#111927]/80 border border-white/10 p-5 rounded-2xl backdrop-blur-md text-center">
            <div className="text-3xl font-black text-white font-mono">&gt;70%</div>
            <div className="text-xs text-gray-400 mt-1">Prompt Compression Target</div>
          </div>

          <div className="bg-[#111927]/80 border border-white/10 p-5 rounded-2xl backdrop-blur-md text-center">
            <div className="text-3xl font-black text-emerald-400 font-mono">≥95%</div>
            <div className="text-xs text-gray-400 mt-1">Accuracy Retention</div>
          </div>

          <div className="bg-[#111927]/80 border border-white/10 p-5 rounded-2xl backdrop-blur-md text-center">
            <div className="text-3xl font-black text-indigo-400 font-mono">3.2x</div>
            <div className="text-xs text-gray-400 mt-1">Inference Latency Speedup</div>
          </div>

          <div className="bg-[#111927]/80 border border-white/10 p-5 rounded-2xl backdrop-blur-md text-center">
            <div className="text-3xl font-black text-purple-400 font-mono">72%+</div>
            <div className="text-xs text-gray-400 mt-1">API Cost Saved</div>
          </div>
        </div>
      </div>
    </section>
  );
}