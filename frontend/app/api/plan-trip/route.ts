import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Allow up to 60 s for the OpenAI call before Next.js cuts the connection
export const maxDuration = 60;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const BUDGET_LABELS: Record<string, string> = {
  budget:     'budget-conscious (targeting under $1,500 per person all-in)',
  'mid-range':'mid-range (targeting $1,500–$3,500 per person all-in)',
  luxury:     'luxury (targeting $3,500+ per person, premium experiences throughout)',
};

export async function POST(req: NextRequest) {
  try {
    const { visitedCountries, budget = 'mid-range', tripDays = 7 } = await req.json();

    const visitedList =
      visitedCountries.length > 0
        ? visitedCountries.join(', ')
        : 'no countries yet — this is their first big trip';

    const budgetLabel = BUDGET_LABELS[budget] ?? BUDGET_LABELS['mid-range'];
    const days = Math.min(21, Math.max(2, Number(tripDays)));

    const prompt = `You are an expert adventure travel advisor with deep knowledge of destinations worldwide.

A traveler has already visited: ${visitedList}.

Their preferences:
- Budget: ${budgetLabel}
- Trip length: ${days} days

Suggest ONE exciting adventure trip to a region or country they have NEVER visited. Choose somewhere genuinely interesting and off the typical tourist trail — consider Central Asia, the Caucasus, West Africa, the Balkans, the Pacific Islands, South America's interior, East Africa, Central America, etc.

Return ONLY a valid JSON object (no markdown code fences, no explanation, just raw JSON) with this exact structure:
{
  "destination": "City/Region, Country",
  "region": "broad region e.g. The Caucasus",
  "tagline": "short evocative tagline under 12 words",
  "why": "2-3 sentences explaining why this is perfect for someone who has already visited those countries",
  "duration": "${days} days",
  "bestTimeToVisit": "e.g. April–June or September–October",
  "overview": "3-4 sentences painting a vivid picture of this destination",
  "highlights": ["5-7 key highlights as short exciting phrases"],
  "itinerary": [
    { "day": 1, "title": "Short day title", "location": "City/area", "description": "What they do and why it is special", "activities": ["activity 1", "activity 2", "activity 3"] }
  ],
  "packages": [
    {
      "tier": "Budget",
      "name": "Package name",
      "pricePerPerson": "$X–$Y USD",
      "duration": "${days} days",
      "includes": ["Flights (economy)", "Hostel/guesthouse", "Local transport", "..."],
      "accommodation": "Type of accommodation",
      "highlights": "One sentence on what makes this package great value"
    },
    {
      "tier": "Mid-Range",
      "name": "...",
      "pricePerPerson": "$X–$Y USD",
      "duration": "${days} days",
      "includes": ["..."],
      "accommodation": "...",
      "highlights": "..."
    },
    {
      "tier": "Luxury",
      "name": "...",
      "pricePerPerson": "$X–$Y USD",
      "duration": "${days} days",
      "includes": ["..."],
      "accommodation": "...",
      "highlights": "..."
    }
  ],
  "practicalTips": ["4-6 specific practical tips"],
  "visaInfo": "Brief visa requirement info for most Western passport holders",
  "currency": "Local currency name and rough exchange rate to USD"
}

Make the itinerary exactly ${days} days. Be vivid and specific — name actual places, dishes, hikes, experiences. Prioritise package options that suit a ${budget} traveler. Package prices should be realistic all-in estimates.`;

    // Retry up to 3 times on rate limit / overload errors
    let content = '';
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          max_tokens: 8000,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
        });
        content = response.choices[0]?.message?.content ?? '';
        break;
      } catch (err: unknown) {
        const isRetryable =
          err instanceof Error &&
          (err.message.includes('rate_limit') ||
           err.message.includes('overloaded') ||
           err.message.includes('529') ||
           err.message.includes('429'));
        if (isRetryable && attempt < 3) {
          await sleep(attempt * 3000);
          continue;
        }
        throw err;
      }
    }

    try {
      return NextResponse.json(JSON.parse(content));
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) return NextResponse.json(JSON.parse(match[0]));
      return NextResponse.json({ error: 'Failed to parse trip plan' }, { status: 500 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Plan trip error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
