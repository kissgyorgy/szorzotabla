# Szorzótábla — Multiplication Table Game for Kids

A playful, colorful SPA that quizzes kids (ages 6-10) on 10 random multiplications (1×1 to 10×10), tracks their time, and maintains a top-10 leaderboard with confetti celebrations for new records.

**IMPORTANT**: Use the `frontend-design` skill during implementation. Read `/home/walkman/.pi/agent/skills/frontend-design/SKILL.md` before writing any UI code. Follow its guidelines for typography, color, motion, spatial composition, and visual details to create a distinctive, playful design that avoids generic AI aesthetics.

**IMPORTANT**: The app UI language is Hungarian. All visible text (buttons, labels, titles, messages) must be in Hungarian. Code, comments, variable names, and this plan document remain in English.

# Architecture

Single-page React app built with Vite. All state managed with React hooks (`useState`, `useEffect`, `useRef`). No backend — leaderboard and player data persisted in `localStorage`. Static export via `vite build` produces a self-contained `dist/` folder that can be opened directly or served from anywhere.

# Tech Stack

- **Vite** — build tool, dev server, static export
- **React 18** — UI framework
- **TypeScript** — type safety
- **canvas-confetti** — confetti celebration effect
- **Google Fonts** — playful typography (Fredoka, Baloo 2, or similar bubbly fonts)
- No CSS framework — custom CSS with CSS variables for the playful theme

# Implementation Plan

## App Screens / States

The app cycles through these states, all rendered in a single component tree:

### 1. Welcome Screen (`screen: "welcome"`)

- Big playful "Szorzótábla" title with bounce animation
- Player name input (if no player saved yet) or greeting with current player name
- "Rajt!" (Start) button — big, chunky, colorful
- Player switcher dropdown (all known players from localStorage, plus "Új játékos" option)
- Leaderboard preview (top 5) shown below

### 2. Game Screen (`screen: "game"`)

- Progress indicator: "3 / 10" with a fun progress bar (stars or dots)
- Timer display: running clock updated every 100ms
- The equation: `7 × 8 = ___` displayed in huge, bold text
- Number input field — large, auto-focused, number-only
- Submit on Enter key press
- On wrong answer:
  - Equation container shakes (CSS `@keyframes shake`)
  - Text turns red briefly
  - Input clears
  - After ~600ms returns to normal color
- On correct answer:
  - Brief green flash / bounce
  - Advance to next question
  - If last question → transition to results

### 3. Results Screen (`screen: "results"`)

- Final time displayed prominently
- If new record (top 10 leaderboard entry):
  - Full-screen confetti burst via `canvas-confetti`
  - "🎉 Új rekord! 🎉" text with celebration animation
- Mistake count shown ("Hibák: 3")
- "Újra!" (Again) button to restart
- "Vissza" (Back) button to return to welcome

## Hungarian UI Text Reference

All user-visible text in Hungarian:

| Key               | Hungarian Text   |
| ----------------- | ---------------- |
| App title         | Szorzótábla      |
| Start button      | Rajt!            |
| Play again        | Újra!            |
| Back              | Vissza           |
| New record        | 🎉 Új rekord! 🎉 |
| New player option | Új játékos       |
| Name prompt       | Hogy hívnak?     |
| Leaderboard title | Ranglista        |
| Progress          | 3 / 10           |
| Time unit         | mp (másodperc)   |
| Mistakes label    | Hibák            |

## Data Model

```typescript
type LeaderboardEntry = {
  playerName: string;
  time: number; // milliseconds
  date: string; // ISO date string
};

type GameQuestion = {
  a: number; // 1-10
  b: number; // 1-10
  answer: number; // a * b
};

type GameState = {
  screen: "welcome" | "game" | "results";
  currentPlayer: string | null;
  questions: GameQuestion[];
  currentIndex: number;
  startTime: number | null;
  endTime: number | null;
  mistakes: number;
  shaking: boolean;
};
```

## localStorage Keys

- `szorzotabla_players` — `string[]` — list of player names
- `szorzotabla_currentPlayer` — `string` — last active player
- `szorzotabla_leaderboard` — `LeaderboardEntry[]` — top 10, sorted by time ascending

## Question Generation

```typescript
function generateQuestions(): GameQuestion[] {
  const all: GameQuestion[] = [];
  for (let a = 1; a <= 10; a++)
    for (let b = 1; b <= 10; b++) all.push({ a, b, answer: a * b });
  return shuffle(all).slice(0, 10);
}
```

Fisher-Yates shuffle for randomization.

## Timer Logic

- `startTime` set via `Date.now()` when first question appears
- Display updated every 100ms via `setInterval` in a `useEffect`
- `endTime` set when last question answered correctly
- Final time = `endTime - startTime`
- Display format: seconds with 1 decimal (e.g., "23.4 mp")

## Wrong Answer Animation

CSS keyframes:

```css
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20%,
  60% {
    transform: translateX(-10px);
  }
  40%,
  80% {
    transform: translateX(10px);
  }
}

.shaking {
  animation: shake 0.5s ease-in-out;
  color: #ff4444;
}
```

On wrong answer: set `shaking: true`, clear input, after animation ends set `shaking: false`.

## Confetti

