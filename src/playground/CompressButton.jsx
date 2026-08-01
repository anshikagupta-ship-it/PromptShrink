import React from "react";

export default function CompressButton({ onClick, isLoading, disabled }) {
  return (
    <div className="flex justify-center mt-6">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || isLoading}
        className={`relative group overflow-hidden px-10 py-4 rounded-2xl font-bold text-base text-white transition-all shadow-xl flex items-center gap-3 ${
          disabled || isLoading
            ? "bg-gray-700/50 cursor-not-allowed opacity-60"
            : "bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/25 active:scale-95"
        }`}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

        {isLoading ? (
          <>
            <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Running Compression Pipeline...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>3. Send & Compress Prompt</span>
          </>
        )}
      </button>
    </div>
  );
}
