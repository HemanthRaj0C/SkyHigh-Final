'use client';

import { useStore } from '@/store/useStore';
import { planetsDataDetailed } from '@/data/planetData';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { type AstronomicalEvent } from '@/data/events';

type Section = 'facts' | 'composition' | 'features' | 'apis';

// Component to show planet-specific events - Fetches directly from NASA/ESA APIs
function PlanetEventsSection({ planetName }: { planetName: string }) {
  const [events, setEvents] = useState<AstronomicalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const planetEvents: AstronomicalEvent[] = [];

        // Fetch planet-specific data based on planet name
        if (planetName === 'sun') {
          // NOAA Space Weather - Real-time solar X-ray flux
          try {
            const noaaRes = await fetch(
              'https://services.swpc.noaa.gov/json/goes/primary/xrays-7-day.json'
            );
            if (noaaRes.ok) {
              const xrayData = await noaaRes.json();
              const recentFlares = xrayData.slice(-1);
              
              if (recentFlares.length > 0) {
                const flare = recentFlares[0];
                const flareClass = parseFloat(flare.flux);
                let severity: 'low' | 'medium' | 'high' = 'low';
                let classType = 'B';
                
                if (flareClass >= 1e-4) {
                  classType = 'X';
                  severity = 'high';
                } else if (flareClass >= 1e-5) {
                  classType = 'M';
                  severity = 'medium';
                } else if (flareClass >= 1e-6) {
                  classType = 'C';
                  severity = 'low';
                }
                
                planetEvents.push({
                  id: `solar-xray-${flare.time_tag}`,
                  type: 'solar_storm',
                  title: `Solar ${classType}-Class X-Ray Activity`,
                  description: `Current X-ray flux: ${flare.flux.toExponential(2)} W/m². Monitored by NOAA GOES satellites.`,
                  startDate: new Date(flare.time_tag),
                  visibility: 'Global',
                  severity,
                  icon: '☀️',
                });
              }
            }
          } catch (err) {
            console.error('Failed to fetch NOAA solar data:', err);
          }

          // Solar wind speed from NOAA
          try {
            const solarWindRes = await fetch(
              'https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json'
            );
            if (solarWindRes.ok) {
              const windData = await solarWindRes.json();
              const latest = windData[windData.length - 1];
              const speed = parseFloat(latest.wind_speed);
              
              planetEvents.push({
                id: `solar-wind-${latest.time_tag}`,
                type: 'solar_storm',
                title: 'Solar Wind Speed',
                description: `Current solar wind: ${speed.toFixed(0)} km/s. ${speed > 500 ? 'High speed stream detected!' : 'Normal conditions.'}`,
                startDate: new Date(latest.time_tag),
                visibility: 'Global',
                severity: speed > 500 ? 'medium' : 'low',
                icon: '🌬️',
              });
            }
          } catch (err) {
            console.error('Failed to fetch solar wind data:', err);
          }
        }

        if (planetName === 'earth') {
          // NASA EONET - Earth observation events
          try {
            const eonetRes = await fetch(
              'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=5'
            );
            if (eonetRes.ok) {
              const eonetData = await eonetRes.json();
              eonetData.events.forEach((event: any) => {
                const category = event.categories[0]?.title || 'Natural Event';
                const coords = event.geometry[0]?.coordinates || [];
                const location = coords.length === 2 
                  ? `${coords[1].toFixed(2)}°N, ${coords[0].toFixed(2)}°E`
                  : 'Global';

                planetEvents.push({
                  id: `eonet-${event.id}`,
                  type: 'planetary',
                  title: event.title,
                  description: `${category} detected by NASA EONET. Location: ${location}`,
                  startDate: new Date(event.geometry[0]?.date || new Date()),
                  visibility: 'Earth',
                  severity: category.includes('Volcano') || category.includes('Storm') ? 'high' : 'medium',
                  icon: category.includes('Volcano') ? '🌋' : category.includes('Storm') ? '🌪️' : category.includes('Fire') ? '🔥' : '🌍',
                });
              });
            }
          } catch (err) {
            console.error('Failed to fetch EONET events:', err);
          }

          // ISS tracking
          try {
            const issRes = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
            if (issRes.ok) {
              const issData = await issRes.json();
              const lat = parseFloat(issData.latitude).toFixed(2);
              const lon = parseFloat(issData.longitude).toFixed(2);
              const altitude = parseFloat(issData.altitude).toFixed(0);
              const velocity = parseFloat(issData.velocity).toFixed(0);

              planetEvents.push({
                id: 'iss-live',
                type: 'iss_flyover',
                title: 'ISS Live Position',
                description: `Lat ${lat}°, Lon ${lon}° • Alt: ${altitude} km • Speed: ${velocity} km/h`,
                startDate: new Date(issData.timestamp * 1000),
                visibility: 'Orbiting Earth',
                severity: 'low',
                icon: '🛰️',
              });
            }
          } catch (err) {
            console.error('Failed to fetch ISS data:', err);
          }
        }

        if (planetName === 'mars') {
          // NASA Mars Rover Photos - Latest from Curiosity
          try {
            const roverRes = await fetch(
              `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/latest_photos?api_key=${process.env.NEXT_PUBLIC_NASA_API_KEY || 'DEMO_KEY'}`
            );
            if (roverRes.ok) {
              const roverData = await roverRes.json();
              if (roverData.latest_photos?.length > 0) {
                const photo = roverData.latest_photos[0];
                
                planetEvents.push({
                  id: `mars-rover-${photo.id}`,
                  type: 'planetary',
                  title: 'Latest Mars Rover Image',
                  description: `Sol ${photo.sol}: Curiosity captured new images using ${photo.camera.full_name}. Earth date: ${photo.earth_date}`,
                  startDate: new Date(photo.earth_date),
                  visibility: 'Mars Surface',
                  severity: 'low',
                  icon: '🔴',
                });
              }
            }
          } catch (err) {
            console.error('Failed to fetch Mars rover data:', err);
          }

          // Mars Weather from NASA InSight (if available)
          try {
            const marsWeatherRes = await fetch(
              `https://api.nasa.gov/insight_weather/?api_key=${process.env.NEXT_PUBLIC_NASA_API_KEY || 'DEMO_KEY'}&feedtype=json&ver=1.0`
            );
            if (marsWeatherRes.ok) {
              const weatherData = await marsWeatherRes.json();
              const sols = weatherData.sol_keys || [];
              
              if (sols.length > 0) {
                const latestSol = weatherData[sols[sols.length - 1]];
                
                planetEvents.push({
                  id: `mars-weather-${sols[sols.length - 1]}`,
                  type: 'planetary',
                  title: 'Mars Weather Update',
                  description: `Sol ${sols[sols.length - 1]}: Avg temp ${latestSol.AT?.av || 'N/A'}°C. Data from NASA InSight lander.`,
                  startDate: new Date(latestSol.First_UTC),
                  visibility: 'Mars Surface',
                  severity: 'low',
                  icon: '🌡️',
                });
              }
            }
          } catch (err) {
            console.error('Failed to fetch Mars weather:', err);
          }
        }

        if (planetName === 'jupiter') {
          planetEvents.push({
            id: 'jupiter-observation',
            type: 'planetary',
            title: 'Jupiter Observation Window',
            description: 'Jupiter is currently visible in the night sky. Best viewing with telescope to see the Great Red Spot and Galilean moons.',
            startDate: new Date(),
            visibility: 'Global',
            severity: 'low',
            icon: '🪐',
          });
        }

        if (planetName === 'saturn') {
          planetEvents.push({
            id: 'saturn-observation',
            type: 'planetary',
            title: 'Saturn Ring Viewing',
            description: 'Saturn\'s magnificent rings are visible through telescopes. Current ring tilt provides excellent viewing conditions.',
            startDate: new Date(),
            visibility: 'Global',
            severity: 'low',
            icon: '🪐',
          });
        }

        setEvents(planetEvents);
      } catch (error) {
        console.error('Failed to fetch planet events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    // Refresh every 5 minutes
    const interval = setInterval(fetchEvents, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [planetName]);

  if (loading) {
    return (
      <div className="border border-white/10 rounded-xl p-4 bg-white/5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔔</span>
          <h3 className="font-semibold text-lg">Live Events & Alerts</h3>
        </div>
        <p className="text-sm text-white/60 mt-2">Loading events...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return null; // Don't show section if no events
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔔</span>
          <h3 className="font-semibold text-lg">Live Events & Alerts</h3>
          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
            {events.length}
          </span>
        </div>
        <svg
          className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {expanded && (
        <div className="p-4 pt-0 space-y-3 animate-fade-in">
          {events.map((event) => (
            <div
              key={event.id}
              className="p-3 rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/10 
                         border border-orange-400/20"
            >
              <div className="flex items-start gap-3 mb-2">
                <span className="text-xl">{event.icon}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-white">{event.title}</h4>
                  <p className="text-xs text-white/70 mt-1">{event.description}</p>
                </div>
              </div>
              <div className="text-xs text-white/60 flex items-center gap-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(event.startDate)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PlanetInfoPanel() {
  const { selectedBody, showInfoPanel, toggleInfoPanel } = useStore();
  const [expandedSection, setExpandedSection] = useState<Section | null>('facts');

  if (!showInfoPanel || !selectedBody) return null;

  const planetData = planetsDataDetailed[selectedBody];

  if (!planetData) return null;

  const toggleSection = (section: Section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sectionIcon = {
    facts: '📊',
    composition: '🧪',
    features: '⭐',
    apis: '🔌',
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 z-10 w-[480px] 
                    bg-black/40 backdrop-blur-xl text-white
                    border-l border-white/20 shadow-2xl
                    flex flex-col overflow-hidden
                    animate-slide-in-right">
      {/* Header */}
      <div className="relative p-6 border-b border-white/10">
        <button
          onClick={toggleInfoPanel}
          className="absolute top-4 right-4 hover:bg-white/10 p-2 rounded-lg transition-colors"
          title="Close Info Panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-3xl font-bold mb-2">{planetData.displayName}</h2>
        <p className="text-sm text-white/70">{planetData.description}</p>
      </div>

      {/* Planet Image Preview */}
      <div className="relative h-64 bg-gradient-to-b from-transparent to-black/50 border-b border-white/10">
        <Image
          src={planetData.image}
          alt={planetData.displayName}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {/* Quick Facts Section */}
        <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
          <button
            onClick={() => toggleSection('facts')}
            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{sectionIcon.facts}</span>
              <h3 className="font-semibold text-lg">Quick Facts</h3>
            </div>
            <svg
              className={`w-5 h-5 transition-transform ${expandedSection === 'facts' ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSection === 'facts' && (
            <div className="p-4 pt-0 space-y-3 animate-fade-in">
              {Object.entries(planetData.quickFacts).map(([key, value]) => (
                <div key={key} className="flex justify-between items-start">
                  <span className="text-white/60 text-sm capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </span>
                  <span className="text-white font-medium text-sm text-right">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Composition & Atmosphere Section */}
        <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
          <button
            onClick={() => toggleSection('composition')}
            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{sectionIcon.composition}</span>
              <h3 className="font-semibold text-lg">Composition & Atmosphere</h3>
            </div>
            <svg
              className={`w-5 h-5 transition-transform ${expandedSection === 'composition' ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSection === 'composition' && (
            <div className="p-4 pt-0 space-y-3 animate-fade-in">
              <p className="text-sm text-white/80">{planetData.composition.summary}</p>
              
              {planetData.composition.atmosphere && (
                <div className="mt-3">
                  <h4 className="text-xs text-white/60 mb-2 uppercase font-semibold">Atmospheric Composition</h4>
                  <ul className="space-y-1.5">
                    {planetData.composition.atmosphere.map((gas, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                        <span>{gas}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notable Features Section */}
        <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
          <button
            onClick={() => toggleSection('features')}
            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{sectionIcon.features}</span>
              <h3 className="font-semibold text-lg">Notable Features</h3>
            </div>
            <svg
              className={`w-5 h-5 transition-transform ${expandedSection === 'features' ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSection === 'features' && (
            <div className="p-4 pt-0 animate-fade-in">
              <ul className="space-y-2.5">
                {planetData.notableFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="text-yellow-400 mt-0.5">★</span>
                    <span className="text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Live Events Section - Planet-specific alerts */}
        <PlanetEventsSection planetName={selectedBody} />

        {/* APIs & Data Sources Section */}
        <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
          <button
            onClick={() => toggleSection('apis')}
            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{sectionIcon.apis}</span>
              <h3 className="font-semibold text-lg">APIs & Data Sources</h3>
            </div>
            <svg
              className={`w-5 h-5 transition-transform ${expandedSection === 'apis' ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSection === 'apis' && (
            <div className="p-4 pt-0 space-y-3 animate-fade-in">
              {planetData.apis.map((api, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 
                             border border-blue-400/20 hover:border-blue-400/40 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm text-blue-300">{api.name}</h4>
                    <a
                      href={api.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-white/60 hover:text-white transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                  <p className="text-xs text-white/70">{api.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-white/10 text-xs text-white/50 text-center">
        Click on another celestial body to view its information
      </div>
    </div>
  );
}
