export type LeaderboardEntry = {
  playerName: string;
  time: number;
  date: string;
};

export type GameQuestion = {
  a: number;
  b: number;
  answer: number;
};

export type Screen = "welcome" | "game" | "results" | "table";

export type GameState = {
  screen: Screen;
  currentPlayer: string | null;
  questions: GameQuestion[];
  currentIndex: number;
  startTime: number | null;
  endTime: number | null;
  mistakes: number;
  shaking: boolean;
};
