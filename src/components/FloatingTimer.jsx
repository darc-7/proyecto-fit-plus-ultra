import { useLocation } from "react-router-dom";
import { useTimer } from "../context/TimerContext";
import { useAuth } from "../context/AuthContext";

export default function FloatingTimer() {
  const { user, userData } = useAuth();
  const { elapsed, active, reset } = useTimer();
  const location = useLocation();

  if (!user || !active || location.pathname === "/routine") return null;

  // Si la rutina ya se completó hoy, resetear y ocultar
  const today = new Date().toLocaleDateString("sv-SE");
  if (userData?.lastRoutineCompleted === today) {
    reset();
    return null;
  }

  const format = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  };

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg z-50 text-sm font-bold">
      ⏱ Tiempo: {format(elapsed)}
    </div>
  );
}