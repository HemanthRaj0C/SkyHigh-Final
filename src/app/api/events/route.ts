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
    // Fetch from real APIs only
    const [eonetEvents, issData] = await Promise.allSettled([
      fetchNASAEarthEvents(),
      fetchISSData(),
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


