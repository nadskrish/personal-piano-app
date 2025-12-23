/**
 * MidiInput - Web MIDI API wrapper for external keyboard input
 *
 * Provides a simple interface for receiving MIDI note events
 */

/**
 * MIDI message types
 */
const MIDI_NOTE_ON = 0x90;
const MIDI_NOTE_OFF = 0x80;

/**
 * MidiInput class
 */
export class MidiInput {
  constructor() {
    this.midiAccess = null;
    this.inputs = [];
    this.onNoteOn = null;
    this.onNoteOff = null;
    this.isSupported = 'requestMIDIAccess' in navigator;
    this.isConnected = false;
  }

  /**
   * Check if Web MIDI is supported
   * @returns {boolean}
   */
  static isSupported() {
    return 'requestMIDIAccess' in navigator;
  }

  /**
   * Initialize MIDI access
   * @returns {Promise<boolean>} Success status
   */
  async init() {
    if (!this.isSupported) {
      console.warn('Web MIDI API not supported in this browser');
      return false;
    }

    try {
      this.midiAccess = await navigator.requestMIDIAccess();
      this.setupInputs();

      // Listen for device changes
      this.midiAccess.onstatechange = () => {
        this.setupInputs();
      };

      return true;
    } catch (err) {
      console.error('Failed to get MIDI access:', err);
      return false;
    }
  }

  /**
   * Set up MIDI input listeners
   */
  setupInputs() {
    // Clear old inputs
    this.inputs = [];

    // Get all inputs
    for (const input of this.midiAccess.inputs.values()) {
      this.inputs.push({
        id: input.id,
        name: input.name,
        manufacturer: input.manufacturer,
      });

      input.onmidimessage = (event) => this.handleMidiMessage(event);
    }

    this.isConnected = this.inputs.length > 0;
  }

  /**
   * Handle incoming MIDI messages
   * @param {MIDIMessageEvent} event
   */
  handleMidiMessage(event) {
    const [status, note, velocity] = event.data;
    const command = status & 0xf0;

    if (command === MIDI_NOTE_ON && velocity > 0) {
      if (this.onNoteOn) {
        this.onNoteOn(note, velocity);
      }
    } else if (command === MIDI_NOTE_OFF || (command === MIDI_NOTE_ON && velocity === 0)) {
      if (this.onNoteOff) {
        this.onNoteOff(note);
      }
    }
  }

  /**
   * Set note on callback
   * @param {function} callback - (midiNote, velocity) => void
   */
  setNoteOnHandler(callback) {
    this.onNoteOn = callback;
  }

  /**
   * Set note off callback
   * @param {function} callback - (midiNote) => void
   */
  setNoteOffHandler(callback) {
    this.onNoteOff = callback;
  }

  /**
   * Get list of connected MIDI devices
   * @returns {Array} Array of {id, name, manufacturer}
   */
  getDevices() {
    return this.inputs;
  }

  /**
   * Cleanup
   */
  dispose() {
    if (this.midiAccess) {
      for (const input of this.midiAccess.inputs.values()) {
        input.onmidimessage = null;
      }
    }
    this.onNoteOn = null;
    this.onNoteOff = null;
  }
}

// Singleton instance
export const midiInput = new MidiInput();
