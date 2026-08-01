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

export default function Home() {
  const [currentView, setCurrentView] = useState("chat"); // 'chat' | 'benchmarks' | 'analytics'
  const [model, setModel] = useState("gpt-4o");
  const [mode, setMode] = useState("balanced");
  const [targetRatio, setTargetRatio] = useState(70);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDashboardOpen, setIsDashboardOpen] = useState(true);

  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentHistory, setRecentHistory] = useState([]);
  const [latestResult, setLatestResult] = useState(null);

  // Inspector Drawer state
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectorData, setInspectorData] = useState(null);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleNewCompression = () => {
    setMessages([]);
    setPrompt("");
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
      text: textToSend,
      originalTokens: origTokens,
      isProcessing: true,
      result: null,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setPrompt("");
    setIsLoading(true);

    setRecentHistory((prev) => [
      { id: `hist-${Date.now()}`, title: textToSend.slice(0, 30) + "..." },
      ...prev.filter((item) => item.title !== textToSend.slice(0, 30) + "...").slice(0, 4),
    ]);

    // Process Compression Engine
    const res = await processCompression({
      prompt: textToSend,
      model,
      mode,
      targetRatio,
    });

    setLatestResult(res);

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === assistantMsgId
          ? {
              ...msg,
              isProcessing: false,
              result: res,
            }
          : msg
      )
    );

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
        onSelectRecent={(item) => setCurrentView("chat")}
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