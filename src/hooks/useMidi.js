/**
 * useMidi - Hook for Web MIDI integration
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { midiInput } from '../midi/MidiInput.js';

/**
 * Hook for managing MIDI input
 * @param {function} onNoteOn - Callback when note is pressed
 * @param {function} onNoteOff - Callback when note is released
 */
export function useMidi(onNoteOn, onNoteOff) {
  const [isSupported] = useState(midiInput.isSupported);
  const [isConnected, setIsConnected] = useState(false);
  const [devices, setDevices] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Store callbacks in refs to avoid re-initialization
  const onNoteOnRef = useRef(onNoteOn);
  const onNoteOffRef = useRef(onNoteOff);

  useEffect(() => {
    onNoteOnRef.current = onNoteOn;
    onNoteOffRef.current = onNoteOff;
  }, [onNoteOn, onNoteOff]);

  // Initialize MIDI
  const initMidi = useCallback(async () => {
    if (!isSupported || isInitialized) return false;

    const success = await midiInput.init();
    if (success) {
      setIsInitialized(true);
      setDevices(midiInput.getDevices());
      setIsConnected(midiInput.isConnected);

      // Set up handlers
      midiInput.setNoteOnHandler((note, velocity) => {
        if (onNoteOnRef.current) {
          onNoteOnRef.current(note, velocity);
        }
      });

      midiInput.setNoteOffHandler((note) => {
        if (onNoteOffRef.current) {
          onNoteOffRef.current(note);
        }
      });
    }
    return success;
  }, [isSupported, isInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      midiInput.dispose();
    };
  }, []);

  // Refresh device list
  const refreshDevices = useCallback(() => {
    if (isInitialized) {
      setDevices(midiInput.getDevices());
      setIsConnected(midiInput.isConnected);
    }
  }, [isInitialized]);

  return {
    isSupported,
    isConnected,
    isInitialized,
    devices,
    initMidi,
    refreshDevices,
  };
}
