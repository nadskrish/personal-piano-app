/**
 * GameEngine - Main game loop and state management
 *
 * Ties together Transport, HitDetection, and Scoring
 * Uses requestAnimationFrame for smooth 60fps updates
 */

import { Transport } from './Transport.js';
import { ScoringEngine } from './Scoring.js';
import { classifyHit, isNoteMissed, findBestMatch, HitResult, DEFAULT_HIT_WINDOWS } from './HitDetection.js';
import { parseChart } from './ChartParser.js';

/**
 * Game states
 */
export const GameState = {
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
  FINISHED: 'finished',
};

/**
 * Game engine class
 */
export class GameEngine {
  constructor(options = {}) {
    this.transport = new Transport();
    this.scoring = new ScoringEngine();

    // Configuration
    this.hitWindows = options.hitWindows || DEFAULT_HIT_WINDOWS;
    this.lookAheadMs = options.lookAheadMs || 3000; // Notes visible 3s ahead
    this.noteSpeedPxPerMs = options.noteSpeedPxPerMs || 0.3; // Pixels per millisecond

    // State
    this.state = GameState.IDLE;
    this.chart = null;
    this.notes = [];
    this.animationFrameId = null;

    // Callbacks
    this.onUpdate = options.onUpdate || (() => {});
    this.onNoteHit = options.onNoteHit || (() => {});
    this.onNoteMiss = options.onNoteMiss || (() => {});
    this.onFinish = options.onFinish || (() => {});
  }

  /**
   * Load a chart into the engine
   * @param {object} chartData - Raw chart data to parse
   */
  loadChart(chartData) {
    this.chart = parseChart(chartData);
    this.notes = this.chart.notes.map(note => ({ ...note, hit: false, hitResult: null }));
    this.scoring.reset();
    this.state = GameState.IDLE;
  }

  /**
   * Start the game
   */
  start() {
    if (!this.chart) {
      throw new Error('No chart loaded');
    }

    this.transport.start();
    this.state = GameState.PLAYING;
    this.startGameLoop();
  }

  /**
   * Pause the game
   */
  pause() {
    this.transport.pause();
    this.state = GameState.PAUSED;
    this.stopGameLoop();
  }

  /**
   * Resume from pause
   */
  resume() {
    this.transport.start();
    this.state = GameState.PLAYING;
    this.startGameLoop();
  }

  /**
   * Stop and reset the game
   */
  stop() {
    this.transport.stop();
    this.state = GameState.IDLE;
    this.stopGameLoop();
    if (this.chart) {
      this.notes = this.chart.notes.map(note => ({ ...note, hit: false, hitResult: null }));
    }
    this.scoring.reset();
  }

  /**
   * Restart the current song
   */
  restart() {
    this.stop();
    this.start();
  }

  /**
   * Handle a key press (from keyboard or MIDI)
   * @param {number} midiNote - MIDI note number
   * @returns {object|null} Hit result or null if no match
   */
  handleKeyPress(midiNote) {
    if (this.state !== GameState.PLAYING) return null;

    const currentTime = this.transport.getCurrentTimeMs();
    const activeNotes = this.notes.filter(n => !n.hit);

    const match = findBestMatch(midiNote, currentTime, activeNotes, this.hitWindows);

    if (match) {
      // Mark note as hit
      match.note.hit = true;
      match.note.hitResult = match.hitResult;

      // Update score
      const scoreResult = this.scoring.recordHit(match.hitResult, {
        noteId: match.note.id,
        expectedMidi: match.note.midi,
        actualMidi: midiNote,
        deltaMs: match.delta,
      });

      this.onNoteHit({
        note: match.note,
        hitResult: match.hitResult,
        delta: match.delta,
        scoreResult,
      });

      return {
        hitResult: match.hitResult,
        note: match.note,
        scoreResult,
      };
    }

    // Wrong note pressed - find if there was a nearby expected note
    const nearbyNote = activeNotes.find(n =>
      Math.abs(currentTime - n.timeMs) <= this.hitWindows.good
    );

    if (nearbyNote) {
      // Wrong note when a different note was expected
      this.scoring.recordHit(HitResult.WRONG_NOTE, {
        noteId: nearbyNote.id,
        expectedMidi: nearbyNote.midi,
        actualMidi: midiNote,
        deltaMs: Math.abs(currentTime - nearbyNote.timeMs),
      });
    }

    return null;
  }

  /**
   * Start the game loop using requestAnimationFrame
   */
  startGameLoop() {
    const loop = () => {
      if (this.state !== GameState.PLAYING) return;

      this.update();
      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  /**
   * Stop the game loop
   */
  stopGameLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Main update function called every frame
   */
  update() {
    const currentTime = this.transport.getCurrentTimeMs();

    // Check for missed notes
    for (const note of this.notes) {
      if (!note.hit && isNoteMissed(note.timeMs, currentTime, this.hitWindows)) {
        note.hit = true;
        note.hitResult = HitResult.MISS;

        this.scoring.recordHit(HitResult.MISS, {
          noteId: note.id,
          expectedMidi: note.midi,
          actualMidi: null,
          deltaMs: currentTime - note.timeMs,
        });

        this.onNoteMiss({ note });
      }
    }

    // Check if song is finished
    const allNotesProcessed = this.notes.every(n => n.hit);
    const lastNoteTime = this.chart.duration;

    if (allNotesProcessed && currentTime > lastNoteTime + 500) {
      this.finish();
      return;
    }

    // Call update callback with current state
    this.onUpdate({
      currentTimeMs: currentTime,
      notes: this.notes,
      score: this.scoring.score,
      streak: this.scoring.streak,
      multiplier: this.scoring.getMultiplier(),
      progress: Math.min(currentTime / this.chart.duration, 1),
    });
  }

  /**
   * Finish the game
   */
  finish() {
    this.state = GameState.FINISHED;
    this.stopGameLoop();
    this.transport.stop();

    const summary = this.scoring.getSummary();
    this.onFinish(summary);
  }

  /**
   * Get current game state for rendering
   * @param {number} hitLineY - Y position of hit line in pixels
   * @returns {object} Render state
   */
  getRenderState(hitLineY = 0) {
    const currentTime = this.transport.getCurrentTimeMs();

    // Calculate Y position for each note
    // Notes above hit line = positive timeToHit
    // Notes at hit line = 0
    // Notes below hit line = negative timeToHit (passed)
    const notesWithPosition = this.notes.map(note => {
      const timeToHit = note.timeMs - currentTime;
      const yOffset = timeToHit * this.noteSpeedPxPerMs;
      const y = hitLineY - yOffset; // Notes fall down, so subtract offset

      return {
        ...note,
        timeToHit,
        y,
        isVisible: timeToHit > -500 && timeToHit < this.lookAheadMs,
      };
    });

    return {
      currentTimeMs: currentTime,
      notes: notesWithPosition,
      score: this.scoring.score,
      streak: this.scoring.streak,
      multiplier: this.scoring.getMultiplier(),
      progress: this.chart ? Math.min(currentTime / this.chart.duration, 1) : 0,
      state: this.state,
    };
  }
}
