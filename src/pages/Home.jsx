import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";
import DashboardPanel from "../components/DashboardPanel";
import EmptyState from "../components/EmptyState";
import UserMessage from "../components/UserMessage";
import AssistantMessage from "../components/AssistantMessage";
import PromptComposer from "../components/PromptComposer";
import CompressionInspector from "../components/CompressionInspector";
import BenchmarkPage from "../components/BenchmarkPage";
import AnalyticsPage from "../components/AnalyticsPage";
import { processCompression, PRESET_SAMPLES, estimateTokens } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  getUserConversations,
  getConversationMessages,
  saveConversationThread,
  appendMessagesToConversation,
  renameConversationDb,
  deleteConversationDb,
} from "../services/supabaseClient";

export default function Home() {
  const { user, isAuthChecked } = useAuth();
  const [currentView, setCurrentView] = useState("chat"); // 'chat' | 'benchmarks' | 'analytics'
  const [model, setModel] = useState("cO-1.0");
  const [mode, setMode] = useState("balanced");
  const [targetRatio, setTargetRatio] = useState(70);

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    // On mobile screens, sidebar is closed by default
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const [isDashboardOpen, setIsDashboardOpen] = useState(() => {
    // On mobile screens, dashboard panel is also closed by default
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeConvoId, setActiveConvoId] = useState(null);

  // Compute user-scoped cache key using user.id UUID (matching users.id in Supabase)
  const accountKey = user?.id;
  const cacheKey = accountKey ? `cz_recent_history_${accountKey}` : "cz_recent_history_guest";

  // Initialize recentHistory from user-scoped localStorage cache
  const [recentHistory, setRecentHistory] = useState(() => {
    try {
      const cached = localStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [latestResult, setLatestResult] = useState(null);

  // Inspector Drawer state
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectorData, setInspectorData] = useState(null);

  const chatEndRef = useRef(null);

  // Persist recent history to user-scoped localStorage cache
  useEffect(() => {
    try {
      if (recentHistory.length > 0) {
        localStorage.setItem(cacheKey, JSON.stringify(recentHistory));
      } else {
        localStorage.removeItem(cacheKey);
      }
    } catch (err) {
      console.warn("localStorage cache save error:", err);
    }
  }, [recentHistory, cacheKey]);

  // Sync conversations from Supabase ONLY after auth check completes
  useEffect(() => {
    if (!isAuthChecked) return;

    // Reset active chat view on user switch or logout
    setActiveConvoId(null);
    setMessages([]);
    setLatestResult(null);

    const currentAccountKey = user?.id;
    if (!currentAccountKey) {
      // Guest mode -> load guest cache or empty
      try {
        const guestCache = localStorage.getItem("cz_recent_history_guest");
        setRecentHistory(guestCache ? JSON.parse(guestCache) : []);
      } catch {
        setRecentHistory([]);
      }
      return;
    }

    // Pre-populate with user's specific local cache while DB query resolves
    try {
      const userCache = localStorage.getItem(`cz_recent_history_${currentAccountKey}`);
      setRecentHistory(userCache ? JSON.parse(userCache) : []);
    } catch {
      setRecentHistory([]);
    }

    async function loadDbConversations() {
      const dbConvos = await getUserConversations(currentAccountKey);
      if (dbConvos && dbConvos.length > 0) {
        const formattedConvos = dbConvos.map((dbc) => {
          const dbMsgs = dbc.messages && dbc.messages.length > 0
            ? dbc.messages.map((m) => ({
                id: m.id,
                sender: m.sender,
                text: m.content,
                originalTokens: m.original_tokens,
                result:
                  m.sender === "assistant"
                    ? (() => {
                        const origToks = m.original_tokens > 0 ? m.original_tokens : estimateTokens(m.content);
                        const compToks = m.compressed_tokens > 0 ? m.compressed_tokens : estimateTokens(m.content);
                        const toksSaved = Math.max(0, origToks - compToks);
                        const ratio = m.reduction_ratio > 0 ? m.reduction_ratio : (origToks > 0 ? parseFloat(((toksSaved / origToks) * 100).toFixed(1)) : 0);
                        return {
                          originalTokens: origToks,
                          compressedTokens: compToks,
                          tokensSaved: toksSaved,
                          reductionRatio: ratio,
                          costSavedEst: (toksSaved * 0.00002).toFixed(4),
                          compressedPrompt: m.content,
                          generatedAnswer: m.content,
                          accuracyRetention: ratio > 0 ? parseFloat(Math.max(92, 100 - ratio * 0.08).toFixed(1)) : 100.0,
                        };
                      })()
                    : null,
              }))
            : [];

          return {
            id: dbc.id,
            title: dbc.title,
            model: dbc.model,
            createdAt: dbc.created_at,
            messages: dbMsgs,
          };
        });
        setRecentHistory(formattedConvos);
      } else {
        // User has 0 conversations in DB -> clear history completely for this account
        setRecentHistory([]);
      }
    }
    loadDbConversations();
  }, [isAuthChecked, user?.id]);

  useEffect(() => {
    if (messages.length === 0) {
      setLatestResult(null);
    }
  }, [messages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleNewCompression = () => {
    setActiveConvoId(null);
    setMessages([]);
    setPrompt("");
    setLatestResult(null);
    setCurrentView("chat");
  };

  const handleSelectPreset = (sample) => {
    setPrompt(sample.context);
    setCurrentView("chat");
  };

  const handleRunPresetBenchmark = async (sample) => {
    setPrompt(sample.context);
    setCurrentView("chat");
    setTimeout(() => {
      handleSendWithText(sample.context);
    }, 100);
  };

  const handleSelectRecent = async (item) => {
    setCurrentView("chat");
    setActiveConvoId(item.id);
    // Auto-close sidebar on mobile after selecting a conversation
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }

    // 1. Instant load from local cached messages
    let hasLoaded = false;
    if (item.messages && item.messages.length > 0) {
      setMessages(item.messages);
      const lastAssistant = [...item.messages].reverse().find((m) => m.result);
      if (lastAssistant?.result) {
        setLatestResult(lastAssistant.result);
      }
      hasLoaded = true;
    }

    // 2. Fetch/sync from Supabase DB
    if (item.id && !item.id.startsWith("hist-")) {
      setIsLoading(!hasLoaded);
      const dbMsgs = await getConversationMessages(item.id);
      if (dbMsgs && dbMsgs.length > 0) {
        const mappedMsgs = dbMsgs.map((m) => ({
          id: m.id,
          sender: m.sender,
          text: m.content,
          originalTokens: m.original_tokens,
          result:
            m.sender === "assistant"
              ? (() => {
                  const origToks = m.original_tokens > 0 ? m.original_tokens : estimateTokens(m.content);
                  const compToks = m.compressed_tokens > 0 ? m.compressed_tokens : estimateTokens(m.content);
                  const toksSaved = Math.max(0, origToks - compToks);
                  const ratio = m.reduction_ratio > 0 ? m.reduction_ratio : (origToks > 0 ? parseFloat(((toksSaved / origToks) * 100).toFixed(1)) : 0);
                  return {
                    originalTokens: origToks,
                    compressedTokens: compToks,
                    tokensSaved: toksSaved,
                    reductionRatio: ratio,
                    costSavedEst: (toksSaved * 0.00002).toFixed(4),
                    compressedPrompt: m.content,
                    generatedAnswer: m.content,
                    accuracyRetention: ratio > 0 ? parseFloat(Math.max(92, 100 - ratio * 0.08).toFixed(1)) : 100.0,
                  };
                })()
              : null,
        }));

        setMessages(mappedMsgs);
        const lastAssistant = mappedMsgs.slice().reverse().find((m) => m.result);
        if (lastAssistant?.result) {
          setLatestResult(lastAssistant.result);
        }

        // Cache mapped messages on current item
        setRecentHistory((prev) => {
          const updated = prev.map((p) => (p.id === item.id ? { ...p, messages: mappedMsgs } : p));
          try {
            localStorage.setItem("cz_recent_history", JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
      setIsLoading(false);
    }
  };

  const handleRenameRecent = (id, newTitle) => {
    setRecentHistory((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, title: newTitle } : item));
      try {
        localStorage.setItem("cz_recent_history", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    renameConversationDb(id, newTitle);
  };

  const handleDeleteRecent = (id) => {
    setRecentHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem("cz_recent_history", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    deleteConversationDb(id);
    if (activeConvoId === id) {
      handleNewCompression();
    }
  };

  const handleSendWithText = async (overrideText) => {
    const textToSend = overrideText || prompt;
    if (!textToSend.trim() || isLoading) return;

    const origTokens = estimateTokens(textToSend);

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: textToSend,
      originalTokens: origTokens,
    };

    const assistantMsgId = Date.now() + 1;
    const assistantMsg = {
      id: assistantMsgId,
      sender: "assistant",
      text: "",
      originalTokens: origTokens,
      isProcessing: true,
      result: null,
    };

    const currentStream = [...messages, userMsg, assistantMsg];
    setMessages(currentStream);
    setPrompt("");
    setIsLoading(true);

    // Process Compression Engine
    const res = await processCompression({
      prompt: textToSend,
      model,
      mode,
      targetRatio,
    });

    setLatestResult(res);

    const updatedAssistantMsg = {
      ...assistantMsg,
      text: res.compressedPrompt || res.generatedAnswer,
      isProcessing: false,
      result: res,
    };

    const finalStream = [...messages, userMsg, updatedAssistantMsg];

    setMessages((prev) =>
      prev.map((msg) => (msg.id === assistantMsgId ? updatedAssistantMsg : msg))
    );

    // Persist to Supabase Database
    if (!activeConvoId) {
      // First turn in a new chat session -> Create new conversation thread in DB
      const newTitle = textToSend.slice(0, 30) + "...";
      const currentAccountKey = user?.id;
      console.log("[Home] Saving new conversation. user.id UUID:", currentAccountKey);
      const savedConvo = await saveConversationThread({
        userId: currentAccountKey,
        title: newTitle,
        model,
        targetRatio,
        promptText: textToSend,
        result: res,
      });

      console.log("[Home] saveConversationThread result:", savedConvo);
      const convoId = savedConvo?.id || `hist-${Date.now()}`;
      setActiveConvoId(convoId);

      setRecentHistory((prev) => {
        const nextList = [
          { id: convoId, title: newTitle, messages: finalStream },
          ...prev.filter((item) => item.id !== convoId).slice(0, 9),
        ];
        try {
          localStorage.setItem("cz_recent_history", JSON.stringify(nextList));
        } catch {}
        return nextList;
      });
    } else {
      // Subsequent turn in existing active chat session -> Append turn to DB under activeConvoId
      await appendMessagesToConversation({
        conversationId: activeConvoId,
        promptText: textToSend,
        result: res,
      });

      setRecentHistory((prev) => {
        const nextList = prev.map((item) =>
          item.id === activeConvoId ? { ...item, messages: finalStream } : item
        );
        try {
          localStorage.setItem("cz_recent_history", JSON.stringify(nextList));
        } catch {}
        return nextList;
      });
    }

    setIsLoading(false);
  };

  const handleInspect = (result, originalText) => {
    setInspectorData({ result, originalText });
    setInspectorOpen(true);
  };

  return (
    <div className="flex h-screen bg-[#0D0D0F] text-[#F5F5F5] font-sans overflow-hidden">
      {/* Mobile backdrop - tap outside to close sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile backdrop - tap outside to close optimization dashboard */}
      {isDashboardOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setIsDashboardOpen(false)}
        />
      )}

      {/* LEFT COLUMN: Sidebar (250px) - Chat History & Nav */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onNewCompression={handleNewCompression}
        recentItems={recentHistory}
        onSelectRecent={handleSelectRecent}
        onRenameRecent={handleRenameRecent}
        onDeleteRecent={handleDeleteRecent}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* CENTER COLUMN: Main Chat & Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <ChatHeader
          model={model}
          setModel={setModel}
          mode={mode}
          setMode={setMode}
          targetRatio={targetRatio}
          setTargetRatio={setTargetRatio}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isDashboardOpen={isDashboardOpen}
          onToggleDashboard={() => setIsDashboardOpen(!isDashboardOpen)}
        />

        {/* Dynamic View Canvas */}
        <div className="flex-1 overflow-y-auto">
          {currentView === "benchmarks" ? (
            <BenchmarkPage onRunPreset={handleRunPresetBenchmark} />
          ) : currentView === "analytics" ? (
            <AnalyticsPage history={recentHistory} />
          ) : messages.length === 0 ? (
            /* Empty State */
            <EmptyState onSelectPreset={handleSelectPreset} />
          ) : (
            /* Active Conversation Stream */
            <div className="pb-12">
              {messages.map((msg) =>
                msg.sender === "user" ? (
                  <UserMessage key={msg.id} message={msg} />
                ) : (
                  <AssistantMessage
                    key={msg.id}
                    message={msg}
                    onInspect={handleInspect}
                  />
                )
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Prompt Composer (Visible in Chat View) */}
        {currentView === "chat" && (
          <PromptComposer
            prompt={prompt}
            setPrompt={setPrompt}
            onSend={() => handleSendWithText()}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* RIGHT COLUMN: Optimization Dashboard Panel (300px) */}
      <DashboardPanel
        latestResult={latestResult}
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
      />

      {/* Compression Inspector Drawer */}
      <CompressionInspector
        isOpen={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
        data={inspectorData}
      />
    </div>
  );
}