import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { ka, en, de, type Language } from '../src/lib/i18n/dictionaries'

describe('Landing Page i18n Dictionaries', () => {
  const languages: Array<{ code: Language; dict: typeof ka }> = [
    { code: 'ka', dict: ka },
    { code: 'en', dict: en },
    { code: 'de', dict: de },
  ]

  it('all languages have essential hero title and subtitles defined', () => {
    for (const { code, dict } of languages) {
      assert.ok(dict.landingHeroTitle, `landingHeroTitle missing for ${code}`)
      assert.ok(dict.landingHeroTitleAccent, `landingHeroTitleAccent missing for ${code}`)
      assert.ok(dict.landingHeroSubtitle, `landingHeroSubtitle missing for ${code}`)
      assert.ok(dict.landingCta, `landingCta missing for ${code}`)
      assert.ok(dict.badge, `badge missing for ${code}`)
    }
  })

  it('all languages have big five dimensions defined', () => {
    for (const { code, dict } of languages) {
      assert.ok(dict.openness, `openness missing for ${code}`)
      assert.ok(dict.conscientiousness, `conscientiousness missing for ${code}`)
      assert.ok(dict.extraversion, `extraversion missing for ${code}`)
      assert.ok(dict.agreeableness, `agreeableness missing for ${code}`)
      assert.ok(dict.neuroticism, `neuroticism missing for ${code}`)
    }
  })
})
