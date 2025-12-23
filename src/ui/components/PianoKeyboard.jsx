/**
 * PianoKeyboard - On-screen piano keyboard component
 *
 * Kid-friendly design with large keys and visual feedback
 */

import { useState, useCallback, useRef } from 'react';
import { MIDI_TO_NOTE } from '../../engine/ChartParser.js';
import './PianoKeyboard.css';

// Default range: C4 to C5 (Middle C octave + one note)
const DEFAULT_START_MIDI = 60;
const DEFAULT_END_MIDI = 72;

/**
 * Check if a MIDI note is a black key
 */
function isBlackKey(midi) {
  const noteInOctave = midi % 12;
  return [1, 3, 6, 8, 10].includes(noteInOctave);
}

/**
 * Get the note name from MIDI (without octave for display)
 */
function getNoteLetter(midi) {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return noteNames[midi % 12];
}

/**
 * Calculate position offset for black keys
 */
function getBlackKeyOffset(midi) {
  const noteInOctave = midi % 12;
  const offsets = {
    1: -10,  // C#
    3: 10,   // D#
    6: -10,  // F#
    8: 0,    // G#
    10: 10,  // A#
  };
  return offsets[noteInOctave] || 0;
}

export function PianoKeyboard({
  startMidi = DEFAULT_START_MIDI,
  endMidi = DEFAULT_END_MIDI,
  onKeyPress,
  onKeyRelease,
  activeNotes = [],  // MIDI numbers currently expected (for hints)
  hitFeedback = null, // { midi, result } for showing hit feedback
}) {
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const touchMap = useRef(new Map()); // Track touch -> key mapping

  // Generate key data
  const whiteKeys = [];
  const blackKeys = [];

  for (let midi = startMidi; midi <= endMidi; midi++) {
    const isBlack = isBlackKey(midi);
    const keyData = {
      midi,
      note: MIDI_TO_NOTE[midi] || `M${midi}`,
      letter: getNoteLetter(midi),
      isBlack,
    };

    if (isBlack) {
      blackKeys.push(keyData);
    } else {
      whiteKeys.push(keyData);
    }
  }

  // Handle key press
  const handlePress = useCallback((midi) => {
    setPressedKeys(prev => new Set([...prev, midi]));
    if (onKeyPress) {
      onKeyPress(midi);
    }
  }, [onKeyPress]);

  // Handle key release
  const handleRelease = useCallback((midi) => {
    setPressedKeys(prev => {
      const next = new Set(prev);
      next.delete(midi);
      return next;
    });
    if (onKeyRelease) {
      onKeyRelease(midi);
    }
  }, [onKeyRelease]);

  // Touch handling for mobile
  const handleTouchStart = useCallback((e, midi) => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      touchMap.current.set(touch.identifier, midi);
    }
    handlePress(midi);
  }, [handlePress]);

  const handleTouchEnd = useCallback((e, midi) => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      const mappedMidi = touchMap.current.get(touch.identifier);
      if (mappedMidi !== undefined) {
        handleRelease(mappedMidi);
        touchMap.current.delete(touch.identifier);
      }
    }
  }, [handleRelease]);

  // Get class names for a key
  const getKeyClassName = (midi, isBlack) => {
    const classes = ['piano-key', isBlack ? 'black' : 'white'];

    if (pressedKeys.has(midi)) {
      classes.push('pressed');
    }

    if (activeNotes.includes(midi)) {
      classes.push('hint');
    }

    if (hitFeedback && hitFeedback.midi === midi) {
      classes.push(`hit-${hitFeedback.result}`);
    }

    return classes.join(' ');
  };

  // Calculate black key position based on white key index
  const getBlackKeyPosition = (midi) => {
    // Find the white key this black key is between
    const noteInOctave = midi % 12;
    const octave = Math.floor(midi / 12) - Math.floor(startMidi / 12);

    // Position mapping (which white key slot is this black key after)
    const positionMap = {
      1: 0,   // C# after C
      3: 1,   // D# after D
      6: 3,   // F# after F
      8: 4,   // G# after G
      10: 5,  // A# after A
    };

    const basePosition = positionMap[noteInOctave];
    const whiteKeysPerOctave = 7;
    const position = basePosition + (octave * whiteKeysPerOctave);

    // Find the actual position considering our range
    let whiteKeyIndex = 0;
    for (let m = startMidi; m < midi; m++) {
      if (!isBlackKey(m)) whiteKeyIndex++;
    }

    return whiteKeyIndex;
  };

  const whiteKeyWidth = 100 / whiteKeys.length;

  return (
    <div className="piano-keyboard">
      {/* White keys */}
      <div className="white-keys">
        {whiteKeys.map((key, index) => (
          <button
            key={key.midi}
            className={getKeyClassName(key.midi, false)}
            style={{ width: `${whiteKeyWidth}%` }}
            onMouseDown={() => handlePress(key.midi)}
            onMouseUp={() => handleRelease(key.midi)}
            onMouseLeave={() => pressedKeys.has(key.midi) && handleRelease(key.midi)}
            onTouchStart={(e) => handleTouchStart(e, key.midi)}
            onTouchEnd={(e) => handleTouchEnd(e, key.midi)}
          >
            <span className="key-label">{key.letter}</span>
          </button>
        ))}
      </div>

      {/* Black keys */}
      <div className="black-keys">
        {blackKeys.map((key) => {
          const position = getBlackKeyPosition(key.midi);
          const leftPercent = ((position + 0.65) * whiteKeyWidth);

          return (
            <button
              key={key.midi}
              className={getKeyClassName(key.midi, true)}
              style={{
                left: `${leftPercent}%`,
                width: `${whiteKeyWidth * 0.6}%`,
              }}
              onMouseDown={() => handlePress(key.midi)}
              onMouseUp={() => handleRelease(key.midi)}
              onMouseLeave={() => pressedKeys.has(key.midi) && handleRelease(key.midi)}
              onTouchStart={(e) => handleTouchStart(e, key.midi)}
              onTouchEnd={(e) => handleTouchEnd(e, key.midi)}
            >
              <span className="key-label">{key.letter}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default PianoKeyboard;
