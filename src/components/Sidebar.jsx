import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({
  currentView,
  setCurrentView,
  onNewCompression,
  recentItems = [],
  onSelectRecent,
  onRenameRecent,
  onDeleteRecent,
  isOpen,
  setIsOpen,
}) {
  const { user, logout } = useAuth();
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const handleStartRename = (e, item) => {
    e.stopPropagation();
    setEditingId(item.id);
    setEditTitle(item.title);
  };

  const handleSaveRename = (id) => {
    if (editTitle.trim()) {
      if (onRenameRecent) {
        onRenameRecent(id, editTitle.trim());
      }
    }
    setEditingId(null);
  };

  const handleCancelRename = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (onDeleteRecent) {
      onDeleteRecent(id);
    }
  };

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
          <div className="space-y-0.5 max-h-[320px] overflow-y-auto pr-0.5">
            {recentItems.length === 0 ? (
              <div className="text-[11px] text-[#737373] px-2 py-3 italic">
                No recent conversations. Start a new compression!
              </div>
            ) : (
              recentItems.map((item, idx) => {
                const itemId = item.id || `recent-${idx}`;
                const isEditing = editingId === itemId;

                return (
                  <div
                    key={itemId}
                    className="group relative flex items-center justify-between px-2 py-1 rounded-md text-xs hover:bg-[#262626] transition"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editTitle}
                          autoFocus
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSaveRename(itemId);
                            }
                            if (e.key === "Escape") {
                              setEditingId(null);
                            }
                          }}
                          className="w-full bg-[#1c1c1c] border border-white/20 text-[#f5f5f5] text-xs px-2 py-1 rounded focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename(itemId)}
                          className="text-[#10B981] hover:text-emerald-400 p-1 font-bold text-xs shrink-0"
                          title="Save title"
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelRename}
                          className="text-[#737373] hover:text-[#f5f5f5] p-1 text-xs shrink-0"
                          title="Cancel"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setCurrentView("chat");
                            if (onSelectRecent) onSelectRecent(item);
                          }}
                          className="text-left text-[#a3a3a3] group-hover:text-[#f5f5f5] truncate flex-1 block pr-2 py-0.5 font-normal"
                        >
                          {item.title}
                        </button>

                        {/* Action Buttons: Rename (✏️) & Delete (🗑️) */}
                        <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleStartRename(e, { ...item, id: itemId })}
                            className="text-[#737373] hover:text-[#f5f5f5] p-1 rounded hover:bg-[#333333] transition"
                            title="Rename"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(e, itemId)}
                            className="text-[#737373] hover:text-red-400 p-1 rounded hover:bg-[#333333] transition"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* BENCHMARKS & EVALUATION NAV - COMMENTED OUT */}
        {/* <div className="pt-2 border-t border-white/[0.06] space-y-0.5">
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
        </div> */}
      </div>

      {/* User Account Profile & Logout Footer */}
      <div className="p-3 border-t border-white/[0.06] bg-[#0d0d0d] space-y-2">
        {user && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-7 h-7 rounded-full border border-white/10 shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#262626] text-white font-bold text-xs flex items-center justify-center border border-white/10 shrink-0">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-[#f5f5f5] truncate">
                  {user.name}
                </div>
                <div className="text-[10px] text-[#737373] truncate font-mono">
                  {user.email}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Log out"
              className="text-[#737373] hover:text-[#f5f5f5] p-1.5 rounded-md hover:bg-[#262626] transition shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
