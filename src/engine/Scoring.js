/**
 * Scoring - Calculate score with streak multiplier
 *
 * Base scores:
 * - Perfect: 100
 * - Great: 70
 * - Good: 40
 * - Miss: 0
 *
 * Streak multiplier: +1 every 10 consecutive non-miss hits (capped at 4x)
 */

import { HitResult } from './HitDetection.js';

// Base scores per hit type
export const BASE_SCORES = {
  [HitResult.PERFECT]: 100,
  [HitResult.GREAT]: 70,
  [HitResult.GOOD]: 40,
  [HitResult.MISS]: 0,
  [HitResult.WRONG_NOTE]: 0,
};

// Streak configuration
export const STREAK_CONFIG = {
  notesPerMultiplier: 10,  // Every 10 notes increases multiplier
  maxMultiplier: 4,        // Cap at 4x
};

/**
 * Scoring state manager
 */
export class ScoringEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.hitCounts = {
      [HitResult.PERFECT]: 0,
      [HitResult.GREAT]: 0,
      [HitResult.GOOD]: 0,
      [HitResult.MISS]: 0,
      [HitResult.WRONG_NOTE]: 0,
    };
    this.totalNotes = 0;
    this.mistakes = []; // Array of {noteId, expectedMidi, actualMidi, deltaMs, hitResult}
  }

  /**
   * Get current multiplier based on streak
   * @returns {number}
   */
  getMultiplier() {
    const multiplier = 1 + Math.floor(this.streak / STREAK_CONFIG.notesPerMultiplier);
    return Math.min(multiplier, STREAK_CONFIG.maxMultiplier);
  }

  /**
   * Record a hit and update score
   * @param {string} hitResult - HitResult value
   * @param {object} noteInfo - Optional info for tracking mistakes
   * @returns {object} {points, multiplier, newStreak}
   */
  recordHit(hitResult, noteInfo = null) {
    this.hitCounts[hitResult]++;
    this.totalNotes++;

    const isMiss = hitResult === HitResult.MISS || hitResult === HitResult.WRONG_NOTE;

    if (isMiss) {
      // Record mistake
      if (noteInfo) {
        this.mistakes.push({
          ...noteInfo,
          hitResult,
        });
      }
      // Reset streak on miss
      this.streak = 0;
    } else {
      // Increase streak on successful hit
      this.streak++;
      this.maxStreak = Math.max(this.maxStreak, this.streak);
    }

    const multiplier = this.getMultiplier();
    const basePoints = BASE_SCORES[hitResult];
    const points = basePoints * multiplier;

    this.score += points;

    return {
      points,
      multiplier,
      newStreak: this.streak,
      basePoints,
    };
  }

  /**
   * Get accuracy percentage
   * @returns {number} 0-100
   */
  getAccuracy() {
    if (this.totalNotes === 0) return 100;
    const successful = this.hitCounts[HitResult.PERFECT] +
                       this.hitCounts[HitResult.GREAT] +
                       this.hitCounts[HitResult.GOOD];
    return Math.round((successful / this.totalNotes) * 100);
  }

  /**
   * Calculate star rating (1-3 stars)
   * @returns {number} 1, 2, or 3
   */
  getStars() {
    const accuracy = this.getAccuracy();
    if (accuracy >= 90) return 3;
    if (accuracy >= 70) return 2;
    return 1;
  }

  /**
   * Get summary of performance
   * @returns {object}
   */
  getSummary() {
    return {
      score: this.score,
      accuracy: this.getAccuracy(),
      stars: this.getStars(),
      maxStreak: this.maxStreak,
      hitCounts: { ...this.hitCounts },
      totalNotes: this.totalNotes,
      mistakes: [...this.mistakes],
    };
  }
}

/**
 * Calculate score for a hit (pure function for testing)
 * @param {string} hitResult - HitResult value
 * @param {number} streak - Current streak before this hit
 * @returns {object} {points, multiplier}
 */
export function calculateScore(hitResult, streak = 0) {
  const isMiss = hitResult === HitResult.MISS || hitResult === HitResult.WRONG_NOTE;
  const effectiveStreak = isMiss ? 0 : streak;
  const multiplier = Math.min(
    1 + Math.floor(effectiveStreak / STREAK_CONFIG.notesPerMultiplier),
    STREAK_CONFIG.maxMultiplier
  );
  const basePoints = BASE_SCORES[hitResult];

  return {
    points: basePoints * multiplier,
    multiplier,
    basePoints,
  };
}
