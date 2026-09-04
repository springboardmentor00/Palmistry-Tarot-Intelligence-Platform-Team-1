import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini SDK (Ensure GEMINI_API_KEY is in your .env.local)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// IN-MEMORY CACHE: Stores Gemini results by "userId-YYYY-MM-DD"
// Prevents hitting the 5 Request/Min limit if the user reloads the page.
const dailyCache = new Map<string, any>();

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Fetch real DB data from Python
    const res = await fetch(`http://127.0.0.1:8000/api/dashboard`, {
      headers: { 'Authorization': authHeader }
    });
    
    if (!res.ok) {
      throw new Error(`Backend returned ${res.status}`);
    }
    
    const data = await res.json();

    // 2. If it's a Seeker (User), Node handles the Gemini generation
    if (data.dashboard && data.dashboard.role === 'user') {
      const { userId, aiContext, astrology } = data.dashboard;
      
      // Generate a cache key: e.g., "12345-2026-03-15"
      const todayStr = new Date().toISOString().split('T')[0];
      const cacheKey = `${userId}-${todayStr}`;

      let geminiData;

      // CHECK CACHE FIRST to save API quota
      if (dailyCache.has(cacheKey)) {
        geminiData = dailyCache.get(cacheKey);
      } else {
        // CALL GEMINI if not cached
        try {
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
          const prompt = `
            You are a master astrologer. Provide a daily forecast.
            User's Zodiac Sign: ${aiContext.sign}
            User's Primary Goal: ${aiContext.primaryGoal}
            Latest Palm/Tarot Reading Context: ${aiContext.readingSummary}

            Return ONLY a valid JSON object with EXACTLY these keys (no markdown formatting or code blocks):
            {
                "overview": "2 sentences of general spiritual advice.",
                "career": "1 sentence on career/karma.",
                "love": "1 sentence on love/relationships.",
                "health": "1 sentence on health/vitality.",
                "remedy": "1 practical spiritual action or remedy.",
                "luckyColor": "e.g. Crimson & Gold",
                "auspiciousTime": "e.g. 10:15 AM - 11:45 AM",
                "mantra": "A relevant short mantra"
            }
          `;

          const result = await model.generateContent(prompt);
          const text = result.response.text();
          
          // Strip any markdown blocks if Gemini formats it as code
          const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
          
          geminiData = JSON.parse(cleanText);
          
          // Store in Cache so it doesn't run again today for this user
          dailyCache.set(cacheKey, geminiData);
        } catch (err) {
          console.error("Node Gemini API Error (Rate limit or parse fail):", err);
          // SAFE FALLBACK: If you hit the 5 RPM limit, it gracefully provides generic advice instead of crashing
          geminiData = {
            overview: `The celestial transits today favor conscious introspection for ${aiContext.sign}. Alignment between your intentions and actions is crucial.`,
            career: "Steady momentum surrounds strategic tasks. Keep goals clear.",
            love: "Empathy and mutual respect create deep, nourishing bonds today.",
            health: "Maintain balanced hydration and take brief moments for mindful pause.",
            remedy: "Practice 5 minutes of mindful breathwork before starting major tasks.",
            luckyColor: "Royal Indigo",
            auspiciousTime: "11:00 AM - 12:30 PM",
            mantra: "Om Gam Ganapataye Namaha"
          };
        }
      }

      // Merge the Node-generated AI data into the Python astrology data
      data.dashboard.astrology = {
        ...astrology,
        ...geminiData
      };

      // Clean up the internal variables before sending to the UI
      delete data.dashboard.aiContext;
      delete data.dashboard.userId;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Dashboard Proxy Error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend database' }, 
      { status: 500 }
    );
  }
}