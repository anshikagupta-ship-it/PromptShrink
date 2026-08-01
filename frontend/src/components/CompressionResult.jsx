import React from "react";

export default function CompressionResult({ result, onInspect }) {
  if (!result) return null;

  return (
    <div className="bg-[#171717] border border-white/[0.07] rounded-xl p-4 space-y-3 mt-4 text-xs font-sans">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <span className="font-medium text-[#a3a3a3] text-xs">Compression result</span>
        <span className="text-[11px] font-mono text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 px-2 py-0.5 rounded-full font-medium">
          ✓ Passed
        </span>
      </div>

      {/* 4 Metric Columns */}
      <div className="grid grid-cols-4 gap-3 py-1">
        <div>
          <div className="font-mono font-medium text-[#f5f5f5] text-sm">
            {result.originalTokens.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#737373] mt-0.5">Before</div>
        </div>

        <div>
          <div className="font-mono font-medium text-[#f5f5f5] text-sm">
            {result.compressedTokens.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#737373] mt-0.5">After</div>
        </div>

        <div>
          <div className="font-mono font-medium text-[#10B981] text-sm">
            {result.reductionRatio}%
          </div>
          <div className="text-[11px] text-[#737373] mt-0.5">Saved</div>
        </div>

        <div>
          <div className="font-mono font-medium text-[#f5f5f5] text-sm">
            {result.accuracyRetention}%
          </div>
          <div className="text-[11px] text-[#737373] mt-0.5">Retention</div>
        </div>
      </div>

      {/* Primary Inspector Action Button */}
      <div className="pt-1">
        <button
          type="button"
          onClick={onInspect}
          className="px-3.5 py-1.5 rounded-md bg-[#262626] hover:bg-[#333333] border border-white/[0.07] text-[#f5f5f5] text-xs font-medium transition flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5 text-[#737373]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>Inspect compression</span>
        </button>
      </div>
    </div>
  );
}
