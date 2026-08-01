import React from "react";

export default function CompressionSettings({
  model,
  setModel,
  mode,
  setMode,
  targetRatio,
  setTargetRatio,
}) {
  const models = [
    { id: "gpt-4o", name: "OpenAI GPT-4o", context: "128k" },
    { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", context: "200k" },
    { id: "llama-3-70b", name: "Meta Llama 3 70B", context: "8k" },
    { id: "gemini-1-5-pro", name: "Google Gemini 1.5 Pro", context: "1M" },
  ];

  const modes = [
    { id: "conservative", name: "Conservative", ratio: 50, desc: "Prioritize maximum accuracy retention" },
    { id: "balanced", name: "Balanced", ratio: 70, desc: "Recommended balance (70%+ target)" },
    { id: "aggressive", name: "Aggressive", ratio: 85, desc: "Maximum token & cost reduction" },
  ];

  return (
    <div className="bg-[#111927] border border-white/10 rounded-2xl p-6 shadow-xl">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Model & Engine Parameters
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Model Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">Target LLM Model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full bg-[#0B1220] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.context})
              </option>
            ))}
          </select>
        </div>

        {/* Compression Mode */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">Compression Mode</label>
          <div className="grid grid-cols-3 gap-1.5 bg-[#0B1220] p-1 rounded-xl border border-white/10">
            {modes.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setMode(m.id);
                  setTargetRatio(m.ratio);
                }}
                className={`py-1.5 px-2 text-xs rounded-lg font-medium transition-all ${
                  mode === m.id
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        {/* Target Token Ratio Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-400">Target Token Reduction</label>
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
              {targetRatio}%
            </span>
          </div>
          <input
            type="range"
            min="30"
            max="90"
            step="5"
            value={targetRatio}
            onChange={(e) => setTargetRatio(Number(e.target.value))}
            className="w-full h-2 bg-[#0B1220] rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-mono">
            <span>30%</span>
            <span>Target: &gt;70%</span>
            <span>90%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
