/**
 * Propaganda framing categories shared by the Daily Feedback Survey.
 *
 * The PropagandaArticle table stores `dominantFraming` as Georgian strings;
 * the survey works with stable canonical keys.
 */

export const FRAMINGS = ['institutional', 'psychological', 'societal', 'geopolitical'] as const

export type Framing = (typeof FRAMINGS)[number]

/** Georgian DB value -> canonical key */
const GEORGIAN_TO_KEY: Record<string, Framing> = {
  'როგორ გვზღუდავენ': 'institutional',
  'როგორ გვთრგუნავენ': 'psychological',
  'როგორ გვყოფენ': 'societal',
  'გავლენები და ეკლესია': 'geopolitical',
}

/** The four Georgian values that map to a real framing (excludes "სხვა / ნეიტრალური"). */
export const FRAMING_DB_VALUES: string[] = Object.keys(GEORGIAN_TO_KEY)

/** i18n dictionary keys for each framing's label + description (reuses existing dashboard keys). */
export const FRAMING_LABEL_KEYS: Record<Framing, { label: string; desc: string }> = {
  institutional: { label: 'howTheyRestrictUs', desc: 'howTheyRestrictUsSub' },
  psychological: { label: 'howTheySuppressUs', desc: 'howTheySuppressUsSub' },
  societal: { label: 'howTheyDivideUs', desc: 'howTheyDivideUsSub' },
  geopolitical: { label: 'influencesAndChurch', desc: 'influencesAndChurchSub' },
}

export function framingFromGeorgian(value: string | null | undefined): Framing | null {
  if (!value) return null
  return GEORGIAN_TO_KEY[value] ?? null
}

export function isFraming(value: unknown): value is Framing {
  return typeof value === 'string' && (FRAMINGS as readonly string[]).includes(value)
}

/** UTC midnight of the given date — the canonical "survey day" value. */
export function utcMidnight(date: Date = new Date()): Date {
  const d = new Date(date)
  d.setUTCHours(0, 0, 0, 0)
  return d
}
