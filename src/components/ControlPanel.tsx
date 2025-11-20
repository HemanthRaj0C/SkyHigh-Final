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
  ChevronRight
} from 'lucide-react';

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
  const { layers, toggleLayer } = useStore();
  const [activePanel, setActivePanel] = useState<'layers' | 'info' | null>(null);
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

  return (
    <div className="fixed bottom-4 right-4 z-20 flex flex-row items-end gap-4">
      {/* Layers Panel */}
      {activePanel === 'layers' && (
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
      {activePanel === 'info' && (
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
        {/* Info Button */}
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

        {/* Layers Button */}
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

        {/* Divider */}
        <div className="h-px bg-white/20 my-1"></div>

        {/* Zoom In Button */}
        <button
          onClick={handleZoomIn}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all shadow-lg hover:scale-110 flex items-center justify-center"
          title="Zoom In"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Zoom Out Button */}
        <button
          onClick={handleZoomOut}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all shadow-lg hover:scale-110 flex items-center justify-center"
          title="Zoom Out"
        >
          <Minus className="w-6 h-6" />
        </button>

        {/* Fullscreen Button */}
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

        {/* Divider */}
        <div className="h-px bg-white/20 my-1"></div>

        {/* Chat Button */}
        <button
          onClick={() => useStore.getState().toggleChatWidget()}
          className="w-12 h-12 rounded-full bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 backdrop-blur-md transition-all shadow-lg hover:scale-110 border border-white/20 flex items-center justify-center"
          title="Chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
