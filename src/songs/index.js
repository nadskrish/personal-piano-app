/**
 * Song catalog and loading utilities
 */

// Import song metadata
import twinkleMeta from './twinkle-twinkle/meta.json';
import jingleMeta from './jingle-bells/meta.json';
import maryMeta from './mary-lamb/meta.json';
import oldMacMeta from './old-macdonald/meta.json';
import rowBoatMeta from './row-your-boat/meta.json';
import happyBirthdayMeta from './happy-birthday/meta.json';
import londonBridgeMeta from './london-bridge/meta.json';
import itsBitSpiderMeta from './itsy-bitsy-spider/meta.json';
import abcMeta from './abc-song/meta.json';
import baaBaaMeta from './baa-baa-black-sheep/meta.json';
import fiveLittleDucksMeta from './five-little-ducks/meta.json';
import hotCrossBunsMeta from './hot-cross-buns/meta.json';
import threeBlindMiceMeta from './three-blind-mice/meta.json';
import yankeeDoodleMeta from './yankee-doodle/meta.json';
import odeToJoyMeta from './ode-to-joy/meta.json';
import areYouSleepingMeta from './are-you-sleeping/meta.json';
import skipToMyLouMeta from './skip-to-my-lou/meta.json';
import thisOldManMeta from './this-old-man/meta.json';
import wheelsOnBusMeta from './wheels-on-bus/meta.json';
import babySharkMeta from './baby-shark/meta.json';

// Import charts for Twinkle Twinkle
import twinkleSimple from './twinkle-twinkle/charts/simple.json';
import twinkleMedium from './twinkle-twinkle/charts/medium.json';
import twinkleHard from './twinkle-twinkle/charts/hard.json';

// Import charts for Jingle Bells
import jingleSimple from './jingle-bells/charts/simple.json';
import jingleMedium from './jingle-bells/charts/medium.json';
import jingleHard from './jingle-bells/charts/hard.json';

// Import charts for Mary Had a Little Lamb
import marySimple from './mary-lamb/simple.json';
import maryMedium from './mary-lamb/medium.json';
import maryHard from './mary-lamb/hard.json';

// Import charts for Old MacDonald
import oldMacSimple from './old-macdonald/simple.json';
import oldMacMedium from './old-macdonald/medium.json';
import oldMacHard from './old-macdonald/hard.json';

// Import charts for Row Your Boat
import rowBoatSimple from './row-your-boat/simple.json';
import rowBoatMedium from './row-your-boat/medium.json';
import rowBoatHard from './row-your-boat/hard.json';

// Import charts for Happy Birthday
import happyBirthdaySimple from './happy-birthday/simple.json';
import happyBirthdayMedium from './happy-birthday/medium.json';
import happyBirthdayHard from './happy-birthday/hard.json';

// Import charts for London Bridge
import londonBridgeSimple from './london-bridge/simple.json';
import londonBridgeMedium from './london-bridge/medium.json';
import londonBridgeHard from './london-bridge/hard.json';

// Import charts for Itsy Bitsy Spider
import itsBitSpiderSimple from './itsy-bitsy-spider/simple.json';
import itsBitSpiderMedium from './itsy-bitsy-spider/medium.json';
import itsBitSpiderHard from './itsy-bitsy-spider/hard.json';

// Import charts for ABC Song
import abcSimple from './abc-song/simple.json';
import abcMedium from './abc-song/medium.json';
import abcHard from './abc-song/hard.json';

// Import charts for Baa Baa Black Sheep
import baaBaaSimple from './baa-baa-black-sheep/simple.json';
import baaBaaMedium from './baa-baa-black-sheep/medium.json';
import baaBaaHard from './baa-baa-black-sheep/hard.json';

// Import charts for Five Little Ducks
import fiveLittleDucksSimple from './five-little-ducks/simple.json';
import fiveLittleDucksMedium from './five-little-ducks/medium.json';
import fiveLittleDucksHard from './five-little-ducks/hard.json';

// Import charts for Hot Cross Buns
import hotCrossBunsSimple from './hot-cross-buns/simple.json';
import hotCrossBunsMedium from './hot-cross-buns/medium.json';
import hotCrossBunsHard from './hot-cross-buns/hard.json';

// Import charts for Three Blind Mice
import threeBlindMiceSimple from './three-blind-mice/simple.json';
import threeBlindMiceMedium from './three-blind-mice/medium.json';
import threeBlindMiceHard from './three-blind-mice/hard.json';

// Import charts for Yankee Doodle
import yankeeDoodleSimple from './yankee-doodle/simple.json';
import yankeeDoodleMedium from './yankee-doodle/medium.json';
import yankeeDoodleHard from './yankee-doodle/hard.json';

// Import charts for Ode to Joy
import odeToJoySimple from './ode-to-joy/simple.json';
import odeToJoyMedium from './ode-to-joy/medium.json';
import odeToJoyHard from './ode-to-joy/hard.json';

