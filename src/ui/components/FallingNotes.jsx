/**
 * FallingNotes - Visual note highway with falling notes
 *
 * Notes fall from top to bottom, with a hit line near the keyboard.
 * Uses CSS transforms for smooth 60fps animation.
 */

import { useCallback, useRef, useEffect, useState } from 'react';
import { MIDI_TO_NOTE } from '../../engine/ChartParser.js';
import { GameState } from '../../engine/GameEngine.js';
import { useAnimationFrame } from '../../hooks/useAnimationFrame.js';
import './FallingNotes.css';

// Visual constants
const HIT_LINE_BOTTOM = 60; // px from bottom of container
const NOTE_SPEED = 0.25; // pixels per millisecond
const LOOK_AHEAD_MS = 3500; // How far ahead to show notes

/**
 * Check if a MIDI note is a black key
 */
function isBlackKey(midi) {
  const noteInOctave = midi % 12;
  return [1, 3, 6, 8, 10].includes(noteInOctave);
}

/**
 * Get lane position for a MIDI note (0-1 range)
 * Maps MIDI notes to keyboard lane positions
 */
function getLanePosition(midi, startMidi, endMidi) {
  // Count white keys in range to determine total lanes
  let whiteKeyCount = 0;
  const lanePositions = {};

  for (let m = startMidi; m <= endMidi; m++) {
    if (!isBlackKey(m)) {
      lanePositions[m] = whiteKeyCount / 13; // Normalize to 0-1
      whiteKeyCount++;
    } else {
      // Black key - position between white keys
      const prevWhiteCount = whiteKeyCount - 1;
      lanePositions[m] = (prevWhiteCount + 0.65) / 13;
    }
  }

  return lanePositions[midi] ?? 0.5;
}

export function FallingNotes({
  engine,
  gameState,
  startMidi = 60,
  endMidi = 72,
}) {
  const containerRef = useRef(null);
  const [notes, setNotes] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);

  // Calculate container height and hit line position
  const getHitLineY = useCallback(() => {
    if (!containerRef.current) return 0;
    return containerRef.current.clientHeight - HIT_LINE_BOTTOM;
  }, []);

  // Animation loop
  useAnimationFrame(() => {
    if (!engine || gameState !== GameState.PLAYING) return;

    const hitLineY = getHitLineY();
    const state = engine.getRenderState(hitLineY);

    setCurrentTime(state.currentTimeMs);

    // Filter to visible notes and calculate positions
    const visibleNotes = state.notes
      .filter(note => {
        const timeToHit = note.timeMs - state.currentTimeMs;
        return timeToHit > -500 && timeToHit < LOOK_AHEAD_MS;
      })
      .map(note => {
        const timeToHit = note.timeMs - state.currentTimeMs;
        const yOffset = timeToHit * NOTE_SPEED;
        const y = hitLineY - yOffset;

        return {
          ...note,
          y,
          laneX: getLanePosition(note.midi, startMidi, endMidi),
          isBlack: isBlackKey(note.midi),
        };
      });

    setNotes(visibleNotes);
  }, gameState === GameState.PLAYING);

  // Get note display letter
  const getNoteLetter = (midi) => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return noteNames[midi % 12];
  };

  // Get note color based on state
  const getNoteClass = (note) => {
    const classes = ['falling-note'];

    if (note.isBlack) {
      classes.push('black');
    }

    if (note.hit) {
      classes.push('hit');
      if (note.hitResult) {
        classes.push(`hit-${note.hitResult}`);
      }
    }

    return classes.join(' ');
  };

  return (
    <div className="falling-notes-container" ref={containerRef}>
      {/* Lane guides */}
      <div className="lane-guides">
        {Array.from({ length: 13 }).map((_, i) => (
          <div
            key={i}
            className="lane-guide"
            style={{ left: `${(i / 13) * 100}%` }}
          />
        ))}
      </div>

      {/* Hit line */}
      <div
        className="hit-line"
        style={{ bottom: `${HIT_LINE_BOTTOM}px` }}
      >
        <div className="hit-line-glow" />
      </div>

      {/* Falling notes */}
      {notes.map(note => (
        <div
          key={note.id}
          className={getNoteClass(note)}
          style={{
            transform: `translate(${note.laneX * 100}%, ${note.y}px)`,
            opacity: note.hit ? 0.3 : 1,
          }}
        >
          <span className="note-letter">{getNoteLetter(note.midi)}</span>
        </div>
      ))}

      {/* Countdown overlay */}
      {gameState === GameState.IDLE && (
        <div className="countdown-overlay">
          <span>Get Ready!</span>
        </div>
      )}
    </div>
  );
}

export default FallingNotes;
