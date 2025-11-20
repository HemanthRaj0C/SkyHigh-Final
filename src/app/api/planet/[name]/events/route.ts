import { NextRequest, NextResponse } from 'next/server';

// Cache for planet-specific events
const eventsCache: Map<string, { data: any; timestamp: number }> = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const planetName = params.name.toLowerCase();
    
    // Check cache first
    const cached = eventsCache.get(planetName);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    // Fetch planet-specific events
    const events = await fetchPlanetEvents(planetName);

    const response = {
      planet: planetName,
      events,
      lastUpdated: new Date().toISOString(),
    };

    // Cache the result
    eventsCache.set(planetName, {
      data: response,
      timestamp: Date.now(),
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error(`Planet events API error for ${params.name}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch planet events' },
      { status: 500 }
    );
  }
}

async function fetchPlanetEvents(planetName: string): Promise<any[]> {
  const events: any[] = [];

  try {
    // Fetch general events directly from NASA EONET and ISS APIs
    // Don't call localhost - use direct API calls
    const [eonetEvents, issData, donkiEvents, asteroidsData] = await Promise.allSettled([
      fetchNASAEarthEvents(),
      fetchISSData(),
      planetName === 'sun' ? fetchDONKISpaceWeather() : Promise.resolve([]),
      planetName === 'earth' ? fetchNearEarthAsteroids() : Promise.resolve([]),
    ]);

    const allEvents: any[] = [];
    if (eonetEvents.status === 'fulfilled') allEvents.push(...eonetEvents.value);
    if (issData.status === 'fulfilled' && issData.value) allEvents.push(issData.value);
    if (donkiEvents.status === 'fulfilled') allEvents.push(...donkiEvents.value);
    if (asteroidsData.status === 'fulfilled') allEvents.push(...asteroidsData.value);
    
    // Filter events related to this planet
    const planetEvents = allEvents.filter((event: any) => {
        const desc = event.description?.toLowerCase() || '';
        const title = event.title?.toLowerCase() || '';
        const vis = event.visibility?.toLowerCase() || '';
        
        return (
          desc.includes(planetName) ||
          title.includes(planetName) ||
          vis.includes(planetName) ||
          (planetName === 'earth' && (event.type === 'planetary' || event.type === 'iss_flyover'))
        );
      });
      
      events.push(...planetEvents);

    // Add planet-specific logic
    if (planetName === 'sun') {
      // Get solar activity data from NOAA
      try {
        const noaaRes = await fetch(
          'https://services.swpc.noaa.gov/json/goes/primary/xrays-7-day.json',
          { next: { revalidate: 3600 } }
        );
        
        if (noaaRes.ok) {
          const xrayData = await noaaRes.json();
          const recentFlares = xrayData.slice(-1); // Last reading
          
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
            
            events.push({
              id: `solar-xray-${flare.time_tag}`,
              type: 'solar_storm',
              title: `Solar ${classType}-Class X-Ray Activity`,
              description: `Current X-ray flux: ${flare.flux.toExponential(2)} W/m². Monitored by NOAA GOES satellites.`,
              startDate: new Date(flare.time_tag).toISOString(),
              visibility: 'Global',
              severity,
              icon: '☀️',
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch NOAA solar data:', error);
      }
    }

    // Mars-specific events can be added here using free APIs
    // InSight mission has ended, so weather data no longer available

    if (planetName === 'jupiter' || planetName === 'saturn') {
      // Add info about planetary positioning
      events.push({
        id: `${planetName}-position`,
        type: 'planetary',
        title: `${planetName.charAt(0).toUpperCase() + planetName.slice(1)} Observation Window`,
        description: `${planetName.charAt(0).toUpperCase() + planetName.slice(1)} is currently visible in the night sky. Best viewing with telescope.`,
        startDate: new Date().toISOString(),
        visibility: 'Global',
        severity: 'low',
        icon: planetName === 'jupiter' ? '🪐' : '🪐',
      });
    }

  } catch (error) {
    console.error(`Failed to fetch events for ${planetName}:`, error);
  }

  // Sort events by most recent first (descending order)
  return events.sort((a, b) => 
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
}

// Fetch NASA EONET Earth observation events
async function fetchNASAEarthEvents(): Promise<any[]> {
  try {
    const response = await fetch(
      'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=10',
      { next: { revalidate: 600 } }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.events.map((event: any) => {
      const category = event.categories[0]?.title || 'Natural Event';
      const coords = event.geometry[0]?.coordinates || [];
      const location = coords.length === 2 
        ? `${coords[1].toFixed(2)}°N, ${coords[0].toFixed(2)}°E`
        : 'Global';

      return {
        id: `eonet-${event.id}`,
        type: 'planetary',
        title: event.title,
        description: `${category} detected by NASA EONET. Location: ${location}`,
        startDate: new Date(event.geometry[0]?.date || new Date()).toISOString(),
        visibility: 'Earth',
        severity: category.includes('Volcano') || category.includes('Storm') ? 'high' : 'medium',
        icon: category.includes('Volcano') ? '🌋' : category.includes('Storm') ? '🌪️' : category.includes('Fire') ? '🔥' : '🌍',
      };
    });
  } catch (error) {
    console.error('Failed to fetch NASA EONET events:', error);
    return [];
  }
}

// Fetch ISS location
async function fetchISSData(): Promise<any | null> {
  try {
    const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544', {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const lat = parseFloat(data.latitude).toFixed(2);
    const lon = parseFloat(data.longitude).toFixed(2);
    const altitude = parseFloat(data.altitude).toFixed(0);
    const velocity = parseFloat(data.velocity).toFixed(0);

    return {
      id: 'iss-live',
      type: 'iss_flyover',
      title: 'ISS Live Position',
      description: `International Space Station: Lat ${lat}°, Lon ${lon}° • Altitude: ${altitude} km • Speed: ${velocity} km/h`,
      startDate: new Date(data.timestamp * 1000).toISOString(),
      visibility: 'Orbiting Earth - Check spotthestation.nasa.gov for local passes',
      severity: 'low',
      icon: '🛰️',
    };
  } catch (error) {
    console.error('Failed to fetch ISS data:', error);
    return null;
  }
}

// Fetch DONKI Space Weather events for Sun
async function fetchDONKISpaceWeather(): Promise<any[]> {
  try {
    const NASA_API_KEY = process.env.NASA_API_KEY;
    if (!NASA_API_KEY) return [];

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // Last 7 days

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    // Fetch solar flares, CMEs, and geomagnetic storms
    const [flaresRes, cmeRes, gstRes] = await Promise.allSettled([
      fetch(`https://api.nasa.gov/DONKI/FLR?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}&api_key=${NASA_API_KEY}`),
      fetch(`https://api.nasa.gov/DONKI/CME?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}&api_key=${NASA_API_KEY}`),
      fetch(`https://api.nasa.gov/DONKI/GST?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}&api_key=${NASA_API_KEY}`),
    ]);

    const events: any[] = [];

    // Process solar flares
    if (flaresRes.status === 'fulfilled' && flaresRes.value.ok) {
      const flares = await flaresRes.value.json();
      flares.slice(0, 3).forEach((flare: any) => {
        events.push({
          id: `donki-flare-${flare.flrID}`,
          type: 'solar_storm',
          title: `Solar Flare ${flare.classType}`,
          description: `${flare.classType} class solar flare from ${flare.sourceLocation}. Peak time: ${new Date(flare.peakTime).toLocaleString()}`,
          startDate: new Date(flare.beginTime).toISOString(),
          endDate: flare.endTime ? new Date(flare.endTime).toISOString() : undefined,
          visibility: 'Sun',
          severity: flare.classType?.startsWith('X') ? 'high' : flare.classType?.startsWith('M') ? 'medium' : 'low',
          icon: '☀️',
        });
      });
    }

    // Process CMEs (Coronal Mass Ejections)
    if (cmeRes.status === 'fulfilled' && cmeRes.value.ok) {
      const cmes = await cmeRes.value.json();
      cmes.slice(0, 2).forEach((cme: any) => {
        events.push({
          id: `donki-cme-${cme.activityID}`,
          type: 'solar_storm',
          title: 'Coronal Mass Ejection',
          description: `CME detected with speed ${cme.speed || 'N/A'} km/s. ${cme.note || 'Solar material ejected from Sun.'}`,
          startDate: new Date(cme.startTime).toISOString(),
          visibility: 'Sun',
          severity: (cme.speed && cme.speed > 1000) ? 'high' : 'medium',
          icon: '🌪️',
        });
      });
    }

    // Process Geomagnetic Storms
    if (gstRes.status === 'fulfilled' && gstRes.value.ok) {
      const storms = await gstRes.value.json();
      storms.slice(0, 2).forEach((storm: any) => {
        events.push({
          id: `donki-gst-${storm.gstID}`,
          type: 'solar_storm',
          title: `Geomagnetic Storm`,
          description: `G${storm.allKpIndex?.[0]?.kpIndex || '?'} level geomagnetic storm. May cause aurora at high latitudes.`,
          startDate: new Date(storm.startTime).toISOString(),
          visibility: 'Earth',
          severity: 'medium',
          icon: '🌌',
        });
      });
    }

    return events;
  } catch (error) {
    console.error('Failed to fetch DONKI space weather:', error);
    return [];
  }
}

