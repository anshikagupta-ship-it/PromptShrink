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
