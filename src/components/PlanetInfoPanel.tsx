'use client';

import { useStore } from '@/store/useStore';
import { planetsDataDetailed } from '@/data/planetData';
import { useState, useEffect } from 'react';
import { type AstronomicalEvent } from '@/data/events';
import { 
  Circle, 
  Sun, 
  RotateCw, 
  Globe, 
  Moon, 
  Weight, 
  ArrowDown, 
  Thermometer,
  type LucideIcon,
  BarChart3,
  Beaker,
  Sparkles,
  Plug,
  Bell,
  Calendar,
  X,
  ChevronDown,
  ExternalLink
} from 'lucide-react';

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
                  icon: 'sun',
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
                icon: 'wind',
              });
            }
          } catch (err) {
            console.error('Failed to fetch solar wind data:', err);
          }

          // DONKI - Space Weather Database
          try {
            const donkiRes = await fetch(
              `https://api.nasa.gov/DONKI/notifications?startDate=${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}&api_key=${process.env.NEXT_PUBLIC_NASA_API_KEY || 'DEMO_KEY'}`
            );
            if (donkiRes.ok) {
              const donkiData = await donkiRes.json();
              if (donkiData.length > 0) {
                const latestNotification = donkiData[0];
                planetEvents.push({
                  id: `donki-${latestNotification.messageID}`,
                  type: 'solar_storm',
                  title: latestNotification.messageType || 'Space Weather Alert',
                  description: `${latestNotification.messageBody?.substring(0, 150)}... Source: NASA DONKI`,
                  startDate: new Date(latestNotification.messageIssueTime),
                  visibility: 'Global',
                  severity: 'medium',
                  icon: 'sun',
                });
              }
            }
          } catch (err) {
            console.error('Failed to fetch DONKI data:', err);
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
                  icon: category.includes('Volcano') ? 'volcano' : category.includes('Storm') ? 'cloud-lightning' : category.includes('Fire') ? 'flame' : 'globe',
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
                icon: 'satellite',
              });
            }
          } catch (err) {
            console.error('Failed to fetch ISS data:', err);
          }

          // EPIC - Earth Polychromatic Imaging Camera
          try {
            const epicRes = await fetch(
              `https://api.nasa.gov/EPIC/api/natural?api_key=${process.env.NEXT_PUBLIC_NASA_API_KEY || 'DEMO_KEY'}`
            );
            if (epicRes.ok) {
              const epicData = await epicRes.json();
              if (epicData.length > 0) {
                const latest = epicData[0];
                planetEvents.push({
                  id: `epic-${latest.identifier}`,
                  type: 'planetary',
                  title: 'Latest Earth Image from DSCOVR',
                  description: `Full-disk Earth imagery captured from L1 Lagrange point. Coordinates: ${latest.centroid_coordinates.lat.toFixed(2)}°, ${latest.centroid_coordinates.lon.toFixed(2)}°`,
                  startDate: new Date(latest.date),
                  visibility: 'From Space',
                  severity: 'low',
                  icon: 'globe',
                });
              }
            }
          } catch (err) {
            console.error('Failed to fetch EPIC data:', err);
          }
        }

        if (planetName === 'venus') {
          // Venus observation and data
          try {
            planetEvents.push({
              id: 'venus-trek',
              type: 'planetary',
              title: 'Venus Surface Mapping Available',
              description: 'High-resolution Venus surface imagery and topographic data accessible through NASA\'s Trek WMTS service for detailed exploration.',
              startDate: new Date(),
              visibility: 'Global',
              severity: 'low',
              icon: 'globe',
            });
          } catch (err) {
            console.error('Failed to add Venus data:', err);
          }

          // Venus observation window
          planetEvents.push({
            id: 'venus-observation',
            type: 'planetary',
            title: 'Venus Visibility',
            description: 'Venus is visible as the "Evening Star" or "Morning Star". Its phases can be observed through telescopes, similar to Earth\'s Moon.',
            startDate: new Date(),
            visibility: 'Global',
            severity: 'low',
            icon: 'telescope',
          });
        }

        if (planetName === 'mars') {
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
                  icon: 'thermometer',
                });
              }
            }
          } catch (err) {
            console.error('Failed to fetch Mars weather:', err);
          }
        }

        if (planetName === 'jupiter') {
          // Jupiter observation
          planetEvents.push({
            id: 'jupiter-observation',
            type: 'planetary',
            title: 'Jupiter Observation Window',
            description: 'Jupiter is currently visible in the night sky. Best viewing with telescope to see the Great Red Spot and Galilean moons.',
            startDate: new Date(),
            visibility: 'Global',
            severity: 'low',
            icon: 'telescope',
          });

          // Near-Earth Objects for context
          try {
            const today = new Date().toISOString().split('T')[0];
            const neoRes = await fetch(
              `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${process.env.NEXT_PUBLIC_NASA_API_KEY || 'DEMO_KEY'}`
            );
            if (neoRes.ok) {
              const neoData = await neoRes.json();
              const nearEarthObjects = neoData.near_earth_objects?.[today] || [];
              if (nearEarthObjects.length > 0) {
                const closest = nearEarthObjects[0];
                planetEvents.push({
                  id: `neo-${closest.id}`,
                  type: 'planetary',
                  title: 'Near-Earth Asteroid Detected',
                  description: `${closest.name} passing at ${parseFloat(closest.close_approach_data[0].miss_distance.kilometers).toFixed(0)} km. Diameter: ~${closest.estimated_diameter.meters.estimated_diameter_max.toFixed(0)}m`,
                  startDate: new Date(closest.close_approach_data[0].close_approach_date_full),
                  visibility: 'Near Earth',
                  severity: 'low',
                  icon: 'circle',
                });
              }
            }
          } catch (err) {
            console.error('Failed to fetch NEO data:', err);
          }
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
            icon: 'telescope',
          });

          // Titan moon observation
          planetEvents.push({
            id: 'saturn-titan',
            type: 'planetary',
            title: 'Titan - Saturn\'s Largest Moon',
            description: 'Titan, Saturn\'s largest moon, has a thick atmosphere and liquid methane lakes. It\'s one of the most Earth-like worlds in our solar system.',
            startDate: new Date(),
            visibility: 'Saturn System',
            severity: 'low',
            icon: 'moon',
          });
        }

        // APOD - Astronomy Picture of the Day (for all planets)
        try {
          const apodRes = await fetch(
            `https://api.nasa.gov/planetary/apod?api_key=${process.env.NEXT_PUBLIC_NASA_API_KEY || 'DEMO_KEY'}`
          );
          if (apodRes.ok) {
            const apodData = await apodRes.json();
            if (apodData.title) {
              planetEvents.push({
                id: `apod-${apodData.date}`,
                type: 'planetary',
                title: `APOD: ${apodData.title}`,
                description: `${apodData.explanation.substring(0, 120)}...`,
                startDate: new Date(apodData.date),
                visibility: 'Astronomy Picture of the Day',
                severity: 'low',
                icon: 'sparkles',
              });
            }
          }
        } catch (err) {
          console.error('Failed to fetch APOD:', err);
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
      <div className="border border-white/10 rounded-lg p-3.5 bg-gradient-to-br from-slate-800/40 to-slate-900/60">
        <div className="flex items-center gap-2.5">
          <Bell className="w-5 h-5" />
          <h3 className="font-semibold text-base">Live Events & Alerts</h3>
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

  const getEventIcon = (iconName: string) => {
    const iconMap: Record<string, any> = {
      sun: Sun,
      wind: RotateCw,
      volcano: Thermometer,
      'cloud-lightning': Sparkles,
      flame: Sparkles,
      globe: Globe,
      satellite: Circle,
      camera: Circle,
      thermometer: Thermometer,
      telescope: Circle,
      moon: Moon,
      sparkles: Sparkles,
      circle: Circle,
    };
    const IconComponent = iconMap[iconName] || Bell;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-gradient-to-br from-slate-800/40 to-slate-900/60">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Bell className="w-5 h-5" />
          <h3 className="font-semibold text-base">Live Events & Alerts</h3>
          <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
            {events.length}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      
      {expanded && (
        <div className="px-3.5 pb-3.5 pt-0 space-y-2.5 animate-fade-in">
          {events.map((event) => (
            <div
              key={event.id}
              className="p-2.5 rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/10 
                         border border-orange-400/20"
            >
              <div className="flex items-start gap-2.5 mb-1.5">
                {getEventIcon(event.icon)}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-white">{event.title}</h4>
                  <p className="text-xs text-white/70 mt-1 leading-relaxed">{event.description}</p>
                </div>
              </div>
              <div className="text-xs text-white/50 flex items-center gap-1.5 ml-7">
                <Calendar className="w-3 h-3" />
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

  const sectionIcons: Record<Section, LucideIcon> = {
    facts: BarChart3,
    composition: Beaker,
    features: Sparkles,
    apis: Plug,
  };

  // Get icon for each fact type
  const getFactIcon = (key: string) => {
    const iconMap: Record<string, LucideIcon> = {
      diameter: Circle,
      distanceFromSun: Sun,
      orbitalPeriod: RotateCw,
      rotationPeriod: Globe,
      moons: Moon,
      type: Circle,
      mass: Weight,
      gravity: ArrowDown,
      temperature: Thermometer,
    };
    const IconComponent = iconMap[key] || Circle;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 z-10 w-[380px] bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-blue-950/95 backdrop-blur-xl text-white border-l border-blue-400/20 shadow-2xl flex flex-col overflow-hidden animate-slide-in-right">
      {/* Header */}
      <div className="relative border-b border-white/10">
        <div className="p-5 pr-14">
          <br />
          <h2 className="text-2xl font-bold mb-1.5">{planetData.displayName}</h2>
          <br />
          <p className="text-xs text-white/60">{planetData.description}</p>
        </div>
        <button
          onClick={toggleInfoPanel}
          className="absolute top-5 right-5 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Quick Facts Section */}
        <div className="border border-white/10 rounded-lg overflow-hidden bg-gradient-to-br from-slate-800/40 to-slate-900/60 my-10">
          <button
            onClick={() => toggleSection('facts')}
            className="w-full flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              {(() => {
                const IconComponent = sectionIcons.facts;
                return <IconComponent className="w-5 h-5" />;
              })()}
              <h3 className="font-semibold text-base">Quick Facts</h3>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSection === 'facts' ? 'rotate-180' : ''}`} />
          </button>
          
          {expandedSection === 'facts' && (
            <div className="p-4 animate-fade-in">
              {Object.entries(planetData.quickFacts).map(([key, value]) => (
                <div key={key} className="flex items-start gap-4 mb-4 last:mb-0">
                  <div className="mt-1 text-blue-400 flex-shrink-0">{getFactIcon(key)}</div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="text-white/40 text-[11px] uppercase tracking-widest font-medium">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-white font-semibold text-[15px] leading-tight">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Composition & Atmosphere Section */}
        <div className="border border-white/10 rounded-lg overflow-hidden bg-gradient-to-br from-slate-800/40 to-slate-900/60">
          <button
            onClick={() => toggleSection('composition')}
            className="w-full flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              {(() => {
                const IconComponent = sectionIcons.composition;
                return <IconComponent className="w-5 h-5" />;
              })()}
              <h3 className="font-semibold text-base">Composition & Atmosphere</h3>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSection === 'composition' ? 'rotate-180' : ''}`} />
          </button>
          
          {expandedSection === 'composition' && (
            <div className="px-3.5 pb-3.5 pt-0 space-y-3 animate-fade-in">
              <div className="bg-white/5 rounded-lg p-3">
                <h4 className="text-xs text-white/50 uppercase tracking-wide mb-2">Composition</h4>
                <p className="text-sm text-white/90 leading-relaxed">{planetData.composition.summary}</p>
              </div>
              
              {planetData.composition.atmosphere && (
                <div className="bg-white/5 rounded-lg p-3">
                  <h4 className="text-xs text-white/50 uppercase tracking-wide mb-2.5">Atmosphere</h4>
                  <ul className="space-y-1.5">
                    {planetData.composition.atmosphere.map((gas, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm text-white/80">
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
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
        <div className="border border-white/10 rounded-lg overflow-hidden bg-gradient-to-br from-slate-800/40 to-slate-900/60">
          <button
            onClick={() => toggleSection('features')}
            className="w-full flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              {(() => {
                const IconComponent = sectionIcons.features;
                return <IconComponent className="w-5 h-5" />;
              })()}
              <h3 className="font-semibold text-base">Notable Features</h3>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSection === 'features' ? 'rotate-180' : ''}`} />
          </button>
          
          {expandedSection === 'features' && (
            <div className="px-3.5 pb-3.5 pt-0 animate-fade-in">
              <ul className="space-y-2">
                {planetData.notableFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm py-1.5">
                    <Circle className="w-2 h-2 fill-red-400 text-red-400 mt-1.5" />
                    <span className="text-white/80 leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Live Events Section - Planet-specific alerts */}
        <PlanetEventsSection planetName={selectedBody} />

        {/* APIs & Data Sources Section */}
        <div className="border border-white/10 rounded-lg overflow-hidden bg-gradient-to-br from-slate-800/40 to-slate-900/60">
          <button
            onClick={() => toggleSection('apis')}
            className="w-full flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              {(() => {
                const IconComponent = sectionIcons.apis;
                return <IconComponent className="w-5 h-5" />;
              })()}
              <h3 className="font-semibold text-base">APIs & Data Sources</h3>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSection === 'apis' ? 'rotate-180' : ''}`} />
          </button>
          
          {expandedSection === 'apis' && (
            <div className="px-3.5 pb-3.5 pt-0 space-y-2.5 animate-fade-in">
              {planetData.apis.map((api, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 
                             border border-blue-400/20 hover:border-blue-400/40 transition-all"
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <h4 className="font-semibold text-sm text-blue-300">{api.name}</h4>
                    <a
                      href={api.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-white/60 hover:text-white transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">{api.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-white/10 text-xs text-white/40 text-center">
        Click on another celestial body to view its information
      </div>
    </div>
  );
}
