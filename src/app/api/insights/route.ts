import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { readings, userId } = body as {
      readings: { type: 'palm' | 'tarot'; summary: string; content: string }[];
      userId?: string;
    };

    if (!readings || readings.length === 0) {
      return NextResponse.json(
        { error: 'No readings provided' },
        { status: 400 }
      );
    }

    const contextBlock = readings
      .map(
        (r, i) =>
          `Reading ${i + 1} (${r.type}): ${r.summary}\nDetails: ${r.content}`
      )
      .join('\n\n');

    const prompt = `You are a spiritual life coach and insight synthesizer. Based on the following palmistry and/or tarot readings, generate a holistic insight report for the seeker.

Readings:
${contextBlock}

Respond ONLY in valid JSON with this exact structure:
{
  "personality": {
    "title": "Personality Profile",
    "content": "3-4 sentence synthesis of personality traits revealed across the readings"
  },
  "trends": {
    "title": "Life Trends",
    "content": "3-4 sentence overview of patterns and trends emerging in the seeker's life"
  },
  "recommendations": {
    "title": "Personalized Recommendations",
    "content": "3-4 sentence actionable guidance tailored to what the readings revealed"
  },
  "affirmation": "A single empowering affirmation (1 sentence) the seeker can carry forward"
}

Be warm, specific, and grounded. Tie insights directly back to what the readings revealed.`;

    const zai = await ZAI.create();
    const response = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are a wise insight synthesizer who returns only valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      thinking: { type: 'disabled' },
    });

    const raw = response.choices[0]?.message?.content ?? '';

    let parsed: {
      personality: { title: string; content: string };
      trends: { title: string; content: string };
      recommendations: { title: string; content: string };
      affirmation: string;
    };
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(match ? match[0] : raw);
    } catch {
      parsed = {
        personality: { title: 'Personality Profile', content: raw },
        trends: { title: 'Life Trends', content: 'Insufficient data to synthesize trends.' },
        recommendations: {
          title: 'Personalized Recommendations',
          content: 'Continue reflecting on your readings.',
        },
        affirmation: 'I trust the wisdom unfolding within me.',
      };
    }

    // Persist insights if userId provided
    if (userId) {
      try {
        // Ensure user exists
        await db.user.upsert({
          where: { id: userId },
          update: {},
          create: { id: userId, name: 'Seeker', role: 'user' },
        });
        for (const insight of [
          { ...parsed.personality, type: 'personality' },
          { ...parsed.trends, type: 'trend' },
          { ...parsed.recommendations, type: 'recommendation' },
        ]) {
          await db.insight.create({
            data: {
              userId,
              type: insight.type,
              title: insight.title,
              content: insight.content,
            },
          });
        }
      } catch (e) {
        console.error('DB save failed (continuing):', e);
      }
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('Insights error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
