# Simply Keys - Kid-Friendly Piano Learning App

A falling-notes rhythm game that teaches timing and pitch to children. Inspired by Simply Piano but with original UI and logic.

## Features

- **Falling Notes Gameplay**: Notes fall from top to hit line - tap when they align
- **Difficulty Levels**: Each song has Simple, Medium, and Hard charts
- **Real-time Scoring**: Perfect/Great/Good/Miss hit windows with streak multipliers
- **Kid-Friendly UI**: Big buttons, minimal text, friendly colors
- **Multiple Input Methods**: On-screen keyboard, Web MIDI for external keyboards
- **iPad Optimized**: Touch-friendly, 60fps animations, iOS Safari compatible

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

## iPad Run Instructions

### Option 1: Local Network (Recommended for Development)

1. Ensure iPad and development machine are on the same WiFi network
2. Start the dev server: `npm run dev`
3. Find your local IP (e.g., `192.168.1.100`)
4. On iPad Safari, navigate to `http://192.168.1.100:5173`
5. Add to Home Screen for fullscreen experience:
   - Tap Share button → "Add to Home Screen"

### Option 2: Production Build

1. Build: `npm run build`
2. Deploy `dist/` folder to any static host (Vercel, Netlify, GitHub Pages)
3. Access via HTTPS URL on iPad

### iPad Tips

- **Fullscreen**: Add to Home Screen for app-like experience
- **Sound**: Tap the screen once to enable audio (iOS requires user interaction)
- **Orientation**: Works best in landscape mode
- **MIDI**: Connect USB MIDI keyboard via Camera Connection Kit adapter

## How to Add Songs

### 1. Create Song Folder Structure

```
src/songs/your-song-id/
├── meta.json
└── charts/
    ├── simple.json
    ├── medium.json
    └── hard.json
```

### 2. Create meta.json

```json
{
  "id": "your-song-id",
  "title": "Your Song Title",
  "shortTitle": "Short Title",
  "bpm": 120,
  "midiRange": [60, 72],
  "thumbnail": "star",
  "color": "#fef08a",
  "difficulty": {
    "simple": "Easy - Right hand only",
    "medium": "Medium - Full melody",
    "hard": "Hard - Both hands"
  }
}
```

### 3. Create Chart Files

Each chart is a JSON file with notes array:

```json
{
  "difficulty": "simple",
  "description": "Easy version",
  "notes": [
    { "timeMs": 0, "midi": 60, "durationMs": 500 },
    { "timeMs": 500, "midi": 62, "durationMs": 500 },
    { "timeMs": 1000, "midi": 64, "durationMs": 500 }
  ]
}
```

**Note Properties:**
- `timeMs`: When the note should be hit (milliseconds from start)
- `midi`: MIDI note number (60 = C4, 62 = D4, etc.)
- `durationMs`: How long the note lasts (visual only)

**MIDI Reference:**
| Note | MIDI |
|------|------|
| C4 (Middle C) | 60 |
| D4 | 62 |
| E4 | 64 |
| F4 | 65 |
| G4 | 67 |
| A4 | 69 |
| B4 | 71 |
| C5 | 72 |

### 4. Register the Song

Edit `src/songs/index.js` to import and add your song:

```javascript
import yourMeta from './your-song-id/meta.json';
import yourSimple from './your-song-id/charts/simple.json';
// ... import other charts

export const SONGS = {
  // ... existing songs
  'your-song-id': {
    ...yourMeta,
    charts: {
      simple: yourSimple,
      medium: yourMedium,
      hard: yourHard,
    },
  },
};
```

## Troubleshooting Audio/MIDI Permissions

### Audio Not Playing

**iOS Safari:**
1. Audio requires user interaction - tap Play button
2. Check Silent mode switch is OFF
3. Increase device volume

**Desktop Chrome:**
1. Check site isn't muted in tab
2. Allow autoplay in site settings

### MIDI Not Working

**Check Browser Support:**
- Web MIDI works in Chrome, Edge, Opera
- Safari requires iOS 16+ with Web MIDI enabled
- Firefox does not support Web MIDI

**Troubleshooting Steps:**
1. Connect MIDI device before loading page
2. Refresh page after connecting
3. Check browser console for MIDI errors
4. Ensure MIDI device is recognized by system

**MIDI Permission Denied:**
1. Chrome: Click lock icon → Site Settings → MIDI Devices → Allow
2. Grant permission when browser prompts

### iOS Specific Issues

**No Sound:**
- Ensure Silent mode is off (physical switch)
- Increase volume
- Tap screen to trigger audio context

**Touch Not Responsive:**
- Avoid multi-touch gestures that Safari interprets as zoom/scroll
- Use single finger taps on keys

## Architecture

```
src/
├── engine/         # Core game logic (framework-agnostic)
│   ├── Transport.js    # Timing source (performance.now)
│   ├── HitDetection.js # Hit window classification
│   ├── Scoring.js      # Score calculation
│   ├── ChartParser.js  # Chart parsing/validation
│   └── GameEngine.js   # Main game loop
├── audio/          # Web Audio synthesis
├── midi/           # Web MIDI input
├── songs/          # Song data and charts
├── hooks/          # React hooks
├── ui/
│   ├── components/ # Reusable UI components
│   └── screens/    # App screens
└── test/           # Unit tests
```

## Testing

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run
```

Tests cover:
- Hit window classification (Perfect/Great/Good/Miss)
- Scoring with streak multipliers
- Chart parsing and validation

## License

Personal project - not for distribution.
