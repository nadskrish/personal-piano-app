# Design Notes - Simply Keys

Technical documentation explaining how the piano learning app works.

## How Timing Works

### Single Source of Truth: Transport

The `Transport` class (`src/engine/Transport.js`) is the single source of truth for all timing in the game.

```javascript
// Core timing calculation
currentTimeMs = performance.now() - startTime - pausedDuration
```

**Why performance.now()?**
- High-resolution timer (microsecond precision)
- Monotonic (never goes backwards)
- Independent of system clock changes
- Consistent across browsers

**Transport States:**
- `IDLE`: Not started
- `PLAYING`: Active, time advancing
- `PAUSED`: Time frozen, resumable

### No setInterval

The game loop uses `requestAnimationFrame` exclusively:

```javascript
const gameLoop = () => {
  if (state !== PLAYING) return;

  const currentTime = transport.getCurrentTimeMs();
  updateNotePositions(currentTime);
  checkForMisses(currentTime);

  requestAnimationFrame(gameLoop);
};
```

**Why not setInterval?**
- setInterval drifts over time (not synced to display refresh)
- requestAnimationFrame syncs with display (smooth 60fps)
- Automatically pauses when tab is hidden (saves battery)

### Note Positioning

Notes are positioned based on time, not arbitrary values:

```javascript
// Calculate Y position for a note
const timeToHit = note.timeMs - currentTimeMs;
const yOffset = timeToHit * NOTE_SPEED_PX_PER_MS;
const y = hitLineY - yOffset;
```

**Constants:**
- `NOTE_SPEED`: 0.25 pixels per millisecond
- `HIT_LINE_BOTTOM`: 60 pixels from keyboard
- `LOOK_AHEAD_MS`: 3500ms (notes visible 3.5s before hit)

## How Alignment is Guaranteed

### 1. Notes Are Time-Based

Chart notes are defined with exact timestamps:

```json
{ "timeMs": 1000, "midi": 60, "durationMs": 500 }
```

This note should be hit exactly at 1000ms from song start.

### 2. Hit Line Is Fixed

The hit line is positioned at a fixed pixel location (60px from bottom of notes area). This never moves.

### 3. Position Derived from Time

Every frame, note Y positions are recalculated:

```javascript
y = hitLineY - (note.timeMs - currentTimeMs) * speed
```

When `currentTimeMs === note.timeMs`, the note is exactly at the hit line.

### 4. Keyboard Lanes Match Notes

Notes are positioned horizontally based on MIDI number:

```javascript
// Each white key gets a lane (0-12)
// Black keys are positioned between white keys
const laneX = getLanePosition(note.midi, startMidi, endMidi);
```

The keyboard component uses the same lane calculation, ensuring notes fall directly onto their corresponding keys.

### 5. Hit Detection Uses Same Time

When a key is pressed:

```javascript
const currentTime = transport.getCurrentTimeMs();
const delta = Math.abs(currentTime - note.timeMs);

if (delta <= HIT_WINDOWS.perfect) return 'perfect';
// etc.
```

The same `currentTimeMs` value is used for both rendering and hit detection.

## How to Author Charts

### Step 1: Determine BPM and Beat Length

```
beatMs = 60000 / bpm
```

For 120 BPM: `beatMs = 500ms`

### Step 2: Map Notes to Timestamps

For "Twinkle Twinkle" at 120 BPM:

| Lyric | Beat | timeMs | Note |
|-------|------|--------|------|
| Twin- | 1 | 0 | C4 (60) |
| -kle | 2 | 500 | C4 (60) |
| twin- | 3 | 1000 | G4 (67) |
| -kle | 4 | 1500 | G4 (67) |
| lit- | 5 | 2000 | A4 (69) |
| -tle | 6 | 2500 | A4 (69) |
| star | 7-8 | 3000 | G4 (67) |

### Step 3: Create JSON

```json
{
  "difficulty": "simple",
  "notes": [
    { "timeMs": 0, "midi": 60, "durationMs": 500 },
    { "timeMs": 500, "midi": 60, "durationMs": 500 },
    { "timeMs": 1000, "midi": 67, "durationMs": 500 },
    { "timeMs": 1500, "midi": 67, "durationMs": 500 },
    { "timeMs": 2000, "midi": 69, "durationMs": 500 },
    { "timeMs": 2500, "midi": 69, "durationMs": 500 },
    { "timeMs": 3000, "midi": 67, "durationMs": 1000 }
  ]
}
```

### Step 4: Create Difficulty Variants

**Simple:**
- Fewer notes (melody only)
- Slower tempo (longer gaps)
- Right hand only

