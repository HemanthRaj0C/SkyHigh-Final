'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { type EventType, type AstronomicalEvent } from '@/data/events';
import { 
  Info, 
  Layers, 
  Plus, 
  Minus, 
  Maximize, 
  Minimize, 
  MessageCircle, 
  X,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import ChatWidget from './ChatWidget';

const layerConfig = [
  { key: 'showUI' as const, label: 'User Interface', icon: '🖥️' },
  { key: 'showPlanets' as const, label: 'Planets', icon: '🪐' },
  { key: 'showAsteroids' as const, label: 'Asteroids', icon: '☄️' },
  { key: 'showDwarfPlanets' as const, label: 'Dwarf Planets', icon: '🌑' },
  { key: 'showOrbits' as const, label: 'Orbits', icon: '⭕' },
];

const eventTypeColors = {
  meteor_shower: 'border-blue-400/30 bg-blue-500/10',
  solar_storm: 'border-orange-400/30 bg-orange-500/10',
  eclipse: 'border-purple-400/30 bg-purple-500/10',
  iss_flyover: 'border-green-400/30 bg-green-500/10',
  planetary: 'border-yellow-400/30 bg-yellow-500/10',
};

const eventTypeLabels: Record<EventType, string> = {
  meteor_shower: 'Meteor Shower',
  solar_storm: 'Solar Storm',
  eclipse: 'Eclipse',
  iss_flyover: 'ISS Flyover',
  planetary: 'Planetary Event',
};

const severityColors = {
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-red-400',
};

export default function ControlPanel() {
  const { layers, toggleLayer, toggleChatWidget, selectedBody, setSelectedBody, showChatWidget } = useStore();
  const [activePanel, setActivePanel] = useState<'layers' | 'info' | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [filterType, setFilterType] = useState<EventType | 'all'>('all');
  const [events, setEvents] = useState<AstronomicalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events', {
          cache: 'no-store'
        });
        const data = await res.json();
        const eventsWithDates = (data.events || []).map((event: any) => ({
          ...event,
          startDate: new Date(event.startDate),
          endDate: event.endDate ? new Date(event.endDate) : undefined,
        }));
        const sortedEvents = eventsWithDates.sort((a: any, b: any) => 
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
        setEvents(sortedEvents);
      } catch (error) {
        console.error('Failed to fetch events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredEvents = filterType === 'all' 
    ? events 
    : events.filter(e => e.type === filterType);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const handleZoomIn = () => {
    // This will be connected to Three.js camera controls
    window.dispatchEvent(new CustomEvent('zoom', { detail: { direction: 'in' } }));
  };

  const handleZoomOut = () => {
    // This will be connected to Three.js camera controls
    window.dispatchEvent(new CustomEvent('zoom', { detail: { direction: 'out' } }));
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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

  return (
    <>
      {/* Help Button - shown at top-right when no planet is selected and chat is closed */}
      {!selectedBody && !showChatWidget && (
        <button
          onClick={() => setShowHelp(!showHelp)}
          className={`fixed top-4 right-4 z-30 w-12 h-12 rounded-full backdrop-blur-md transition-all shadow-lg hover:scale-110 flex items-center justify-center
                     ${showHelp
                       ? 'bg-blue-500/30 border-2 border-blue-400'
                       : 'bg-white/10 hover:bg-white/20 border border-white/20'
                     }`}
          title="Help & Shortcuts"
        >
          <HelpCircle className="w-6 h-6" />
        </button>
      )}

      {/* Help Panel - shown when help button is clicked */}
      {showHelp && !selectedBody && !showChatWidget && (
        <div className="fixed top-20 right-4 z-30
                        bg-black/40 backdrop-blur-xl
                        text-white rounded-2xl
                        border border-white/20
                        shadow-2xl
                        w-80 max-h-[70vh] overflow-hidden
                        flex flex-col
                        animate-slide-in-right">
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-500/20 to-blue-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                <h2 className="font-semibold text-lg">Help & Controls</h2>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="hover:bg-white/10 p-1 rounded-lg transition-colors"
                title="Close Help"
              >
                <X className="w-5 h-5" />
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
                  <span>Check Alerts for upcoming astronomical events and meteor showers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>Ask Cosmos AI anything about space, planets, or astronomy</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Close/Deselect Button - shown at top-right when planet is selected */}
      {selectedBody && (
        <button
          onClick={() => setSelectedBody(null)}
          className="fixed top-4 right-4 z-30 w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/30 backdrop-blur-md border-2 border-red-400 transition-all shadow-lg hover:scale-110 flex items-center justify-center"
          title="Close Planet Info"
        >
          <X className="w-7 h-7" />
        </button>
      )}

      <div className="fixed bottom-4 right-4 z-20 flex flex-row items-end gap-4">
        {/* Layers Panel */}
        {activePanel === 'layers' && !selectedBody && (
        <div className="bg-neutral-800 text-white rounded-lg border border-neutral-700 shadow-2xl w-56 max-h-[60vh] overflow-hidden flex flex-col transition-all duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-700 bg-neutral-900/50">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm">Layers</h3>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
            {layerConfig.map((layer) => (
              <label
                key={layer.key}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded cursor-pointer transition-all hover:bg-neutral-700/50"
              >
                <input 
                  type="checkbox" 
                  checked={layers[layer.key]} 
                  onChange={() => toggleLayer(layer.key)}
                  className="w-4 h-4 rounded border-2 border-neutral-500 bg-neutral-700 checked:bg-blue-500 checked:border-blue-500 cursor-pointer transition-colors"
                />
                <span className="text-sm text-neutral-200">{layer.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Info/Alerts Panel */}
      {activePanel === 'info' && !selectedBody && (
        <div className="bg-black/80 backdrop-blur-xl text-white rounded-2xl border border-white/20 shadow-2xl w-80 max-h-[60vh] overflow-hidden flex flex-col transition-all duration-200">
          <div className="p-3 border-b border-white/10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">Astronomical Alerts</h3>
              <button
                onClick={() => setActivePanel(null)}
                className="hover:bg-white/10 p-1 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2 py-1 rounded-full text-xs transition-all
                           ${filterType === 'all' 
                             ? 'bg-white/20 text-white' 
                             : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
              >
                All
              </button>
              {Object.keys(eventTypeLabels).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type as EventType)}
                  className={`px-2 py-1 rounded-full text-xs transition-all
                             ${filterType === type 
                               ? 'bg-white/20 text-white' 
                               : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                >
                  {eventTypeLabels[type as EventType].split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {loading ? (
              <div className="text-center text-white/40 py-4 text-xs">
                <p>Loading events...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center text-white/40 py-4 text-xs">
                <p>No events found</p>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className={`p-3 rounded-lg border transition-all
                             ${eventTypeColors[event.type]}`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{event.icon}</span>
                      <div>
                        <h4 className="font-semibold text-xs">{event.title}</h4>
                        <span className="text-xs text-white/60">
                          {eventTypeLabels[event.type]}
                        </span>
                      </div>
                    </div>
                    {event.severity && (
                      <span className={`text-xs font-medium ${severityColors[event.severity]}`}>
                        {event.severity.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/80 mb-2">
                    {event.description}
                  </p>
                  <div className="text-xs text-white/60">
                    {formatDate(event.startDate)}
                    {event.endDate && ` - ${formatDate(event.endDate)}`}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex flex-col gap-2">
        {/* Info Button - hidden when planet is selected */}
        {!selectedBody && (
          <button
            onClick={() => setActivePanel(activePanel === 'info' ? null : 'info')}
            className={`w-12 h-12 rounded-full backdrop-blur-md transition-all shadow-lg hover:scale-110 relative flex items-center justify-center
                       ${activePanel === 'info' 
                         ? 'bg-blue-500/30 border-2 border-blue-400' 
                         : 'bg-white/10 hover:bg-white/20 border border-white/20'
                       }`}
            title="Info/Alerts"
          >
            <Info className="w-6 h-6" />
            {events.length > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {events.length}
              </div>
            )}
          </button>
        )}

        {/* Layers Button - hidden when planet is selected */}
        {!selectedBody && (
          <button
            onClick={() => setActivePanel(activePanel === 'layers' ? null : 'layers')}
            className={`w-12 h-12 rounded-full backdrop-blur-md transition-all shadow-lg hover:scale-110 flex items-center justify-center
                       ${activePanel === 'layers' 
                         ? 'bg-blue-500/30 border-2 border-blue-400' 
                         : 'bg-white/10 hover:bg-white/20 border border-white/20'
                       }`}
            title="Layers"
          >
            <Layers className="w-6 h-6" />
          </button>
        )}

        {/* Divider - hidden when planet is selected */}
        {!selectedBody && <div className="h-px bg-white/20 my-1"></div>}

        {/* Zoom In Button - hidden when planet is selected */}
        {!selectedBody && (
          <button
            onClick={handleZoomIn}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all shadow-lg hover:scale-110 flex items-center justify-center"
            title="Zoom In"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}

        {/* Zoom Out Button - hidden when planet is selected */}
        {!selectedBody && (
          <button
            onClick={handleZoomOut}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all shadow-lg hover:scale-110 flex items-center justify-center"
            title="Zoom Out"
          >
            <Minus className="w-6 h-6" />
          </button>
        )}

        {/* Fullscreen Button - hidden when planet is selected */}
        {!selectedBody && (
          <button
            onClick={toggleFullscreen}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all shadow-lg hover:scale-110 flex items-center justify-center"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <Minimize className="w-6 h-6" />
            ) : (
              <Maximize className="w-6 h-6" />
            )}
          </button>
        )}

        {/* Divider - hidden when planet is selected */}
        {!selectedBody && <div className="h-px bg-white/20 my-1"></div>}

        {/* Chat Widget - hidden when planet is selected */}
        {!selectedBody && <ChatWidget />}
      </div>
      </div>
    </>
  );
}
