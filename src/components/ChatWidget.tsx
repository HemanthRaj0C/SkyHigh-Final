"use client";

import { useStore } from "@/store/useStore";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { 
  Sparkles, 
  X, 
  Maximize2, 
  Minimize2, 
  Send, 
  ArrowRight, 
  User, 
  Loader2 
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const suggestedQuestions = [
  "How far is Mars from Earth right now?",
  "How long would it take to reach Jupiter?",
  "Which planet has the most moons?",
  "What causes the Great Red Spot on Jupiter?",
  "Tell me about Saturn's rings",
  "When is the next meteor shower?",
];

export default function ChatWidget() {
  const { showChatWidget, toggleChatWidget, selectedBody } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (showChatWidget && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showChatWidget]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: content.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          selectedBody,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question);
  };

  if (!showChatWidget) {
    return (
      <button
        onClick={toggleChatWidget}
        className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-lg hover:scale-110 transition-all"
        title="Open Cosmos AI Chat"
      >
        <div className="relative w-full h-full">
          <Image
            src="/images/Chatbot.png"
            alt="Chatbot"
            fill
            className="object-cover"
          />
        </div>
      </button>
    );
  }

  return (
    <div
      className={`fixed z-30 text-white shadow-2xl flex flex-col transition-all duration-300 ease-in-out
        ${
          isFullScreen
            ? "inset-0 w-full h-full rounded-none"
            : "top-0 right-0 w-[450px] min-w-[380px] h-full rounded-l-3xl"
        }`}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-linear-to-br from-purple-950/40 via-indigo-950/40 to-blue-950/40 backdrop-blur-3xl"></div>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl"></div>
      
      {/* Border Glow Effect */}
      <div className="absolute inset-0 rounded-l-3xl border-l-2 border-t-2 border-b-2 border-purple-500/20 shadow-[0_0_50px_rgba(168,85,247,0.15)]"></div>
      
      {/* Content Container */}
      <div className="relative z-10 flex flex-col h-full">
      
      {/* Header */}
      <div className="relative p-4 border-b border-white/10 backdrop-blur-xl">
        <div className="absolute inset-0 bg-linear-to-r from-purple-900/30 via-blue-900/20 to-indigo-900/30"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="font-bold text-lg tracking-tight bg-linear-to-r from-purple-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
                Cosmos AI
              </h3>
              <p className="text-xs text-white/50 mt-0.5">Your personal astronomy guide</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="text-white/40 hover:text-white hover:bg-purple-500/20 p-2 rounded-lg transition-all duration-200"
              title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
            >
              {isFullScreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={toggleChatWidget}
              className="text-white/40 hover:text-white hover:bg-red-500/20 p-2 rounded-lg transition-all duration-200"
              title="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="space-y-6 mt-4">
            <div className="text-center space-y-3">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold bg-linear-to-r from-purple-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
                  Welcome to Cosmos AI
                </h2>
                <p className="text-white/60 text-sm max-w-md mx-auto">
                  Explore the wonders of the universe. Ask me anything about planets, stars, and space!
                </p>
              </div>
            </div>

            {/* Suggested Questions */}
            <div className="space-y-3">
              <p className="text-xs text-white/40 uppercase font-semibold tracking-wider text-center flex items-center justify-center gap-2">
                <span className="h-px w-6 bg-linear-to-r from-transparent to-white/20"></span>
                Suggested Questions
                <span className="h-px w-6 bg-linear-to-l from-transparent to-white/20"></span>
              </p>
              <div className="grid gap-2">
                {suggestedQuestions.map((question, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="w-full text-left p-3 rounded-xl bg-linear-to-r from-white/5 to-white/2 hover:from-purple-500/20 hover:to-blue-500/10
                               border border-white/10 hover:border-purple-500/40
                               transition-all duration-200 text-sm text-white/70 hover:text-white
                               group flex items-center justify-between hover:scale-[1.02]"
                    disabled={isLoading}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-purple-400 group-hover:text-purple-300 transition-colors text-xs">→</span>
                      <span>{question}</span>
                    </span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 text-purple-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, i) => (
              <div
                key={i}
                className={`flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-linear-to-br from-purple-600 to-blue-600 flex items-center justify-center shrink-0 shadow-md mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] p-3 rounded-xl text-sm leading-relaxed shadow-md ${
                    message.role === "user"
                      ? "bg-linear-to-br from-purple-600/40 to-blue-600/30 text-white border border-purple-400/30 rounded-tr-sm backdrop-blur-xl"
                      : "bg-linear-to-br from-white/10 to-white/5 text-gray-100 border border-white/20 rounded-tl-sm backdrop-blur-xl"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center shrink-0 shadow-md mt-0.5">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start gap-2 animate-in fade-in duration-300">
                <div className="w-7 h-7 rounded-lg bg-linear-to-br from-purple-600 to-blue-600 flex items-center justify-center shrink-0 shadow-md mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-linear-to-br from-white/10 to-white/5 border border-white/20 p-3 rounded-xl rounded-tl-sm backdrop-blur-xl shadow-md">
                  <div className="flex items-center gap-1">
                    <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                    <span className="text-sm text-white/60">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="relative p-4 border-t border-white/10 backdrop-blur-xl">
        <div className="absolute inset-0 bg-linear-to-t from-purple-900/20 via-blue-900/10 to-transparent"></div>
        <form onSubmit={handleSubmit} className="relative flex gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about space..."
              disabled={isLoading}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3
                       text-sm text-white placeholder-white/40
                       focus:outline-none focus:border-purple-500/60 focus:bg-white/10
                       transition-all duration-200
                       disabled:opacity-50 backdrop-blur-xl"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="relative bg-linear-to-br from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500
                     text-white
                     disabled:opacity-50 disabled:cursor-not-allowed
                     px-4 py-3 rounded-xl transition-all duration-200
                     flex items-center justify-center hover:scale-105
                     group"
          >
            <Send className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}
