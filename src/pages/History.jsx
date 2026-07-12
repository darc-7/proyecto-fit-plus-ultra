import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

const formatTime = (s) => {
  if (!s && s !== 0) return "-";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
};

const groupByMonth = (workouts) => {
  const groups = {};
  workouts.forEach(w => {
    const month = w.date?.slice(0, 7);
    if (!month) return;
    if (!groups[month]) groups[month] = [];
    groups[month].push(w);
  });
  return groups;
};

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

export default function History() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Sin orderBy — ordenamos en JS para evitar dependencias de índices
    const q = collection(db, "users", user.uid, "workoutHistory");

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setWorkouts(data);
      setLoading(false);
    }, (error) => {
      console.error("Error al cargar historial:", error);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 animate-pulse font-medium">Cargando historial...</p>
      </div>
    );
  }

  const groups = groupByMonth(workouts);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Historial de Rutinas</h1>

      {workouts.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">Aún no has completado ninguna rutina.</p>
        </div>
      )}

      {Object.entries(groups).map(([monthKey, items]) => {
        const [y, m] = monthKey.split("-").map(Number);
        const label = `${MONTHS[m - 1]} ${y}`;
        return (
          <div key={monthKey} className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-3 border-b pb-1">{label}</h2>
            <div className="space-y-3">
              {items.map((w) => {
                const isOpen = expanded === w.id;
                return (
                  <div key={w.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => setExpanded(isOpen ? null : w.id)}
                      className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{w.date}</p>
                        <p className="text-sm text-gray-500">
                          {w.totalPoints} pts · {formatTime(w.elapsed)} · {w.exercises?.length || 0} ejercicios
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {w.approvedByTrainer && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Verificado</span>
                        )}
                        <span className="text-gray-400">{isOpen ? "▲" : "▼"}</span>
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                          <div><span className="text-gray-500">Series totales:</span> <span className="font-medium">{w.exercises?.reduce((s, e) => s + (e.sets || 0), 0) || 0}</span></div>
                          <div><span className="text-gray-500">Reps totales:</span> <span className="font-medium">{w.exercises?.reduce((s, e) => s + ((e.sets || 0) * (e.reps || 0)), 0) || 0}</span></div>
                          <div><span className="text-gray-500">Ejercicios completados:</span> <span className="font-medium">{w.completedSteps || w.exercises?.length || 0}</span></div>
                          <div><span className="text-gray-500">Tiempo:</span> <span className="font-medium">{formatTime(w.elapsed)}</span></div>
                        </div>
                        <div className="mt-3 space-y-1">
                          <p className="text-xs font-semibold text-gray-500 uppercase">Ejercicios</p>
                          <ul className="divide-y divide-gray-100">
                            {w.exercises?.map((e, i) => (
                              <li key={e.id || i} className="flex items-center justify-between py-1.5 text-sm">
                                <span className="text-gray-800">{e.name}</span>
                                <span className="text-gray-500">{e.sets}×{e.reps}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}