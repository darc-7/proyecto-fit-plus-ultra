import { useLocation } from "react-router-dom";
import { useTimer } from "../context/TimerContext";

export default function FloatingTimer() {
  const { elapsed, active } = useTimer();
  const location = useLocation();

  // No mostrar si estamos en la página de rutina
  if (!active || location.pathname === "/routine") return null;

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
