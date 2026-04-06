import type { GameQuestion } from "./types";

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateQuestions(): GameQuestion[] {
  const all: GameQuestion[] = [];
  for (let a = 1; a <= 10; a++) {
    for (let b = 1; b <= 10; b++) {
      all.push({ a, b, answer: a * b });
    }
  }
  return shuffle(all).slice(0, 10);
}

export function formatTime(ms: number): string {
  const seconds = ms / 1000;
  return `${seconds.toFixed(1)} mp`;
}
