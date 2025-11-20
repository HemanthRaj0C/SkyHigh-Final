import { NextRequest, NextResponse } from 'next/server';
import { planetsDataDetailed } from '@/data/planetData';

// Cache for planetary data
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// NASA API key
const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';

export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const planetName = params.name.toLowerCase();

    // Check if planet exists in our data
    if (!planetsDataDetailed[planetName]) {
      return NextResponse.json(
        { error: 'Planet not found' },
        { status: 404 }
      );
    }

    const planetData = planetsDataDetailed[planetName];

    // Check cache first
    const cached = cache.get(planetName);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    // Enhance with live data if available
    const [liveData, nasaImages, marsWeather] = await Promise.allSettled([
      fetchLiveData(planetName),
      fetchNASAImages(planetName),
      planetName === 'mars' ? fetchMarsWeather() : Promise.resolve(null),
    ]);

    const enhancedData = {
      ...planetData,
      liveData: liveData.status === 'fulfilled' ? liveData.value : null,
      recentImages: nasaImages.status === 'fulfilled' ? nasaImages.value : [],
      weatherData: marsWeather.status === 'fulfilled' ? marsWeather.value : null,
      lastUpdated: new Date().toISOString(),
    };

    // Cache the result
    cache.set(planetName, {
      data: enhancedData,
      timestamp: Date.now(),
    });

    return NextResponse.json(enhancedData);
  } catch (error) {
    console.error('Planet API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch planet data' },
      { status: 500 }
    );
  }
}

// Fetch live astronomical data
async function fetchLiveData(planetName: string) {
  try {
    // Fetch NASA APOD if it's related to the planet
    const apodResponse = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&count=1`,
      { next: { revalidate: 86400 } } // Cache for 24 hours
    );

    const apodData = apodResponse.ok ? await apodResponse.json() : null;

    return {
      astronomyPictureOfDay: apodData?.[0] || null,
      distanceFromEarth: calculateDistanceFromEarth(planetName),
      nextObservableEvent: getNextEvent(planetName),
      visibility: calculateVisibility(planetName),
      skyPosition: getSkyPosition(planetName),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Failed to fetch live data for ${planetName}:`, error);
    return null;
  }
}

// Fetch NASA images for the planet
async function fetchNASAImages(planetName: string): Promise<any[]> {
  try {
    // For Mars, use rover images API
    if (planetName === 'mars') {
      const response = await fetch(
        `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/latest_photos?api_key=${NASA_API_KEY}`,
        { next: { revalidate: 3600 } } // Cache for 1 hour
      );

      if (!response.ok) throw new Error('Failed to fetch Mars images');

      const data = await response.json();
      return data.latest_photos?.slice(0, 6).map((photo: any) => ({
        id: photo.id,
        url: photo.img_src,
        camera: photo.camera.full_name,
        date: photo.earth_date,
        rover: photo.rover.name,
      })) || [];
    }

    // For other planets, search NASA image library
    const searchResponse = await fetch(
      `https://images-api.nasa.gov/search?q=${planetName}&media_type=image&page_size=6`,
      { next: { revalidate: 86400 } } // Cache for 24 hours
    );

    if (!searchResponse.ok) throw new Error('Failed to fetch NASA images');

    const searchData = await searchResponse.json();
    return searchData.collection?.items?.slice(0, 6).map((item: any) => ({
      title: item.data[0]?.title,
      url: item.links?.[0]?.href,
      description: item.data[0]?.description,
      date: item.data[0]?.date_created,
    })) || [];
  } catch (error) {
    console.error(`Failed to fetch NASA images for ${planetName}:`, error);
    return [];
  }
}

// Fetch Mars weather data from InSight lander (if available)
async function fetchMarsWeather() {
  try {
    // Note: InSight mission ended, but keeping this as example
    // You can replace with other Mars data APIs
    const response = await fetch(
      `https://api.nasa.gov/insight_weather/?api_key=${NASA_API_KEY}&feedtype=json&ver=1.0`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return {
      source: 'NASA InSight Lander',
      available: false, // Mission ended
      note: 'InSight mission has concluded. Historical data available.',
    };
  } catch (error) {
    console.error('Failed to fetch Mars weather:', error);
    return null;
  }
}

// Calculate approximate distance from Earth
function calculateDistanceFromEarth(planetName: string): string {
  // Current approximate distances (varies with orbital positions)
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  
  const distances: Record<string, { min: number; max: number; unit: string }> = {
    sun: { min: 147, max: 152, unit: 'million km' },
    mercury: { min: 77, max: 222, unit: 'million km' },
    venus: { min: 38, max: 261, unit: 'million km' },
    earth: { min: 0, max: 0, unit: 'km' },
    mars: { min: 55, max: 401, unit: 'million km' },
    jupiter: { min: 588, max: 968, unit: 'million km' },
    saturn: { min: 1200, max: 1660, unit: 'million km' },
    uranus: { min: 2580, max: 3150, unit: 'million km' },
    neptune: { min: 4300, max: 4700, unit: 'million km' },
    moon: { min: 356, max: 407, unit: 'thousand km' },
  };
  
  const planet = distances[planetName];
  if (!planet) return 'Unknown';
  
  // Simple approximation using day of year
  const ratio = Math.sin((dayOfYear / 365) * Math.PI * 2) * 0.5 + 0.5;
  const currentDistance = planet.min + (planet.max - planet.min) * ratio;
  
  return `~${currentDistance.toFixed(0)} ${planet.unit}`;
}

// Get next observable event for planet (updated for 2025)
function getNextEvent(planetName: string): string {
  const events: Record<string, string> = {
    sun: 'Solar maximum ongoing through 2025',
    mercury: 'Next greatest elongation: January 2026',
    venus: 'Evening star visibility: Winter 2025',
    earth: 'Next total solar eclipse: August 12, 2026',
    mars: 'Next opposition: March 2025',
    jupiter: 'Opposition: November 2025',
    saturn: 'Opposition: September 2025',
    uranus: 'Opposition: November 2025',
    neptune: 'Opposition: September 2025',
    moon: 'Next full moon: Check lunar calendar',
  };
  
  return events[planetName] || 'Check astronomy calendar for events';
}

// Calculate current visibility based on season
function calculateVisibility(planetName: string): string {
  const month = new Date().getMonth();
  
  const visibility: Record<string, Record<number, string>> = {
    venus: { 0: 'Morning star', 3: 'Evening star', 6: 'Not visible', 9: 'Evening star' },
    mars: { 0: 'Evening sky', 3: 'Late evening', 6: 'Not visible', 9: 'Morning sky' },
    jupiter: { 0: 'Late evening', 3: 'Early morning', 6: 'Not visible', 9: 'All night' },
    saturn: { 0: 'Evening sky', 3: 'Early evening', 6: 'Not visible', 9: 'Late evening' },
  };
  
  if (visibility[planetName]) {
    const quarter = Math.floor(month / 3) * 3;
    return visibility[planetName][quarter] || 'Check sky charts';
  }
  
  return 'Best viewed with telescope';
}

// Get approximate sky position
function getSkyPosition(planetName: string): { constellation: string; magnitude: number } {
  const positions: Record<string, { constellation: string; magnitude: number }> = {
    venus: { constellation: 'Variable', magnitude: -4.6 },
    mars: { constellation: 'Variable', magnitude: 1.6 },
    jupiter: { constellation: 'Variable', magnitude: -2.5 },
    saturn: { constellation: 'Variable', magnitude: 0.6 },
    mercury: { constellation: 'Variable', magnitude: -0.4 },
  };
  
  return positions[planetName] || { constellation: 'N/A', magnitude: 0 };
}
