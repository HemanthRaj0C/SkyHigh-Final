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
    // Fetch general events first
    const generalEventsRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/events`,
      { next: { revalidate: 600 } }
    );
    
    if (generalEventsRes.ok) {
      const generalData = await generalEventsRes.json();
      const allEvents = generalData.events || [];
      
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
    }

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

    if (planetName === 'mars') {
      // Get Mars weather data from NASA InSight
      try {
        const marsWeatherRes = await fetch(
          `https://api.nasa.gov/insight_weather/?api_key=${process.env.NASA_API_KEY || 'DEMO_KEY'}&feedtype=json&ver=1.0`,
          { next: { revalidate: 86400 } } // Cache for 24 hours
        );
        
        if (marsWeatherRes.ok) {
          const weatherData = await marsWeatherRes.json();
          const sols = weatherData.sol_keys || [];
          
          if (sols.length > 0) {
            const latestSol = weatherData[sols[sols.length - 1]];
            
            events.push({
              id: `mars-weather-${sols[sols.length - 1]}`,
              type: 'planetary',
              title: 'Mars Weather Update',
              description: `Sol ${sols[sols.length - 1]}: Avg temp ${latestSol.AT?.av || 'N/A'}°C. Data from NASA InSight lander.`,
              startDate: new Date(latestSol.First_UTC).toISOString(),
              visibility: 'Mars Surface',
              severity: 'low',
              icon: '🔴',
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch Mars weather:', error);
      }
    }

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

  return events;
}
