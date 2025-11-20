import { NextRequest, NextResponse } from 'next/server';
import { planetsDataDetailed } from '@/data/planetData';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: Message[];
  selectedBody?: string | null;
}

// System prompt for Cosmos AI
const SYSTEM_PROMPT = `You are Cosmos AI, an expert astronomy and space exploration assistant for the SkyHigh Cosmos Explorer application. You help users explore and understand our Solar System.

Your capabilities:
- Explain astronomical concepts in clear, engaging language
- Provide accurate information about planets, moons, the Sun, and other celestial bodies
- Calculate distances, travel times, and orbital mechanics
- Share interesting facts about space missions, telescopes, and spacecraft
- Recommend which features or panels to explore in the application

Guidelines:
- Be concise but informative (2-4 sentences typically)
- Use emojis occasionally to make responses engaging (🌍 🚀 ⭐ etc.)
- When users ask about specific celestial bodies, reference their actual properties
- If asked about travel times, assume modern spacecraft speeds (~40,000-60,000 km/h)
- Encourage exploration: suggest viewing different planets or checking the Alerts panel for events
- If you don't know something with certainty, say so honestly

Current context: The user is exploring a 3D solar system visualization with interactive features.`;

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { messages, selectedBody } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    // Get Gemini API key from environment
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('GEMINI_API_KEY not found in environment variables');
      // Fallback response if API key is not configured
      return NextResponse.json({
        message: getFallbackResponse(messages[messages.length - 1].content, selectedBody),
      });
    }

    // Build context about selected body if any
    let contextInfo = '';
    if (selectedBody && planetsDataDetailed[selectedBody]) {
      const bodyData = planetsDataDetailed[selectedBody];
      contextInfo = `\n\nCurrent context: User is viewing ${bodyData.displayName}. Key facts: ${bodyData.description}`;
    }

    // Prepare messages for Gemini API
    const geminiMessages = messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: SYSTEM_PROMPT + contextInfo }],
            },
            ...geminiMessages,
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('Gemini API error:', await response.text());
      return NextResponse.json({
        message: getFallbackResponse(messages[messages.length - 1].content, selectedBody),
      });
    }

    const data = await response.json();
    const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

    return NextResponse.json({ message: aiMessage });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request', message: 'Sorry, I encountered an error. Please try again.' },
      { status: 500 }
    );
  }
}

// Fallback responses when Gemini API is not available
function getFallbackResponse(userMessage: string, selectedBody?: string | null): string {
  const lowerMessage = userMessage.toLowerCase();

  // Distance queries
  if (lowerMessage.includes('how far') || lowerMessage.includes('distance')) {
    if (lowerMessage.includes('mars')) {
      return '🚀 Mars is approximately 225 million kilometers from the Sun, and its distance from Earth varies between 54.6 million and 401 million km depending on their positions in orbit. Currently, spacecraft take about 6-9 months to reach Mars!';
    }
    if (lowerMessage.includes('jupiter')) {
      return '🪐 Jupiter orbits at about 778 million kilometers from the Sun! It is so far that light from the Sun takes about 43 minutes to reach it. Try clicking on Jupiter to learn more about this gas giant!';
    }
    return '🌌 Distances in space are vast! Use the distance measurements in the Planet Info panel (press P) to see exact distances for each celestial body.';
  }

  // Travel time queries
  if (lowerMessage.includes('how long') && (lowerMessage.includes('reach') || lowerMessage.includes('take') || lowerMessage.includes('travel'))) {
    return '⏱️ Travel times vary by speed! With current technology (~40,000 km/h), reaching Mars takes 6-9 months, Jupiter takes about 6 years, and Neptune would take about 12 years. Future propulsion systems could cut these times significantly!';
  }

  // Moon queries
  if (lowerMessage.includes('moon')) {
    if (lowerMessage.includes('most') || lowerMessage.includes('many')) {
      return '🌙 Saturn holds the record with over 146 known moons! Jupiter comes in second with 95+ moons. Some of these moons are incredibly interesting - like Europa (possibly harboring life) and Titan (with liquid methane lakes)!';
    }
    return '🌙 Our Moon is Earth\'s only natural satellite, about 384,400 km away. It is the fifth-largest moon in the Solar System and the only celestial body visited by humans!';
  }

  // Planet-specific queries
  if (selectedBody && planetsDataDetailed[selectedBody]) {
    const bodyData = planetsDataDetailed[selectedBody];
    return `✨ You are currently viewing ${bodyData.displayName}! ${bodyData.notableFeatures[0]} Check out the Planet Info panel (press P) for detailed facts, composition, and available data APIs.`;
  }

  // Great Red Spot
  if (lowerMessage.includes('great red spot') || (lowerMessage.includes('jupiter') && lowerMessage.includes('spot'))) {
    return '🌪️ The Great Red Spot is a massive storm on Jupiter that has been raging for at least 300 years! It is so large that 2-3 Earths could fit inside it. The storm rotates counterclockwise with winds up to 432 km/h!';
  }

  // Saturn rings
  if (lowerMessage.includes('saturn') && lowerMessage.includes('ring')) {
    return '💍 Saturn\'s rings are made of billions of particles of ice and rock, ranging from tiny grains to chunks the size of houses! They extend up to 282,000 km from Saturn but are surprisingly thin - only about 10 meters thick in some places!';
  }

  // Events
  if (lowerMessage.includes('meteor shower') || lowerMessage.includes('event') || lowerMessage.includes('when')) {
    return '📅 Check the Alerts panel (press I) to see upcoming astronomical events like meteor showers, eclipses, and planetary conjunctions! We track real-time space events to keep you informed.';
  }

  // Default response
  return '🌟 Great question! As Cosmos AI, I can help you explore the Solar System, calculate distances and travel times, explain celestial phenomena, and guide you through the app features. What would you like to know about our cosmic neighborhood?';
}
