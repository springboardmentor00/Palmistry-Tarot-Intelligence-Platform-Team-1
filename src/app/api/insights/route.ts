import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get User Question
    const body = await req.json();
    const { question } = body;
    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    // 3. Fetch Database Memory from FastAPI
    let zodiac = "Unknown";
    let goal = "General life clarity";
    let historyContext = "No recent readings.";
    
    try {
      const contextRes = await fetch(`${BACKEND_URL}/api/insights/context`, {
        headers: { 'Authorization': authHeader }
      });
      if (contextRes.ok) {
        const contextData = await contextRes.json();
        zodiac = contextData.zodiac;
        goal = contextData.goal;
        historyContext = contextData.history;
      }
    } catch (e) {
      console.error("Could not fetch user context from FastAPI", e);
    }

    // 4. Send everything to Gemini
    const prompt = `You are the Mystica Spiritual Advisor chatbot. 
    The seeker is asking you a specific question in a live chat session.

    SEEKER BACKGROUND & RECENT READING OUTPUTS:
    - Zodiac Sign: ${zodiac}
    - Core Life Goal: ${goal}
    - Past Reading Results:
    ${historyContext}

    USER'S CURRENT CHAT QUESTION:
    "${question}"

    CORE INSTRUCTIONS:
    1. Answer ONLY the specific question asked by the user above.
    2. Do NOT provide a generic life report or broad overview.
    3. Use their past reading results and profile as internal background memory to make your response personally relevant, but do not recite the readings back to them word-for-word.
    4. Keep the response natural, conversational, intuitive, and concise (1-2 direct paragraphs).`;

    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    // 5. Return to UI
    return NextResponse.json({ answer: answer });

  } catch (error: any) {
    console.error('Insights API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to consult guide' }, { status: 500 });
  }
}