```typescript
import confetti from "canvas-confetti";

confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
setTimeout(() => confetti({ particleCount: 50, spread: 100 }), 300);
```

## Design Direction: Toy-Box / Candy Playfulness

**IMPORTANT**: Follow the frontend-design skill guidelines — bold aesthetic direction, distinctive typography, impactful animations, no generic AI look!

**Color Palette** (CSS variables):

- `--bg`: warm cream/yellow (#FFF8E7)
- `--primary`: bright orange (#FF6B35)
- `--secondary`: vibrant teal (#00B4D8)
- `--accent`: hot pink (#FF006E)
- `--success`: lime green (#70E000)
- `--danger`: coral red (#FF4444)
- `--text`: dark chocolate (#2D1B00)

**Typography**:

- Display/title: Fredoka (Google Font) — bubbly, rounded, perfect for kids
- Body/numbers: Baloo 2 or Nunito — friendly, readable at large sizes

**Visual Elements**:

- Rounded corners everywhere (16-24px border-radius)
- Chunky 4px borders on buttons and cards
- Subtle dotted/dashed patterns in background
- Emoji decorations (⭐, 🎯, 🏆, 🎉) as accent elements
- Buttons with thick bottom-border for 3D "press" effect
- Playful hover states with scale transforms
- Background with subtle repeating pattern (stars, dots, or math symbols)

**Layout**:

- Centered, max-width ~500px for focus
- Large touch targets (min 48px, prefer 56-64px)
- Generous spacing for small fingers
- Input field: huge font (2.5rem+), very prominent

## Component Structure

All in a single `App.tsx` with extracted sub-components:

```
App.tsx
├── WelcomeScreen
│   ├── PlayerSelector (name input + switcher dropdown)
│   ├── StartButton
│   └── LeaderboardPreview
├── GameScreen
│   ├── ProgressBar
│   ├── Timer
│   ├── EquationDisplay (with shake animation)
│   └── AnswerInput
└── ResultsScreen
    ├── CelebrationOverlay (confetti + "Új rekord!")
    ├── TimeDisplay
    ├── Leaderboard (full top 10)
    └── ActionButtons (Újra / Vissza)
```

One CSS file (`App.css`) for all styles.

## Project Structure

```
szorzotabla/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── main.tsx          # React entry point
│   ├── App.tsx           # Main app component with all screens
│   ├── App.css           # All styles
│   ├── storage.ts        # localStorage helpers
│   ├── game.ts           # Question generation, shuffle, timer utils
│   └── types.ts          # TypeScript types
└── dist/                 # Build output (static)
```

# Files to Modify

All files are new (greenfield project):

- **package.json** — dependencies: react, react-dom, canvas-confetti, typescript, vite, @vitejs/plugin-react
- **vite.config.ts** — basic React plugin config
- **tsconfig.json** — standard React TS config
- **index.html** — Vite entry HTML with Google Fonts link, root div
- **src/types.ts** — `LeaderboardEntry`, `GameQuestion`, `GameState` types
- **src/game.ts** — `generateQuestions()`, `shuffle()`, `formatTime()` utilities
- **src/storage.ts** — `getPlayers()`, `savePlayers()`, `getCurrentPlayer()`, `setCurrentPlayer()`, `getLeaderboard()`, `addLeaderboardEntry()` — all wrapping localStorage with JSON parse/stringify
- **src/App.tsx** — all React components and game logic. **All visible text in Hungarian!**
- **src/App.css** — complete styling: CSS variables, animations (shake, bounce, pulse), responsive layout, playful theme
- **src/main.tsx** — `ReactDOM.createRoot` entry

# Verification / Success Criteria

1. `npm run dev` starts dev server, app loads in browser
2. Can enter player name, see it saved, switch between players
3. Game shows 10 random multiplications, timer runs
4. Wrong answers: equation shakes red, input clears, timer keeps running
5. Correct answers advance to next question
6. After 10 questions, results screen shows time
7. New record triggers confetti + "Új rekord!" celebration
8. Leaderboard persists across page reloads (localStorage)
9. `npm run build` produces static `dist/` folder
10. Opening `dist/index.html` works (fully self-contained)
11. **All user-visible text is in Hungarian — no English in the UI**

# Todo Items

1. Read the frontend-design skill (`/home/walkman/.pi/agent/skills/frontend-design/SKILL.md`) before writing any UI code
2. Initialize project: `npm create vite`, install dependencies (react, canvas-confetti), configure vite + tsconfig
3. Create `src/types.ts` with all TypeScript types
4. Create `src/game.ts` with question generation, shuffle, time formatting
5. Create `src/storage.ts` with localStorage helpers for players and leaderboard
6. Create `src/App.css` with full playful theme following frontend-design skill guidelines: bold aesthetic direction, distinctive typography, CSS variables, animations, responsive layout, kid-friendly sizing
7. Create `src/App.tsx` with all screens: Welcome (player selector + leaderboard preview), Game (progress + timer + equation + input), Results (time + confetti + full leaderboard). **All visible text in Hungarian!**
8. Create `src/main.tsx` entry point and `index.html` with Google Fonts
9. Test full flow: player creation → game → wrong/right answers → results → record celebration → leaderboard persistence
10. Build static export and verify `dist/` works standalone
