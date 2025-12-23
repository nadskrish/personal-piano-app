/**
 * HitDetection - Classifies timing accuracy of note hits
 *
 * Hit windows (configurable):
 * - Perfect: |delta| <= 60ms
 * - Great: 61-120ms
 * - Good: 121-180ms
 * - Miss: >180ms or wrong note
 */

// Default hit window thresholds in ms
export const DEFAULT_HIT_WINDOWS = {
  perfect: 60,
  great: 120,
  good: 180,
};

/**
 * Hit result types
 */
export const HitResult = {
  PERFECT: 'perfect',
  GREAT: 'great',
  GOOD: 'good',
  MISS: 'miss',
  WRONG_NOTE: 'wrong_note',
};

/**
 * Classify a hit based on timing delta
 * @param {number} deltaMs - Absolute time difference between hit and target (always positive)
 * @param {boolean} correctNote - Whether the correct note was hit
 * @param {object} windows - Custom hit windows (optional)
 * @returns {string} HitResult value
 */
export function classifyHit(deltaMs, correctNote = true, windows = DEFAULT_HIT_WINDOWS) {
  if (!correctNote) {
    return HitResult.WRONG_NOTE;
  }

  const absDelta = Math.abs(deltaMs);

  if (absDelta <= windows.perfect) {
    return HitResult.PERFECT;
  }
  if (absDelta <= windows.great) {
    return HitResult.GREAT;
  }
  if (absDelta <= windows.good) {
    return HitResult.GOOD;
  }
  return HitResult.MISS;
}

/**
 * Check if a note should be considered missed (past the hit window)
 * @param {number} noteTimeMs - Target time of the note
 * @param {number} currentTimeMs - Current transport time
 * @param {object} windows - Custom hit windows (optional)
 * @returns {boolean}
 */
export function isNoteMissed(noteTimeMs, currentTimeMs, windows = DEFAULT_HIT_WINDOWS) {
  return currentTimeMs > noteTimeMs + windows.good;
}

/**
 * Check if a note is within hittable range
 * @param {number} noteTimeMs - Target time of the note
 * @param {number} currentTimeMs - Current transport time
 * @param {object} windows - Custom hit windows (optional)
 * @returns {boolean}
 */
export function isNoteHittable(noteTimeMs, currentTimeMs, windows = DEFAULT_HIT_WINDOWS) {
  const delta = Math.abs(currentTimeMs - noteTimeMs);
  return delta <= windows.good;
}

/**
 * Find the best matching note for a key press
 * @param {number} midiNote - MIDI note number pressed
 * @param {number} currentTimeMs - Current transport time
 * @param {Array} activeNotes - Array of {timeMs, midi, id} notes to check
 * @param {object} windows - Custom hit windows (optional)
 * @returns {object|null} Best matching note with hitResult, or null if no match
 */
export function findBestMatch(midiNote, currentTimeMs, activeNotes, windows = DEFAULT_HIT_WINDOWS) {
  let bestMatch = null;
  let bestDelta = Infinity;

  for (const note of activeNotes) {
    if (note.midi !== midiNote) continue;
    if (note.hit) continue; // Already hit

    const delta = Math.abs(currentTimeMs - note.timeMs);

    if (delta <= windows.good && delta < bestDelta) {
      bestDelta = delta;
      bestMatch = {
        note,
        delta,
        hitResult: classifyHit(delta, true, windows),
      };
    }
  }

  return bestMatch;
}
