import React, { useRef } from "react";
import { estimateTokens } from "../services/api";

export default function ChatInput({ prompt, setPrompt, onSend, isLoading }) {
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
    <div className="p-4 bg-gradient-to-t from-[#171717] via-[#171717]/90 to-transparent sticky bottom-0 z-20">
      <div className="max-w-3xl mx-auto">
        <div className="bg-[#2F2F2F] border border-white/10 rounded-2xl p-3 shadow-2xl focus-within:border-indigo-500/80 transition relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.log,.json,.md,.js,.py"
            className="hidden"
          />

          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a prompt, codebase context, or incident logs (Shift+Enter for line break)..."
            className="w-full bg-transparent text-white text-sm placeholder-gray-400 focus:outline-none font-mono resize-none pr-24 leading-relaxed"
          />

          {/* Action Row inside bottom bar */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/5 transition font-mono"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <span>Attach Log/Text File</span>
            </button>

            <div className="flex items-center gap-3">
              {/* Token Counter Gauge */}
              <span className="text-xs font-mono text-gray-400">
                Payload: <span className="text-indigo-400 font-bold">{tokenCount.toLocaleString()} tokens</span>
              </span>

              {/* Send Button (ChatGPT Style Arrow) */}
              <button
                type="button"
                onClick={onSend}
                disabled={!prompt.trim() || isLoading}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  !prompt.trim() || isLoading
                    ? "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                    : "bg-white text-black hover:bg-gray-200 shadow-lg active:scale-95"
                }`}
              >
                {isLoading ? (
                  <svg className="animate-spin w-4 h-4 text-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
