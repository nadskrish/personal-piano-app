/**
 * Song catalog and loading utilities
 */

// Import song metadata
import twinkleMeta from './twinkle-twinkle/meta.json';
import jingleMeta from './jingle-bells/meta.json';

// Import charts for Twinkle Twinkle
import twinkleSimple from './twinkle-twinkle/charts/simple.json';
import twinkleMedium from './twinkle-twinkle/charts/medium.json';
import twinkleHard from './twinkle-twinkle/charts/hard.json';

// Import charts for Jingle Bells
import jingleSimple from './jingle-bells/charts/simple.json';
import jingleMedium from './jingle-bells/charts/medium.json';
import jingleHard from './jingle-bells/charts/hard.json';

/**
 * All available songs with their metadata and charts
 */
export const SONGS = {
  'twinkle-twinkle': {
    ...twinkleMeta,
    charts: {
      simple: twinkleSimple,
      medium: twinkleMedium,
      hard: twinkleHard,
    },
  },
  'jingle-bells': {
    ...jingleMeta,
    charts: {
      simple: jingleSimple,
      medium: jingleMedium,
      hard: jingleHard,
    },
  },
};

/**
 * Get list of all songs for display
 * @returns {Array} Array of song metadata objects
 */
export function getSongList() {
  return Object.values(SONGS).map(song => ({
    id: song.id,
    title: song.title,
    shortTitle: song.shortTitle,
    thumbnail: song.thumbnail,
    color: song.color,
    difficulties: Object.keys(song.charts),
  }));
}

/**
 * Get a specific song with its chart
 * @param {string} songId - Song identifier
 * @param {string} difficulty - 'simple', 'medium', or 'hard'
 * @returns {object|null} Song data with selected chart
 */
export function getSong(songId, difficulty = 'simple') {
  const song = SONGS[songId];
  if (!song) return null;

  const chart = song.charts[difficulty];
  if (!chart) return null;

  return {
    id: song.id,
    title: song.title,
    shortTitle: song.shortTitle,
    bpm: song.bpm,
    color: song.color,
    thumbnail: song.thumbnail,
    difficulty,
    difficultyDescription: song.difficulty[difficulty],
    chart,
  };
}

/**
 * Difficulty display names
 */
export const DIFFICULTY_LABELS = {
  simple: 'Simple',
  medium: 'Medium',
  hard: 'Hard',
};

/**
 * Difficulty colors for UI
 */
export const DIFFICULTY_COLORS = {
  simple: '#4ade80', // green
  medium: '#facc15', // yellow
  hard: '#f87171',   // red
};
