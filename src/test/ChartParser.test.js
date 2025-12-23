/**
 * Tests for ChartParser module
 */

import { describe, it, expect } from 'vitest';
import {
  parseChart,
  simpleNotesToChart,
  getChartTimeRange,
  getVisibleNotes,
  MIDI_TO_NOTE,
  NOTE_TO_MIDI,
} from '../engine/ChartParser.js';

describe('ChartParser', () => {
  describe('MIDI_TO_NOTE and NOTE_TO_MIDI', () => {
    it('maps MIDI 60 to C4', () => {
      expect(MIDI_TO_NOTE[60]).toBe('C4');
    });

    it('maps C4 to MIDI 60', () => {
      expect(NOTE_TO_MIDI['C4']).toBe(60);
    });

    it('has consistent bidirectional mapping', () => {
      for (const [midi, note] of Object.entries(MIDI_TO_NOTE)) {
        expect(NOTE_TO_MIDI[note]).toBe(parseInt(midi));
      }
    });
  });

  describe('parseChart', () => {
    it('parses valid chart data', () => {
      const chartData = {
        notes: [
          { timeMs: 0, midi: 60, durationMs: 500 },
          { timeMs: 500, midi: 62, durationMs: 500 },
        ],
      };

      const result = parseChart(chartData);

      expect(result.notes).toHaveLength(2);
      expect(result.noteCount).toBe(2);
      expect(result.duration).toBe(1000); // 500 + 500
    });

    it('adds unique IDs to notes', () => {
      const chartData = {
        notes: [
          { timeMs: 0, midi: 60 },
          { timeMs: 500, midi: 62 },
        ],
      };

      const result = parseChart(chartData);

      expect(result.notes[0].id).toBe('note-0');
      expect(result.notes[1].id).toBe('note-1');
    });

    it('adds noteName from MIDI', () => {
      const chartData = {
        notes: [{ timeMs: 0, midi: 60 }],
      };

      const result = parseChart(chartData);

      expect(result.notes[0].noteName).toBe('C4');
    });

    it('sorts notes by time', () => {
      const chartData = {
        notes: [
          { timeMs: 1000, midi: 64 },
          { timeMs: 0, midi: 60 },
          { timeMs: 500, midi: 62 },
        ],
      };

      const result = parseChart(chartData);

      expect(result.notes[0].timeMs).toBe(0);
      expect(result.notes[1].timeMs).toBe(500);
      expect(result.notes[2].timeMs).toBe(1000);
    });

    it('sets default duration if not provided', () => {
      const chartData = {
        notes: [{ timeMs: 0, midi: 60 }],
      };

      const result = parseChart(chartData);

      expect(result.notes[0].durationMs).toBe(400);
    });

    it('initializes hit state to false', () => {
      const chartData = {
        notes: [{ timeMs: 0, midi: 60 }],
      };

      const result = parseChart(chartData);

      expect(result.notes[0].hit).toBe(false);
      expect(result.notes[0].hitResult).toBe(null);
    });

    it('throws on invalid chart (missing notes)', () => {
      expect(() => parseChart({})).toThrow('Invalid chart');
      expect(() => parseChart(null)).toThrow('Invalid chart');
    });

    it('throws on invalid note (bad timeMs)', () => {
      expect(() => parseChart({ notes: [{ midi: 60 }] })).toThrow('invalid timeMs');
      expect(() => parseChart({ notes: [{ timeMs: -1, midi: 60 }] })).toThrow('invalid timeMs');
    });

    it('throws on invalid note (bad midi)', () => {
      expect(() => parseChart({ notes: [{ timeMs: 0 }] })).toThrow('invalid midi');
      expect(() => parseChart({ notes: [{ timeMs: 0, midi: 200 }] })).toThrow('invalid midi');
    });
  });

  describe('simpleNotesToChart', () => {
    it('converts note array to chart format', () => {
      const notes = ['C4', 'D4', 'E4'];
      const result = simpleNotesToChart(notes);

      expect(result.notes).toHaveLength(3);
      expect(result.notes[0].midi).toBe(60);
      expect(result.notes[1].midi).toBe(62);
      expect(result.notes[2].midi).toBe(64);
    });

    it('spaces notes by beatMs', () => {
      const notes = ['C4', 'D4'];
      const result = simpleNotesToChart(notes, 1000);

      expect(result.notes[0].timeMs).toBe(0);
      expect(result.notes[1].timeMs).toBe(1000);
    });

    it('uses default 500ms beat', () => {
      const notes = ['C4', 'D4'];
      const result = simpleNotesToChart(notes);

      expect(result.notes[1].timeMs).toBe(500);
    });
  });

  describe('getChartTimeRange', () => {
    it('returns correct time range', () => {
      const chart = parseChart({
        notes: [
          { timeMs: 100, midi: 60, durationMs: 500 },
          { timeMs: 1000, midi: 62, durationMs: 500 },
        ],
      });

      const range = getChartTimeRange(chart);

      expect(range.startMs).toBe(100);
      expect(range.endMs).toBe(1500); // 1000 + 500
    });

    it('returns zero range for empty chart', () => {
      const chart = { notes: [], duration: 0 };
      const range = getChartTimeRange(chart);

      expect(range.startMs).toBe(0);
      expect(range.endMs).toBe(0);
    });
  });

  describe('getVisibleNotes', () => {
    const notes = [
      { id: 'n1', timeMs: 0 },
      { id: 'n2', timeMs: 1000 },
      { id: 'n3', timeMs: 2000 },
      { id: 'n4', timeMs: 5000 },
    ];

    it('returns notes within look-ahead window', () => {
      const visible = getVisibleNotes(notes, 1000, 2000, 500);

      expect(visible).toHaveLength(2);
      expect(visible.map(n => n.id)).toContain('n2');
      expect(visible.map(n => n.id)).toContain('n3');
    });

    it('includes notes within look-behind window', () => {
      const visible = getVisibleNotes(notes, 500, 3000, 600);

      expect(visible.map(n => n.id)).toContain('n1');
    });

    it('excludes notes outside window', () => {
      const visible = getVisibleNotes(notes, 1000, 1000, 500);

      expect(visible.map(n => n.id)).not.toContain('n4');
    });

    it('uses default window values', () => {
      const visible = getVisibleNotes(notes, 0);

      // Default: lookAhead 3000, lookBehind 500
      expect(visible.map(n => n.id)).toContain('n1');
      expect(visible.map(n => n.id)).toContain('n2');
      expect(visible.map(n => n.id)).toContain('n3');
      expect(visible.map(n => n.id)).not.toContain('n4');
    });
  });
});
