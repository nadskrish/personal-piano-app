/**
 * AudioEngine - Simple Web Audio synthesizer for piano sounds
 *
 * Uses triangle waves with ADSR envelope for kid-friendly tones
 */

// MIDI note to frequency conversion
function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * AudioEngine class
 */
export class AudioEngine {
  constructor() {
    this.context = null;
    this.masterGain = null;
    this.initialized = false;
    this.activeOscillators = new Map();
  }

  /**
   * Initialize the audio context (must be called after user interaction)
   */
  async init() {
    if (this.initialized) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.context = new AudioContext();

    // Create master gain
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 0.5;
    this.masterGain.connect(this.context.destination);

    // Resume context if suspended (iOS requirement)
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }

    this.initialized = true;
  }

  /**
   * Play a note with envelope
   * @param {number} midiNote - MIDI note number
   * @param {number} duration - Duration in ms (optional, for auto-release)
   * @returns {string} Note ID for stopping
   */
  playNote(midiNote, duration = null) {
    if (!this.initialized) return null;

    const freq = midiToFreq(midiNote);
    const now = this.context.currentTime;

    // Create oscillator with triangle wave (softer for kids)
    const osc = this.context.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;

    // Create gain for envelope
    const gainNode = this.context.createGain();

    // ADSR envelope
    const attack = 0.02;
    const decay = 0.1;
    const sustain = 0.3;
    const release = 0.3;

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.5, now + attack);
    gainNode.gain.linearRampToValueAtTime(sustain, now + attack + decay);

    // Connect
    osc.connect(gainNode);
    gainNode.connect(this.masterGain);

    // Start
    osc.start(now);

    const noteId = `${midiNote}-${Date.now()}`;
    this.activeOscillators.set(noteId, { osc, gainNode });

    // Auto-release if duration provided
    if (duration) {
      const stopTime = now + duration / 1000;
      gainNode.gain.setValueAtTime(sustain, stopTime);
      gainNode.gain.linearRampToValueAtTime(0, stopTime + release);
      osc.stop(stopTime + release + 0.1);

      setTimeout(() => {
        this.activeOscillators.delete(noteId);
      }, duration + release * 1000 + 100);
    }

    return noteId;
  }

  /**
   * Stop a specific note
   * @param {string} noteId - ID returned from playNote
   */
  stopNote(noteId) {
    if (!this.initialized) return;

    const note = this.activeOscillators.get(noteId);
    if (!note) return;

    const now = this.context.currentTime;
    const release = 0.15;

    note.gainNode.gain.cancelScheduledValues(now);
    note.gainNode.gain.setValueAtTime(note.gainNode.gain.value, now);
    note.gainNode.gain.linearRampToValueAtTime(0, now + release);
    note.osc.stop(now + release + 0.1);

    this.activeOscillators.delete(noteId);
  }

  /**
   * Play a quick tap sound (for UI feedback)
   */
  playTap() {
    if (!this.initialized) return;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = 'sine';
    osc.frequency.value = 880;

    const now = this.context.currentTime;
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * Play success sound (stars earned)
   */
  playSuccess() {
    if (!this.initialized) return;

    const notes = [72, 76, 79, 84]; // C5, E5, G5, C6 - happy arpeggio
    notes.forEach((note, i) => {
      setTimeout(() => this.playNote(note, 300), i * 100);
    });
  }

  /**
   * Play metronome click
   * @param {boolean} isDownbeat - Whether this is a downbeat (accented)
   */
  playMetronomeClick(isDownbeat = false) {
    if (!this.initialized) return;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = 'square';
    osc.frequency.value = isDownbeat ? 1000 : 800;

    const now = this.context.currentTime;
    const volume = isDownbeat ? 0.15 : 0.08;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Set master volume
   * @param {number} volume - 0 to 1
   */
  setVolume(volume) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Cleanup
   */
  dispose() {
    for (const [id] of this.activeOscillators) {
      this.stopNote(id);
    }
    if (this.context) {
      this.context.close();
    }
    this.initialized = false;
  }
}

// Singleton instance
export const audioEngine = new AudioEngine();
