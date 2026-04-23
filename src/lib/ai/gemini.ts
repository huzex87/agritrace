import { GoogleGenerativeAI } from '@google/generative-ai'
import type { MarketPrice } from '@/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Use Gemini 2.5 Flash-Lite — 2.0 Flash is deprecated June 1 2026
const MODEL = 'gemini-2.5-flash-lite-preview-06-17'

export async function generatePriceAlertMessage(
  prices: MarketPrice[],
  lang: 'ha' | 'en'
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: MODEL })
  const priceLines = prices
    .map((p) => `${p.commodity}: ₦${p.price_ngn_per_kg}/kg at ${p.market_location}`)
    .join('\n')

  const prompt = `You are AgriTrace, a Nigerian agricultural market assistant.
Generate a short, friendly WhatsApp price alert message in ${lang === 'ha' ? 'Hausa' : 'English'}.
Keep it under 5 lines. Include an emoji. Do not invent prices.

Today's commodity prices:
${priceLines}

Write the message now:`

  const result = await model.generateContent(prompt)
  return result.response.text().trim()
}

export async function extractPricesFromText(rawText: string): Promise<Array<{ commodity: string; price: number; market: string }>> {
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: { responseMimeType: 'application/json' },
  })

  const prompt = `Extract commodity prices from this Nigerian market text.
Return a JSON array with objects: { commodity, price_ngn_per_kg, market_location }
Only include sesame, cowpea, groundnut, castor_seed, dried_ginger.
If price is per 100kg bag, convert to per-kg.

Text:
${rawText}

JSON only:`

  const result = await model.generateContent(prompt)
  try {
    return JSON.parse(result.response.text())
  } catch {
    return []
  }
}

export async function translateToHausa(englishText: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: MODEL })
  const result = await model.generateContent(
    `Translate this agricultural message to Hausa. Keep it natural and simple for rural farmers.
Text: "${englishText}"
Hausa translation:`
  )
  return result.response.text().trim()
}
