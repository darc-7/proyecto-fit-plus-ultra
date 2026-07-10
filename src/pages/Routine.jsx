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

const arraysEqual = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
};

const Routine = () => {
  const { user, userData } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [routineIds, setRoutineIds] = useState([]);
  const [routineFinished, setRoutineFinished] = useState(false);
  const [confirmingStop, setConfirmingStop] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [resting, setResting] = useState(false);
  const { elapsed, active, start, reset } = useTimer();

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(collection(db, "exercises"), (snapshot) => {
      const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExercises(all);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!userData) return;
    const { currentRoutine = [], lastRoutineCompleted = "" } = userData;
    const today = getTodayDate();
    if (lastRoutineCompleted === today) {
      setRoutineFinished(true);
      localStorage.removeItem(`routine-progress-${user?.uid}`);
      return;
    }

    setRoutineIds(currentRoutine);
    setRoutineFinished(false);
    setConfirmingStop(false);

    const saved = JSON.parse(localStorage.getItem(`routine-progress-${user?.uid}`) || "{}");
    if (saved.date === today && arraysEqual(saved.routineIds, currentRoutine)) {
      setCurrentStep(saved.currentStep || 0);
      setCompletedSteps(saved.completedSteps || []);
      setResting(saved.resting || false);
    } else {
      setCurrentStep(0);
      setCompletedSteps([]);
      setResting(false);
    }
  }, [userData, user?.uid]);

  useEffect(() => {
    if (routineIds.length > 0) {
      localStorage.setItem(`routine-progress-${user?.uid}`, JSON.stringify({
        date: getTodayDate(),
        routineIds,
        currentStep,
        completedSteps,
        resting,
      }));
    }
  }, [currentStep, completedSteps, resting, routineIds, user?.uid]);

  const routineExercises = exercises.filter(e => routineIds.includes(e.id));
  const totalPoints = routineExercises.reduce((sum, e) => sum + (e.points || 0), 0);
  const minimumTime = 45 * 60;
  const hasTrainer = !!userData?.trainerId;

  const skipRest = () => {
    setResting(false);
  };

  const handleStart = () => {
    if (routineExercises.length < 3) {
      toast.error("Selecciona al menos 3 ejercicios para comenzar la rutina.");
      return;
    }
    start();
  };

  const completeCurrentExercise = () => {
    if (!active) {
      toast("Inicia el cronómetro antes de comenzar a entrenar.", { icon: "⏱️" });
      return;
    }

    const newCompleted = [...completedSteps, currentStep];
    setCompletedSteps(newCompleted);

    if (currentStep + 1 >= routineExercises.length) {
      setCurrentStep(routineExercises.length);
      return;
    }

    setCurrentStep(currentStep + 1);
    setResting(true);
  };

  const handleStop = async () => {
    if (!user || routineIds.length === 0 || routineExercises.length === 0) return;

    if (!confirmingStop) {
      setConfirmingStop(true);
      return;
    }

    reset();
    setRoutineFinished(false);
    setConfirmingStop(false);
    setCurrentStep(0);
    setCompletedSteps([]);
    setResting(false);
    localStorage.removeItem(`routine-progress-${user?.uid}`);

    toast("Rutina detenida. No se han otorgado puntos.", { icon: "⏹️" });
  };

  const completeRoutine = async () => {
    if (!user || routineExercises.length === 0 || !active) return;

    if (!hasTrainer && elapsed < minimumTime) {
      toast("Aún no ha pasado el tiempo mínimo necesario. Entrena al menos 45 minutos para obtener tus recompensas.", {
        icon: "⏳",
        duration: 5000
      });
      return;
    }

    const userRef = doc(db, "users", user.uid);

    if (hasTrainer) {
      await updateDoc(userRef, {
        pendingVerification: {
          routineIds,
          exerciseNames: routineExercises.map(e => e.name),
          completedSteps: completedSteps.length,
          totalPoints,
          elapsed,
          timestamp: new Date().toISOString(),
        }
      });
      reset();
      setConfirmingStop(false);
      setCurrentStep(0);
      setCompletedSteps([]);
      setResting(false);
      localStorage.removeItem(`routine-progress-${user?.uid}`);
      toast.success("Rutina enviada para verificación. Espera la confirmación de tu entrenador.");
      return;
    }

    const userSnap = await getDoc(userRef);
    const data = userSnap.data();
    const today = getTodayDate();
    const points = totalPoints;

    const updatedStreakData = upStreak(data, today);
    const updatedTotalPoints = (data.totalPoints || 0) + points;
    const updatedCompleted = (data.completedRoutines || 0) + 1;

    const newBadges = checkAchieve({
      ...data,
      totalPoints: updatedTotalPoints,
      streak: updatedStreakData.streak,
      completedRoutines: updatedCompleted,
      unlockedRewards: data.unlockedRewards || [],
      badges: data.badges || []
    });

    await updateDoc(userRef, {
      lastRoutineCompleted: today,
      ...(updatedStreakData.streak !== undefined && { streak: updatedStreakData.streak }),
      ...(updatedStreakData.streakProtectors !== undefined && { streakProtectors: updatedStreakData.streakProtectors }),
      ...(updatedStreakData.protectedDates !== undefined && { protectedDates: updatedStreakData.protectedDates }),
      currentRoutine: [],
      totalPoints: updatedTotalPoints,
      completedRoutines: updatedCompleted,
      ...(newBadges.length > 0 && { badges: arrayUnion(...newBadges) })
    });

    reset();
    setRoutineIds([]);
    setRoutineFinished(true);
    setConfirmingStop(false);
    setCurrentStep(0);
    setCompletedSteps([]);
    setResting(false);
    localStorage.removeItem(`routine-progress-${user?.uid}`);

    toast.success(`¡Rutina completada! Ganaste ${points} puntos.`);

    if (newBadges.length > 0) {
      newBadges.forEach(badge => {
        toast.success(`🏅 Nuevo logro: ${badge}!`, { duration: 6000 });
      });
    }
  };

  const formattedTime = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-2">Tu rutina</h1>

      {routineExercises.length === 0 && !routineFinished && !userData?.pendingVerification && (
        <div className="text-center mt-10 space-y-4">
          <p className="text-gray-600">
            Parece que no has armado tu rutina. Comienza a agregar ejercicios desde la sección de Ejercicios.
          </p>
        </div>
      )}

      {routineFinished && (
        <div className="text-center mt-10 space-y-4">
          <p className="text-green-600 font-semibold text-lg">
            ✅ ¡Felicidades! Has completado tu rutina del día.
          </p>
        </div>
      )}

      {userData?.pendingVerification && !routineFinished && (
        <div className="text-center py-10 space-y-4">
          <p className="text-lg font-semibold text-yellow-600">⏳ En espera de verificación</p>
          <p className="text-gray-600">
            Tu entrenador está revisando tu rutina. Recibirás los puntos una vez que sea aprobada.
          </p>
        </div>
      )}

      {routineExercises.length > 0 && !routineFinished && !userData?.pendingVerification && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-800">
            💡 Completa cada ejercicio uno por uno. El cronómetro registra tu tiempo total.
            Al completar todos los ejercicios recibirás <strong>{totalPoints} puntos</strong>.
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">
              Ejercicio {Math.min(currentStep + 1, routineExercises.length)} de {routineExercises.length}
            </span>
            <span className="text-sm font-semibold text-yellow-600">
              ⭐ {totalPoints} puntos estimados
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedSteps.length / routineExercises.length) * 100}%` }}
            />
          </div>

          {currentStep < routineExercises.length && (
            <div className="mb-4">
              <ExerciseCard
                key={routineExercises[currentStep].id}
                exercise={routineExercises[currentStep]}
                selected
                disabled
              />

              {!active && (
                <p className="text-sm text-gray-400 text-center mt-2">
                  Presiona ▶ Iniciar para habilitar los botones de ejercicio
                </p>
              )}

              <button
                onClick={completeCurrentExercise}
                disabled={resting || !active}
                className={`mt-3 w-full py-3 font-bold rounded-lg transition-colors ${
                  resting || !active
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                ✅ Completar ejercicio
              </button>
            </div>
          )}

          {resting && (
            <div className="text-center py-4 bg-gray-50 rounded-lg mb-4">
              <p className="text-lg font-medium text-gray-700">😮‍💨 Tómate un descanso</p>
              <p className="text-sm text-gray-500 mt-1">El cronómetro sigue corriendo</p>
              <button
                onClick={skipRest}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Saltar descanso →
              </button>
            </div>
          )}

          {currentStep >= routineExercises.length && (
            <div className="text-center py-6">
              <p className="text-lg font-semibold text-gray-700 mb-3">
                ¡Completaste todos los ejercicios!
              </p>
              <button
                onClick={completeRoutine}
                disabled={!active}
                className={`px-8 py-3 font-bold rounded-lg transition-colors ${
                  !active
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {hasTrainer ? '📤 Enviar para verificación' : `🏆 Completar rutina (${totalPoints} pts)`}
              </button>
            </div>
          )}

          <div className="flex flex-col items-center gap-4 mt-6 border-t pt-4">
            <div className="text-2xl font-mono">{formattedTime}</div>
            <div className="flex gap-4">
              {!active ? (
                <button
                  onClick={handleStart}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md"
                >
                  ▶ Iniciar
                </button>
              ) : (
                <div className="text-sm text-gray-500 text-center">
                  El cronómetro está corriendo
                </div>
              )}

              {!confirmingStop ? (
                <button
                  onClick={handleStop}
                  className="px-4 py-2 bg-red-500 text-white rounded-md"
                >
                  ⏹ Detener
                </button>
              ) : (
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-red-600 font-medium">¿Detener? No obtendrás puntos.</span>
                  <button
                    onClick={handleStop}
                    className="px-3 py-2 bg-red-600 text-white rounded-md text-sm font-bold"
                  >
                    Sí, detener
                  </button>
                  <button
                    onClick={() => setConfirmingStop(false)}
                    className="px-3 py-2 bg-gray-300 text-gray-700 rounded-md text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Routine;