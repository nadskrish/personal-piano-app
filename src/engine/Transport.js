/**
 * Transport - Single source of truth for timing
 *
 * Uses performance.now() for high-precision timing.
 * All note positions and hit detection derive from this.
 */

export class Transport {
  constructor() {
    this.startTime = null;
    this.pauseTime = null;
    this.pausedDuration = 0;
    this.isPlaying = false;
    this.isPaused = false;
  }

  /**
   * Start the transport
   */
  start() {
    if (this.isPlaying && !this.isPaused) return;

    if (this.isPaused && this.pauseTime !== null) {
      // Resume from pause
      this.pausedDuration += performance.now() - this.pauseTime;
      this.pauseTime = null;
      this.isPaused = false;
    } else {
      // Fresh start
      this.startTime = performance.now();
      this.pausedDuration = 0;
      this.pauseTime = null;
    }
    this.isPlaying = true;
  }

  /**
   * Pause the transport
   */
  pause() {
    if (!this.isPlaying || this.isPaused) return;
    this.pauseTime = performance.now();
    this.isPaused = true;
  }

  /**
   * Stop and reset the transport
   */
  stop() {
    this.startTime = null;
    this.pauseTime = null;
    this.pausedDuration = 0;
    this.isPlaying = false;
    this.isPaused = false;
  }

  /**
   * Get current time in milliseconds since start
   * @returns {number} Current time in ms, or 0 if not playing
   */
  getCurrentTimeMs() {
    if (!this.isPlaying || this.startTime === null) return 0;

    if (this.isPaused && this.pauseTime !== null) {
      return this.pauseTime - this.startTime - this.pausedDuration;
    }

    return performance.now() - this.startTime - this.pausedDuration;
  }

  /**
   * Check if transport is currently playing (not paused)
   * @returns {boolean}
   */
  isActive() {
    return this.isPlaying && !this.isPaused;
  }

  /**
   * Seek to a specific time (for debugging/testing)
   * @param {number} timeMs - Time to seek to in ms
   */
  seekTo(timeMs) {
    if (!this.isPlaying) {
      this.start();
    }
    const now = performance.now();
    this.startTime = now - timeMs;
    this.pausedDuration = 0;
    if (this.isPaused) {
      this.pauseTime = now;
    }
  }
}

// Singleton instance for the game
export const transport = new Transport();
