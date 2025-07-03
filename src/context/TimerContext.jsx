import { createContext, useContext, useEffect, useState } from "react";

const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("routine-timer")) || {};
    if (saved.running && saved.startTime) {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - saved.startTime) / 1000);
      setElapsed(elapsedSeconds);
      setRunning(true);
      setActive(true);
    } else if (saved.pausedSeconds) {
      setElapsed(saved.pausedSeconds);
      setActive(true);
    }
  }, []);

  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [running]);

  const start = () => {
    setRunning(true);
    setActive(true);
    localStorage.setItem("routine-timer", JSON.stringify({
      startTime: Date.now(),
      running: true,
    }));
  };

  const pause = () => {
    setRunning(false);
    localStorage.setItem("routine-timer", JSON.stringify({
      pausedSeconds: elapsed,
      running: false,
    }));
  };

  const reset = () => {
    setRunning(false);
    setElapsed(0);
    setActive(false);
    localStorage.removeItem("routine-timer");
  };

  return (
    <TimerContext.Provider value={{ running, elapsed, active, start, pause, reset }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);
