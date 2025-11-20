'use client';

import { useStore } from '@/store/useStore';

const layerConfig = [
  { key: 'showUI' as const, label: 'User Interface', icon: '🖥️' },
  { key: 'showPlanets' as const, label: 'Planets', icon: '🪐' },
  { key: 'showAsteroids' as const, label: 'Asteroids', icon: '☄️' },
  { key: 'showComets' as const, label: 'Comets', icon: '☄️' },
  { key: 'showDwarfPlanets' as const, label: 'Dwarf Planets', icon: '🌑' },
  { key: 'showConstellations' as const, label: 'Constellations', icon: '✨' },
  { key: 'showSpacecraft' as const, label: 'Spacecraft', icon: '🛸' },
  { key: 'showTrails' as const, label: 'Trails', icon: '〰️' },
  { key: 'showOrbits' as const, label: 'Orbits', icon: '⭕' },
  { key: 'showLabels' as const, label: 'Labels', icon: '🏷️' },
  { key: 'showIcons' as const, label: 'Icons', icon: '📍' },
  { key: 'showSatellites' as const, label: 'Satellites', icon: '🛰️' },
];

export default function LayersPanel() {
  const { showLayersPanel, toggleLayersPanel, layers, toggleLayer } = useStore();

  if (!showLayersPanel) {
    // Show collapsed button when panel is hidden
    return (
      <button
        onClick={toggleLayersPanel}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-20
                   bg-white/10 hover:bg-white/20 backdrop-blur-md
                   text-white p-3 rounded-r-xl
                   border border-l-0 border-white/20
                   transition-all duration-300
                   shadow-lg hover:shadow-xl
                   flex flex-col items-center gap-2"
        title="Toggle Layers (L)"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span className="text-xs writing-mode-vertical">Layers</span>
      </button>
    );
  }

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-20
                    bg-black/40 backdrop-blur-xl
                    text-white rounded-2xl
                    border border-white/20
                    shadow-2xl
                    w-64 max-h-[80vh] overflow-hidden
                    flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <h2 className="font-semibold text-lg">Layers</h2>
        </div>
        <button
          onClick={toggleLayersPanel}
          className="hover:bg-white/10 p-1 rounded-lg transition-colors"
          title="Close (L)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {layerConfig.map((layer) => (
          <button
            key={layer.key}
            onClick={() => toggleLayer(layer.key)}
            className={`w-full flex items-center justify-between p-3 rounded-xl
                       transition-all duration-200
                       ${layers[layer.key]
                         ? 'bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30'
                         : 'bg-white/5 hover:bg-white/10 border border-transparent'
                       }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{layer.icon}</span>
              <span className="text-sm font-medium">{layer.label}</span>
            </div>
            
            {/* Toggle Switch */}
            <div className={`relative w-11 h-6 rounded-full transition-colors
                           ${layers[layer.key] ? 'bg-blue-500' : 'bg-white/20'}`}>
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full
                             transition-transform duration-200
                             ${layers[layer.key] ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </button>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-white/10 text-xs text-white/60 text-center">
        Press <kbd className="px-2 py-1 bg-white/10 rounded">L</kbd> to toggle
      </div>
    </div>
  );
}
