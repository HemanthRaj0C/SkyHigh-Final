"use client";

import { useStore } from "@/store/useStore";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

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
      className={`fixed z-30 bg-[#0a0a0a]/95 backdrop-blur-2xl text-white border-l border-white/10 shadow-2xl flex flex-col transition-all duration-300 ease-in-out
        ${
          isFullScreen
            ? "inset-0 w-full h-full rounded-none"
            : "top-0 right-0 w-1/3 min-w-[320px] h-full rounded-l-3xl"
        }`}
    >
      {/* Header */}
      <div className="p-5 border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg tracking-tight">
                Cosmos AI
              </h3>
              <p className="text-xs text-white/40 font-medium tracking-wide">
                Powered by Gemini
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="text-white/40 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all duration-200"
              title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
            >
              {isFullScreen ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 9L4 4m0 0l5 0M4 4l0 5M15 9l5-5m0 0l-5 0m5 0l0 5M9 15l-5 5m0 0l5 0m-5 0l0-5M15 15l5 5m0 0l-5 0m5 0l0-5"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
              )}
            </button>
            <button
              onClick={toggleChatWidget}
              className="text-white/40 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all duration-200"
              title="Close Chat"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="space-y-6 mt-4">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto border border-purple-500/20">
                <span className="text-2xl">👋</span>
              </div>
              <div className="space-y-1">
                <p className="text-white font-medium">Welcome to Cosmos AI</p>
                <p className="text-white/40 text-sm">
                  Your personal astronomy guide
                </p>
              </div>
            </div>

            {/* Suggested Questions */}
            <div className="space-y-3">
              <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider text-center">
                Suggested Questions
              </p>
              <div className="grid gap-2">
                {suggestedQuestions.map((question, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 
                               border border-white/5 hover:border-white/20
                               transition-all duration-200 text-sm text-white/70 hover:text-white
                               group flex items-center justify-between"
                    disabled={isLoading}
                  >
                    <span>{question}</span>
                    <svg
                      className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
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
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-purple-600/20 text-purple-100 border border-purple-500/20 rounded-tr-sm"
                      : "bg-white/5 text-gray-200 border border-white/10 rounded-tl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 bg-purple-400/60 rounded-full animate-bounce"></span>
                    <span
                      className="w-1.5 h-1.5 bg-purple-400/60 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></span>
                    <span
                      className="w-1.5 h-1.5 bg-purple-400/60 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-5 border-t border-white/10 bg-black/20">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about space..."
            disabled={isLoading}
            className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3
                     text-sm text-white placeholder-white/30
                     focus:outline-none focus:border-purple-500/50 focus:bg-black/40
                     transition-all duration-200
                     disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-white/10 hover:bg-purple-600/20 
                     text-white/70 hover:text-purple-300
                     border border-white/10 hover:border-purple-500/30
                     disabled:opacity-50 disabled:cursor-not-allowed
                     p-3 rounded-xl transition-all duration-200
                     flex items-center justify-center"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
