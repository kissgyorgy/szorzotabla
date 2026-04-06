import { useState, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import type { GameState, LeaderboardEntry } from "./types";
import { generateQuestions, formatTime } from "./game";
import {
  getPlayers,
  addPlayer,
  getCurrentPlayer,
  setCurrentPlayer,
  getLeaderboard,
  addLeaderboardEntry,
} from "./storage";
import "./App.css";

const MEDAL = ["🥇", "🥈", "🥉"];
const RANK_CLASS = [
  "leaderboard-rank--gold",
  "leaderboard-rank--silver",
  "leaderboard-rank--bronze",
];

function Leaderboard({
  entries,
  limit,
  highlightEntry,
}: {
  entries: LeaderboardEntry[];
  limit?: number;
  highlightEntry?: LeaderboardEntry | null;
}) {
  const shown = limit ? entries.slice(0, limit) : entries;

  if (shown.length === 0) {
    return <div className="leaderboard-empty">Még nincs eredmény 🎯</div>;
  }

  return (
    <ul className="leaderboard-list">
      {shown.map((entry, i) => {
        const isHighlight =
          highlightEntry &&
          entry.playerName === highlightEntry.playerName &&
          entry.time === highlightEntry.time &&
          entry.date === highlightEntry.date;

        return (
          <li
            key={`${entry.date}-${entry.time}-${i}`}
            className={`leaderboard-entry${isHighlight ? " leaderboard-entry--highlight" : ""}`}
          >
            <span className={`leaderboard-rank ${i < 3 ? RANK_CLASS[i] : ""}`}>
              {i < 3 ? MEDAL[i] : `${i + 1}.`}
            </span>
            <span className="leaderboard-name">{entry.playerName}</span>
            <span className="leaderboard-time">{formatTime(entry.time)}</span>
          </li>
        );
      })}
    </ul>
  );
}

type TableView = "grid" | "grouped";

function MultiplicationTableScreen({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<TableView>("grid");
  const [selected, setSelected] = useState<{ a: number; b: number } | null>(
    null,
  );
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <>
      <h1 className="app-title">
        <span className="emoji-deco">📐</span> Szorzótábla{" "}
        <span className="emoji-deco">📐</span>
      </h1>

      <div className="table-view-switcher">
        <button
          className={`player-bubble${view === "grid" ? " player-bubble--active" : ""}`}
          onClick={() => setView("grid")}
        >
          🔢 Táblázat
        </button>
        <button
          className={`player-bubble${view === "grouped" ? " player-bubble--active" : ""}`}
          onClick={() => setView("grouped")}
        >
          📋 Szorzók szerint
        </button>
      </div>

      {view === "grid" ? (
        <div className="card mult-table-card">
          <div className="mult-grid">
            <div className="mult-cell mult-cell--corner">×</div>
            {nums.map((n) => (
              <div
                key={`h${n}`}
                className={`mult-cell mult-cell--header${selected?.b === n ? " mult-cell--col-hl" : ""}`}
              >
                {n}
              </div>
            ))}
            {nums.map((a) => (
              <>
                <div
                  key={`r${a}`}
                  className={`mult-cell mult-cell--header${selected?.a === a ? " mult-cell--row-hl" : ""}`}
                >
                  {a}
                </div>
                {nums.map((b) => {
                  const isSelected = selected?.a === a && selected?.b === b;
                  const isHighlighted =
                    selected !== null && (selected.a === a || selected.b === b);
                  return (
                    <div
                      key={`${a}x${b}`}
                      className={`mult-cell${isSelected ? " mult-cell--selected" : isHighlighted ? " mult-cell--highlighted" : ""}`}
                      onClick={() => setSelected(isSelected ? null : { a, b })}
                    >
                      {a * b}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      ) : (
        <div className="mult-grouped">
          {nums.map((a) => (
            <div key={a} className="card mult-group-card">
              <h3 className="mult-group-title">{a}× szorzótábla</h3>
              <div className="mult-group-rows">
                {nums.map((b) => (
                  <div key={b} className="mult-group-row">
                    <span className="mult-group-expr">
                      {a} × {b}
                    </span>
                    <span className="mult-group-eq">=</span>
                    <span className="mult-group-result">{a * b}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-md mb-md">
        <button className="btn btn--secondary" onClick={onBack}>
          ← Vissza
        </button>
      </div>
    </>
  );
}

function WelcomeScreen({
  onStart,
  onShowTable,
}: {
  onStart: (playerName: string) => void;
  onShowTable: () => void;
}) {
  const [players, setPlayers] = useState<string[]>(getPlayers);
  const [current, setCurrent] = useState<string | null>(getCurrentPlayer);
  const [newName, setNewName] = useState("");
  const [showNameInput, setShowNameInput] = useState(!current);
  const [leaderboard] = useState<LeaderboardEntry[]>(getLeaderboard);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showNameInput && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [showNameInput]);

  const handleSetPlayer = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addPlayer(trimmed);
    setCurrentPlayer(trimmed);
    setCurrent(trimmed);
    setPlayers(getPlayers());
    setShowNameInput(false);
    setNewName("");
  }, []);

  const handleNewPlayer = useCallback(() => {
    setShowNameInput(true);
    setCurrent(null);
  }, []);

  const handleStart = useCallback(() => {
    if (current) onStart(current);
  }, [current, onStart]);

  return (
    <>
      <h1 className="app-title">
        <span className="emoji-deco">✨</span> Szorzótábla{" "}
        <span className="emoji-deco">✨</span>
      </h1>
      <p className="subtitle">Mennyire megy a szorzás? 🤔</p>

      <div className="card player-section">
        {current && !showNameInput && (
          <div className="player-greeting">
            Szia, <span className="player-name">{current}</span>! 👋
          </div>
        )}

        {players.length > 0 && (
          <div className="player-bubbles">
            {players.map((p) => (
              <button
                key={p}
                className={`player-bubble${p === current ? " player-bubble--active" : ""}`}
                onClick={() => handleSetPlayer(p)}
              >
                {p}
              </button>
            ))}
            <button
              className="player-bubble player-bubble--new"
              onClick={handleNewPlayer}
            >
              ➕ Új játékos
            </button>
          </div>
        )}

        {showNameInput && (
          <form
            className="player-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSetPlayer(newName);
            }}
          >
            <input
              ref={nameInputRef}
              className="input"
              type="text"
              placeholder="Hogy hívnak?"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              maxLength={20}
              autoComplete="off"
            />
            <button
              type="submit"
              className="btn btn--secondary"
              disabled={!newName.trim()}
            >
              OK
            </button>
          </form>
        )}
      </div>

      <div
        className="text-center mb-md"
        style={{
          display: "flex",
          gap: "14px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          className="btn btn--primary btn--start"
          onClick={handleStart}
          disabled={!current}
        >
          🚀 Rajt!
        </button>
        <button className="btn btn--success" onClick={onShowTable}>
          📐 Szorzótábla
        </button>
      </div>

      {leaderboard.length > 0 && (
        <div className="card leaderboard stagger-2">
          <h2 className="leaderboard-title">🏆 Ranglista</h2>
          <Leaderboard entries={leaderboard} limit={5} />
        </div>
      )}
    </>
  );
}

function GameScreen({
  state,
  onAnswer,
}: {
  state: GameState;
  onAnswer: (value: string) => void;
}) {
  const [inputVal, setInputVal] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [correct, setCorrect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const question = state.questions[state.currentIndex];

  useEffect(() => {
    if (!state.startTime) return;
    const id = setInterval(() => {
      setElapsed(Date.now() - state.startTime!);
    }, 100);
    return () => clearInterval(id);
  }, [state.startTime]);

  useEffect(() => {
    setInputVal("");
    setCorrect(false);
    if (inputRef.current) inputRef.current.focus();
  }, [state.currentIndex]);

  useEffect(() => {
    if (!state.shaking && inputRef.current) {
      inputRef.current.focus();
    }
  }, [state.shaking]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = inputVal.trim();
      if (!trimmed) return;

      if (parseInt(trimmed, 10) === question.answer) {
        setCorrect(true);
        setTimeout(() => {
          onAnswer(trimmed);
          setInputVal("");
          setCorrect(false);
        }, 300);
      } else {
        setInputVal("");
        onAnswer(trimmed);
      }
    },
    [inputVal, question.answer, onAnswer],
  );

  const areaClass = [
    "equation-area",
    state.shaking ? "equation-area--shaking" : "",
    correct ? "equation-area--correct" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div className="card card--game">
        <div className="game-header">
          <span className="progress-text">
            {state.currentIndex + 1} / {state.questions.length}
          </span>
          <div className="progress-dots">
            {state.questions.map((_, i) => {
              let cls = "progress-dot";
              if (i < state.currentIndex) cls += " progress-dot--done";
              else if (i === state.currentIndex)
                cls += " progress-dot--current";
              return <div key={i} className={cls} />;
            })}
          </div>
          <span className="timer">⏱ {formatTime(elapsed)}</span>
        </div>

        <div className={areaClass}>
          <div className="equation">
            {question.a}
            <span className="multiply"> × </span>
            {question.b}
            <span className="equals"> = </span>
            <span className="qmark">?</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="answer-area">
          <input
            ref={inputRef}
            className="input input--answer"
            type="number"
            inputMode="numeric"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={state.shaking || correct}
            autoComplete="off"
          />
        </form>
      </div>
    </>
  );
}

function ResultsScreen({
  state,
  rank,
  resultEntry,
  onPlayAgain,
  onBack,
}: {
  state: GameState;
  rank: number | null;
  resultEntry: LeaderboardEntry | null;
  onPlayAgain: () => void;
  onBack: () => void;
}) {
  const [leaderboard] = useState<LeaderboardEntry[]>(getLeaderboard);
  const confettiFired = useRef(false);
  const isTop3 = rank !== null && rank <= 3;

  useEffect(() => {
    if (isTop3 && !confettiFired.current) {
      confettiFired.current = true;
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      setTimeout(
        () => confetti({ particleCount: 60, spread: 120, origin: { y: 0.5 } }),
        350,
      );
      setTimeout(
        () => confetti({ particleCount: 40, spread: 100, origin: { y: 0.7 } }),
        700,
      );
    }
  }, [isTop3]);

  const totalTime = (state.endTime ?? 0) - (state.startTime ?? 0);

  const celebrationText =
    rank === 1 ? "🎉 Új rekord! 🎉" : isTop3 ? "🎉 Első három! 🎉" : null;

  return (
    <>
      <div className="card results">
        <div className="results-emoji">🎯</div>
        <div className="results-time">{formatTime(totalTime)}</div>
        <div className="results-mistakes">
          Hibák: {state.mistakes} {state.mistakes === 0 ? "🌟 Tökéletes!" : ""}
        </div>
        {celebrationText && (
          <div className="results-record">{celebrationText}</div>
        )}
        <div className="results-actions">
          <button className="btn btn--primary" onClick={onPlayAgain}>
            🔄 Újra!
          </button>
          <button className="btn btn--secondary" onClick={onBack}>
            ← Vissza
          </button>
        </div>
      </div>

      <div className="card leaderboard stagger-2">
        <h2 className="leaderboard-title">🏆 Ranglista</h2>
        <Leaderboard entries={leaderboard} highlightEntry={resultEntry} />
      </div>
    </>
  );
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    screen: "welcome",
    currentPlayer: getCurrentPlayer(),
    questions: [],
    currentIndex: 0,
    startTime: null,
    endTime: null,
    mistakes: 0,
    shaking: false,
  });

  const [rank, setRank] = useState<number | null>(null);
  const [resultEntry, setResultEntry] = useState<LeaderboardEntry | null>(null);

  const handleStart = useCallback((playerName: string) => {
    const questions = generateQuestions();
    setGameState({
      screen: "game",
      currentPlayer: playerName,
      questions,
      currentIndex: 0,
      startTime: Date.now(),
      endTime: null,
      mistakes: 0,
      shaking: false,
    });
    setRank(null);
    setResultEntry(null);
    finishedRef.current = false;
  }, []);

  const finishedRef = useRef(false);

  const handleAnswer = useCallback((value: string) => {
    setGameState((prev) => {
      const question = prev.questions[prev.currentIndex];
      const isCorrect = parseInt(value, 10) === question.answer;

      if (!isCorrect) {
        setTimeout(() => {
          setGameState((p) => ({ ...p, shaking: false }));
        }, 550);
        return { ...prev, mistakes: prev.mistakes + 1, shaking: true };
      }

      const nextIndex = prev.currentIndex + 1;
      const isLast = nextIndex >= prev.questions.length;

      if (isLast) {
        const endTime = Date.now();

        if (!finishedRef.current) {
          finishedRef.current = true;
          const totalTime = endTime - (prev.startTime ?? endTime);
          const entry: LeaderboardEntry = {
            playerName: prev.currentPlayer!,
            time: totalTime,
            date: new Date().toISOString(),
          };
          const entryRank = addLeaderboardEntry(entry);
          setRank(entryRank);
          setResultEntry(entry);
        }

        return {
          ...prev,
          currentIndex: nextIndex,
          endTime,
          screen: "results",
        };
      }

      return {
        ...prev,
        currentIndex: nextIndex,
      };
    });
  }, []);

  const handlePlayAgain = useCallback(() => {
    handleStart(gameState.currentPlayer!);
  }, [gameState.currentPlayer, handleStart]);

  const handleBack = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      screen: "welcome",
    }));
  }, []);

  const handleShowTable = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      screen: "table",
    }));
  }, []);

  return (
    <div
      className={`app-container${gameState.screen === "table" ? " app-container--wide" : ""}`}
    >
      {gameState.screen === "welcome" && (
        <WelcomeScreen onStart={handleStart} onShowTable={handleShowTable} />
      )}
      {gameState.screen === "table" && (
        <MultiplicationTableScreen onBack={handleBack} />
      )}
      {gameState.screen === "game" && (
        <GameScreen state={gameState} onAnswer={handleAnswer} />
      )}
      {gameState.screen === "results" && (
        <ResultsScreen
          state={gameState}
          rank={rank}
          resultEntry={resultEntry}
          onPlayAgain={handlePlayAgain}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
