/**
 * HomeScreen - Main landing screen with big Play button
 *
 * Kid-friendly with minimal text and large touch targets
 */

import './HomeScreen.css';

export function HomeScreen({ onPlay, onSongs, onLessons }) {
  return (
    <div className="home-screen">
      <div className="home-content">
        {/* Logo/Title */}
        <div className="home-logo">
          <span className="logo-icon">🎹</span>
          <h1 className="logo-title">Simply Keys</h1>
          <p className="logo-subtitle">Kid Mode</p>
        </div>

        {/* Main buttons */}
        <div className="home-buttons">
          <button className="home-btn play-btn" onClick={onPlay}>
            <span className="btn-icon">▶</span>
            <span className="btn-text">Play!</span>
          </button>

          <button className="home-btn songs-btn" onClick={onSongs}>
            <span className="btn-icon">🎵</span>
            <span className="btn-text">Songs</span>
          </button>

          <button className="home-btn lessons-btn" onClick={onLessons}>
            <span className="btn-icon">📚</span>
            <span className="btn-text">Lessons</span>
          </button>
        </div>

        {/* Fun decoration */}
        <div className="home-decoration">
          <span className="floating-note">♪</span>
          <span className="floating-note delay-1">♫</span>
          <span className="floating-note delay-2">♪</span>
        </div>
      </div>

      {/* Parent area hint (bottom corner) */}
      <div
        className="parent-area-trigger"
        title="Long press for parent settings"
      />
    </div>
  );
}

export default HomeScreen;
