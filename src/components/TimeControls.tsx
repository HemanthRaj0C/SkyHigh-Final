"use client";

import { useStore } from "@/store/useStore";
import { useState } from "react";

const speedPresets = [
  { value: 0, label: "Pause", multiplier: 0 },
  { value: -1, label: "Real-Time", multiplier: -1 },
  { value: 0.5, label: "Slow", multiplier: 0.5 },
  { value: 5, label: "Fast", multiplier: 5 },
  { value: 10, label: "Faster", multiplier: 10 },
];

export default function TimeControls() {
  const { timeSpeed, setTimeSpeed } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  const [previousSpeed, setPreviousSpeed] = useState(1);

  const isPaused = timeSpeed === 0;

  const togglePlayPause = () => {
    if (isPaused) {
      setTimeSpeed(previousSpeed);
    } else {
      setPreviousSpeed(timeSpeed);
      setTimeSpeed(0);
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    if (newSpeed !== 0) {
      setPreviousSpeed(newSpeed);
    }
    setTimeSpeed(newSpeed);
  };

  const getSpeedPercentage = () => {
    if (timeSpeed === 0) return 0;
    const max = 10;
    return Math.min((Math.abs(timeSpeed) / max) * 100, 100);
  };

  const getSpeedColor = () => {
    return "from-gray-400 to-gray-500";
  };

  return (
    <div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating Speed Presets - Only show on hover */}
      <div
        className={`transition-all duration-500 ease-out ${
          isHovered
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {/* UPDATED: Increased gap-2 to gap-4 and p-2 to p-3 for better spacing */}
        <div className="flex items-center gap-4 bg-black/60 backdrop-blur-2xl rounded-full p-3 border border-white/10 shadow-2xl">
          {speedPresets.map((preset, idx) => {
            const isActive = timeSpeed === preset.value;

            return (
              <button
                key={idx}
                onClick={() => handleSpeedChange(preset.value)}
                // UPDATED: Reduced padding (px-6 py-3), added min-width, reduced active scale
                className={`group relative px-6 py-3 min-w-[90px] rounded-full transition-all duration-300 border-2 ${
                  isActive
                    ? "scale-105 shadow-lg border-gray-400 bg-gradient-to-br from-gray-400/20 to-gray-500/20"
                    : "border-transparent hover:border-gray-400/30 hover:bg-gray-400/10 hover:scale-105"
                }`}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span
                    className={`text-sm font-bold ${
                      isActive
                        ? "text-white"
                        : "text-white/60 group-hover:text-white/90"
                    } transition-colors duration-300`}
                  >
                    {preset.label}
                  </span>
                  {preset.value !== -1 && preset.value !== 0 && (
                    <span
                      className={`text-xs ${
                        isActive
                          ? "text-white/80"
                          : "text-white/40 group-hover:text-white/60"
                      }`}
                    >
                      {preset.value}x
                    </span>
                  )}
                </div>

                {isActive && (
                  <div
                    className={`absolute -inset-1 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 opacity-20 blur-xl animate-pulse`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Control Orb */}
      <div className="relative">
        {/* Outer glow ring */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${getSpeedColor()} blur-xl transition-all duration-700 ${
            isPaused
              ? "opacity-20 scale-90"
              : "opacity-40 scale-100 animate-pulse"
          }`}
        />

        {/* Middle ring */}
        <div
          className={`absolute inset-0 rounded-full border-2 ${
            isPaused ? "border-white/10" : "border-white/30"
          } transition-all duration-500`}
        >
          <svg
            className="w-full h-full -rotate-90 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="url(#speedGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${getSpeedPercentage() * 3.01} 301`}
              className="transition-all duration-500"
            />
            <defs>
              <linearGradient
                id="speedGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#9ca3af" />
                <stop offset="50%" stopColor="#9ca3af" />
                <stop offset="100%" stopColor="#6b7280" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Main button */}
        <button
          onClick={togglePlayPause}
          className="relative w-20 h-20 rounded-full bg-gradient-to-br from-black/90 via-gray-900/90 to-black/90 backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group"
        >
          {/* Inner gradient overlay */}
          <div
            className={`absolute inset-2 rounded-full bg-gradient-to-br ${getSpeedColor()} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}
          />

          {/* Play/Pause Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isPaused ? (
              <svg
                className="w-8 h-8 text-white drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg
                className="w-8 h-8 text-white drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            )}
          </div>

          {/* Speed Display */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full mt-2">
            <div className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-xl border border-white/20 shadow-lg">
              <div className="flex flex-col items-center">
                <span className="text-white/50 text-[9px] font-medium uppercase tracking-wider">
                  Speed
                </span>
                <span
                  className={`font-bold text-sm bg-gradient-to-r ${getSpeedColor()} bg-clip-text text-transparent`}
                >
                  {isPaused
                    ? "Paused"
                    : timeSpeed === -1
                    ? "Real"
                    : `${timeSpeed}×`}
                </span>
              </div>
            </div>
          </div>
        </button>

        {/* Rotating particles effect when active */}
        {!isPaused && (
          <>
            {[...Array(8)].map((_, i) => {
              const rotation = i * 45;
              const delay = i * 0.125;
              return (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-white opacity-60 animate-[orbit_3s_linear_infinite]"
                  style={{
                    transform: `rotate(${rotation}deg) translateY(-50px)`,
                    animationDelay: `${delay}s`,
                  }}
                />
              );
            })}
          </>
        )}
      </div>

      {/* Fine-tune slider (appears on hover) */}
      <div
        className={`transition-all duration-500 ease-out ${
          isHovered
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-2xl rounded-full px-6 py-3 border border-white/10 shadow-2xl min-w-[320px]">
          <span className="text-white/50 text-xs font-medium whitespace-nowrap">
            Fine Tune
          </span>
          <div className="relative flex-1">
            <div
              className="absolute inset-0 h-1 rounded-full overflow-hidden"
              style={{
                background: `linear-gradient(to right, #6b7280 0%, #6b7280 ${getSpeedPercentage()}%, rgba(255,255,255,0.1) ${getSpeedPercentage()}%, rgba(255,255,255,0.1) 100%)`,
              }}
            />
            <input
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              value={isPaused ? previousSpeed : Math.abs(timeSpeed)}
              onChange={(e) => {
                const newValue = Number(e.target.value);
                if (newValue > 0) {
                  handleSpeedChange(newValue);
                }
              }}
              className="relative w-full h-1 rounded-full appearance-none cursor-pointer bg-transparent
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-4
                         [&::-webkit-slider-thumb]:h-4
                         [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-gradient-to-br
                         [&::-webkit-slider-thumb]:from-gray-300
                         [&::-webkit-slider-thumb]:to-gray-400
                         [&::-webkit-slider-thumb]:shadow-lg
                         [&::-webkit-slider-thumb]:shadow-gray-500/50
                         [&::-webkit-slider-thumb]:cursor-grab
                         [&::-webkit-slider-thumb]:active:cursor-grabbing
                         [&::-webkit-slider-thumb]:hover:scale-125
                         [&::-webkit-slider-thumb]:transition-transform
                         [&::-webkit-slider-thumb]:-mt-[6px]
                         [&::-moz-range-thumb]:w-4
                         [&::-moz-range-thumb]:h-4
                         [&::-moz-range-thumb]:rounded-full
                         [&::-moz-range-thumb]:bg-gradient-to-br
                         [&::-moz-range-thumb]:from-gray-300
                         [&::-moz-range-thumb]:to-gray-400
                         [&::-moz-range-thumb]:border-0
                         [&::-moz-range-thumb]:shadow-lg
                         [&::-moz-range-thumb]:cursor-grab
                         [&::-webkit-slider-runnable-track]:h-1
                         [&::-webkit-slider-runnable-track]:rounded-full
                         [&::-webkit-slider-runnable-track]:bg-transparent
                         [&::-moz-range-track]:h-1
                         [&::-moz-range-track]:rounded-full
                         [&::-moz-range-track]:bg-white/10
                         [&::-moz-range-progress]:h-1
                         [&::-moz-range-progress]:rounded-full
                         [&::-moz-range-progress]:bg-gray-500"
            />
          </div>
          <span
            className={`text-xs font-bold min-w-[42px] text-right bg-gradient-to-r ${getSpeedColor()} bg-clip-text text-transparent`}
          >
            {(isPaused ? previousSpeed : timeSpeed).toFixed(1)}x
          </span>
        </div>
      </div>
    </div>
  );
}
