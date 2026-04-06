# Szorzótábla — Multiplication Table Game for Kids

## Commands

```bash
npm run build      # TypeScript check + Vite production build → dist/
just deploy        # Build + rsync to production server
```

## Language Rule

All user-visible text (buttons, labels, titles, messages) **must be in Hungarian**.
Code, variable names, and comments remain in English.

## Architecture

Single-page React app (Vite + TypeScript). No backend — all data persisted in
`localStorage`. Static export via `vite build` produces a self-contained `dist/`.

The app is a single component tree in `App.tsx` with four screens driven by
`GameState.screen`: `"welcome"` → `"game"` → `"results"`, plus `"table"` (reference view).

## Source Files

- `src/types.ts` — `LeaderboardEntry`, `GameQuestion`, `Screen`, `GameState` types
- `src/game.ts` — `generateQuestions()` (10 random from 1×1..10×10), `formatTime()`
- `src/storage.ts` — localStorage wrappers for players and leaderboard (keys: `szorzotabla_players`, `szorzotabla_currentPlayer`, `szorzotabla_leaderboard`)
- `src/App.tsx` — All React components: `WelcomeScreen`, `GameScreen`, `MultiplicationTableScreen`, `ResultsScreen`, `Leaderboard`, and root `App`
- `src/App.css` — Full styling with CSS variables, animations (shake, bounce, confetti), responsive layout
- `src/main.tsx` — React entry point

## Design

Kid-friendly "toy-box" aesthetic using Google Fonts (Fredoka + Baloo 2), warm
color palette via CSS variables (`--primary: #FF6B35`, `--secondary: #00B4D8`,
`--accent: #FF006E`), chunky borders, large touch targets, and emoji decorations.
Uses `canvas-confetti` for top-3 leaderboard celebrations.