// Import charts for Are You Sleeping
import areYouSleepingSimple from './are-you-sleeping/simple.json';
import areYouSleepingMedium from './are-you-sleeping/medium.json';
import areYouSleepingHard from './are-you-sleeping/hard.json';

// Import charts for Skip to My Lou
import skipToMyLouSimple from './skip-to-my-lou/simple.json';
import skipToMyLouMedium from './skip-to-my-lou/medium.json';
import skipToMyLouHard from './skip-to-my-lou/hard.json';

// Import charts for This Old Man
import thisOldManSimple from './this-old-man/simple.json';
import thisOldManMedium from './this-old-man/medium.json';
import thisOldManHard from './this-old-man/hard.json';

// Import charts for Wheels on the Bus
import wheelsOnBusSimple from './wheels-on-bus/simple.json';
import wheelsOnBusMedium from './wheels-on-bus/medium.json';
import wheelsOnBusHard from './wheels-on-bus/hard.json';

// Import charts for Baby Shark
import babySharkSimple from './baby-shark/simple.json';
import babySharkMedium from './baby-shark/medium.json';
import babySharkHard from './baby-shark/hard.json';

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
  'mary-lamb': {
    ...maryMeta,
    charts: {
      simple: marySimple,
      medium: maryMedium,
      hard: maryHard,
    },
  },
  'old-macdonald': {
    ...oldMacMeta,
    charts: {
      simple: oldMacSimple,
      medium: oldMacMedium,
      hard: oldMacHard,
    },
  },
  'row-your-boat': {
    ...rowBoatMeta,
    charts: {
      simple: rowBoatSimple,
      medium: rowBoatMedium,
      hard: rowBoatHard,
    },
  },
  'happy-birthday': {
    ...happyBirthdayMeta,
    charts: {
      simple: happyBirthdaySimple,
      medium: happyBirthdayMedium,
      hard: happyBirthdayHard,
    },
  },
  'london-bridge': {
    ...londonBridgeMeta,
    charts: {
      simple: londonBridgeSimple,
      medium: londonBridgeMedium,
      hard: londonBridgeHard,
    },
  },
  'itsy-bitsy-spider': {
    ...itsBitSpiderMeta,
    charts: {
      simple: itsBitSpiderSimple,
      medium: itsBitSpiderMedium,
      hard: itsBitSpiderHard,
    },
  },
  'abc-song': {
    ...abcMeta,
    charts: {
      simple: abcSimple,
      medium: abcMedium,
      hard: abcHard,
    },
  },
  'baa-baa-black-sheep': {
    ...baaBaaMeta,
    charts: {
      simple: baaBaaSimple,
      medium: baaBaaMedium,
      hard: baaBaaHard,
    },
  },
  'five-little-ducks': {
    ...fiveLittleDucksMeta,
    charts: {
      simple: fiveLittleDucksSimple,
      medium: fiveLittleDucksMedium,
      hard: fiveLittleDucksHard,
    },
  },
  'hot-cross-buns': {
    ...hotCrossBunsMeta,
    charts: {
      simple: hotCrossBunsSimple,
      medium: hotCrossBunsMedium,
      hard: hotCrossBunsHard,
    },
  },
  'three-blind-mice': {
    ...threeBlindMiceMeta,
    charts: {
      simple: threeBlindMiceSimple,
      medium: threeBlindMiceMedium,
      hard: threeBlindMiceHard,
    },
  },
  'yankee-doodle': {
    ...yankeeDoodleMeta,
    charts: {
      simple: yankeeDoodleSimple,
      medium: yankeeDoodleMedium,
      hard: yankeeDoodleHard,
    },
  },
  'ode-to-joy': {
    ...odeToJoyMeta,
    charts: {
      simple: odeToJoySimple,
      medium: odeToJoyMedium,
      hard: odeToJoyHard,
    },
  },
  'are-you-sleeping': {
    ...areYouSleepingMeta,
    charts: {
      simple: areYouSleepingSimple,
      medium: areYouSleepingMedium,
      hard: areYouSleepingHard,
    },
  },
  'skip-to-my-lou': {
    ...skipToMyLouMeta,
    charts: {
      simple: skipToMyLouSimple,
      medium: skipToMyLouMedium,
      hard: skipToMyLouHard,
    },
  },
  'this-old-man': {
    ...thisOldManMeta,
    charts: {
      simple: thisOldManSimple,
      medium: thisOldManMedium,
      hard: thisOldManHard,
    },
  },
  'wheels-on-bus': {
    ...wheelsOnBusMeta,
    charts: {
      simple: wheelsOnBusSimple,
      medium: wheelsOnBusMedium,
      hard: wheelsOnBusHard,
    },
  },
  'baby-shark': {
    ...babySharkMeta,
    charts: {
      simple: babySharkSimple,
      medium: babySharkMedium,
      hard: babySharkHard,
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
