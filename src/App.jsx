/**
 * Simply Keys - Kid-friendly piano learning app
 *
 * Main application component with screen navigation
 */

import { useState, useCallback } from 'react';
import { audioEngine } from './audio/AudioEngine.js';
import HomeScreen from './ui/screens/HomeScreen.jsx';
import SongListScreen from './ui/screens/SongListScreen.jsx';
import GameScreen from './ui/screens/GameScreen.jsx';
import ResultsScreen from './ui/screens/ResultsScreen.jsx';
import { getSong } from './songs/index.js';
import './App.css';

// Screen types
const Screens = {
  HOME: 'home',
  SONGS: 'songs',
  GAME: 'game',
  RESULTS: 'results',
  LESSONS: 'lessons',
};

function App() {
  const [currentScreen, setCurrentScreen] = useState(Screens.HOME);
  const [selectedSong, setSelectedSong] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('simple');
  const [gameResults, setGameResults] = useState(null);
  const [audioInitialized, setAudioInitialized] = useState(false);

  // Initialize audio on first user interaction
  const initAudio = useCallback(async () => {
    if (!audioInitialized) {
      await audioEngine.init();
      setAudioInitialized(true);
    }
  }, [audioInitialized]);

  // Navigation handlers
  const goToHome = useCallback(() => {
    setCurrentScreen(Screens.HOME);
    setGameResults(null);
  }, []);

  const goToSongs = useCallback(async () => {
    await initAudio();
    setCurrentScreen(Screens.SONGS);
  }, [initAudio]);

  const goToLessons = useCallback(async () => {
    await initAudio();
    // For now, lessons just goes to songs
    // Could be expanded to a dedicated lessons screen
    setCurrentScreen(Screens.SONGS);
  }, [initAudio]);

  const startQuickPlay = useCallback(async () => {
    await initAudio();
    // Quick play starts with Twinkle Twinkle on Simple
    setSelectedSong('twinkle-twinkle');
    setSelectedDifficulty('simple');
    setCurrentScreen(Screens.GAME);
  }, [initAudio]);

  const selectSong = useCallback((songId, difficulty) => {
    setSelectedSong(songId);
    setSelectedDifficulty(difficulty);
    setCurrentScreen(Screens.GAME);
  }, []);

  const handleGameFinish = useCallback((results) => {
    setGameResults(results);
    setCurrentScreen(Screens.RESULTS);
  }, []);

  const replaySong = useCallback(() => {
    setGameResults(null);
    setCurrentScreen(Screens.GAME);
  }, []);

  // Get current song info for results
  const currentSongInfo = selectedSong ? getSong(selectedSong, selectedDifficulty) : null;

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case Screens.HOME:
        return (
          <HomeScreen
            onPlay={startQuickPlay}
            onSongs={goToSongs}
            onLessons={goToLessons}
          />
        );

      case Screens.SONGS:
        return (
          <SongListScreen
            onSelectSong={selectSong}
            onBack={goToHome}
          />
        );

      case Screens.GAME:
        return (
          <GameScreen
            songId={selectedSong}
            difficulty={selectedDifficulty}
            onBack={goToSongs}
            onFinish={handleGameFinish}
          />
        );

      case Screens.RESULTS:
        return (
          <ResultsScreen
            results={gameResults}
            songTitle={currentSongInfo?.shortTitle || 'Song'}
            onReplay={replaySong}
            onBack={goToSongs}
          />
        );

      default:
        return <HomeScreen onPlay={startQuickPlay} onSongs={goToSongs} onLessons={goToLessons} />;
    }
  };

  return (
    <div className="app">
      {renderScreen()}
    </div>
  );
}

export default App;
