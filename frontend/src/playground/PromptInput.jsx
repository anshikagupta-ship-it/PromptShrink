<<<<<<< HEAD
import { useState } from "react";
import {
  Clipboard,
  ClipboardCheck,
  Sparkles,
  Trash2,
  FileText,
} from "lucide-react";

export default function PromptInput() {
  const [prompt, setPrompt] = useState("");
  const [copied, setCopied] = useState(false);

  const characters = prompt.length;
  const words = prompt.trim() ? prompt.trim().split(/\s+/).length : 0;
  const tokens = Math.ceil(characters / 4);

  const copyText = async () => {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearPrompt = () => {
    setPrompt("");
  };

  return (
    <section
      id="playground"
      className="max-w-7xl mx-auto px-6 py-20"
    >
      <div className="rounded-3xl border border-slate-800 bg-[#111827]/70 backdrop-blur-xl shadow-2xl overflow-hidden">

        {/* Header */}

        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-800">

          <div>

            <div className="flex items-center gap-3">

              <Sparkles className="text-indigo-400" />

              <h2 className="text-2xl font-bold">
                Prompt Playground
              </h2>

            </div>

            <p className="text-slate-400 mt-2">
              Test and optimize prompts before sending them to your LLM.
            </p>

          </div>

          <div className="hidden md:flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-2 text-green-400 text-sm">
            ● Connected
          </div>

        </div>

        {/* Textarea */}

        <div className="p-8">

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Paste your prompt here..."
            className="w-full h-80 resize-none rounded-2xl border border-slate-700 bg-[#0B1220] p-6 text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500 transition"
          />

          {/* Stats */}

          <div className="grid grid-cols-3 gap-4 mt-6">

            <div className="rounded-xl bg-[#0B1220] border border-slate-700 p-4 text-center">
              <p className="text-3xl font-bold text-indigo-400">
                {characters}
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Characters
              </p>
            </div>

            <div className="rounded-xl bg-[#0B1220] border border-slate-700 p-4 text-center">
              <p className="text-3xl font-bold text-cyan-400">
                {words}
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Words
              </p>
            </div>

            <div className="rounded-xl bg-[#0B1220] border border-slate-700 p-4 text-center">
              <p className="text-3xl font-bold text-green-400">
                {tokens}
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Estimated Tokens
              </p>
            </div>

          </div>

          {/* Buttons */}

          <div className="flex flex-wrap justify-end gap-4 mt-8">

            <button
              onClick={clearPrompt}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 transition"
            >
              <Trash2 size={18} />
              Clear
            </button>

            <button
              onClick={copyText}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 transition"
            >
              {copied ? (
                <>
                  <ClipboardCheck size={18} />
                  Copied
                </>
              ) : (
                <>
                  <Clipboard size={18} />
                  Copy
                </>
              )}
            </button>

            <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-8 py-3 font-semibold hover:scale-105 transition">
              <FileText size={18} />
              Compress Prompt
            </button>

          </div>

        </div>

      </div>
    </section>
  );
}
=======
import React from "react";
import { estimateTokens, PRESET_SAMPLES } from "../services/api";

export default function PromptInput({ prompt, setPrompt, onSelectPreset }) {
  const charCount = prompt.length;
  const tokenCount = estimateTokens(prompt);

  return (
    <div className="bg-[#111927] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Glow background accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
            1 & 2. Enter Prompt / Long Context
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Paste your prompt or select a pre-loaded sample context below
          </p>
        </div>

        {/* Token Counter Gauge */}
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs">
          <div>
            <span className="text-gray-400">Characters: </span>
            <span className="font-mono text-white font-medium">{charCount.toLocaleString()}</span>
          </div>
          <div className="w-px h-4 bg-white/10"></div>
          <div>
            <span className="text-gray-400">Est. Tokens: </span>
            <span className="font-mono text-indigo-400 font-bold text-sm">{tokenCount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Preset Sample Buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs font-medium text-gray-400 mr-1">Preset Samples:</span>
        {PRESET_SAMPLES.map((sample) => (
          <button
            key={sample.id}
            type="button"
            onClick={() => onSelectPreset(sample)}
            className="text-xs bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 hover:border-indigo-500/40 text-indigo-300 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
          >
            <span>✨</span>
            <span>{sample.title}</span>
          </button>
        ))}
      </div>

      {/* Main Text Area */}
      <div className="relative">
        <textarea
          rows={10}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Paste your prompt, codebase excerpt, or customer support logs here (e.g. 'Analyze this long text and identify the root cause...')"
          className="w-full bg-[#0B1220]/80 border border-white/10 rounded-xl p-4 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono leading-relaxed transition-all resize-y"
        />
      </div>
    </div>
  );
}
>>>>>>> 71ec4bfcc37aff6296541fb91c14392aad28b18f