// Fetch Near Earth Asteroids
async function fetchNearEarthAsteroids(): Promise<any[]> {
  try {
    const NASA_API_KEY = process.env.NASA_API_KEY;
    if (!NASA_API_KEY) return [];

    const today = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7); // Next 7 days

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    const response = await fetch(
      `https://api.nasa.gov/neo/rest/v1/feed?start_date=${formatDate(today)}&end_date=${formatDate(endDate)}&api_key=${NASA_API_KEY}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) return [];

    const data = await response.json();
    const events: any[] = [];

    // Get the most notable asteroids (closest approaches)
    const allAsteroids: any[] = [];
    Object.values(data.near_earth_objects).forEach((dayAsteroids: any) => {
      allAsteroids.push(...dayAsteroids);
    });

    // Sort by closest approach and take top 3
    const closestAsteroids = allAsteroids
      .sort((a, b) => {
        const distA = parseFloat(a.close_approach_data[0]?.miss_distance?.kilometers || Infinity);
        const distB = parseFloat(b.close_approach_data[0]?.miss_distance?.kilometers || Infinity);
        return distA - distB;
      })
      .slice(0, 3);

    closestAsteroids.forEach((asteroid: any) => {
      const approach = asteroid.close_approach_data[0];
      const distance = parseFloat(approach.miss_distance.kilometers);
      const distanceLD = parseFloat(approach.miss_distance.lunar); // Lunar distance
      const isPotentiallyHazardous = asteroid.is_potentially_hazardous_asteroid;

      events.push({
        id: `neo-${asteroid.id}`,
        type: 'planetary',
        title: `Asteroid ${asteroid.name}`,
        description: `Close approach at ${distanceLD.toFixed(2)} lunar distances (${(distance / 1000000).toFixed(2)}M km). Diameter: ~${asteroid.estimated_diameter.meters.estimated_diameter_max.toFixed(0)}m. ${isPotentiallyHazardous ? '⚠️ Potentially hazardous' : 'Safe passage'}.`,
        startDate: new Date(approach.close_approach_date_full).toISOString(),
        visibility: 'Near Earth',
        severity: isPotentiallyHazardous ? 'medium' : 'low',
        icon: '☄️',
      });
    });

    return events;
  } catch (error) {
    console.error('Failed to fetch near-Earth asteroids:', error);
    return [];
  }
}