**Medium:**
- Full melody
- Original tempo
- All notes from the song

**Hard:**
- Add left hand bass notes
- Add chords (multiple notes at same timeMs)
- Faster passages

### Chord Example

For notes played simultaneously, use the same `timeMs`:

```json
[
  { "timeMs": 0, "midi": 60, "durationMs": 500 },  // C4
  { "timeMs": 0, "midi": 64, "durationMs": 500 },  // E4
  { "timeMs": 0, "midi": 67, "durationMs": 500 }   // G4
]
```

## Hit Window Tuning

Default hit windows (configurable in `HitDetection.js`):

| Rating | Window | Points |
|--------|--------|--------|
| Perfect | ≤60ms | 100 |
| Great | 61-120ms | 70 |
| Good | 121-180ms | 40 |
| Miss | >180ms | 0 |

**Why these values?**
- 60ms is ~1 frame at 16fps (very generous for kids)
- 180ms total window is forgiving but requires timing awareness
- Professional rhythm games use 30-50ms windows

### Adjusting for Difficulty

For younger kids, widen windows:
```javascript
const EASY_WINDOWS = { perfect: 100, great: 180, good: 250 };
```

For challenge mode, tighten:
```javascript
const HARD_WINDOWS = { perfect: 40, great: 80, good: 120 };
```

## Streak Multiplier

```javascript
multiplier = 1 + floor(streak / 10)
max multiplier = 4x
```

| Streak | Multiplier | Perfect Points |
|--------|------------|----------------|
| 0-9 | 1x | 100 |
| 10-19 | 2x | 200 |
| 20-29 | 3x | 300 |
| 30+ | 4x | 400 |

Any miss or wrong note resets streak to 0.

## Performance Considerations

### iPad Optimization

1. **CSS Transforms for Notes**: Uses `transform: translateY()` instead of `top` property (GPU-accelerated)

2. **Will-Change Hint**: Notes have `will-change: transform` for compositor optimization

3. **Limited Visible Notes**: Only notes within view window are rendered (3.5s lookahead)

4. **Single Animation Loop**: One requestAnimationFrame loop, not per-note timers

5. **Touch Events**: Uses `touch-action: manipulation` to prevent zoom delays

### Memory Management

- Notes are pre-parsed at chart load
- Visible notes are filtered each frame (no new allocations)
- Audio oscillators are short-lived and garbage collected

## What Was Wrong in the Original Code

### Issue 1: No Timing Engine

**Old code:**
```javascript
// Notes were just an array of note names
const notes = ["C4", "C4", "G4", "G4"]
```

**Fix:**
```javascript
// Notes have precise timestamps
{ "timeMs": 0, "midi": 60, "durationMs": 500 }
```

### Issue 2: Static Note Display

**Old code:**
```javascript
// Just showed next 5 notes statically
container.innerHTML = upcoming.map(note => `<div>...</div>`);
```

**Fix:**
```javascript
// Notes positioned based on real time
const y = hitLineY - (note.timeMs - currentTimeMs) * speed;
```

### Issue 3: No Hit Windows

**Old code:**
```javascript
// Binary: correct or wrong
if (note === targetNote) { score += 10; }
```

**Fix:**
```javascript
// Timing-based scoring
const delta = Math.abs(currentTime - note.timeMs);
if (delta <= 60) return HitResult.PERFECT;
if (delta <= 120) return HitResult.GREAT;
// etc.
```

### Issue 4: setInterval for Metronome

**Old code:**
```javascript
this.metronomeInterval = setInterval(() => {
  // Play click
}, 1000); // Drifts over time!
```

**Fix:** Metronome would be tied to transport time, not independent interval.

### Issue 5: No Difficulty Selection

**Old code:**
```javascript
// One chart per song
{ title: "Twinkle", notes: ["C4", "C4", ...] }
```

**Fix:**
```javascript
// Multiple charts per song
charts: {
  simple: { notes: [...] },
  medium: { notes: [...] },
  hard: { notes: [...] }
}
```

### Issue 6: Scoring Not Deterministic

**Old code:**
```javascript
// Just +10 per note, no way to verify correctness
this.score += 10;
```

**Fix:**
```javascript
// Deterministic formula with streak
points = BASE_SCORES[hitResult] * multiplier;
// Can verify: 3 perfects at streak 0-2 = 300 points
```

## Future Enhancements

1. **Microphone Pitch Detection**: Interface exists but not implemented
2. **Audio Playback**: Songs could play backing tracks
3. **Lesson Mode**: Guided tutorials with slower pacing
4. **Progress Tracking**: Save high scores, unlock songs
5. **Parent Dashboard**: View child's practice stats
