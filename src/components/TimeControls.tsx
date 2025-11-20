'use client';

import { useStore } from '@/store/useStore';
import { useState } from 'react';

const speedPresets = [
  { value: 0, label: 'Pause', icon: '⏸' },
  { value: 0.5, label: 'Slow', icon: '🐌' },
  { value: 1, label: 'Real', icon: '🌍' },
  { value: 5, label: 'Fast', icon: '⚡' },
  { value: 10, label: 'Faster', icon: '🚀' },
];

export default function TimeControls() {
  const { timeSpeed, setTimeSpeed } = useStore();
  const [expanded, setExpanded] = useState(false);

  const currentPreset = speedPresets.find(p => p.value === timeSpeed);
  const speedLabel = currentPreset ? currentPreset.label : `${timeSpeed}x`;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
      {expanded ? (
        <div className="bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 
                        backdrop-blur-xl border border-white/20 rounded-2xl p-5 
                        shadow-2xl shadow-black/50 min-w-[500px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 
                              flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Time Speed</h3>
                <p className="text-white/50 text-xs">Control orbital animation</p>
              </div>
            </div>
            <button
              onClick={() => setExpanded(false)}
              className="text-white/60 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Speed Presets */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {speedPresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setTimeSpeed(preset.value)}
                className={`p-3 rounded-xl transition-all duration-200 border-2
                           ${timeSpeed === preset.value
                             ? 'bg-blue-500/20 border-blue-400 scale-105 shadow-lg shadow-blue-500/20'
                             : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                           }`}
              >
                <div className="text-2xl mb-1">{preset.icon}</div>
                <div className="text-white text-xs font-medium">{preset.label}</div>
              </button>
            ))}
          </div>

          {/* Custom Speed Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-white/70 text-sm font-medium">Custom Speed</label>
              <span className="text-blue-400 font-bold text-sm">{timeSpeed}x</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={timeSpeed}
              onChange={(e) => setTimeSpeed(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-4
                         [&::-webkit-slider-thumb]:h-4
                         [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-blue-500
                         [&::-webkit-slider-thumb]:shadow-lg
                         [&::-webkit-slider-thumb]:shadow-blue-500/50
                         [&::-webkit-slider-thumb]:cursor-pointer
                         [&::-moz-range-thumb]:w-4
                         [&::-moz-range-thumb]:h-4
                         [&::-moz-range-thumb]:rounded-full
                         [&::-moz-range-thumb]:bg-blue-500
                         [&::-moz-range-thumb]:border-0
                         [&::-moz-range-thumb]:shadow-lg
                         [&::-moz-range-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-xs text-white/40">
              <span>Paused</span>
              <span>Maximum Speed</span>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          className="group bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 
                     backdrop-blur-xl border border-white/20 rounded-full px-6 py-3
                     shadow-2xl shadow-black/50 hover:shadow-blue-500/20
                     transition-all duration-300 hover:scale-105
                     flex items-center gap-4"
        >
          {/* Speed Icon */}
          <div className="text-2xl">{currentPreset?.icon || '⚡'}</div>
          
          {/* Speed Info */}
          <div className="flex flex-col items-start">
            <span className="text-white/50 text-xs font-medium">Speed</span>
            <span className="text-white font-bold text-sm">{speedLabel}</span>
          </div>

          {/* Expand Icon */}
          <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-white/20 
                          flex items-center justify-center transition-all">
            <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
      )}
    </div>
  );
}
