import React from "react";
import { PRESET_SAMPLES } from "../services/api";

export default function Sidebar({
  currentView,
  setCurrentView,
  onNewCompression,
  recentItems = [],
  onSelectRecent,
  isOpen,
  setIsOpen,
}) {
  const defaultRecents = [
    { id: "recent-1", title: "Incident log analysis" },
    { id: "recent-2", title: "Customer support summary" },
    { id: "recent-3", title: "API documentation" },
    { id: "recent-4", title: "Database debugging" },
  ];

  const displayRecents = recentItems.length > 0 ? recentItems : defaultRecents;

  return (
    <aside
      className={`fixed md:static inset-y-0 left-0 z-40 bg-[#121212] border-r border-white/[0.07] flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
        isOpen ? "w-60 opacity-100 translate-x-0" : "w-0 md:w-0 opacity-0 -translate-x-full md:translate-x-0 border-none"
      }`}
    >
      {/* Top Section */}
      <div className="p-3 space-y-4">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#262626] border border-white/10 flex items-center justify-center font-semibold text-white text-xs shadow-xs">
              CZ
            </div>
            <span className="font-semibold text-sm text-[#f5f5f5] tracking-tight">
              ContextZero
            </span>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-[#737373] hover:text-[#f5f5f5] text-xs p-1"
          >
            ✕
          </button>
        </div>

        {/* New Compression Button */}
        <button
          onClick={() => {
            setCurrentView("chat");
            onNewCompression();
          }}
          className="w-full bg-[#262626] hover:bg-[#333333] text-white font-medium rounded-lg px-3 py-2 text-xs flex items-center justify-center gap-2 shadow-xs border border-white/10 transition"
        >
          <svg className="w-3.5 h-3.5 text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span>New compression</span>
        </button>

        {/* RECENT Conversations List */}
        <div className="pt-2">
          <div className="text-[11px] font-medium text-[#737373] px-2 mb-1.5 uppercase tracking-wider">
            Recent
          </div>
          <div className="space-y-0.5">
            {displayRecents.map((item, idx) => (
              <button
                key={item.id || idx}
                onClick={() => {
                  setCurrentView("chat");
                  if (onSelectRecent) onSelectRecent(item);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-md text-xs text-[#a3a3a3] hover:bg-[#262626] hover:text-[#f5f5f5] transition truncate block font-normal"
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>

        {/* BENCHMARKS & EVALUATION NAV */}
        <div className="pt-2 border-t border-white/[0.06] space-y-0.5">
          <button
            onClick={() => setCurrentView("benchmarks")}
            className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition flex items-center justify-between ${
              currentView === "benchmarks"
                ? "bg-[#262626] text-[#f5f5f5]"
                : "text-[#a3a3a3] hover:bg-[#262626] hover:text-[#f5f5f5]"
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-[#737373]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Benchmarks Suite</span>
            </div>
          </button>
        </div>
      </div>

      {/* Visually Quiet Bottom */}
      <div className="p-3 border-t border-white/[0.06] text-[11px] font-mono text-[#737373] text-center">
        v1.0 • Pre-Processor
      </div>
    </aside>
  );
}
