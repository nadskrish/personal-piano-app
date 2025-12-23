/**
 * Tests for Scoring module
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ScoringEngine,
  calculateScore,
  BASE_SCORES,
  STREAK_CONFIG,
} from '../engine/Scoring.js';
import { HitResult } from '../engine/HitDetection.js';

describe('Scoring', () => {
  describe('BASE_SCORES', () => {
    it('has correct base scores', () => {
      expect(BASE_SCORES[HitResult.PERFECT]).toBe(100);
      expect(BASE_SCORES[HitResult.GREAT]).toBe(70);
      expect(BASE_SCORES[HitResult.GOOD]).toBe(40);
      expect(BASE_SCORES[HitResult.MISS]).toBe(0);
      expect(BASE_SCORES[HitResult.WRONG_NOTE]).toBe(0);
    });
  });

  describe('calculateScore', () => {
    it('returns base score with 1x multiplier for streak < 10', () => {
      const result = calculateScore(HitResult.PERFECT, 5);
      expect(result.points).toBe(100);
      expect(result.multiplier).toBe(1);
    });

    it('returns 2x multiplier for streak 10-19', () => {
      const result = calculateScore(HitResult.PERFECT, 10);
      expect(result.points).toBe(200);
      expect(result.multiplier).toBe(2);
    });

    it('returns 3x multiplier for streak 20-29', () => {
      const result = calculateScore(HitResult.PERFECT, 25);
      expect(result.points).toBe(300);
      expect(result.multiplier).toBe(3);
    });

    it('caps multiplier at 4x', () => {
      const result = calculateScore(HitResult.PERFECT, 100);
      expect(result.points).toBe(400);
      expect(result.multiplier).toBe(4);
    });

    it('returns 0 points for MISS', () => {
      const result = calculateScore(HitResult.MISS, 15);
      expect(result.points).toBe(0);
    });
  });

  describe('ScoringEngine', () => {
    let scoring;

    beforeEach(() => {
      scoring = new ScoringEngine();
    });

    describe('initial state', () => {
      it('starts with zero score', () => {
        expect(scoring.score).toBe(0);
      });

      it('starts with zero streak', () => {
        expect(scoring.streak).toBe(0);
      });

      it('starts with 1x multiplier', () => {
        expect(scoring.getMultiplier()).toBe(1);
      });
    });

    describe('recordHit', () => {
      it('adds points for PERFECT hit', () => {
        scoring.recordHit(HitResult.PERFECT);
        expect(scoring.score).toBe(100);
      });

      it('increases streak on successful hit', () => {
        scoring.recordHit(HitResult.PERFECT);
        scoring.recordHit(HitResult.GREAT);
        scoring.recordHit(HitResult.GOOD);
        expect(scoring.streak).toBe(3);
      });

      it('resets streak on MISS', () => {
        scoring.recordHit(HitResult.PERFECT);
        scoring.recordHit(HitResult.PERFECT);
        scoring.recordHit(HitResult.MISS);
        expect(scoring.streak).toBe(0);
      });

      it('resets streak on WRONG_NOTE', () => {
        scoring.recordHit(HitResult.PERFECT);
        scoring.recordHit(HitResult.WRONG_NOTE);
        expect(scoring.streak).toBe(0);
      });

      it('tracks hit counts correctly', () => {
        scoring.recordHit(HitResult.PERFECT);
        scoring.recordHit(HitResult.PERFECT);
        scoring.recordHit(HitResult.GREAT);
        scoring.recordHit(HitResult.MISS);

        expect(scoring.hitCounts[HitResult.PERFECT]).toBe(2);
        expect(scoring.hitCounts[HitResult.GREAT]).toBe(1);
        expect(scoring.hitCounts[HitResult.MISS]).toBe(1);
      });

      it('returns correct score result', () => {
        const result = scoring.recordHit(HitResult.PERFECT);
        expect(result.points).toBe(100);
        expect(result.multiplier).toBe(1);
        expect(result.newStreak).toBe(1);
      });

      it('applies multiplier after 10 streak', () => {
        for (let i = 0; i < 10; i++) {
          scoring.recordHit(HitResult.PERFECT);
        }
        // At streak 10, multiplier becomes 2x
        const result = scoring.recordHit(HitResult.PERFECT);
        expect(result.multiplier).toBe(2);
        expect(result.points).toBe(200);
      });
    });

    describe('getAccuracy', () => {
      it('returns 100% with no notes', () => {
        expect(scoring.getAccuracy()).toBe(100);
      });

      it('calculates accuracy correctly', () => {
        scoring.recordHit(HitResult.PERFECT);
        scoring.recordHit(HitResult.GREAT);
        scoring.recordHit(HitResult.MISS);
        scoring.recordHit(HitResult.MISS);
        // 2 successful out of 4
        expect(scoring.getAccuracy()).toBe(50);
      });

      it('includes GOOD in successful hits', () => {
        scoring.recordHit(HitResult.PERFECT);
        scoring.recordHit(HitResult.GOOD);
        expect(scoring.getAccuracy()).toBe(100);
      });
    });

    describe('getStars', () => {
      it('returns 3 stars for 90%+ accuracy', () => {
        for (let i = 0; i < 9; i++) {
          scoring.recordHit(HitResult.PERFECT);
        }
        scoring.recordHit(HitResult.MISS);
        expect(scoring.getStars()).toBe(3);
      });

      it('returns 2 stars for 70-89% accuracy', () => {
        for (let i = 0; i < 7; i++) {
          scoring.recordHit(HitResult.PERFECT);
        }
        for (let i = 0; i < 3; i++) {
          scoring.recordHit(HitResult.MISS);
        }
        expect(scoring.getStars()).toBe(2);
      });

      it('returns 1 star for below 70% accuracy', () => {
        for (let i = 0; i < 5; i++) {
          scoring.recordHit(HitResult.PERFECT);
        }
        for (let i = 0; i < 5; i++) {
          scoring.recordHit(HitResult.MISS);
        }
        expect(scoring.getStars()).toBe(1);
      });
    });

    describe('getSummary', () => {
      it('returns complete summary', () => {
        scoring.recordHit(HitResult.PERFECT);
        scoring.recordHit(HitResult.GREAT);
        scoring.recordHit(HitResult.MISS);

        const summary = scoring.getSummary();

        expect(summary.score).toBe(170); // 100 + 70
        expect(summary.accuracy).toBe(67); // 2/3 rounded
        expect(summary.maxStreak).toBe(2);
        expect(summary.totalNotes).toBe(3);
        expect(summary.hitCounts[HitResult.PERFECT]).toBe(1);
      });
    });

    describe('reset', () => {
      it('resets all state', () => {
        scoring.recordHit(HitResult.PERFECT);
        scoring.recordHit(HitResult.PERFECT);
        scoring.reset();

        expect(scoring.score).toBe(0);
        expect(scoring.streak).toBe(0);
        expect(scoring.totalNotes).toBe(0);
      });
    });
  });
});
