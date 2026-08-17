import { FRAMINGS, type Framing } from '@/lib/framing'

export type ClassificationResult = {
  dominantFraming: string // Georgian string, e.g., "როგორ გვთრგუნავენ"
  canonicalKey: Framing
  framingScore: number
  source: 'gemini' | 'heuristic'
  reasoning?: string
}

export const GEORGIAN_KEYWORDS: Record<Framing, { dbValue: string; keywords: string[] }> = {
  institutional: {
    dbValue: 'როგორ გვზღუდავენ',
    keywords: [
      'სასამართლო', 'პოლიცია', 'დაკავება', 'ჯარიმა', 'მოსამართლე', 'ბიუროკრატია',
      'არჩევნები', 'ჩარევა', 'აკრძალვა', 'სანქცია', 'კანონი', 'უფლებები', 'ცენზურა',
      'სახელმწიფო უსაფრთხოება', 'სუსი', 'მოსმენა', 'თვალთვალი', 'დაჯარიმება'
    ],
  },
  psychological: {
    dbValue: 'როგორ გვთრგუნავენ',
    keywords: [
      'შიში', 'ომი', 'საფრთხე', 'მეორე ფრონტი', 'პანიკა', 'დეზინფორმაცია',
      'სუვერენიტეტის დაკარგვა', 'განადგურება', 'მსხვერპლი', 'თავდასხმა', 'კატასტროფა',
      'მუქარა', 'ქაოსი', 'დაშინება', 'დაძაბულობა', 'სტრესი'
    ],
  },
  societal: {
    dbValue: 'როგორ გვყოფენ',
    keywords: [
      'ტრადიცია', 'ლგბტ', 'პოლარიზაცია', 'დაპირისპირება', 'ღირებულებები', 'ოჯახი',
      'ტრადიციული', 'პროპაგანდა', 'დასავლეთი', 'გარყვნილება', 'მოღალატე', 'აგენტი',
      'მტრები', 'ერის მტერი', 'საზოგადოების გახლეჩვა', 'დისკრიმინაცია'
    ],
  },
  geopolitical: {
    dbValue: 'გავლენები და ეკლესია',
    keywords: [
      'ეკლესია', 'რუსეთი', 'პატრიარქი', 'მართლმადიდებლობა', 'რწმენა', 'ევროკავშირი',
      'აგენტურა', 'გლობალური ომის პარტია', 'ოკუპაცია', 'სუვერენიტეტი', 'ნატო', 'აშშ',
      'მოსკოვი', 'კრემლი', 'საპატრიარქო', 'რელიგია'
    ],
  },
}

function cleanGeorgianText(text: string): string {
  return text.toLowerCase().replace(/[^\w\s\u10D0-\u10FA]/g, ' ')
}

/**
 * Fast & zero-dependency Georgian keyword/lexicon classifier.
 */
export function classifyWithHeuristics(headline: string, bodyText: string = ''): ClassificationResult {
  const combined = cleanGeorgianText(`${headline} ${bodyText}`)
  const words = combined.split(/\s+/).filter(Boolean)

  let bestFraming: Framing = 'institutional'
  let highestMatchCount = 0

  for (const framing of FRAMINGS) {
    const config = GEORGIAN_KEYWORDS[framing]
    let matches = 0

    for (const keyword of config.keywords) {
      if (combined.includes(keyword)) {
        matches += 2 // substring bonus
      }
      for (const w of words) {
        if (w === keyword || w.startsWith(keyword)) {
          matches += 1
        }
      }
    }

    if (matches > highestMatchCount) {
      highestMatchCount = matches
      bestFraming = framing
    }
  }

  // Calculate a score from 40 to 95 based on matches
  const framingScore = Math.min(95, Math.max(40, 40 + highestMatchCount * 12))
  const dbValue = GEORGIAN_KEYWORDS[bestFraming].dbValue

  return {
    dominantFraming: dbValue,
    canonicalKey: bestFraming,
    framingScore,
    source: 'heuristic',
    reasoning: `Heuristic lexicon match (${highestMatchCount} signal weight)`
  }
}

/**
 * Classifies headline with Google Gemini API when GEMINI_API_KEY is configured,
 * automatically falling back to keyword heuristics.
 */
export async function classifyHeadline(
  headline: string,
  bodyText: string = '',
  apiKey: string | undefined = process.env.GEMINI_API_KEY
): Promise<ClassificationResult> {
  if (!apiKey || apiKey.trim() === '') {
    return classifyWithHeuristics(headline, bodyText)
  }

  try {
    const prompt = `Analyze this Georgian news headline/text and classify it into exactly one of the 4 propaganda framing narratives:
1. institutional ("როგორ გვზღუდავენ" - laws, courts, police, fines, state power)
2. psychological ("როგორ გვთრგუნავენ" - fear, war threat, second front, chaos, panic)
3. societal ("როგორ გვყოფენ" - LGBT vs traditional family, polarization, traitors vs patriots)
4. geopolitical ("გავლენები და ეკლესია" - church, Russia, EU, Global War Party, foreign agents)

Headline: "${headline}"
Context: "${bodyText.slice(0, 300)}"

Respond ONLY with valid JSON in this exact structure:
{
  "canonicalKey": "institutional" | "psychological" | "societal" | "geopolitical",
  "framingScore": number between 40 and 99,
  "reasoning": "brief 1 sentence explanation"
}`

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      }),
      signal: AbortSignal.timeout(6000), // 6s timeout
    })

    if (!response.ok) {
      return classifyWithHeuristics(headline, bodyText)
    }

    const data = await response.json()
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!content) {
      return classifyWithHeuristics(headline, bodyText)
    }

    const parsed = JSON.parse(content)
    const canonicalKey = parsed.canonicalKey as Framing
    if (!FRAMINGS.includes(canonicalKey)) {
      return classifyWithHeuristics(headline, bodyText)
    }

    return {
      dominantFraming: GEORGIAN_KEYWORDS[canonicalKey].dbValue,
      canonicalKey,
      framingScore: typeof parsed.framingScore === 'number' ? Math.min(99, Math.max(30, parsed.framingScore)) : 75,
      source: 'gemini',
      reasoning: parsed.reasoning || 'Classified by Gemini 2.0 Flash',
    }
  } catch {
    // Fallback gracefully on any network / parsing error
    return classifyWithHeuristics(headline, bodyText)
  }
}
