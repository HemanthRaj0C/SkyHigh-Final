import { NextRequest, NextResponse } from 'next/server';
import { type AstronomicalEvent } from '@/data/events';

// Cache for events data
let eventsCache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export async function GET(request: NextRequest) {
  try {
    // Check cache first
    if (eventsCache && Date.now() - eventsCache.timestamp < CACHE_DURATION) {
      return NextResponse.json(eventsCache.data);
    }

    // Fetch and aggregate events from multiple sources
    const events = await aggregateEvents();

    const response = {
      events,
      lastUpdated: new Date().toISOString(),
      sources: [
        'NASA EONET (Earth Events)',
        'NASA DONKI (Space Weather)',
        'NASA NeoWs (Near-Earth Asteroids)',
        'Where The ISS At (ISS Tracking)',
      ],
    };

    // Cache the result
    eventsCache = {
      data: response,
      timestamp: Date.now(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Events API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events data' },
      { status: 500 }
    );
  }
}

// Aggregate events from multiple sources
async function aggregateEvents(): Promise<any[]> {
  try {
    // Fetch from real NASA APIs
    const [eonetEvents, issData, donkiEvents, asteroidsData] = await Promise.allSettled([
      fetchNASAEarthEvents(),
      fetchISSData(),
      fetchDONKISpaceWeather(),
      fetchNearEarthAsteroids(),
    ]);

    const allEvents: AstronomicalEvent[] = [];

    // Add NASA EONET Earth events
    if (eonetEvents.status === 'fulfilled' && eonetEvents.value.length > 0) {
      allEvents.push(...eonetEvents.value);
    }

    // Add ISS flyover event
    if (issData.status === 'fulfilled' && issData.value) {
      allEvents.push(issData.value);
    }

    // Add DONKI space weather events
    if (donkiEvents.status === 'fulfilled' && donkiEvents.value.length > 0) {
      allEvents.push(...donkiEvents.value);
    }

    // Add near-Earth asteroids
    if (asteroidsData.status === 'fulfilled' && asteroidsData.value.length > 0) {
      allEvents.push(...asteroidsData.value);
    }

    // Enrich all events with real-time status and serialize dates
    const enrichedEvents = allEvents.map((event) => ({
      ...event,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate ? event.endDate.toISOString() : undefined,
      status: getEventStatus(event.startDate, event.endDate),
      countdown: getCountdown(event.startDate),
    }));

    // Sort by date (most recent first - descending order)
    return enrichedEvents
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, 20); // Limit to 20 most recent events
  } catch (error) {
    console.error('Failed to aggregate events:', error);
    return [];
  }
}

// Fetch NASA EONET Earth observation events
async function fetchNASAEarthEvents(): Promise<AstronomicalEvent[]> {
  try {
    const response = await fetch(
      `https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=10`,
      { next: { revalidate: 600 } }
    );

    if (!response.ok) throw new Error('Failed to fetch EONET events');

    const data = await response.json();

    return data.events.map((event: any) => {
      const category = event.categories[0]?.title || 'Natural Event';
      const coords = event.geometry[0]?.coordinates || [];
      const location = coords.length === 2 
        ? `${coords[1].toFixed(2)}°N, ${coords[0].toFixed(2)}°E`
        : 'Global';

      return {
        id: `eonet-${event.id}`,
        type: 'planetary' as const,
        title: event.title,
        description: `${category} detected by NASA EONET. Location: ${location}`,
        startDate: new Date(event.geometry[0]?.date || new Date()),
        visibility: 'Earth',
        severity: category.includes('Volcano') || category.includes('Storm') ? 'high' : 'medium' as const,
        icon: category.includes('Volcano') ? '🌋' : category.includes('Storm') ? '🌪️' : category.includes('Fire') ? '🔥' : '🌍',
      };
    });
  } catch (error) {
    console.error('Failed to fetch NASA EONET events:', error);
    return [];
  }
}

