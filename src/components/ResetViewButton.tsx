"use client";

import { useStore } from "@/store/useStore";

export default function ResetViewButton() {
  const { selectedBody, setSelectedBody } = useStore();

  if (!selectedBody) return null;

  const handleReset = () => {
    setSelectedBody(null);
  };

  return (
    <button
      onClick={handleReset}
      className="fixed top-6 left-6 z-30 
                 group
                 bg-black/40 hover:bg-black/60
                 backdrop-blur-md
                 text-white/90 hover:text-white
                 px-6 py-2.5 rounded-full
                 border border-white/10 hover:border-white/30
                 transition-all duration-300 ease-out
                 shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]
                 flex items-center gap-3"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-white/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <svg
          className="w-4 h-4 relative z-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
      </div>
      <span className="text-sm font-medium tracking-wide">
        Return to Solar System
      </span>
    </button>
  );
}
