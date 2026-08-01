import React, { useState } from "react";

export default function ChatMessage({ message }) {
  const { sender, text, originalTokens, result, isProcessing, currentStep } = message;
  const [showDiff, setShowDiff] = useState(false);
  const [showBaseline, setShowBaseline] = useState(false);

  if (sender === "user") {
    return (
      <div className="py-6 px-4 md:px-6 hover:bg-[#212121]/40 transition border-b border-white/5">
        <div className="max-w-3xl mx-auto flex gap-4">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
            U
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-white">You</span>
              <span className="text-xs font-mono bg-white/10 text-gray-300 px-2.5 py-0.5 rounded-full">
                Payload: {originalTokens?.toLocaleString()} tokens
              </span>
            </div>
            <div className="text-sm text-gray-200 font-mono whitespace-pre-wrap leading-relaxed bg-[#171717] p-3 rounded-xl border border-white/10 max-h-60 overflow-y-auto">
              {text}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Assistant Message with Inline Automated Background Pipeline
  return (
    <div className="py-6 px-4 md:px-6 bg-[#212121]/60 border-b border-white/5">
      <div className="max-w-3xl mx-auto flex gap-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-lg">
          PS
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm text-white">PromptShrink Assistant</span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              Automated Pre-Processor
            </span>
          </div>

          {/* Automated Pipeline Progress Indicator (Visible during generation or completed) */}
          {isProcessing ? (
            <div className="bg-[#171717] border border-indigo-500/30 p-4 rounded-xl space-y-2 animate-pulse">
              <div className="flex items-center justify-between text-xs font-mono text-indigo-300">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                  Background Pipeline Step {currentStep}/6 Running...
                </span>
              </div>
              <div className="text-xs text-gray-400 font-mono">
                {currentStep === 1 && "1. Analyzing Token Structure..."}
                {currentStep === 2 && "2. Protecting Intent, Constraints & Facts..."}
                {currentStep === 3 && "3. Deduplicating & Condensing Context..."}
                {currentStep === 4 && "4. Checking Quality & Retention Threshold (≥70%)..."}
                {currentStep === 5 && "5. Forwarding Compact Prompt Payload to LLM..."}
                {currentStep === 6 && "6. Generating Answer..."}
              </div>
            </div>
          ) : result ? (
            <>
              {/* Impact Stats Bar */}
              <div className="bg-gradient-to-r from-indigo-950/40 via-[#171717] to-emerald-950/40 border border-indigo-500/30 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 font-mono text-xs shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">⚡ Tokens Saved:</span>
                  <span className="text-white font-bold">{result.tokensSaved} tokens</span>
                  <span className="text-gray-400">({result.originalTokens} → {result.compressedTokens})</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
                    {result.reductionRatio}% Saved ✓
                  </span>
                  <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded">
                    Est. Cost: ${result.costSavedEst}
                  </span>
                  <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded font-bold">
                    {result.accuracyRetention}% Retention ✓
                  </span>
                </div>
              </div>

              {/* Main LLM Answer Text */}
              <div className="text-sm text-gray-200 font-sans leading-relaxed whitespace-pre-line bg-[#171717] p-4 rounded-xl border border-white/10">
                {result.generatedAnswer}
              </div>

              {/* Expandable Transparency Controls */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowDiff(!showDiff)}
                  className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
                >
                  <span>🔍</span>
                  <span>{showDiff ? "Hide Prompt Diff" : "Inspect Prompt Diff"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowBaseline(!showBaseline)}
                  className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
                >
                  <span>⚖️</span>
                  <span>{showBaseline ? "Hide Baseline Compare" : "Compare Baseline Answer"}</span>
                </button>
              </div>

              {/* Prompt Diff Drawer */}
              {showDiff && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-[#141414] border border-white/10 rounded-xl p-3">
                    <div className="text-xs font-bold text-gray-400 mb-2 font-mono">Original ({result.originalTokens} tokens)</div>
                    <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                      {text}
                    </pre>
                  </div>

                  <div className="bg-[#141414] border border-indigo-500/30 rounded-xl p-3">
                    <div className="text-xs font-bold text-indigo-400 mb-2 font-mono">Compressed ({result.compressedTokens} tokens - {result.reductionRatio}% Saved)</div>
                    <pre className="text-xs text-indigo-200 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                      {result.compressedPrompt}
                    </pre>
                  </div>
                </div>
              )}

              {/* Baseline Comparison Drawer */}
              {showBaseline && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-[#141414] border border-white/10 rounded-xl p-3">
                    <div className="text-xs font-bold text-gray-400 mb-2 font-mono">Baseline Response (Full Context)</div>
                    <div className="text-xs text-gray-300 whitespace-pre-line leading-relaxed font-sans">
                      {result.baselineAnswer}
                    </div>
                  </div>

                  <div className="bg-[#141414] border border-emerald-500/30 rounded-xl p-3">
                    <div className="text-xs font-bold text-emerald-400 mb-2 font-mono">Compressed Response ({result.reductionRatio}% Saved)</div>
                    <div className="text-xs text-gray-200 whitespace-pre-line leading-relaxed font-sans">
                      {result.generatedAnswer}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
