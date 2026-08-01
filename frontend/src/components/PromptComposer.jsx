import React, { useRef } from "react";
import { estimateTokens } from "../services/api";

export default function PromptComposer({ prompt, setPrompt, onSend, isLoading }) {
  const fileInputRef = useRef(null);
  const tokenCount = estimateTokens(prompt);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (prompt.trim() && !isLoading) {
        onSend();
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        setPrompt(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 sticky bottom-0 z-20 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="bg-[#1a1a1a] border border-white/[0.08] rounded-[24px] p-3 shadow-lg focus-within:border-white/20 transition relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.log,.json,.md,.js,.py"
            className="hidden"
          />

          <textarea
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything or paste long context..."
            className="w-full bg-transparent text-[#f5f5f5] text-sm placeholder-[#737373] focus:outline-none resize-none leading-relaxed px-2 font-normal"
          />

          {/* Bottom Row */}
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] mt-1">
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-[#a3a3a3] hover:text-[#f5f5f5] flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-[#262626] transition font-medium"
            >
              <svg className="w-4 h-4 text-[#737373]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Attach Log</span>
            </button>

            {/* Right: Token Counter & Send Arrow Button */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[#737373]">
                {tokenCount.toLocaleString()} tokens
              </span>

              <button
                type="button"
                onClick={onSend}
                disabled={!prompt.trim() || isLoading}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  !prompt.trim() || isLoading
                    ? "bg-[#262626] text-[#737373] cursor-not-allowed"
                    : "bg-[#f5f5f5] text-black hover:bg-white shadow-xs active:scale-95"
                }`}
              >
                {isLoading ? (
                  <svg className="animate-spin w-4 h-4 text-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
