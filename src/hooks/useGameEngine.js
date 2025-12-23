/**
 * useGameEngine - React hook for game engine integration
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { GameEngine, GameState } from '../engine/GameEngine.js';
import { audioEngine } from '../audio/AudioEngine.js';

/**
 * Hook for managing game engine state in React
 */
export function useGameEngine() {
  const engineRef = useRef(null);
  const [gameState, setGameState] = useState(GameState.IDLE);
  const [renderState, setRenderState] = useState({
    currentTimeMs: 0,
    notes: [],
    score: 0,
    streak: 0,
    multiplier: 1,
    progress: 0,
  });
  const [lastHit, setLastHit] = useState(null);
  const [results, setResults] = useState(null);

  // Initialize engine on mount
  useEffect(() => {
    const engine = new GameEngine({
      onUpdate: (state) => {
        setRenderState(prev => ({
          ...prev,
          ...state,
        }));
      },
      onNoteHit: (hitInfo) => {
        setLastHit(hitInfo);
        // Clear hit indicator after a short delay
        setTimeout(() => setLastHit(null), 300);
      },
      onNoteMiss: () => {
        // Could add miss feedback here
      },
      onFinish: (summary) => {
        setResults(summary);
        setGameState(GameState.FINISHED);
        audioEngine.playSuccess();
      },
    });

    engineRef.current = engine;

    return () => {
      engine.stop();
    };
  }, []);

  /**
   * Load a chart and prepare for playing
   */
  const loadChart = useCallback((chartData) => {
    if (!engineRef.current) return;
    engineRef.current.loadChart(chartData);
    setGameState(GameState.IDLE);
    setResults(null);
    setRenderState({
      currentTimeMs: 0,
      notes: [],
      score: 0,
      streak: 0,
      multiplier: 1,
      progress: 0,
    });
  }, []);

  /**
   * Start playing
   */
  const start = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.start();
    setGameState(GameState.PLAYING);
  }, []);

  /**
   * Pause the game
   */
  const pause = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.pause();
    setGameState(GameState.PAUSED);
  }, []);

  /**
   * Resume from pause
   */
  const resume = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.resume();
    setGameState(GameState.PLAYING);
  }, []);

  /**
   * Stop and reset
   */
  const stop = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.stop();
    setGameState(GameState.IDLE);
    setResults(null);
  }, []);

  /**
   * Restart current song
   */
  const restart = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.restart();
    setGameState(GameState.PLAYING);
    setResults(null);
  }, []);

  /**
   * Handle a key press
   */
  const handleKeyPress = useCallback((midiNote) => {
    if (!engineRef.current) return null;
    return engineRef.current.handleKeyPress(midiNote);
  }, []);

  /**
   * Get current render state with note positions
   */
  const getRenderState = useCallback((hitLineY) => {
    if (!engineRef.current) return renderState;
    return engineRef.current.getRenderState(hitLineY);
  }, [renderState]);

  return {
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
    getRenderState,
    engine: engineRef.current,
  };
}
