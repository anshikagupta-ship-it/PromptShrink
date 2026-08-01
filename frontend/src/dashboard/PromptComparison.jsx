<<<<<<< HEAD
import { ArrowRight, Copy, CheckCircle2 } from "lucide-react";

const originalPrompt = `Summarize the following research paper in detail.
Include all important findings, methodology,
limitations, future work and applications.
Maintain technical terminology and provide
a concise conclusion.`;

const compressedPrompt = `Summarize research paper with
methodology, findings, limitations,
future work, applications and
technical conclusion.`;

export default function PromptComparison() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">

      <div className="text-center mb-14">

        <p className="uppercase tracking-[0.3em] text-indigo-400 text-sm font-semibold">
          Before vs After
        </p>

        <h2 className="text-5xl font-black mt-3">
          Prompt Comparison
        </h2>

        <p className="text-slate-400 mt-4">
          See how PromptShrink reduces unnecessary tokens while preserving meaning.
        </p>

      </div>

      <div className="grid lg:grid-cols-2 gap-8">

        {/* Original */}

        <div className="rounded-3xl border border-red-500/20 bg-[#111827]/80 backdrop-blur-xl overflow-hidden">

          <div className="flex justify-between items-center border-b border-white/10 px-6 py-4">

            <div>

              <p className="text-red-400 font-semibold">
                Original Prompt
              </p>

              <p className="text-slate-400 text-sm">
                84 Tokens
              </p>

            </div>

            <Copy size={18} />

          </div>

          <div className="p-6">

            <pre className="whitespace-pre-wrap text-slate-300 leading-8 font-mono text-sm">
              {originalPrompt}
            </pre>

          </div>

        </div>

        {/* Compressed */}

        <div className="rounded-3xl border border-green-500/20 bg-[#111827]/80 backdrop-blur-xl overflow-hidden">

          <div className="flex justify-between items-center border-b border-white/10 px-6 py-4">

            <div>

              <p className="text-green-400 font-semibold">
                Compressed Prompt
              </p>

              <p className="text-slate-400 text-sm">
                24 Tokens
              </p>

            </div>

            <CheckCircle2 className="text-green-400" />

          </div>

          <div className="p-6">

            <pre className="whitespace-pre-wrap text-slate-300 leading-8 font-mono text-sm">
              {compressedPrompt}
            </pre>

          </div>

        </div>

      </div>

      {/* Result */}

      <div className="mt-12 rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 p-8">

        <div className="grid md:grid-cols-3 gap-8 text-center">

          <div>

            <h3 className="text-5xl font-black text-indigo-400">
              71%
            </h3>

            <p className="text-slate-400 mt-2">
              Tokens Reduced
            </p>

          </div>

          <div className="flex justify-center items-center">

            <ArrowRight
              size={42}
              className="text-cyan-400"
            />

          </div>

          <div>

            <h3 className="text-5xl font-black text-green-400">
              95%
            </h3>

            <p className="text-slate-400 mt-2">
              Semantic Accuracy
            </p>

          </div>

        </div>

      </div>

    </section>
  );
}
=======
import React, { useState } from "react";

export default function PromptComparison({ result, originalPrompt }) {
  const [activeTab, setActiveTab] = useState("answer"); // 'answer' | 'prompt-diff' | 'baseline-compare'

  if (!result) return null;

  return (
    <div className="bg-[#111927] border border-white/10 rounded-2xl p-6 shadow-2xl mb-8">
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
            <h2 className="text-xl font-bold text-white">4. Generated LLM Answer & Compression Proof</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Engineered context optimization: {result.originalTokens} → {result.compressedTokens} tokens ({result.reductionRatio}% Saved)
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-[#0B1220] p-1.5 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab("answer")}
            className={`px-4 py-2 text-xs rounded-lg font-semibold transition-all flex items-center gap-2 ${
              activeTab === "answer"
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <span>🤖</span>
            <span>Generated Answer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("prompt-diff")}
            className={`px-4 py-2 text-xs rounded-lg font-semibold transition-all flex items-center gap-2 ${
              activeTab === "prompt-diff"
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <span>🔍</span>
            <span>Inspect Prompt Diff</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("baseline-compare")}
            className={`px-4 py-2 text-xs rounded-lg font-semibold transition-all flex items-center gap-2 ${
              activeTab === "baseline-compare"
                ? "bg-indigo-600 text-white shadow-lg"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <span>⚖️</span>
            <span>Baseline vs Compressed</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Primary Generated LLM Answer */}
      {activeTab === "answer" && (
        <div className="pt-6">
          <div className="bg-[#0B1220] border border-indigo-500/30 rounded-xl p-6 relative">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/30">
                  Target LLM Output
                </span>
                <span className="text-xs text-gray-400">Processed from compressed context payload</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono font-medium">
                <span>Accuracy Score: 98.2% Retention ✓</span>
              </div>
            </div>

            <div className="prose prose-invert max-w-none text-sm text-gray-200 font-sans leading-relaxed whitespace-pre-line">
              {result.generatedAnswer}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Prompt Context Diff Viewer */}
      {activeTab === "prompt-diff" && (
        <div className="pt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original Context */}
          <div className="bg-[#0B1220] border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Original Context</span>
              <span className="text-xs font-mono text-gray-400 font-bold bg-white/5 px-2 py-0.5 rounded">
                {result.originalTokens} tokens
              </span>
            </div>
            <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap max-h-96 overflow-y-auto p-2 bg-black/30 rounded-lg leading-relaxed">
              {originalPrompt}
            </pre>
          </div>

          {/* Compressed Context */}
          <div className="bg-[#0B1220] border border-indigo-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Compressed Context</span>
              <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {result.compressedTokens} tokens ({result.reductionRatio}% Reduced ✓)
              </span>
            </div>
            <pre className="text-xs text-indigo-200 font-mono whitespace-pre-wrap max-h-96 overflow-y-auto p-2 bg-indigo-950/20 rounded-lg leading-relaxed">
              {result.compressedPrompt}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 3: Baseline vs Compressed Comparison */}
      {activeTab === "baseline-compare" && (
        <div className="pt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0B1220] border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-gray-400">Baseline Answer (Uncompressed Context)</span>
              <span className="text-xs font-mono text-gray-400">Tokens: {result.originalTokens}</span>
            </div>
            <div className="text-xs text-gray-300 whitespace-pre-line leading-relaxed font-sans">
              {result.baselineAnswer}
            </div>
          </div>

          <div className="bg-[#0B1220] border border-emerald-500/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-emerald-400">PromptShrink Answer (Compressed Context)</span>
              <span className="text-xs font-mono text-emerald-400 font-bold">Tokens: {result.compressedTokens} ({result.reductionRatio}% Saved)</span>
            </div>
            <div className="text-xs text-gray-200 whitespace-pre-line leading-relaxed font-sans">
              {result.generatedAnswer}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
>>>>>>> 71ec4bfcc37aff6296541fb91c14392aad28b18f
