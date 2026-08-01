import React from "react";

export default function ChatHeader({
  model,
  setModel,
  mode,
  setMode,
  targetRatio,
  setTargetRatio,
  isSidebarOpen,
  onToggleSidebar,
  isDashboardOpen,
  onToggleDashboard,
}) {
  const models = [
    { id: "cO-1.0", name: "cO 1.0 (Default Engine)" },
    { id: "cO-1.0-pro", name: "cO 1.0 Pro" },
    { id: "cO-1.0-flash", name: "cO 1.0 Flash" },
  ];

  return (
    <header className="h-[56px] border-b border-white/[0.07] bg-[#0a0a0a] px-4 flex items-center justify-between shrink-0 font-sans">
      {/* Left: Sidebar Toggle & Model Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          className="text-[#737373] hover:text-[#f5f5f5] p-1.5 rounded-md hover:bg-[#1f1f1f] transition flex items-center gap-1.5 border border-white/[0.07]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </button>

        {/* Model Selector Dropdown */}
        <div className="relative">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="bg-[#171717] text-[#f5f5f5] text-xs font-semibold px-3 py-1.5 rounded-md border border-white/20 hover:bg-[#262626] focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none pr-8 transition"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id} className="bg-[#1a1a1a] text-[#f5f5f5]">
                {m.name}
              </option>
            ))}
          </select>
          <svg
            className="w-3.5 h-3.5 text-[#737373] absolute right-2.5 top-2.5 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Right: Compression Mode Segmented Control, Badge & Dashboard Toggle */}
      <div className="flex items-center gap-3">
        {/* Segmented Control */}
        <div className="flex items-center p-0.5 bg-[#171717] rounded-lg border border-white/[0.07] text-xs">
          <button
            onClick={() => {
              setMode("conservative");
              setTargetRatio(50);
            }}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
              mode === "conservative"
                ? "bg-[#262626] text-[#f5f5f5]"
                : "text-[#737373] hover:text-[#a3a3a3]"
            }`}
          >
            Conservative
          </button>
          <button
            onClick={() => {
              setMode("balanced");
              setTargetRatio(70);
            }}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
              mode === "balanced"
                ? "bg-[#262626] text-[#f5f5f5]"
                : "text-[#737373] hover:text-[#a3a3a3]"
            }`}
          >
            Balanced
          </button>
          <button
            onClick={() => {
              setMode("aggressive");
              setTargetRatio(85);
            }}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
              mode === "aggressive"
                ? "bg-[#262626] text-[#f5f5f5]"
                : "text-[#737373] hover:text-[#a3a3a3]"
            }`}
          >
            Aggressive
          </button>
        </div>

        {/* Subdued Target Badge */}
        <span className="hidden sm:inline-flex text-[11px] font-mono text-[#737373] bg-[#171717] border border-white/[0.07] px-2 py-0.5 rounded-full">
          Target {targetRatio}%
        </span>

        {/* Dashboard Toggle Button */}
        <button
          onClick={onToggleDashboard}
          title={isDashboardOpen ? "Collapse Dashboard" : "Expand Dashboard"}
          className={`text-xs font-mono flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition ${
            isDashboardOpen
              ? "bg-[#262626] text-[#f5f5f5] border-white/20"
              : "bg-transparent text-[#737373] hover:text-[#f5f5f5] border-white/[0.07]"
          }`}
        >
          <svg className="w-4 h-4 text-[#a3a3a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="hidden sm:inline font-medium font-sans">Telemetry</span>
        </button>
      </div>
    </header>
  );
}