// Fetch ISS location and create flyover event
async function fetchISSData(): Promise<AstronomicalEvent | null> {
  try {
    // Use HTTPS and add timeout
    const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544', {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) throw new Error('Failed to fetch ISS data');

    const data = await response.json();

    // Get location name from coordinates
    const lat = parseFloat(data.latitude).toFixed(2);
    const lon = parseFloat(data.longitude).toFixed(2);
    const altitude = parseFloat(data.altitude).toFixed(0);
    const velocity = parseFloat(data.velocity).toFixed(0);

    return {
      id: 'iss-live',
      type: 'iss_flyover' as const,
      title: 'ISS Live Position',
      description: `International Space Station: Lat ${lat}°, Lon ${lon}° • Altitude: ${altitude} km • Speed: ${velocity} km/h`,
      startDate: new Date(data.timestamp * 1000),
      visibility: 'Orbiting Earth - Check spotthestation.nasa.gov for local passes',
      severity: 'low' as const,
      icon: '🛰️',
    };
  } catch (error) {
    console.error('Failed to fetch ISS data:', error);
    return null;
  }
}

// Determine event status
function getEventStatus(startDate: Date, endDate?: Date): 'upcoming' | 'ongoing' | 'past' {
  const now = new Date();
  
  if (now < startDate) {
    return 'upcoming';
  }
  
  if (endDate && now <= endDate) {
    return 'ongoing';
  }
  
  if (!endDate && now.toDateString() === startDate.toDateString()) {
    return 'ongoing';
  }
  
  return 'past';
}

// Calculate countdown to event
function getCountdown(startDate: Date): string {
  const now = new Date();
  const diff = startDate.getTime() - now.getTime();
  
  if (diff < 0) {
    return 'Event started';
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) {
    return `${days} day${days === 1 ? '' : 's'} ${hours} hour${hours === 1 ? '' : 's'}`;
  }
  
  if (hours > 0) {
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} hour${hours === 1 ? '' : 's'} ${minutes} minute${minutes === 1 ? '' : 's'}`;
  }
  
  const minutes = Math.floor(diff / (1000 * 60));
  return `${minutes} minute${minutes === 1 ? '' : 's'}`;
}

// Fetch DONKI Space Weather events
async function fetchDONKISpaceWeather(): Promise<AstronomicalEvent[]> {
  try {
    const NASA_API_KEY = process.env.NEXT_PUBLIC_NASA_API_KEY;
    if (!NASA_API_KEY) return [];

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // Last 7 days

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    // Fetch solar flares, CMEs, and geomagnetic storms
    const [flaresRes, cmeRes, gstRes] = await Promise.allSettled([
      fetch(`https://api.nasa.gov/DONKI/FLR?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}&api_key=${NASA_API_KEY}`, { next: { revalidate: 3600 } }),
      fetch(`https://api.nasa.gov/DONKI/CME?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}&api_key=${NASA_API_KEY}`, { next: { revalidate: 3600 } }),
      fetch(`https://api.nasa.gov/DONKI/GST?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}&api_key=${NASA_API_KEY}`, { next: { revalidate: 3600 } }),
    ]);

    const events: AstronomicalEvent[] = [];

    // Process solar flares
    if (flaresRes.status === 'fulfilled' && flaresRes.value.ok) {
      const flares = await flaresRes.value.json();
      flares.slice(0, 3).forEach((flare: any) => {
        events.push({
          id: `donki-flare-${flare.flrID}`,
          type: 'solar_storm',
          title: `Solar Flare ${flare.classType}`,
          description: `${flare.classType} class solar flare from ${flare.sourceLocation}. Peak time: ${new Date(flare.peakTime).toLocaleString()}`,
          startDate: new Date(flare.beginTime),
          endDate: flare.endTime ? new Date(flare.endTime) : undefined,
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
          startDate: new Date(cme.startTime),
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
          title: 'Geomagnetic Storm',
          description: `G${storm.allKpIndex?.[0]?.kpIndex || '?'} level geomagnetic storm. May cause aurora at high latitudes.`,
          startDate: new Date(storm.startTime),
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
async function fetchNearEarthAsteroids(): Promise<AstronomicalEvent[]> {
  try {
    const NASA_API_KEY = process.env.NEXT_PUBLIC_NASA_API_KEY || 'DEMO_KEY';
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
    const events: AstronomicalEvent[] = [];

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
        startDate: new Date(approach.close_approach_date_full),
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


