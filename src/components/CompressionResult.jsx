import React, { useState } from "react";

export default function CompressionResult({ result, onInspect }) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const handleCopyResponse = () => {
    const textToCopy = result.generatedAnswer || result.compressedPrompt || "";
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-[#171717] border border-white/[0.07] rounded-xl p-4 space-y-3 mt-4 text-xs font-sans">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <span className="font-medium text-[#a3a3a3] text-xs">Compression result</span>
        <span className="text-[11px] font-mono text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 px-2 py-0.5 rounded-full font-medium">
          ✓ Passed
        </span>
      </div>

      {/* 4 Metric Columns (2x2 on mobile, 1x4 on desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 py-1">
        <div className="bg-[#1f1f1f]/50 p-2 sm:p-0 rounded-lg sm:bg-transparent border border-white/[0.04] sm:border-none">
          <div className="font-mono font-medium text-[#f5f5f5] text-sm">
            {result.originalTokens.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#737373] mt-0.5">Before</div>
        </div>

        <div className="bg-[#1f1f1f]/50 p-2 sm:p-0 rounded-lg sm:bg-transparent border border-white/[0.04] sm:border-none">
          <div className="font-mono font-medium text-[#f5f5f5] text-sm">
            {result.compressedTokens.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#737373] mt-0.5">After</div>
        </div>

        <div className="bg-[#1f1f1f]/50 p-2 sm:p-0 rounded-lg sm:bg-transparent border border-white/[0.04] sm:border-none">
          <div className="font-mono font-medium text-[#10B981] text-sm">
            {result.reductionRatio}%
          </div>
          <div className="text-[11px] text-[#737373] mt-0.5">Saved</div>
        </div>

        <div className="bg-[#1f1f1f]/50 p-2 sm:p-0 rounded-lg sm:bg-transparent border border-white/[0.04] sm:border-none">
          <div className="font-mono font-medium text-[#f5f5f5] text-sm">
            {result.accuracyRetention}%
          </div>
          <div className="text-[11px] text-[#737373] mt-0.5">Retention</div>
        </div>
      </div>

      {/* Action Buttons: Inspect & Copy Response */}
      <div className="pt-1 flex flex-wrap items-center gap-2">
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

        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopyResponse}
          className="px-3.5 py-1.5 rounded-md bg-[#262626] hover:bg-[#333333] border border-white/[0.07] text-[#a3a3a3] hover:text-[#f5f5f5] text-xs font-medium transition flex items-center gap-1.5"
        >
          {copied ? (
            <>
              <span className="text-[#10B981]">✓</span>
              <span className="text-[#10B981]">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 text-[#737373]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy response</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
