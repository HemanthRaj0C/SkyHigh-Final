'use client';

import { useStore } from '@/store/useStore';
import { type EventType, type AstronomicalEvent } from '@/data/events';
import { useState, useEffect } from 'react';

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

export default function AlertsPanel() {
  const { showAlertsPanel, toggleAlertsPanel } = useStore();
  const [filterType, setFilterType] = useState<EventType | 'all'>('all');
  const [events, setEvents] = useState<AstronomicalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events');
        const data = await res.json();
        // Convert ISO strings back to Date objects
        const eventsWithDates = (data.events || []).map((event: any) => ({
          ...event,
          startDate: new Date(event.startDate),
          endDate: event.endDate ? new Date(event.endDate) : undefined,
        }));
        setEvents(eventsWithDates);
      } catch (error) {
        console.error('Failed to fetch events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    // Refresh every 10 minutes
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

  if (!showAlertsPanel) {
    return (
      <button
        onClick={toggleAlertsPanel}
        className="fixed right-4 top-4 z-20
                   bg-white/10 hover:bg-white/20 backdrop-blur-md
                   text-white px-4 py-2 rounded-xl
                   border border-white/20
                   transition-all duration-300
                   shadow-lg hover:shadow-xl
                   flex items-center gap-2"
        title="Toggle Alerts (I)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span className="text-sm font-medium">Alerts</span>
        {events.length > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
            {events.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed right-4 top-4 z-20
                    bg-black/40 backdrop-blur-xl
                    text-white rounded-2xl
                    border border-white/20
                    shadow-2xl
                    w-96 max-h-[85vh] overflow-hidden
                    flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h2 className="font-semibold text-lg">Astronomical Alerts</h2>
          </div>
          <button
            onClick={toggleAlertsPanel}
            className="hover:bg-white/10 p-1 rounded-lg transition-colors"
            title="Close (I)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all
                       ${filterType === 'all' 
                         ? 'bg-white/20 text-white' 
                         : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            All ({events.length})
          </button>
          {Object.keys(eventTypeLabels).map((type) => {
            const count = events.filter(e => e.type === type).length;
            return (
              <button
                key={type}
                onClick={() => setFilterType(type as EventType)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all
                           ${filterType === type 
                             ? 'bg-white/20 text-white' 
                             : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
              >
                {eventTypeLabels[type as EventType]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {loading ? (
          <div className="text-center text-white/40 py-8">
            <p>Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center text-white/40 py-8">
            <p>No events found</p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className={`p-4 rounded-xl border transition-all hover:scale-[1.02]
                         ${eventTypeColors[event.type]}`}
            >
              {/* Event Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{event.icon}</span>
                  <div>
                    <h3 className="font-semibold text-sm">{event.title}</h3>
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

              {/* Event Description */}
              <p className="text-sm text-white/80 mb-3">
                {event.description}
              </p>

              {/* Event Details */}
              <div className="space-y-1 text-xs text-white/60">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>
                    {formatDate(event.startDate)}
                    {event.endDate && ` - ${formatDate(event.endDate)}`}
                  </span>
                </div>
                {event.visibility && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{event.visibility}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 text-xs text-white/60 text-center">
        Press <kbd className="px-2 py-1 bg-white/10 rounded">I</kbd> to toggle
      </div>
    </div>
  );
}
