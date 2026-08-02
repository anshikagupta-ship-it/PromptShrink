import React from "react";
import CompressionResult from "./CompressionResult";

export default function AssistantMessage({
  message,
  onInspect,
}) {
  const { text, result, isProcessing } = message;

  return (
    <div className="py-3.5 sm:py-5 px-3 sm:px-4 max-w-3xl mx-auto animate-fade-in">
      <div className="flex gap-2.5 sm:gap-3.5 items-start">
        {/* Assistant Avatar: Clean Neutral Badge */}
        <div className="w-6 h-6 rounded-md bg-[#262626] border border-white/10 flex items-center justify-center font-semibold text-white text-xs shrink-0 mt-0.5 shadow-xs">
          CZ
        </div>

        <div className="flex-1 space-y-3 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#f5f5f5]">ContextZero</span>
          </div>

          {/* Claude-Style Beautiful AI Loading Animation */}
          {isProcessing ? (
            <div className="py-2 space-y-3">
              {/* Claude Sparkle & Shimmering Text */}
              <div className="flex items-center gap-2 text-xs">
                <svg
                  className="w-4 h-4 text-amber-500 claude-sparkle-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>
                <span className="font-medium font-sans claude-shimmer-text tracking-wide">
                  Optimizing context & thinking...
                </span>
              </div>

              {/* Shimmering Wave Skeleton Bars */}
              <div className="space-y-2 max-w-md pt-1">
                <div className="h-2.5 bg-gradient-to-r from-[#1a1a1a] via-[#333333] to-[#1a1a1a] rounded-full animate-pulse"></div>
                <div className="h-2.5 bg-gradient-to-r from-[#1a1a1a] via-[#333333] to-[#1a1a1a] rounded-full animate-pulse w-4/5"></div>
                <div className="h-2.5 bg-gradient-to-r from-[#1a1a1a] via-[#333333] to-[#1a1a1a] rounded-full animate-pulse w-3/5"></div>
              </div>
            </div>
          ) : result ? (
            <>
              {/* Primary LLM Response — Show CLI compressed prompt output */}
              <div className="text-xs sm:text-sm text-[#f5f5f5] font-sans leading-relaxed whitespace-pre-line break-words">
                {result.compressedPrompt || result.generatedAnswer}
              </div>

              {/* Secondary Compression Result Card */}
              <CompressionResult
                result={result}
                onInspect={() => onInspect(result, text)}
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
