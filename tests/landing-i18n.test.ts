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

  it('all languages have burnout assessment questions defined with standardized Georgian text', () => {
    for (const { code, dict } of languages) {
      for (let i = 1; i <= 10; i++) {
        const key = `q_bo_${i}` as keyof typeof dict
        assert.ok(dict[key], `${key} missing for ${code}`)
      }
    }
    assert.strictEqual(ka.q_bo_4, 'მთელი დღე ადამიანებთან მუშაობა ჩემთვის ძალიან დამღლელი და დამთრგუნველია.')
    assert.strictEqual(ka.q_bo_5, 'ვგრძნობ, რომ სამსახურისგან სრულიად გადამწვარი ვარ.')
    assert.strictEqual(ka.q_bo_7, 'ამ სამსახურის დაწყების შემდეგ ადამიანების მიმართ უფრო გულგრილი გავხდი.')
    assert.strictEqual(ka.q_bo_9, 'ადამიანებთან მჭიდრო თანამშრომლობა ენერგიით მავსებს.')
    assert.strictEqual(ka.q_bo_10, 'კოლეგების ან კლიენტების პრობლემებს ძალიან ეფექტურად ვაგვარებ.')
  })
})


