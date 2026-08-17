import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { navigation, analyticsNavigation, type SidebarLabels } from '../src/components/layout/sidebar'
import { ka, en, de, type Language } from '../src/lib/i18n/dictionaries'

describe('Sidebar Navigation & i18n', () => {
  const languages: Array<{ code: Language; dict: typeof ka }> = [
    { code: 'ka', dict: ka },
    { code: 'en', dict: en },
    { code: 'de', dict: de },
  ]

  it('defines all required primary navigation items with valid paths and icons', () => {
    assert.ok(navigation.length >= 4)
    const expectedKeys: (keyof SidebarLabels)[] = ['navDashboard', 'navAssessments', 'navSurveys', 'navProfile']
    const keys = navigation.map((n) => n.key)
    for (const key of expectedKeys) {
      assert.ok(keys.includes(key), `Missing navigation key: ${key}`)
    }
  })

  it('defines analytics navigation items with valid paths and icons', () => {
    assert.ok(analyticsNavigation.length >= 1)
    const keys = analyticsNavigation.map((n) => n.key)
    assert.ok(keys.includes('navReports'), 'Missing analytics navigation key: navReports')
  })

  it('ensures all sidebar label keys exist in all supported languages', () => {
    const requiredKeys: (keyof SidebarLabels)[] = [
      'navDashboard',
      'navAssessments',
      'navSurveys',
      'navMarket',
      'navProfile',
      'navAnalytics',
      'navReports',
    ]

    for (const { code, dict } of languages) {
      for (const key of requiredKeys) {
        assert.ok(dict[key], `Sidebar label "${key}" missing for language: ${code}`)
        assert.ok(typeof dict[key] === 'string' && dict[key].trim().length > 0)
      }
    }
  })
})
