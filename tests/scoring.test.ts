import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { calculateLikertScore, calculateBigFiveScores, type BigFiveDomain } from '../src/lib/scoring'

describe('Assessment Scoring Engine', () => {
  describe('calculateLikertScore', () => {
    it('neutral answers (all 3s on 1-5 scale) result in exactly 50%', () => {
      const score = calculateLikertScore([3, 3, 3], 1, 5)
      assert.equal(score, 50)
    })

    it('minimum answers (all 1s on 1-5 scale) result in 0%', () => {
      const score = calculateLikertScore([1, 1, 1], 1, 5)
      assert.equal(score, 0)
    })

    it('maximum answers (all 5s on 1-5 scale) result in 100%', () => {
      const score = calculateLikertScore([5, 5, 5], 1, 5)
      assert.equal(score, 100)
    })

    it('mixed responses calculate correctly', () => {
      // ratings: 2, 4 -> sum = 6, count = 2 -> (6 - 2) / (4 * 2) = 4 / 8 = 0.5 = 50%
      assert.equal(calculateLikertScore([2, 4], 1, 5), 50)

      // ratings: 1, 5 -> sum = 6, count = 2 -> (6 - 2) / (4 * 2) = 50%
      assert.equal(calculateLikertScore([1, 5], 1, 5), 50)

      // ratings: 4, 4, 4 -> sum = 12, count = 3 -> (12 - 3) / 12 = 9/12 = 75%
      assert.equal(calculateLikertScore([4, 4, 4], 1, 5), 75)

      // ratings: 2, 2, 2 -> sum = 6, count = 3 -> (6 - 3) / 12 = 3/12 = 25%
      assert.equal(calculateLikertScore([2, 2, 2], 1, 5), 25)
    })

    it('handles empty ratings gracefully', () => {
      assert.equal(calculateLikertScore([], 1, 5), 0)
    })
  })

  describe('calculateBigFiveScores', () => {
    const mockQuestions: Array<{ id: number; trait: BigFiveDomain }> = [
      { id: 1, trait: 'extraversion' },
      { id: 2, trait: 'agreeableness' },
      { id: 3, trait: 'conscientiousness' },
      { id: 4, trait: 'neuroticism' },
      { id: 5, trait: 'openness' },
      { id: 6, trait: 'extraversion' },
      { id: 7, trait: 'agreeableness' },
      { id: 8, trait: 'conscientiousness' },
      { id: 9, trait: 'neuroticism' },
      { id: 10, trait: 'openness' },
    ]

    it('all neutral responses result in 50% across all domains', () => {
      const neutralAnswers: Record<number, number> = {
        1: 3, 2: 3, 3: 3, 4: 3, 5: 3,
        6: 3, 7: 3, 8: 3, 9: 3, 10: 3,
      }

      const scores = calculateBigFiveScores(neutralAnswers, mockQuestions, 1, 5)

      assert.equal(scores.extraversion, 50)
      assert.equal(scores.agreeableness, 50)
      assert.equal(scores.conscientiousness, 50)
      assert.equal(scores.neuroticism, 50)
      assert.equal(scores.openness, 50)
    })

    it('all min responses result in 0% across all domains', () => {
      const minAnswers: Record<number, number> = {
        1: 1, 2: 1, 3: 1, 4: 1, 5: 1,
        6: 1, 7: 1, 8: 1, 9: 1, 10: 1,
      }

      const scores = calculateBigFiveScores(minAnswers, mockQuestions, 1, 5)

      assert.equal(scores.extraversion, 0)
      assert.equal(scores.agreeableness, 0)
      assert.equal(scores.conscientiousness, 0)
      assert.equal(scores.neuroticism, 0)
      assert.equal(scores.openness, 0)
    })

    it('all max responses result in 100% across all domains', () => {
      const maxAnswers: Record<number, number> = {
        1: 5, 2: 5, 3: 5, 4: 5, 5: 5,
        6: 5, 7: 5, 8: 5, 9: 5, 10: 5,
      }

      const scores = calculateBigFiveScores(maxAnswers, mockQuestions, 1, 5)

      assert.equal(scores.extraversion, 100)
      assert.equal(scores.agreeableness, 100)
      assert.equal(scores.conscientiousness, 100)
      assert.equal(scores.neuroticism, 100)
      assert.equal(scores.openness, 100)
    })
  })
})
