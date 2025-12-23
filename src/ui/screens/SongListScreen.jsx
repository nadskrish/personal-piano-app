/**
 * SongListScreen - Song selection with difficulty choice
 *
 * Shows song cards with thumbnails and difficulty selector
 */

import { useState } from 'react';
import { getSongList, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '../../songs/index.js';
import './SongListScreen.css';

// Thumbnail icons for songs
const THUMBNAILS = {
  star: '⭐',
  bell: '🔔',
  default: '🎵',
};

export function SongListScreen({ onSelectSong, onBack }) {
  const songs = getSongList();
  const [selectedDifficulty, setSelectedDifficulty] = useState({});

  const handleSongClick = (songId) => {
    const difficulty = selectedDifficulty[songId] || 'simple';
    onSelectSong(songId, difficulty);
  };

  const handleDifficultyClick = (e, songId, difficulty) => {
    e.stopPropagation();
    setSelectedDifficulty(prev => ({
      ...prev,
      [songId]: difficulty,
    }));
  };

  return (
    <div className="song-list-screen">
      {/* Header */}
      <header className="song-list-header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <h1 className="header-title">🎵 Choose a Song</h1>
        <div className="header-spacer" />
      </header>

      {/* Song grid */}
      <div className="song-grid">
        {songs.map(song => {
          const currentDifficulty = selectedDifficulty[song.id] || 'simple';
          const thumbnail = THUMBNAILS[song.thumbnail] || THUMBNAILS.default;

          return (
            <div
              key={song.id}
              className="song-card"
              style={{ backgroundColor: song.color }}
              onClick={() => handleSongClick(song.id)}
            >
              {/* Thumbnail */}
              <div className="song-thumbnail">{thumbnail}</div>

              {/* Title */}
              <h3 className="song-title">{song.shortTitle}</h3>

              {/* Difficulty selector */}
              <div className="difficulty-selector">
                {song.difficulties.map(diff => (
                  <button
                    key={diff}
                    className={`difficulty-btn ${currentDifficulty === diff ? 'selected' : ''}`}
                    style={{
                      backgroundColor: currentDifficulty === diff
                        ? DIFFICULTY_COLORS[diff]
                        : 'rgba(255,255,255,0.5)',
                    }}
                    onClick={(e) => handleDifficultyClick(e, song.id, diff)}
                  >
                    {DIFFICULTY_LABELS[diff]}
                  </button>
                ))}
              </div>

              {/* Play indicator */}
              <div className="play-indicator">▶</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SongListScreen;
