/**
 * GameScreen - Main gameplay screen with falling notes and piano
 */

import { useEffect, useCallback, useState, useRef } from 'react';
import { GameState } from '../../engine/GameEngine.js';
import { getSong } from '../../songs/index.js';
import { audioEngine } from '../../audio/AudioEngine.js';
import { useGameEngine } from '../../hooks/useGameEngine.js';
import { useMidi } from '../../hooks/useMidi.js';
import { useAnimationFrame } from '../../hooks/useAnimationFrame.js';
import { PianoKeyboard } from '../components/PianoKeyboard.jsx';
import { MIDI_TO_NOTE } from '../../engine/ChartParser.js';
import './GameScreen.css';

// Visual constants
const HIT_LINE_BOTTOM = 60;
const NOTE_SPEED = 0.25;
const LOOK_AHEAD_MS = 3500;

// Get lane position for a MIDI note
function getLanePosition(midi, startMidi = 60, endMidi = 72) {
  const noteInOctave = midi % 12;
  const isBlack = [1, 3, 6, 8, 10].includes(noteInOctave);

  let whiteKeyCount = 0;
  for (let m = startMidi; m <= endMidi; m++) {
    const isBlackKey = [1, 3, 6, 8, 10].includes(m % 12);
    if (m === midi) {
      if (isBlack) {
        return ((whiteKeyCount - 1 + 0.65) / 13) * 100;
      }
      return (whiteKeyCount / 13) * 100;
    }
    if (!isBlackKey) whiteKeyCount++;
  }
  return 50;
}

