import { NextRequest, NextResponse } from 'next/server';

// Cache for APOD data
let apodCache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

export async function GET(request: NextRequest) {
  try {
    // Check cache first
    if (apodCache && Date.now() - apodCache.timestamp < CACHE_DURATION) {
      return NextResponse.json(apodCache.data);
    }

    const NASA_API_KEY = process.env.NASA_API_KEY;
    
    if (!NASA_API_KEY) {
      return NextResponse.json(
        { error: 'NASA API key not configured' },
        { status: 500 }
      );
    }

    // Fetch Astronomy Picture of the Day
    const response = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`,
      { next: { revalidate: 21600 } } // 6 hours
    );

    if (!response.ok) {
      throw new Error('Failed to fetch APOD');
    }

    const data = await response.json();

    const result = {
      title: data.title,
      explanation: data.explanation,
      url: data.url,
      hdurl: data.hdurl,
      media_type: data.media_type,
      date: data.date,
      copyright: data.copyright || 'NASA',
    };

    // Cache the result
    apodCache = {
      data: result,
      timestamp: Date.now(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('APOD API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Astronomy Picture of the Day' },
      { status: 500 }
    );
  }
}
