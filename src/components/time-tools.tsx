"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Tab = "timer" | "stopwatch";

function formatTimerDisplay(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours)}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatStopwatchDisplay(ms: number) {
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  const centiseconds = Math.floor((ms % 1000) / 10);

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
}

function parseDuration(hours: number, minutes: number, seconds: number) {
  return (hours * 3600 + minutes * 60 + seconds) * 1000;
}

export function TimeTools() {
  const [tab, setTab] = useState<Tab>("timer");

  return (
    <div className="mx-auto max-w-2xl px-6 pb-14 pt-2">
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cerulean">No login needed</p>
        <h1 className="mt-3 font-heading text-4xl font-bold text-deep-space-blue md:text-5xl">
          Timer &amp; Stopwatch
        </h1>
        <p className="mt-3 text-base leading-7 text-deep-space-blue/72">
          Count down or track elapsed time — works instantly in your browser.
        </p>
      </div>

      <div className="rounded-[2rem] border border-white/60 bg-white/78 p-6 shadow-panel backdrop-blur md:p-8">
        <div
          role="tablist"
          aria-label="Timer or stopwatch"
          className="mb-8 grid grid-cols-2 gap-2 rounded-2xl border border-deep-space-blue/10 bg-frosted-blue/20 p-1"
        >
          {(
            [
              ["timer", "Timer"],
              ["stopwatch", "Stopwatch"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                tab === id
                  ? "bg-deep-space-blue text-white shadow-panel"
                  : "text-deep-space-blue/72 hover:text-deep-space-blue"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "timer" ? <TimerPanel /> : <StopwatchPanel />}
      </div>
    </div>
  );
}

function TimerPanel() {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [remainingMs, setRemainingMs] = useState(() => parseDuration(0, 5, 0));
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const endAtRef = useRef<number | null>(null);

  const resetToInputs = useCallback(() => {
    const duration = parseDuration(hours, minutes, seconds);
    setRemainingMs(duration);
    setIsFinished(false);
    endAtRef.current = null;
  }, [hours, minutes, seconds]);

  useEffect(() => {
    if (!isRunning && !isFinished) {
      setRemainingMs(parseDuration(hours, minutes, seconds));
    }
  }, [hours, minutes, seconds, isRunning, isFinished]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const tick = () => {
      if (endAtRef.current === null) {
        return;
      }

      const left = endAtRef.current - Date.now();
      if (left <= 0) {
        setRemainingMs(0);
        setIsRunning(false);
        setIsFinished(true);
        endAtRef.current = null;
        return;
      }

      setRemainingMs(left);
    };

    tick();
    const intervalId = window.setInterval(tick, 100);
    return () => window.clearInterval(intervalId);
  }, [isRunning]);

  function handleStart() {
    if (isRunning) {
      return;
    }

    const startFrom =
      isFinished || remainingMs <= 0 ? parseDuration(hours, minutes, seconds) : remainingMs;

    if (startFrom <= 0) {
      return;
    }

    endAtRef.current = Date.now() + startFrom;
    setRemainingMs(startFrom);
    setIsFinished(false);
    setIsRunning(true);
  }

  function handlePause() {
    if (!isRunning || endAtRef.current === null) {
      return;
    }

    setRemainingMs(Math.max(0, endAtRef.current - Date.now()));
    endAtRef.current = null;
    setIsRunning(false);
  }

  function handleReset() {
    setIsRunning(false);
    setIsFinished(false);
    endAtRef.current = null;
    resetToInputs();
  }

  const canStart = !isRunning && (remainingMs > 0 || parseDuration(hours, minutes, seconds) > 0);

  return (
    <div role="tabpanel" className="space-y-8">
      <p
        className={`text-center font-heading text-6xl font-bold tracking-tight md:text-7xl ${
          isFinished ? "text-cerulean" : "text-deep-space-blue"
        }`}
        aria-live="polite"
      >
        {isFinished ? "Time's up!" : formatTimerDisplay(remainingMs)}
      </p>

      {!isRunning && !isFinished ? (
        <div className="grid grid-cols-3 gap-3">
          <label className="block text-center">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-deep-space-blue/60">
              Hours
            </span>
            <input
              type="number"
              min={0}
              max={99}
              value={hours}
              onChange={(event) => setHours(Math.max(0, Number(event.target.value) || 0))}
              className="w-full rounded-2xl border border-deep-space-blue/12 bg-white px-3 py-3 text-center text-lg font-semibold text-deep-space-blue outline-none focus:border-cerulean"
            />
          </label>
          <label className="block text-center">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-deep-space-blue/60">
              Minutes
            </span>
            <input
              type="number"
              min={0}
              max={59}
              value={minutes}
              onChange={(event) => setMinutes(Math.min(59, Math.max(0, Number(event.target.value) || 0)))}
              className="w-full rounded-2xl border border-deep-space-blue/12 bg-white px-3 py-3 text-center text-lg font-semibold text-deep-space-blue outline-none focus:border-cerulean"
            />
          </label>
          <label className="block text-center">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-deep-space-blue/60">
              Seconds
            </span>
            <input
              type="number"
              min={0}
              max={59}
              value={seconds}
              onChange={(event) => setSeconds(Math.min(59, Math.max(0, Number(event.target.value) || 0)))}
              className="w-full rounded-2xl border border-deep-space-blue/12 bg-white px-3 py-3 text-center text-lg font-semibold text-deep-space-blue outline-none focus:border-cerulean"
            />
          </label>
        </div>
      ) : null}

      <div className="flex flex-wrap justify-center gap-3">
        {isRunning ? (
          <button
            type="button"
            onClick={handlePause}
            className="rounded-2xl bg-deep-space-blue px-6 py-3 text-sm font-semibold text-white transition hover:bg-cerulean"
          >
            Pause
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStart}
            disabled={!canStart && !isFinished}
            className="rounded-2xl bg-deep-space-blue px-6 py-3 text-sm font-semibold text-white transition hover:bg-cerulean disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isFinished ? "Restart" : "Start"}
          </button>
        )}
        <button
          type="button"
          onClick={handleReset}
          className="rounded-2xl border border-deep-space-blue/12 bg-white px-6 py-3 text-sm font-semibold text-deep-space-blue transition hover:border-cerulean hover:text-cerulean"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function StopwatchPanel() {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const startedAtRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const tick = () => {
      if (startedAtRef.current === null) {
        return;
      }

      setElapsedMs(accumulatedRef.current + (Date.now() - startedAtRef.current));
    };

    tick();
    const intervalId = window.setInterval(tick, 50);
    return () => window.clearInterval(intervalId);
  }, [isRunning]);

  function handleStart() {
    if (isRunning) {
      return;
    }

    startedAtRef.current = Date.now();
    setIsRunning(true);
  }

  function handlePause() {
    if (!isRunning || startedAtRef.current === null) {
      return;
    }

    accumulatedRef.current += Date.now() - startedAtRef.current;
    startedAtRef.current = null;
    setElapsedMs(accumulatedRef.current);
    setIsRunning(false);
  }

  function handleReset() {
    setIsRunning(false);
    setElapsedMs(0);
    setLaps([]);
    startedAtRef.current = null;
    accumulatedRef.current = 0;
  }

  function handleLap() {
    if (!isRunning) {
      return;
    }

    setLaps((current) => [elapsedMs, ...current]);
  }

  return (
    <div role="tabpanel" className="space-y-8">
      <p
        className="text-center font-heading text-6xl font-bold tracking-tight text-deep-space-blue md:text-7xl"
        aria-live="polite"
      >
        {formatStopwatchDisplay(elapsedMs)}
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        {isRunning ? (
          <button
            type="button"
            onClick={handlePause}
            className="rounded-2xl bg-deep-space-blue px-6 py-3 text-sm font-semibold text-white transition hover:bg-cerulean"
          >
            Pause
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStart}
            className="rounded-2xl bg-deep-space-blue px-6 py-3 text-sm font-semibold text-white transition hover:bg-cerulean"
          >
            Start
          </button>
        )}
        <button
          type="button"
          onClick={handleLap}
          disabled={!isRunning}
          className="rounded-2xl border border-deep-space-blue/12 bg-white px-6 py-3 text-sm font-semibold text-deep-space-blue transition hover:border-cerulean hover:text-cerulean disabled:cursor-not-allowed disabled:opacity-50"
        >
          Lap
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-2xl border border-deep-space-blue/12 bg-white px-6 py-3 text-sm font-semibold text-deep-space-blue transition hover:border-cerulean hover:text-cerulean"
        >
          Reset
        </button>
      </div>

      {laps.length > 0 ? (
        <div className="rounded-2xl border border-deep-space-blue/10 bg-frosted-blue/15 p-4">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cerulean">Laps</p>
          <ul className="max-h-48 space-y-2 overflow-y-auto">
            {laps.map((lap, index) => (
              <li
                key={`${lap}-${index}`}
                className="flex items-center justify-between rounded-xl bg-white/80 px-4 py-2 text-sm font-semibold text-deep-space-blue"
              >
                <span>Lap {laps.length - index}</span>
                <span className="font-mono">{formatStopwatchDisplay(lap)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
