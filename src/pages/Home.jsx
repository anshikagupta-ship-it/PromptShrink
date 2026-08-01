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
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState("chat"); // 'chat' | 'benchmarks' | 'analytics'
  const [model, setModel] = useState("cO-1.0");
  const [mode, setMode] = useState("balanced");
  const [targetRatio, setTargetRatio] = useState(70);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDashboardOpen, setIsDashboardOpen] = useState(true);

  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeConvoId, setActiveConvoId] = useState(null);

  // Initialize recentHistory from localStorage cache for instant zero-delay render
  const [recentHistory, setRecentHistory] = useState(() => {
    try {
      const cached = localStorage.getItem("cz_recent_history");
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

  // Persist recent history to localStorage cache
  useEffect(() => {
    try {
      if (recentHistory.length > 0) {
        localStorage.setItem("cz_recent_history", JSON.stringify(recentHistory));
      }
    } catch (err) {
      console.warn("localStorage cache save error:", err);
    }
  }, [recentHistory]);

  // Sync conversations from Supabase on mount / user change
  useEffect(() => {
    async function loadDbConversations() {
      const dbConvos = await getUserConversations(user?.id);
      if (dbConvos && dbConvos.length > 0) {
        setRecentHistory((prev) => {
          return dbConvos.map((dbc) => {
            const cached = prev.find((p) => p.id === dbc.id);
            return {
              ...dbc,
              messages: cached?.messages || [],
            };
          });
        });
      }
    }
    loadDbConversations();
  }, [user]);

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
              ? {
                  originalTokens: m.original_tokens,
                  compressedTokens: m.compressed_tokens,
                  reductionRatio: m.reduction_ratio,
                  compressedPrompt: m.content,
                  generatedAnswer: m.content,
                  accuracyRetention: 98.2,
                }
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
      const savedConvo = await saveConversationThread({
        userId: user?.id,
        title: newTitle,
        model,
        targetRatio,
        promptText: textToSend,
        result: res,
      });

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
            <AnalyticsPage />
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