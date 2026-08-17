import { describe, it } from 'node:test'
import assert from 'node:assert'
import { classifyWithHeuristics, classifyHeadline } from '../src/lib/mediaClassifier'

describe('Media Classifier (Georgian Heuristics)', () => {
  it('correctly classifies institutional framing ("როგორ გვზღუდავენ")', () => {
    const text = 'სასამართლომ აქტივისტები დააჯარიმა და პოლიციამ ახალი რეგულაცია აამოქმედა'
    const result = classifyWithHeuristics(text)
    assert.strictEqual(result.canonicalKey, 'institutional')
    assert.strictEqual(result.dominantFraming, 'როგორ გვზღუდავენ')
    assert.ok(result.framingScore >= 40)
  })

  it('correctly classifies psychological framing ("როგორ გვთრგუნავენ")', () => {
    const text = 'ქვეყანაში ომის და მეორე ფრონტის საფრთხეა, რასაც პანიკა და დეზინფორმაცია მოჰყვა'
    const result = classifyWithHeuristics(text)
    assert.strictEqual(result.canonicalKey, 'psychological')
    assert.strictEqual(result.dominantFraming, 'როგორ გვთრგუნავენ')
  })

  it('correctly classifies societal framing ("როგორ გვყოფენ")', () => {
    const text = 'პოლარიზაცია და ტრადიციული ოჯახური ღირებულებების წინააღმდეგ პროპაგანდა'
    const result = classifyWithHeuristics(text)
    assert.strictEqual(result.canonicalKey, 'societal')
    assert.strictEqual(result.dominantFraming, 'როგორ გვყოფენ')
  })

  it('correctly classifies geopolitical framing ("გავლენები და ეკლესია")', () => {
    const text = 'საპატრიარქო, რუსეთი და გლობალური ომის პარტიის აგენტურა საქართველოში'
    const result = classifyWithHeuristics(text)
    assert.strictEqual(result.canonicalKey, 'geopolitical')
    assert.strictEqual(result.dominantFraming, 'გავლენები და ეკლესია')
  })

  it('falls back gracefully to heuristics when no API key is provided', async () => {
    const text = 'პოლიციამ უკანონო დაკავება განახორციელა'
    const result = await classifyHeadline(text, '', '')
    assert.strictEqual(result.source, 'heuristic')
    assert.strictEqual(result.canonicalKey, 'institutional')
  })
})
