import { describe, it } from 'node:test'
import assert from 'node:assert'
import { sanitizeXmlText, parseRssXml } from '../src/services/mediaIngestionService'

describe('Media Ingestion Service', () => {
  describe('sanitizeXmlText', () => {
    it('strips CDATA wrappers properly', () => {
      const input = '<![CDATA[აქციის მონაწილეები]]>'
      assert.strictEqual(sanitizeXmlText(input), 'აქციის მონაწილეები')
    })

    it('strips HTML tags and decodes XML entities', () => {
      const input = '<p>სასამართლო &amp; &quot;სამართალი&quot; &#8211; დეტალები</p>'
      assert.strictEqual(sanitizeXmlText(input), 'სასამართლო & "სამართალი" – დეტალები')
    })
  })

  describe('parseRssXml', () => {
    it('parses RSS 2.0 items correctly', () => {
      const rss = `
        <rss version="2.0">
          <channel>
            <title>Test Feed</title>
            <item>
              <title><![CDATA[სასამართლომ გადაწყვეტილება გამოაცხადა]]></title>
              <link>https://ipn.ge/article/123</link>
              <description><![CDATA[დამატებითი ინფორმაცია სასამართლოზე]]></description>
              <pubDate>Mon, 17 Aug 2026 10:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>
      `
      const items = parseRssXml(rss, 'IPN')
      assert.strictEqual(items.length, 1)
      assert.strictEqual(items[0].headline, 'სასამართლომ გადაწყვეტილება გამოაცხადა')
      assert.strictEqual(items[0].url, 'https://ipn.ge/article/123')
      assert.strictEqual(items[0].sourcePublisher, 'IPN')
    })

    it('parses Atom entries when RSS items are not found', () => {
      const atom = `
        <feed xmlns="http://www.w3.org/2005/Atom">
          <title>Test Atom</title>
          <entry>
            <title>მთავრობამ ახალი კანონპროექტი წარადგინა</title>
            <link href="https://tabula.ge/article/456"/>
            <summary>მოკლე ანოტაცია</summary>
            <published>2026-08-17T11:00:00Z</published>
          </entry>
        </feed>
      `
      const items = parseRssXml(atom, 'Tabula')
      assert.strictEqual(items.length, 1)
      assert.strictEqual(items[0].headline, 'მთავრობამ ახალი კანონპროექტი წარადგინა')
      assert.strictEqual(items[0].url, 'https://tabula.ge/article/456')
      assert.strictEqual(items[0].sourcePublisher, 'Tabula')
    })
  })
})
