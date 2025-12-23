/**
 * ChartParser - Parse and validate song chart files
 *
 * Chart format:
 * {
 *   "notes": [
 *     { "timeMs": 0, "midi": 60, "durationMs": 500 },
 *     { "timeMs": 500, "midi": 62, "durationMs": 500 },
 *     ...
 *   ]
 * }
 */

/**
 * MIDI note number to note name mapping
 */
export const MIDI_TO_NOTE = {
  48: 'C3', 49: 'C#3', 50: 'D3', 51: 'D#3', 52: 'E3', 53: 'F3',
  54: 'F#3', 55: 'G3', 56: 'G#3', 57: 'A3', 58: 'A#3', 59: 'B3',
  60: 'C4', 61: 'C#4', 62: 'D4', 63: 'D#4', 64: 'E4', 65: 'F4',
  66: 'F#4', 67: 'G4', 68: 'G#4', 69: 'A4', 70: 'A#4', 71: 'B4',
  72: 'C5', 73: 'C#5', 74: 'D5', 75: 'D#5', 76: 'E5', 77: 'F5',
};

/**
 * Note name to MIDI number mapping
 */
export const NOTE_TO_MIDI = Object.fromEntries(
  Object.entries(MIDI_TO_NOTE).map(([midi, note]) => [note, parseInt(midi)])
);

/**
 * Parse and validate a chart
 * @param {object} chartData - Raw chart data
 * @returns {object} Parsed chart with validated notes
 * @throws {Error} If chart is invalid
 */
export function parseChart(chartData) {
  if (!chartData || !Array.isArray(chartData.notes)) {
    throw new Error('Invalid chart: missing notes array');
  }

  const parsedNotes = chartData.notes.map((note, index) => {
    // Support both timeMs and time property names
    const timeMs = note.timeMs ?? note.time;
    const durationMs = note.durationMs ?? note.duration ?? 400;

    if (typeof timeMs !== 'number' || timeMs < 0) {
      throw new Error(`Invalid note at index ${index}: invalid timeMs`);
    }
    if (typeof note.midi !== 'number' || note.midi < 0 || note.midi > 127) {
      throw new Error(`Invalid note at index ${index}: invalid midi number`);
    }

    return {
      id: `note-${index}`,
      timeMs: timeMs,
      midi: note.midi,
      durationMs: durationMs,
      noteName: MIDI_TO_NOTE[note.midi] || `M${note.midi}`,
      hit: false,
      hitResult: null,
    };
  });

  // Sort by time
  parsedNotes.sort((a, b) => a.timeMs - b.timeMs);

  return {
    notes: parsedNotes,
    duration: parsedNotes.length > 0
      ? parsedNotes[parsedNotes.length - 1].timeMs +
        parsedNotes[parsedNotes.length - 1].durationMs
      : 0,
    noteCount: parsedNotes.length,
  };
}

/**
 * Convert simple note array to chart format
 * Useful for converting legacy ["C4", "D4", ...] format
 * @param {string[]} noteNames - Array of note names
 * @param {number} beatMs - Milliseconds per beat (default 500ms = 120bpm)
 * @returns {object} Chart data
 */
export function simpleNotesToChart(noteNames, beatMs = 500) {
  const notes = noteNames.map((name, index) => ({
    timeMs: index * beatMs,
    midi: NOTE_TO_MIDI[name] || 60,
    durationMs: beatMs - 50, // Small gap between notes
  }));

  return { notes };
}

/**
 * Get the time range of notes in the chart
 * @param {object} parsedChart - Parsed chart from parseChart()
 * @returns {object} {startMs, endMs}
 */
export function getChartTimeRange(parsedChart) {
  if (!parsedChart.notes.length) {
    return { startMs: 0, endMs: 0 };
  }
  return {
    startMs: parsedChart.notes[0].timeMs,
    endMs: parsedChart.duration,
  };
}

/**
 * Get notes within a time window (for rendering optimization)
 * @param {Array} notes - Array of notes from parsed chart
 * @param {number} currentTimeMs - Current transport time
 * @param {number} lookAheadMs - How far ahead to look (default 3000ms)
 * @param {number} lookBehindMs - How far behind to keep (default 500ms)
 * @returns {Array} Filtered notes
 */
export function getVisibleNotes(notes, currentTimeMs, lookAheadMs = 3000, lookBehindMs = 500) {
  const minTime = currentTimeMs - lookBehindMs;
  const maxTime = currentTimeMs + lookAheadMs;

  return notes.filter(note =>
    note.timeMs >= minTime && note.timeMs <= maxTime
  );
}
