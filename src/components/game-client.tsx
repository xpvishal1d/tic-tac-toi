"use client";

import { useEffect, useRef, useState } from "react";

type GameResult = "win" | "loss" | "draw";
type CellValue = "X" | "O" | null;

type HistoryItem = {
  id: number;
  result: GameResult;
  playerSymbol: "X" | "O";
  finalBoard: CellValue[];
  createdAt: string;
};

type GameClientProps = {
  playerName: string;
};

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function getWinner(board: CellValue[]) {
  for (const [a, b, c] of winningLines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}

function getResultFromBoard(board: CellValue[]): GameResult | null {
  const winner = getWinner(board);

  if (winner === "X") {
    return "win";
  }

  if (winner === "O") {
    return "loss";
  }

  if (board.every(Boolean)) {
    return "draw";
  }

  return null;
}

function formatResult(result: GameResult) {
  if (result === "win") return "Victory";
  if (result === "loss") return "Defeat";
  return "Draw";
}

export function GameClient({ playerName }: GameClientProps) {
  const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null));
  const [status, setStatus] = useState("Your turn. You are X.");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const pendingSaveRef = useRef(false);
  const computerMoveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      const response = await fetch("/api/games", {
        cache: "no-store",
        credentials: "include",
      });

      if (!response.ok || cancelled) {
        setIsLoadingHistory(false);
        return;
      }

      const data = (await response.json()) as { games: HistoryItem[] };

      if (!cancelled) {
        setHistory(data.games);
        setIsLoadingHistory(false);
      }
    }

    void loadHistory();

    return () => {
      cancelled = true;
      if (computerMoveTimeoutRef.current) {
        window.clearTimeout(computerMoveTimeoutRef.current);
      }
    };
  }, []);

  async function persistGame(finalBoard: CellValue[], result: GameResult) {
    if (pendingSaveRef.current) {
      return;
    }

    pendingSaveRef.current = true;
    setIsSaving(true);
    setFeedback("");

    const response = await fetch("/api/games", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        result,
        playerSymbol: "X",
        finalBoard,
      }),
    });

    const data = (await response.json().catch(() => null)) as
      | { game?: HistoryItem; message?: string }
      | null;

    if (!response.ok) {
      setFeedback(data?.message ?? "Could not save this game.");
      setIsSaving(false);
      pendingSaveRef.current = false;
      return;
    }

    if (data?.game) {
      setHistory((current) => [data.game!, ...current]);
    }

    setFeedback("Game saved to your history.");
    setIsSaving(false);
  }

  function finishRound(finalBoard: CellValue[]) {
    const result = getResultFromBoard(finalBoard);

    if (!result) {
      return;
    }

    setStatus(
      result === "win"
        ? "You won this round."
        : result === "loss"
          ? "Computer won this round."
          : "Round ended in a draw.",
    );

    void persistGame(finalBoard, result);
  }

  function playComputerTurn(currentBoard: CellValue[]) {
    setIsComputerThinking(false);

    const availableMoves = currentBoard
      .map((value, index) => ({ value, index }))
      .filter((item) => item.value === null);

    if (availableMoves.length === 0) {
      finishRound(currentBoard);
      return;
    }

    const randomMove =
      availableMoves[Math.floor(Math.random() * availableMoves.length)]?.index;

    if (randomMove === undefined) {
      return;
    }

    const nextBoard = [...currentBoard];
    nextBoard[randomMove] = "O";
    setBoard(nextBoard);

    const result = getResultFromBoard(nextBoard);

    if (result) {
      finishRound(nextBoard);
    } else {
      setStatus("Your turn. Plan the next move.");
    }
  }

  function handleSquareClick(index: number) {
    if (board[index] || getResultFromBoard(board) || isSaving || isComputerThinking) {
      return;
    }

    const nextBoard = [...board];
    nextBoard[index] = "X";
    setBoard(nextBoard);

    const result = getResultFromBoard(nextBoard);

    if (result) {
      finishRound(nextBoard);
      return;
    }

    setStatus("Computer is thinking...");
    setIsComputerThinking(true);
    computerMoveTimeoutRef.current = window.setTimeout(() => playComputerTurn(nextBoard), 450);
  }

  function resetBoard() {
    if (computerMoveTimeoutRef.current) {
      window.clearTimeout(computerMoveTimeoutRef.current);
      computerMoveTimeoutRef.current = null;
    }

    pendingSaveRef.current = false;
    setBoard(Array(9).fill(null));
    setStatus("Your turn. You are X.");
    setFeedback("");
    setIsSaving(false);
    setIsComputerThinking(false);
  }

  const wins = history.filter((item) => item.result === "win").length;
  const losses = history.filter((item) => item.result === "loss").length;
  const draws = history.filter((item) => item.result === "draw").length;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="rounded-[2rem] border border-white/60 bg-white/78 p-6 shadow-panel backdrop-blur md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cerulean">
              Match board
            </p>
            <h1 className="mt-3 font-heading text-4xl font-bold text-deep-space-blue">
              Welcome back, {playerName}
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-deep-space-blue/72">
              Beat the computer, save each result automatically, and build your record over time.
            </p>
          </div>
          <button
            type="button"
            onClick={resetBoard}
            className="rounded-full border border-deep-space-blue/15 bg-white px-4 py-2 text-sm font-semibold text-deep-space-blue transition hover:border-cerulean hover:text-cerulean"
          >
            New round
          </button>
        </div>

        <div className="mt-8 grid max-w-[28rem] grid-cols-3 gap-3">
          {board.map((cell, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSquareClick(index)}
              className="aspect-square rounded-[1.6rem] border border-deep-space-blue/10 bg-alabaster/45 text-5xl font-bold text-deep-space-blue transition hover:border-cerulean hover:bg-frosted-blue/35 disabled:cursor-not-allowed"
            >
              {cell}
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div className="rounded-full bg-frosted-blue/60 px-4 py-2 text-sm font-semibold text-deep-space-blue">
            {status}
          </div>
          {isSaving ? (
            <div className="rounded-full bg-cerulean px-4 py-2 text-sm font-semibold text-white">
              Saving result...
            </div>
          ) : null}
          {feedback ? (
            <div className="rounded-full bg-deep-space-blue px-4 py-2 text-sm font-semibold text-white">
              {feedback}
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {[
            { label: "Wins", value: wins, accent: "bg-deep-space-blue text-white" },
            { label: "Losses", value: losses, accent: "bg-cerulean text-white" },
            { label: "Draws", value: draws, accent: "bg-frosted-blue-2 text-deep-space-blue" },
          ].map((item) => (
            <article
              key={item.label}
              className="rounded-[1.7rem] border border-white/60 bg-white/78 p-5 shadow-panel backdrop-blur"
            >
              <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${item.accent}`}>
                {item.label}
              </div>
              <p className="mt-4 font-heading text-4xl font-bold text-deep-space-blue">{item.value}</p>
            </article>
          ))}
        </div>

        <article className="rounded-[1.9rem] border border-white/60 bg-white/78 p-6 shadow-panel backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-2xl font-bold text-deep-space-blue">Recent history</h2>
            {isLoadingHistory ? (
              <span className="text-sm text-deep-space-blue/60">Loading...</span>
            ) : null}
          </div>

          <div className="mt-5 space-y-3">
            {history.length === 0 && !isLoadingHistory ? (
              <p className="rounded-2xl bg-alabaster/55 px-4 py-5 text-sm text-deep-space-blue/72">
                No saved games yet. Finish a round to create your first stat line.
              </p>
            ) : null}

            {history.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-deep-space-blue/8 bg-alabaster/35 px-4 py-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-deep-space-blue">{formatResult(item.result)}</p>
                  <p className="text-sm text-deep-space-blue/60">
                    {new Intl.DateTimeFormat("en", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(item.createdAt))}
                  </p>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {item.finalBoard.map((cell, cellIndex) => (
                    <div
                      key={`${item.id}-${cellIndex}`}
                      className="grid aspect-square place-items-center rounded-xl bg-white text-lg font-bold text-deep-space-blue"
                    >
                      {cell}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
