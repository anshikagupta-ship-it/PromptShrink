import React from "react";

export default function ProcessingTimeline({ isProcessing, currentStep, result }) {
  const steps = [
    {
      id: 1,
      title: "Token Analysis",
      description: "Measuring input payload size & structure",
      badge: result ? `Original: ${result.originalTokens.toLocaleString()} tokens` : "Analyzing...",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 2,
      title: "Protect Important Information",
      description: "Locking Intent, Constraints, Facts/entities, Output rules",
      badge: "Intent • Constraints • Entities",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      id: 3,
      title: "Compress Prompt",
      description: "Stripping repetition, irrelevant spans & condensing semantics",
      badge: "Deduplicating & Pruning",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 0L4 4m5.121 5.121L4 14.121" />
        </svg>
      ),
    },
    {
      id: 4,
      title: "Quality Check",
      description: "Verifying semantic retention & verifying ≥70% reduction threshold",
      badge: result ? `Retention: ${result.accuracyRetention}% ✓` : "Validating...",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 5,
      title: "Send Compressed Prompt to LLM",
      description: "Forwarding compact prompt payload to model",
      badge: result ? `${result.originalTokens} → ${result.compressedTokens} tokens (${result.reductionRatio}% Saved ✓)` : "Forwarding...",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: 6,
      title: "LLM Response Generated",
      description: "Final response generated from target LLM",
      badge: "Completed",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
  ];

  if (!isProcessing && !result) return null;

  return (
    <div className="bg-[#111927] border border-white/10 rounded-2xl p-6 shadow-xl mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            Automatic Background Pipeline Execution
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Everything happens automatically between clicking Send and receiving the LLM answer
          </p>
        </div>
        {result && (
          <span className="text-xs font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full font-medium">
            Status: 72.6%+ Saved & Verified ✓
          </span>
        )}
      </div>

      {/* Grid of Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {steps.map((step) => {
          const isDone = result || currentStep > step.id;
          const isCurrent = isProcessing && currentStep === step.id;

          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isDone
                  ? "bg-emerald-500/5 border-emerald-500/20 text-white"
                  : isCurrent
                  ? "bg-indigo-500/10 border-indigo-500/40 text-white shadow-lg ring-1 ring-indigo-500/50"
                  : "bg-[#0B1220]/50 border-white/5 text-gray-500 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                      isDone
                        ? "bg-emerald-500/20 text-emerald-400"
                        : isCurrent
                        ? "bg-indigo-600 text-white animate-pulse"
                        : "bg-white/5 text-gray-400"
                    }`}
                  >
                    {isDone ? "✓" : step.id}
                  </div>
                  <span className="text-xs font-semibold text-white">{step.title}</span>
                </div>
              </div>

              <p className="text-[11px] text-gray-400 leading-tight mb-2">{step.description}</p>

              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {step.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
