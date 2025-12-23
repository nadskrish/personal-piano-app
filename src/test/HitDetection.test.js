/**
 * Tests for HitDetection module
 */

import { describe, it, expect } from 'vitest';
import {
  classifyHit,
  isNoteMissed,
  isNoteHittable,
  findBestMatch,
  HitResult,
  DEFAULT_HIT_WINDOWS,
} from '../engine/HitDetection.js';

describe('HitDetection', () => {
  describe('classifyHit', () => {
    it('returns PERFECT for delta within 60ms', () => {
      expect(classifyHit(0)).toBe(HitResult.PERFECT);
      expect(classifyHit(30)).toBe(HitResult.PERFECT);
      expect(classifyHit(60)).toBe(HitResult.PERFECT);
    });

    it('returns GREAT for delta between 61-120ms', () => {
      expect(classifyHit(61)).toBe(HitResult.GREAT);
      expect(classifyHit(90)).toBe(HitResult.GREAT);
      expect(classifyHit(120)).toBe(HitResult.GREAT);
    });

    it('returns GOOD for delta between 121-180ms', () => {
      expect(classifyHit(121)).toBe(HitResult.GOOD);
      expect(classifyHit(150)).toBe(HitResult.GOOD);
      expect(classifyHit(180)).toBe(HitResult.GOOD);
    });

    it('returns MISS for delta over 180ms', () => {
      expect(classifyHit(181)).toBe(HitResult.MISS);
      expect(classifyHit(300)).toBe(HitResult.MISS);
      expect(classifyHit(1000)).toBe(HitResult.MISS);
    });

    it('returns WRONG_NOTE when correctNote is false', () => {
      expect(classifyHit(0, false)).toBe(HitResult.WRONG_NOTE);
      expect(classifyHit(50, false)).toBe(HitResult.WRONG_NOTE);
    });

    it('uses absolute value of delta', () => {
      expect(classifyHit(-30)).toBe(HitResult.PERFECT);
      expect(classifyHit(-90)).toBe(HitResult.GREAT);
    });

    it('respects custom hit windows', () => {
      const customWindows = { perfect: 30, great: 60, good: 100 };
      expect(classifyHit(30, true, customWindows)).toBe(HitResult.PERFECT);
      expect(classifyHit(31, true, customWindows)).toBe(HitResult.GREAT);
      expect(classifyHit(61, true, customWindows)).toBe(HitResult.GOOD);
      expect(classifyHit(101, true, customWindows)).toBe(HitResult.MISS);
    });
  });

  describe('isNoteMissed', () => {
    it('returns true when note is past hit window', () => {
      expect(isNoteMissed(1000, 1200)).toBe(true);
      expect(isNoteMissed(1000, 1181)).toBe(true);
    });

    it('returns false when note is still hittable', () => {
      expect(isNoteMissed(1000, 1000)).toBe(false);
      expect(isNoteMissed(1000, 1180)).toBe(false);
      expect(isNoteMissed(1000, 800)).toBe(false);
    });
  });

  describe('isNoteHittable', () => {
    it('returns true when note is within hit window', () => {
      expect(isNoteHittable(1000, 1000)).toBe(true);
      expect(isNoteHittable(1000, 1100)).toBe(true);
      expect(isNoteHittable(1000, 900)).toBe(true);
      expect(isNoteHittable(1000, 1180)).toBe(true);
    });

    it('returns false when note is outside hit window', () => {
      expect(isNoteHittable(1000, 1200)).toBe(false);
      expect(isNoteHittable(1000, 800)).toBe(false);
    });
  });

  describe('findBestMatch', () => {
    const notes = [
      { id: 'n1', midi: 60, timeMs: 1000, hit: false },
      { id: 'n2', midi: 62, timeMs: 1500, hit: false },
      { id: 'n3', midi: 60, timeMs: 2000, hit: false },
    ];

    it('finds matching note within hit window', () => {
      const result = findBestMatch(60, 1050, notes);
      expect(result).not.toBeNull();
      expect(result.note.id).toBe('n1');
      expect(result.hitResult).toBe(HitResult.PERFECT);
    });

    it('returns null when no matching note', () => {
      const result = findBestMatch(64, 1050, notes);
      expect(result).toBeNull();
    });

    it('returns null when outside hit window', () => {
      const result = findBestMatch(60, 500, notes);
      expect(result).toBeNull();
    });

    it('skips already hit notes', () => {
      const notesWithHit = [
        { id: 'n1', midi: 60, timeMs: 1000, hit: true },
        { id: 'n2', midi: 60, timeMs: 2000, hit: false },
      ];
      const result = findBestMatch(60, 1050, notesWithHit);
      expect(result).toBeNull();
    });

    it('finds closest note when multiple are in range', () => {
      const closeNotes = [
        { id: 'n1', midi: 60, timeMs: 1000, hit: false },
        { id: 'n2', midi: 60, timeMs: 1100, hit: false },
      ];
      const result = findBestMatch(60, 1090, closeNotes);
      expect(result.note.id).toBe('n2'); // Closer to 1100
    });
  });
});
