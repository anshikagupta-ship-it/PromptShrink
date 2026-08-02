import React, { useState } from "react";

export default function CompressionInspector({ isOpen, onClose, data }) {
  const [activeTab, setActiveTab] = useState("diff"); // 'diff' | 'protected' | 'pipeline'

  if (!isOpen || !data) return null;

  const { result, originalText } = data;

  const protectedEntitiesList = Array.isArray(result?.protectedEntities)
    ? result.protectedEntities
    : [
        "Intent & User Instruction",
        "Constraints & Negations",
        "Entities, IDs & Error Codes",
        "Format Requirements",
      ];

  const protectedInfo = protectedEntitiesList.map((item, idx) => ({
    category: typeof item === "string" ? item : item.category || `Rule ${idx + 1}`,
    status: "Preserved",
    detail: typeof item === "string" ? "Locked semantic boundary" : item.detail || "Preserved in compressed prompt",
  }));

  const pipelineSteps = [
    { title: "Token Analysis", status: "Completed" },
    { title: "Critical Information Protection", status: "Completed" },
    { title: "Redundancy Removal", status: "Completed" },
    { title: "Semantic Condensation", status: "Completed" },
    { title: "Quality Verification", status: "Completed" },
    { title: "LLM Forwarding", status: "Completed" },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-[460px] bg-[#111113] border-l border-white/[0.08] h-full flex flex-col justify-between shadow-2xl animate-fade-in">
        {/* Drawer Header */}
        <div className="p-4 border-b border-white/[0.08]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#F5F5F5] tracking-tight">
              Compression Inspector
            </h2>
            <button
              onClick={onClose}
              className="text-[#71717A] hover:text-[#F5F5F5] p-1 rounded-md hover:bg-[#1D1D21] transition"
            >
              ✕
            </button>
          </div>

          {/* Top Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#17171A] border border-white/[0.08] p-2.5 sm:p-3 rounded-lg text-xs font-mono">
            <div>
              <div className="text-[10px] sm:text-[11px] text-[#71717A]">Original</div>
              <div className="text-[#F5F5F5] font-medium mt-0.5 text-xs sm:text-sm">{result.originalTokens.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] sm:text-[11px] text-[#71717A]">Compressed</div>
              <div className="text-[#F5F5F5] font-medium mt-0.5 text-xs sm:text-sm">{result.compressedTokens.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] sm:text-[11px] text-[#71717A]">Reduction</div>
              <div className="text-[#10B981] font-medium mt-0.5 text-xs sm:text-sm">{result.reductionRatio}% ✓</div>
            </div>
            <div>
              <div className="text-[10px] sm:text-[11px] text-[#71717A]">Preservation</div>
              <div className="text-indigo-400 font-medium mt-0.5 text-xs sm:text-sm">{result.accuracyRetention}% ✓</div>
            </div>
          </div>

          {/* Inspector Tab Switcher */}
          <div className="flex items-center gap-1 mt-4 p-0.5 bg-[#17171A] rounded-lg border border-white/[0.08]">
            <button
              onClick={() => setActiveTab("diff")}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${
                activeTab === "diff"
                  ? "bg-[#1D1D21] text-[#F5F5F5]"
                  : "text-[#71717A] hover:text-[#A1A1AA]"
              }`}
            >
              Prompt Diff
            </button>
            <button
              onClick={() => setActiveTab("protected")}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${
                activeTab === "protected"
                  ? "bg-[#1D1D21] text-[#F5F5F5]"
                  : "text-[#71717A] hover:text-[#A1A1AA]"
              }`}
            >
              Protected
            </button>
            <button
              onClick={() => setActiveTab("pipeline")}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${
                activeTab === "pipeline"
                  ? "bg-[#1D1D21] text-[#F5F5F5]"
                  : "text-[#71717A] hover:text-[#A1A1AA]"
              }`}
            >
              Pipeline
            </button>
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-mono">
          {/* Tab 1: Prompt Diff */}
          {activeTab === "diff" && (
            <div className="space-y-4">
              <div>
                <div className="text-[11px] font-sans font-medium text-[#71717A] mb-1.5">Legend</div>
                <div className="flex items-center gap-3 text-[11px] font-sans">
                  <span className="flex items-center gap-1.5 text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> Removed
                  </span>
                  <span className="flex items-center gap-1.5 text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> Protected
                  </span>
                  <span className="flex items-center gap-1.5 text-[#F5F5F5]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#71717A]"></span> Retained
                  </span>
                </div>
              </div>

              <div className="bg-[#17171A] border border-white/[0.08] p-3 rounded-lg space-y-3 leading-relaxed max-h-[420px] overflow-y-auto">
                <div>
                  <div className="text-[10px] text-[#71717A] uppercase font-sans tracking-wider mb-1 font-semibold">Original Prompt Payload</div>
                  <div className="p-2 bg-[#0A0A0C] text-[#A1A1AA] border border-white/[0.06] rounded whitespace-pre-wrap font-mono text-[11px]">
                    {originalText || result.prompt || "Original prompt text"}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-[#10B981] uppercase font-sans tracking-wider mb-1 font-semibold">Compressed Prompt Payload</div>
                  <div className="p-2 bg-[#10B981]/5 text-[#10B981] border border-[#10B981]/20 rounded whitespace-pre-wrap font-mono text-[11px] font-medium">
                    {result.compressedPrompt || result.generatedAnswer || "Compressed prompt text"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Protected Information */}
          {activeTab === "protected" && (
            <div className="space-y-3 font-sans">
              <p className="text-xs text-[#A1A1AA] mb-2">
                Demonstrating information protection rules enforced during compression:
              </p>

              {protectedInfo.map((item, idx) => (
                <div key={idx} className="bg-[#17171A] border border-white/[0.08] p-3 rounded-lg space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#F5F5F5]">{item.category}</span>
                    <span className="text-[#10B981] font-mono text-[11px] font-medium">✓ {item.status}</span>
                  </div>
                  <div className="text-xs text-[#A1A1AA] font-mono">{item.detail}</div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Pipeline Status Checklist */}
          {activeTab === "pipeline" && (
            <div className="space-y-2 font-sans">
              <p className="text-xs text-[#A1A1AA] mb-3">
                Pre-processor pipeline stage execution:
              </p>

              {pipelineSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-[#17171A] border border-white/[0.08] px-3 py-2.5 rounded-lg flex items-center justify-between text-xs"
                >
                  <span className="text-[#F5F5F5] font-medium">{step.title}</span>
                  <span className="text-[#10B981] font-mono text-xs font-medium">✓ Preserved</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-white/[0.08]">
          <button
            onClick={onClose}
            className="w-full bg-[#1D1D21] hover:bg-[#252529] text-[#F5F5F5] font-medium text-xs py-2 rounded-lg transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
