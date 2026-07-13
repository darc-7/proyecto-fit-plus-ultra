import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";

const TimerContext = createContext();

const getStorageKey = (uid) => `routine-timer-${uid || "anonymous"}`;

// Máximo 3 horas para una sesión; más que eso es una sesión abandonada
const MAX_SESSION_SECONDS = 3 * 60 * 60;

export const TimerProvider = ({ children }) => {
  const { user } = useAuth();
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [active, setActive] = useState(false);
  const elapsedRef = useRef(elapsed);
  const runningRef = useRef(running);
  const uid = user?.uid || "anonymous";
  const prevUidRef = useRef(uid);

  useEffect(() => {
    elapsedRef.current = elapsed;
    runningRef.current = running;
  });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(getStorageKey(uid))) || {};
    if (saved.running && saved.startTime) {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - saved.startTime) / 1000);

      // Auto-reset si la sesión lleva más de 3 horas (abandonada)
      if (elapsedSeconds > MAX_SESSION_SECONDS) {
        localStorage.removeItem(getStorageKey(uid));
        setElapsed(0);
        setRunning(false);
        setActive(false);
        return;
      }

      setElapsed(elapsedSeconds);
      setRunning(true);
      setActive(true);
    } else if (saved.pausedSeconds) {
      setElapsed(saved.pausedSeconds);
      setActive(true);
      setRunning(false);
    } else {
      setElapsed(0);
      setRunning(false);
      setActive(false);
    }
  }, [uid]);

  useEffect(() => {
    const prevUid = prevUidRef.current;
    if (prevUid !== uid) {
      const currentElapsed = elapsedRef.current;
      const wasRunning = runningRef.current;

      if (wasRunning) {
        localStorage.setItem(getStorageKey(prevUid), JSON.stringify({
          startTime: Date.now() - currentElapsed * 1000,
          running: true,
        }));
      } else {
        localStorage.setItem(getStorageKey(prevUid), JSON.stringify({
          pausedSeconds: currentElapsed,
          running: false,
        }));
      }

      prevUidRef.current = uid;
    }
  });

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
    localStorage.setItem(getStorageKey(uid), JSON.stringify({
      startTime: Date.now(),
      running: true,
    }));
  };

  const pause = () => {
    setRunning(false);
    localStorage.setItem(getStorageKey(uid), JSON.stringify({
      pausedSeconds: elapsed,
      running: false,
    }));
  };

  const reset = () => {
    setRunning(false);
    setElapsed(0);
    setActive(false);
    localStorage.removeItem(getStorageKey(uid));
  };

  return (
    <TimerContext.Provider value={{ running, elapsed, active, start, pause, reset }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);