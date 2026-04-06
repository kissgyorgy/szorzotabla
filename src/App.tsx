import { useState, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import type { GameState, GameMode, LeaderboardEntry } from "./types";
import { generateQuestions, formatTime, MODE_LABELS } from "./game";
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

type TableType = "multiplication" | "division";
type TableView = "grid" | "grouped";

function TableScreen({ onBack }: { onBack: () => void }) {
  const [tableType, setTableType] = useState<TableType>("multiplication");
  const [view, setView] = useState<TableView>("grid");
  const [selected, setSelected] = useState<{ a: number; b: number } | null>(
    null,
  );
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const isDivision = tableType === "division";

  return (
    <>
      <h1 className="app-title">
        <span className="emoji-deco">📐</span>{" "}
        {isDivision ? "Osztótábla" : "Szorzótábla"}{" "}
        <span className="emoji-deco">📐</span>
      </h1>

      <div className="table-type-switcher">
        <button
          className={`mode-btn${!isDivision ? " mode-btn--active mode-btn--multiplication" : ""}`}
          onClick={() => {
            setTableType("multiplication");
            setSelected(null);
          }}
        >
          ✖️ Szorzótábla
        </button>
        <button
          className={`mode-btn${isDivision ? " mode-btn--active mode-btn--division" : ""}`}
          onClick={() => {
            setTableType("division");
            setSelected(null);
          }}
        >
          ➗ Osztótábla
        </button>
      </div>

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
          📋 {isDivision ? "Osztók" : "Szorzók"} szerint
        </button>
      </div>

      {view === "grid" ? (
        <div className="card mult-table-card">
          <div className="mult-grid">
            <div className="mult-cell mult-cell--corner">
              {isDivision ? "÷" : "×"}
            </div>
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
      ) : isDivision ? (
        <div className="mult-grouped">
          {nums.map((divisor) => (
            <div key={divisor} className="card mult-group-card">
              <h3 className="mult-group-title">÷{divisor} osztótábla</h3>
              <div className="mult-group-rows">
                {nums.map((quotient) => (
                  <div key={quotient} className="mult-group-row">
                    <span className="mult-group-expr">
                      {divisor * quotient} ÷ {divisor}
                    </span>
                    <span className="mult-group-eq">=</span>
                    <span className="mult-group-result">{quotient}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
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

function ModeSelector({
  mode,
  onChange,
}: {
  mode: GameMode;
  onChange: (m: GameMode) => void;
}) {
  return (
    <div className="card mode-section">
      <div className="mode-buttons">
        <button
          className={`mode-btn${mode === "multiplication" ? " mode-btn--active mode-btn--multiplication" : ""}`}
          onClick={() => onChange("multiplication")}
        >
          ✖️ Szorzás
        </button>
        <button
          className={`mode-btn${mode === "division" ? " mode-btn--active mode-btn--division" : ""}`}
          onClick={() => onChange("division")}
        >
          ➗ Osztás
        </button>
        <button
          className={`mode-btn${mode === "mixed" ? " mode-btn--active mode-btn--mixed" : ""}`}
          onClick={() => onChange("mixed")}
        >
          🔀 Vegyes
        </button>
      </div>
    </div>
  );
}

const SUBTITLE: Record<GameMode, string> = {
  multiplication: "Mennyire megy a szorzás? 🤔",
  division: "Mennyire megy az osztás? 🤔",
  mixed: "Mennyire megy a matek? 🤔",
};

function WelcomeScreen({
  onStart,
  onShowTable,
}: {
  onStart: (playerName: string, mode: GameMode) => void;
  onShowTable: () => void;
}) {
  const [players, setPlayers] = useState<string[]>(getPlayers);
  const [current, setCurrent] = useState<string | null>(getCurrentPlayer);
  const [newName, setNewName] = useState("");
  const [showNameInput, setShowNameInput] = useState(!current);
  const [mode, setMode] = useState<GameMode>("multiplication");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() =>
    getLeaderboard(mode),
  );
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showNameInput && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [showNameInput]);

  useEffect(() => {
    setLeaderboard(getLeaderboard(mode));
  }, [mode]);

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
    if (current) onStart(current, mode);
  }, [current, mode, onStart]);

  return (
    <>
      <h1 className="app-title">
        <span className="emoji-deco">✨</span> Szorzótábla{" "}
        <span className="emoji-deco">✨</span>
      </h1>
      <p className="subtitle">{SUBTITLE[mode]}</p>

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

      <ModeSelector mode={mode} onChange={setMode} />

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
          📐 Táblázatok
        </button>
      </div>

      {leaderboard.length > 0 && (
        <div className="card leaderboard stagger-2">
          <h2 className="leaderboard-title">
            🏆 Ranglista — {MODE_LABELS[mode]}
          </h2>
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
  }, [state.currentIndex]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    const handleBlur = () => {
      setTimeout(() => {
        if (inputRef.current && document.hasFocus()) {
          inputRef.current.focus({ preventScroll: true });
        }
      }, 10);
    };
    el.addEventListener("blur", handleBlur);
    return () => el.removeEventListener("blur", handleBlur);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (state.shaking || correct) return;
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
    [inputVal, question.answer, onAnswer, state.shaking, correct],
  );

  const areaClass = [
    "equation-area",
    state.shaking ? "equation-area--shaking" : "",
    correct ? "equation-area--correct" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className="game-screen"
      onClick={() => inputRef.current?.focus({ preventScroll: true })}
    >
      <span className="timer">⏱ {formatTime(elapsed)}</span>
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
        </div>

        <div className={areaClass}>
          <div className="equation">
            {question.a}
            <span className="multiply"> {question.operator} </span>
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
            onChange={(e) => {
              if (!state.shaking && !correct) setInputVal(e.target.value);
            }}
            autoComplete="off"
          />
        </form>
      </div>
    </div>
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
  const [leaderboard] = useState<LeaderboardEntry[]>(() =>
    getLeaderboard(state.mode),
  );
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
        <div className="results-mode">{MODE_LABELS[state.mode]}</div>
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
        <h2 className="leaderboard-title">
          🏆 Ranglista — {MODE_LABELS[state.mode]}
        </h2>
        <Leaderboard entries={leaderboard} highlightEntry={resultEntry} />
      </div>
    </>
  );
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    screen: "welcome",
    currentPlayer: getCurrentPlayer(),
    mode: "multiplication",
    questions: [],
    currentIndex: 0,
    startTime: null,
    endTime: null,
    mistakes: 0,
    shaking: false,
  });

  const [rank, setRank] = useState<number | null>(null);
  const [resultEntry, setResultEntry] = useState<LeaderboardEntry | null>(null);

  const handleStart = useCallback((playerName: string, mode: GameMode) => {
    const questions = generateQuestions(mode);
    setGameState({
      screen: "game",
      currentPlayer: playerName,
      mode,
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
          const entryRank = addLeaderboardEntry(entry, prev.mode);
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
    handleStart(gameState.currentPlayer!, gameState.mode);
  }, [gameState.currentPlayer, gameState.mode, handleStart]);

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
      {gameState.screen === "table" && <TableScreen onBack={handleBack} />}
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
