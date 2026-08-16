/**
 * Normalizes an array of Likert scale ratings into a 0 - 100 percentage score.
 * 
 * Formula: ((sum - (minScale * count)) / ((maxScale - minScale) * count)) * 100
 * 
 * For standard 1-5 scale:
 * - Minimum rating 1 maps to 0%
 * - Neutral rating 3 maps to 50%
 * - Maximum rating 5 maps to 100%
 */
export function calculateLikertScore(
  ratings: number[],
  minScale = 1,
  maxScale = 5
): number {
  if (!ratings || ratings.length === 0) return 0
  const sum = ratings.reduce((a, b) => a + b, 0)
  const range = maxScale - minScale
  if (range <= 0) return 0
  
  const rawScore = ((sum - minScale * ratings.length) / (range * ratings.length)) * 100
  const clamped = Math.max(0, Math.min(100, rawScore))
  return Math.round(clamped * 10) / 10
}

export type BigFiveDomain = 'extraversion' | 'agreeableness' | 'conscientiousness' | 'neuroticism' | 'openness'

export type BigFiveScores = {
  extraversion: number
  agreeableness: number
  conscientiousness: number
  neuroticism: number
  openness: number
}

export function calculateBigFiveScores(
  answers: Record<number, number>,
  questions: Array<{ id: number; trait: BigFiveDomain }>,
  minScale = 1,
  maxScale = 5
): BigFiveScores {
  const grouped: Record<BigFiveDomain, number[]> = {
    extraversion: [],
    agreeableness: [],
    conscientiousness: [],
    neuroticism: [],
    openness: [],
  }

  questions.forEach(q => {
    const val = answers[q.id] ?? Math.round((minScale + maxScale) / 2)
    grouped[q.trait].push(val)
  })

  return {
    extraversion: calculateLikertScore(grouped.extraversion, minScale, maxScale),
    agreeableness: calculateLikertScore(grouped.agreeableness, minScale, maxScale),
    conscientiousness: calculateLikertScore(grouped.conscientiousness, minScale, maxScale),
    neuroticism: calculateLikertScore(grouped.neuroticism, minScale, maxScale),
    openness: calculateLikertScore(grouped.openness, minScale, maxScale),
  }
}
