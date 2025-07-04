import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { collection, doc, getDoc, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../services/firebase";
import ExerciseCard from "../components/ExerciseCard";
import { upStreak } from "../utils/streakUtils";
import { checkAchieve } from "../utils/achievements";
import toast from "react-hot-toast";
import { useTimer } from "../context/TimerContext";

const getTodayDate = () => new Date().toLocaleDateString("sv-SE");

const Routine = () => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [routineIds, setRoutineIds] = useState([]);
  const [routineFinished, setRoutineFinished] = useState(false);
  const { elapsed, running, start, pause, reset } = useTimer();

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(collection(db, "exercises"), async (snapshot) => {
      const allExercises = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExercises(allExercises);

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const { currentRoutine = [], lastRoutineCompleted = "" } = userDoc.data();
      const today = getTodayDate();

      if (lastRoutineCompleted === today) setRoutineFinished(true);
      else setRoutineIds(currentRoutine);
    });

    return () => unsubscribe();
  }, [user]);

  //Temporizador y finalizacion de rutina
  const handleStop = async () => {
    if (!user || routineIds.length === 0) return;

    const tiempoMinimo = routineIds.length * 0.5 * 60;

    if (elapsed < tiempoMinimo) {
      toast("Aún no es momento de finalizar tu rutina. Sigue entrenando para obtener tus puntos 💪", {
        icon: "⏳",
        duration: 5000
      });
      return;
    }

    const confirm = window.confirm("¿Deseas finalizar la rutina de hoy?");
    if (!confirm) return;
    
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
    //Actualizar puntos
    const today = getTodayDate();
    const completedExercises = exercises.filter(e => routineIds.includes(e.id));
    const points = completedExercises.reduce((sum, e) => sum + (e.points || 0), 0);
    
    const updatedStreakData = upStreak(userData, today);
    const updatedTotalPoints = (userData.totalPoints || 0) + points;
    const updatedCompleted = (userData.completedRoutines || 0) + 1;
    
    const newBadges = checkAchieve({
      ...userData,
      totalPoints: updatedTotalPoints,
      streak: updatedStreakData.streak,
      completedRoutines: updatedCompleted,
      unlockedRewards: userData.unlockedRewards || [],
      badges: userData.badges || []
    });
    //Actualizar racha y logros
    await updateDoc(userRef, {
      ...updatedStreakData,
      currentRoutine: [],
      totalPoints: updatedTotalPoints,
      completedRoutines: updatedCompleted,
      ...(newBadges.length > 0 && { badges: arrayUnion(...newBadges) })
    });

    setRoutineIds([]);
    setRoutineFinished(true);
    reset();
    toast.success("¡Rutina completada con éxito!");
  };

  const formattedTime = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`;
  const routineExercises = exercises.filter(e => routineIds.includes(e.id));

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-center mb-4">Tu rutina</h1>

      {routineFinished && (
        <p className="text-center text-green-600 font-semibold mb-4">
          ✅ ¡Felicidades! Has completado tu rutina del día.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {routineExercises.map(e => (
          <ExerciseCard key={e.id} exercise={e} selected disabled />
        ))}
      </div>

      {routineExercises.length > 0 && !routineFinished && (
        <div className="flex flex-col items-center gap-4 mt-6">
          <div className="text-2xl font-mono">{formattedTime}</div>
          <div className="flex gap-4">
            <button
              onClick={() => (running ? pause() : start())}
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              {running ? "Pausar" : "Reanudar"}
            </button>
            <button
              onClick={handleStop}
              className="px-4 py-2 bg-red-500 text-white rounded-md"
            >
              Detener
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Routine;