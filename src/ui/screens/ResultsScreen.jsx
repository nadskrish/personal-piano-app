/**
 * ResultsScreen - Shows performance summary after song completion
 *
 * Displays stars, accuracy, score breakdown, and mistakes
 */

import { useEffect } from 'react';
import { audioEngine } from '../../audio/AudioEngine.js';
import { HitResult } from '../../engine/HitDetection.js';
import { MIDI_TO_NOTE } from '../../engine/ChartParser.js';
import './ResultsScreen.css';

export function ResultsScreen({ results, songTitle, onReplay, onBack }) {
  // Play success sound on mount
  useEffect(() => {
    audioEngine.playSuccess();
  }, []);

  const { score, accuracy, stars, maxStreak, hitCounts, totalNotes, mistakes } = results;

  // Generate star display
  const renderStars = () => {
    const starElements = [];
    for (let i = 0; i < 3; i++) {
      starElements.push(
        <span
          key={i}
          className={`star ${i < stars ? 'earned' : 'empty'}`}
          style={{ animationDelay: `${i * 0.2}s` }}
        >
          ⭐
        </span>
      );
    }
    return starElements;
  };

  // Get encouraging message based on performance
  const getMessage = () => {
    if (accuracy >= 95) return "Perfect! You're a piano superstar!";
    if (accuracy >= 80) return "Amazing! Keep up the great work!";
    if (accuracy >= 60) return "Good job! Practice makes perfect!";
    return "Nice try! Let's play again!";
  };

  return (
    <div className="results-screen">
      <div className="results-card">
        {/* Header with stars */}
        <div className="results-header">
          <h1 className="results-title">Great Job!</h1>
          <div className="stars-container">
            {renderStars()}
          </div>
          <p className="results-message">{getMessage()}</p>
        </div>

        {/* Song info */}
        <div className="song-completed">
          <span className="song-icon">🎵</span>
          <span className="song-name">{songTitle}</span>
        </div>

        {/* Main stats */}
        <div className="stats-grid">
          <div className="stat-card score">
            <span className="stat-value">{score}</span>
            <span className="stat-label">Score</span>
          </div>

          <div className="stat-card accuracy">
            <span className="stat-value">{accuracy}%</span>
            <span className="stat-label">Accuracy</span>
          </div>

          <div className="stat-card streak">
            <span className="stat-value">{maxStreak}</span>
            <span className="stat-label">Best Streak</span>
          </div>
        </div>

        {/* Hit breakdown */}
        <div className="hit-breakdown">
          <h3 className="breakdown-title">Note Breakdown</h3>
          <div className="breakdown-bars">
            <div className="breakdown-item perfect">
              <span className="breakdown-label">Perfect</span>
              <div className="breakdown-bar">
                <div
                  className="breakdown-fill"
                  style={{ width: `${(hitCounts[HitResult.PERFECT] / totalNotes) * 100}%` }}
                />
              </div>
              <span className="breakdown-count">{hitCounts[HitResult.PERFECT]}</span>
            </div>

            <div className="breakdown-item great">
              <span className="breakdown-label">Great</span>
              <div className="breakdown-bar">
                <div
                  className="breakdown-fill"
                  style={{ width: `${(hitCounts[HitResult.GREAT] / totalNotes) * 100}%` }}
                />
              </div>
              <span className="breakdown-count">{hitCounts[HitResult.GREAT]}</span>
            </div>

            <div className="breakdown-item good">
              <span className="breakdown-label">Good</span>
              <div className="breakdown-bar">
                <div
                  className="breakdown-fill"
                  style={{ width: `${(hitCounts[HitResult.GOOD] / totalNotes) * 100}%` }}
                />
              </div>
              <span className="breakdown-count">{hitCounts[HitResult.GOOD]}</span>
            </div>

            <div className="breakdown-item miss">
              <span className="breakdown-label">Miss</span>
              <div className="breakdown-bar">
                <div
                  className="breakdown-fill"
                  style={{ width: `${((hitCounts[HitResult.MISS] + hitCounts[HitResult.WRONG_NOTE]) / totalNotes) * 100}%` }}
                />
              </div>
              <span className="breakdown-count">
                {hitCounts[HitResult.MISS] + hitCounts[HitResult.WRONG_NOTE]}
              </span>
            </div>
          </div>
        </div>

        {/* Mistakes list (if any) */}
        {mistakes.length > 0 && mistakes.length <= 5 && (
          <div className="mistakes-section">
            <h3 className="mistakes-title">Notes to Practice</h3>
            <div className="mistakes-list">
              {mistakes.slice(0, 5).map((mistake, i) => (
                <div key={i} className="mistake-item">
                  <span className="mistake-note">
                    {MIDI_TO_NOTE[mistake.expectedMidi] || `Note ${mistake.expectedMidi}`}
                  </span>
                  <span className="mistake-timing">
                    {mistake.deltaMs > 0 ? `${Math.round(mistake.deltaMs)}ms late` : 'missed'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="results-actions">
          <button className="action-btn replay" onClick={onReplay}>
            🔄 Play Again
          </button>
          <button className="action-btn back" onClick={onBack}>
            🏠 More Songs
          </button>
        </div>
      </div>

      {/* Confetti animation */}
      {stars >= 2 && <div className="confetti-container" />}
    </div>
  );
}

export default ResultsScreen;