export function GameScreen({ songId, difficulty, onBack, onFinish }) {
  const containerRef = useRef(null);
  const [notes, setNotes] = useState([]);
  const [hitFeedback, setHitFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [progress, setProgress] = useState(0);
  const [activeHints, setActiveHints] = useState([]);

  const {
    gameState,
    renderState,
    lastHit,
    results,
    loadChart,
    start,
    pause,
    resume,
    stop,
    restart,
    handleKeyPress,
    engine,
  } = useGameEngine();

  // Get song data
  const song = getSong(songId, difficulty);

  // Initialize audio and load song
  useEffect(() => {
    const init = async () => {
      await audioEngine.init();
      if (song) {
        loadChart(song.chart);
      }
    };
    init();

    return () => {
      stop();
    };
  }, [songId, difficulty]);

  // Handle finish
  useEffect(() => {
    if (gameState === GameState.FINISHED && results) {
      onFinish(results);
    }
  }, [gameState, results, onFinish]);

  // Handle key press (from keyboard or MIDI)
  const onKeyPressed = useCallback((midiNote) => {
    // Play sound
    audioEngine.playNote(midiNote, 400);

    // Process hit
    const result = handleKeyPress(midiNote);

    if (result) {
      setHitFeedback({ midi: midiNote, result: result.hitResult });
      setTimeout(() => setHitFeedback(null), 200);
    }
  }, [handleKeyPress]);

  // MIDI input
  const { isConnected: midiConnected, initMidi } = useMidi(
    onKeyPressed,
    null
  );

  // Initialize MIDI on mount
  useEffect(() => {
    initMidi();
  }, [initMidi]);

  // Animation loop for rendering
  useAnimationFrame(() => {
    if (!engine || gameState !== GameState.PLAYING) return;
    if (!containerRef.current) return;

    const hitLineY = containerRef.current.clientHeight - HIT_LINE_BOTTOM;
    const state = engine.getRenderState(hitLineY);

    // Update state
    setScore(state.score);
    setStreak(state.streak);
    setMultiplier(state.multiplier);
    setProgress(state.progress);

    // Calculate visible notes
    const visibleNotes = state.notes
      .filter(note => {
        const timeToHit = note.timeMs - state.currentTimeMs;
        return timeToHit > -500 && timeToHit < LOOK_AHEAD_MS;
      })
      .map(note => {
        const timeToHit = note.timeMs - state.currentTimeMs;
        const yOffset = timeToHit * NOTE_SPEED;
        const y = hitLineY - yOffset;
        const isBlack = [1, 3, 6, 8, 10].includes(note.midi % 12);

        return {
          ...note,
          y,
          x: getLanePosition(note.midi),
          isBlack,
        };
      });

    setNotes(visibleNotes);

    // Update hints (next notes to hit)
    const upcomingNotes = state.notes
      .filter(n => !n.hit && n.timeMs - state.currentTimeMs < 500 && n.timeMs - state.currentTimeMs > -100);
    setActiveHints(upcomingNotes.map(n => n.midi));

  }, gameState === GameState.PLAYING);

  // Get note letter
  const getNoteLetter = (midi) => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return noteNames[midi % 12];
  };

  // Handle pause/resume toggle
  const togglePause = () => {
    if (gameState === GameState.PLAYING) {
      pause();
    } else if (gameState === GameState.PAUSED) {
      resume();
    }
  };

  // Handle back (with confirmation if playing)
  const handleBack = () => {
    stop();
    onBack();
  };

  return (
    <div className="game-screen">
      {/* Top bar */}
      <header className="game-header">
        <button className="game-btn back-btn" onClick={handleBack}>
          ← Back
        </button>

        <div className="song-info">
          <h2 className="song-name">{song?.shortTitle}</h2>
          <span className="difficulty-badge" style={{
            backgroundColor: difficulty === 'simple' ? '#4ade80' :
                           difficulty === 'medium' ? '#facc15' : '#f87171'
          }}>
            {difficulty}
          </span>
        </div>

        <div className="score-display">
          <span className="score-label">Score</span>
          <span className="score-value">{score}</span>
        </div>
      </header>

      {/* Stats bar */}
      <div className="stats-bar">
        <div className="stat">
          <span className="stat-label">Streak</span>
          <span className="stat-value">{streak}</span>
        </div>
        <div className="stat multiplier">
          <span className="stat-label">Multiplier</span>
          <span className="stat-value">{multiplier}x</span>
        </div>
        {midiConnected && (
          <div className="midi-indicator">🎹 MIDI</div>
        )}
      </div>

      {/* Progress bar */}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Falling notes area */}
      <div className="notes-area" ref={containerRef}>
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
        />

        {/* Notes */}
        {notes.map(note => (
          <div
            key={note.id}
            className={`falling-note ${note.isBlack ? 'black' : ''} ${note.hit ? 'hit' : ''} ${note.hitResult ? `hit-${note.hitResult}` : ''}`}
            style={{
              transform: `translateX(${note.x}%) translateY(${note.y}px)`,
              opacity: note.hit ? 0.3 : 1,
            }}
          >
            {getNoteLetter(note.midi)}
          </div>
        ))}

        {/* Overlays */}
        {gameState === GameState.IDLE && (
          <div className="overlay start-overlay" onClick={start}>
            <div className="overlay-content">
              <span className="overlay-icon">▶</span>
              <span className="overlay-text">Tap to Start!</span>
            </div>
          </div>
        )}

        {gameState === GameState.PAUSED && (
          <div className="overlay pause-overlay" onClick={resume}>
            <div className="overlay-content">
              <span className="overlay-icon">⏸</span>
              <span className="overlay-text">Paused</span>
              <span className="overlay-hint">Tap to Resume</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="game-controls">
        <button
          className={`control-btn ${gameState === GameState.PAUSED ? 'resume' : 'pause'}`}
          onClick={togglePause}
          disabled={gameState === GameState.IDLE || gameState === GameState.FINISHED}
        >
          {gameState === GameState.PAUSED ? '▶ Resume' : '⏸ Pause'}
        </button>

        <button className="control-btn restart" onClick={restart}>
          🔄 Restart
        </button>
      </div>

      {/* Piano keyboard */}
      <div className="keyboard-container">
        <PianoKeyboard
          startMidi={60}
          endMidi={72}
          onKeyPress={onKeyPressed}
          activeNotes={activeHints}
          hitFeedback={hitFeedback}
        />
      </div>
    </div>
  );
}

export default GameScreen;
