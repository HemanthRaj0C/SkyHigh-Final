'use client';

import { useStore } from '@/store/useStore';
import { useState } from 'react';

const timeSpeedOptions = [
  { value: 0, label: 'Pause', icon: '⏸️' },
  { value: 0.5, label: '0.5x', icon: '🐌' },
  { value: 1, label: 'Real', icon: '🌍' },
  { value: 5, label: '5x', icon: '⚡' },
  { value: 10, label: '10x', icon: '🚀' },
  { value: 50, label: '50x', icon: '⚡⚡' },
];

export default function TimeControls() {
  const { timeSpeed, setTimeSpeed } = useStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const currentSpeedLabel = timeSpeedOptions.find((opt) => opt.value === timeSpeed)?.label || `${timeSpeed}x`;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-20">
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-black/40 backdrop-blur-xl text-white px-4 py-2 rounded-full
                     border border-white/20 hover:bg-white/10
                     transition-all duration-300 shadow-lg
                     flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm font-medium">{currentSpeedLabel}</span>
        </button>
      ) : (
        <div className="bg-black/40 backdrop-blur-xl text-white rounded-2xl
                        border border-white/20 shadow-2xl
                        p-4 min-w-[400px]
                        animate-slide-in-up">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="font-semibold">Time Control</h3>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="hover:bg-white/10 p-1 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Speed Options */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {timeSpeedOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeSpeed(option.value)}
                className={`p-3 rounded-xl transition-all border
                           ${timeSpeed === option.value
                             ? 'bg-blue-500/20 border-blue-400/40 text-white'
                             : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                           }`}
              >
                <div className="text-xl mb-1">{option.icon}</div>
                <div className="text-xs font-medium">{option.label}</div>
              </button>
            ))}
          </div>

          {/* Custom Slider */}
          <div className="pt-2">
            <label className="text-xs text-white/60 mb-2 block">Custom Speed</label>
            <input
              type="range"
              min="0"
              max="100"
              value={timeSpeed}
              onChange={(e) => setTimeSpeed(Number(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-4
                         [&::-webkit-slider-thumb]:h-4
                         [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-blue-500
                         [&::-webkit-slider-thumb]:cursor-pointer
                         [&::-moz-range-thumb]:w-4
                         [&::-moz-range-thumb]:h-4
                         [&::-moz-range-thumb]:rounded-full
                         [&::-moz-range-thumb]:bg-blue-500
                         [&::-moz-range-thumb]:border-0
                         [&::-moz-range-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-xs text-white/40 mt-1">
              <span>0x</span>
              <span className="text-white/60 font-medium">{timeSpeed}x</span>
              <span>100x</span>
            </div>
          </div>

          <p className="text-xs text-white/50 mt-3 text-center">
            Control orbital animation speed
          </p>
        </div>
      )}
    </div>
  );
}
