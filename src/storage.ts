import type { LeaderboardEntry } from "./types";

const PLAYERS_KEY = "szorzotabla_players";
const CURRENT_PLAYER_KEY = "szorzotabla_currentPlayer";
const LEADERBOARD_KEY = "szorzotabla_leaderboard";

export function getPlayers(): string[] {
  try {
    const raw = localStorage.getItem(PLAYERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePlayers(players: string[]): void {
  localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
}

export function addPlayer(name: string): void {
  const players = getPlayers();
  if (!players.includes(name)) {
    players.push(name);
    savePlayers(players);
  }
}

export function getCurrentPlayer(): string | null {
  return localStorage.getItem(CURRENT_PLAYER_KEY);
}

export function setCurrentPlayer(name: string): void {
  localStorage.setItem(CURRENT_PLAYER_KEY, name);
}

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addLeaderboardEntry(entry: LeaderboardEntry): number | null {
  const board = getLeaderboard();
  board.push(entry);
  board.sort((a, b) => a.time - b.time);
  const top10 = board.slice(0, 10);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(top10));
  const idx = top10.findIndex(
    (e) =>
      e.playerName === entry.playerName &&
      e.time === entry.time &&
      e.date === entry.date,
  );
  return idx >= 0 ? idx + 1 : null;
}
