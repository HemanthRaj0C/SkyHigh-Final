'use client';

import { useState } from 'react';

export default function HelpPanel() {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { key: 'L', description: 'Toggle Layers Panel' },
    { key: 'I', description: 'Toggle Alerts Panel' },
    { key: 'P', description: 'Toggle Planet Info Panel' },
    { key: 'F', description: 'Toggle Fullscreen' },
    { key: 'Esc', description: 'Close Panels / Deselect' },
    { key: 'Mouse Drag', description: 'Orbit Camera' },
    { key: 'Mouse Scroll', description: 'Zoom In/Out' },
    { key: 'Click Planet', description: 'Focus & View Info' },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-20
                   bg-white/10 hover:bg-white/20 backdrop-blur-md
                   text-white p-2.5 rounded-full
                   border border-white/20
                   transition-all duration-300
                   shadow-lg hover:shadow-xl"
        title="Help & Shortcuts"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-20
                    bg-black/40 backdrop-blur-xl
                    text-white rounded-2xl
                    border border-white/20
                    shadow-2xl
                    w-80 max-h-[85vh] overflow-hidden
                    flex flex-col
                    animate-slide-in-right">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-500/20 to-blue-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="font-semibold text-lg">Help & Controls</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/10 p-1 rounded-lg transition-colors"
            title="Close Help"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Keyboard Shortcuts */}
        <div>
          <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
            <span>⌨️</span> Keyboard Shortcuts
          </h3>
          <div className="space-y-2">
            {shortcuts.map((shortcut, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-lg bg-white/5
                           hover:bg-white/10 transition-colors"
              >
                <span className="text-sm text-white/70">{shortcut.description}</span>
                <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono border border-white/20">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        <div>
          <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
            <span>💡</span> Quick Tips
          </h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Click any planet or the Sun to focus and view detailed information</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Use the Time Control to speed up or pause planetary orbits</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Toggle layers to customize your view (planets, asteroids, comets, etc.)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Check Alerts for upcoming astronomical events and meteor showers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Ask Cosmos AI anything about space, planets, or astronomy</span>
            </li>
          </ul>
        </div>

        {/* Features */}
        <div>
          <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
            <span>🌟</span> Features
          </h3>
          <div className="space-y-2 text-sm">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-400/20">
              <div className="font-semibold text-blue-300 mb-1">Interactive 3D Solar System</div>
              <p className="text-white/60 text-xs">Explore planets with realistic orbits and textures</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-400/20">
              <div className="font-semibold text-green-300 mb-1">Real-time Events</div>
              <p className="text-white/60 text-xs">Track meteor showers, eclipses, and space weather</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20">
              <div className="font-semibold text-purple-300 mb-1">AI Assistant</div>
              <p className="text-white/60 text-xs">Ask Cosmos AI powered by Google Gemini</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 text-center">
        <p className="text-xs text-white/50">
          Press <kbd className="px-2 py-0.5 bg-white/10 rounded">?</kbd> anytime for help
        </p>
      </div>
    </div>
  );
}
