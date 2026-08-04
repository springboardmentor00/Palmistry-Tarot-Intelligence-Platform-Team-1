import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

interface PalmAnalysisResult {
  summary: string;
  lifeLine: string;
  heartLine: string;
  headLine: string;
  fateLine: string;
  personality: string;
  recommendations: string[];
  rawAnalysis: string;
}

const SYSTEM_PROMPT = `You are an expert palmistry consultant with deep knowledge of traditional and modern palm reading traditions. Analyze the palm image and provide a thoughtful, mystical-yet-grounded reading.

Respond ONLY in valid JSON with this exact structure:
{
  "summary": "A 2-3 sentence overall reading of the palm",
  "lifeLine": "Analysis of the Life Line - vitality, energy, life path (2-3 sentences)",
  "heartLine": "Analysis of the Heart Line - emotions, relationships, love (2-3 sentences)",
  "headLine": "Analysis of the Head Line - intellect, thinking style, communication (2-3 sentences)",
  "fateLine": "Analysis of the Fate Line - destiny, career, life purpose (2-3 sentences)",
  "personality": "A paragraph synthesizing personality traits revealed by the palm (3-4 sentences)",
  "recommendations": ["3-5 practical recommendations for growth and balance"]
}

Be warm, insightful, and respectful. Avoid making medical or absolute predictions. Frame insights as tendencies and opportunities for self-awareness. If a line is not visible, note that gracefully.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, handType = 'right', userId } = body as {
      image: string;
      handType?: string;
      userId?: string;
    };

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const zai = await ZAI.create();

    const response = await zai.chat.completions.createVision({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: SYSTEM_PROMPT },
            {
              type: 'image_url',
              image_url: { url: image },
            },
          ],
        },
      ],
      thinking: { type: 'disabled' },
    });

    const raw = response.choices[0]?.message?.content ?? '';

    // Try to parse JSON from response (it may have surrounding text)
    let parsed: PalmAnalysisResult;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch {
      // Fallback - structure the raw text
      parsed = {
        summary: raw.slice(0, 300),
        lifeLine: 'Analysis unavailable.',
        heartLine: 'Analysis unavailable.',
        headLine: 'Analysis unavailable.',
        fateLine: 'Analysis unavailable.',
        personality: raw,
        recommendations: ['Reflect on the reading and journal your insights.'],
        rawAnalysis: raw,
      };
    }

    parsed.rawAnalysis = raw;

    // Persist to database if userId provided
    let savedId: string | undefined;
    if (userId) {
      try {
        // Ensure user exists (upsert handles foreign key constraint)
        await db.user.upsert({
          where: { id: userId },
          update: {},
          create: { id: userId, name: 'Seeker', role: 'user' },
        });
        const record = await db.palmReading.create({
          data: {
            userId,
            imageUrl: image.slice(0, 500), // truncate for storage
            handType,
            analysis: raw,
            summary: parsed.summary,
            lifeLine: parsed.lifeLine,
            heartLine: parsed.heartLine,
            headLine: parsed.headLine,
            fateLine: parsed.fateLine,
          },
        });
        savedId = record.id;
      } catch (e) {
        console.error('DB save failed (continuing):', e);
      }
    }

    return NextResponse.json({ ...parsed, id: savedId });
  } catch (err) {
    console.error('Palm analysis error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
