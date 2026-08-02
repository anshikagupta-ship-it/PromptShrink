import React from "react";

export default function UserMessage({ message }) {
  const { text, originalTokens } = message;

  return (
    <div className="py-3 sm:py-4 px-3 sm:px-4 max-w-3xl mx-auto animate-fade-in font-sans">
      <div className="flex flex-col items-end space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] sm:text-xs font-mono text-[#737373] bg-[#1a1a1a] border border-white/[0.07] px-2 sm:px-2.5 py-0.5 rounded-full">
            {originalTokens?.toLocaleString()} input tokens
          </span>
          <span className="text-xs font-semibold text-[#a3a3a3]">You</span>
        </div>

        <div className="bg-[#1a1a1a] border border-white/[0.07] rounded-[18px] rounded-tr-xs px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-[#f5f5f5] font-mono leading-relaxed max-w-[90vw] sm:max-w-2xl whitespace-pre-wrap break-words shadow-xs overflow-hidden">
          {text}
        </div>
      </div>
    </div>
  );
}
