import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { collection, doc, getDoc, onSnapshot, updateDoc, arrayUnion, addDoc } from "firebase/firestore";
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
  const [routineConfig, setRoutineConfig] = useState({});
  const [configDone, setConfigDone] = useState(false);
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
      localStorage.removeItem(`routine-config-${user?.uid}`);
      return;
    }

    setRoutineIds(currentRoutine);
    setRoutineFinished(false);
    setConfirmingStop(false);

    const savedProgress = JSON.parse(localStorage.getItem(`routine-progress-${user?.uid}`) || "{}");
    if (savedProgress.date === today && arraysEqual(savedProgress.routineIds, currentRoutine)) {
      setCurrentStep(savedProgress.currentStep || 0);
      setCompletedSteps(savedProgress.completedSteps || []);
      setResting(savedProgress.resting || false);
    } else {
      setCurrentStep(0);
      setCompletedSteps([]);
      setResting(false);
    }

    const savedConfig = JSON.parse(localStorage.getItem(`routine-config-${user?.uid}`) || "{}");
    if (savedConfig.date === today && arraysEqual(savedConfig.routineIds, currentRoutine)) {
      setRoutineConfig(savedConfig.config || {});
      setConfigDone(savedConfig.configDone || false);
    } else {
      setRoutineConfig({});
      setConfigDone(false);
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

  useEffect(() => {
    if (routineIds.length > 0) {
      localStorage.setItem(`routine-config-${user?.uid}`, JSON.stringify({
        date: getTodayDate(),
        routineIds,
        config: routineConfig,
        configDone,
      }));
    }
  }, [routineConfig, configDone, routineIds, user?.uid]);

  const routineExercises = exercises.filter(e => routineIds.includes(e.id));
  const totalPoints = routineExercises.reduce((sum, e) => sum + (e.points || 0), 0);
  const minimumTime = 45 * 60;
  const hasTrainer = !!userData?.trainerId;

  const getDefaults = () => {
    const defaults = {};
    routineExercises.forEach(e => {
      defaults[e.id] = { sets: 3, reps: 10 };
    });
    return defaults;
  };

  const handleSetConfig = (id, field, value) => {
    setRoutineConfig(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleConfirmConfig = () => {
    if (routineExercises.length < 3) {
      toast.error("Selecciona al menos 3 ejercicios para comenzar la rutina.");
      return;
    }
    if (!window.confirm("¿Estás seguro con la configuración de series y repeticiones?")) return;
    setConfigDone(true);
  };

  const handleStart = () => {
    if (routineExercises.length < 3) {
      toast.error("Selecciona al menos 3 ejercicios para comenzar la rutina.");
      return;
    }
    start();
  };

  const skipRest = () => {
    setResting(false);
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
    setConfigDone(false);
    setRoutineConfig({});
    localStorage.removeItem(`routine-progress-${user?.uid}`);
    localStorage.removeItem(`routine-config-${user?.uid}`);

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

    // ── Cliente con entrenador: enviar para verificación ──
    if (hasTrainer) {
      await updateDoc(userRef, {
        pendingVerification: {
          exercises: routineExercises.map(e => ({
            id: e.id,
            name: e.name,
            category: e.category,
            level: e.level,
            points: e.points || 0,
            sets: routineConfig[e.id]?.sets || 3,
            reps: routineConfig[e.id]?.reps || 10,
          })),
          totalPoints,
          elapsed,
          completedSteps: completedSteps.length,
          timestamp: new Date().toISOString(),
        }
      });
      reset();
      setConfirmingStop(false);
      setCurrentStep(0);
      setCompletedSteps([]);
      setResting(false);
      setConfigDone(false);
      setRoutineConfig({});
      localStorage.removeItem(`routine-progress-${user?.uid}`);
      localStorage.removeItem(`routine-config-${user?.uid}`);
      toast.success("Rutina enviada para verificación. Espera la confirmación de tu entrenador.");
      return;
    }

    // ── Cliente sin entrenador: completar directamente ──
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

    // ── Guardar historial ──
    const historyExercises = routineExercises.map(e => ({
      id: e.id,
      name: e.name,
      category: e.category,
      level: e.level,
      points: e.points || 0,
      sets: routineConfig[e.id]?.sets || 3,
      reps: routineConfig[e.id]?.reps || 10,
    }));

    await addDoc(collection(db, "users", user.uid, "workoutHistory"), {
      date: today,
      exercises: historyExercises,
      totalPoints,
      elapsed,
      completedSteps: completedSteps.length || routineExercises.length,
      approvedByTrainer: null,
      createdAt: new Date().toISOString(),
    });

    reset();
    setRoutineIds([]);
    setRoutineFinished(true);
    setConfirmingStop(false);
    setCurrentStep(0);
    setCompletedSteps([]);
    setResting(false);
    setConfigDone(false);
    setRoutineConfig({});
    localStorage.removeItem(`routine-progress-${user?.uid}`);
    localStorage.removeItem(`routine-config-${user?.uid}`);

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

      {routineExercises.length > 0 && !routineFinished && !userData?.pendingVerification && !configDone && (
        <div className="transition-all duration-500">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-800">
            💡 Configura las series y repeticiones de cada ejercicio antes de comenzar.
          </div>

          <div className="space-y-4 mb-6">
            {routineExercises.map((exercise) => {
              const cfg = routineConfig[exercise.id] || getDefaults()[exercise.id] || { sets: 3, reps: 10 };
              return (
                <div key={exercise.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">
                      {exercise.category === 'Pecho' ? '💪' : exercise.category === 'Piernas' ? '🦵' : '🏋️'}
                    </span>
                    <div>
                      <h3 className="font-bold text-gray-800">{exercise.name}</h3>
                      <p className="text-sm text-gray-500">{exercise.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">Series:</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={cfg.sets}
                        onChange={(e) => handleSetConfig(exercise.id, 'sets', Math.min(5, Math.max(1, Number(e.target.value))))}
                        className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">Reps:</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={cfg.reps}
                        onChange={(e) => handleSetConfig(exercise.id, 'reps', Math.min(20, Math.max(1, Number(e.target.value))))}
                        className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleConfirmConfig}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
          >
            Continuar
          </button>
        </div>
      )}

      {routineExercises.length > 0 && !routineFinished && !userData?.pendingVerification && configDone && (
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

          {/* ── Ejercicio actual ── */}
          <div>
            {currentStep < routineExercises.length && (
              <div className="mb-4">
                <ExerciseCard
                  key={routineExercises[currentStep].id}
                  exercise={routineExercises[currentStep]}
                  selected
                  disabled
                />

                <div className="mt-2 text-center text-sm font-medium text-gray-600">
                  {(routineConfig[routineExercises[currentStep].id]?.sets || 3)} × {(routineConfig[routineExercises[currentStep].id]?.reps || 10)} repeticiones
                </div>

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
          </div>

          {/* ── Sidebar fija en escritorio ── */}
          <div className="hidden md:block fixed right-4 top-24 w-52 z-10">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 shadow-md">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tu rutina</p>
              <ul className="space-y-1 max-h-[calc(100vh-12rem)] overflow-y-auto">
                {routineExercises.map((e, i) => {
                  const cfg = routineConfig[e.id] || { sets: 3, reps: 10 };
                  const isCurrent = i === currentStep;
                  const isDone = completedSteps.includes(i);
                  return (
                    <li
                      key={e.id}
                      className={`text-sm py-1 px-2 rounded ${
                        isCurrent ? 'bg-blue-100 font-semibold text-blue-800' :
                        isDone ? 'text-green-600 line-through' :
                        'text-gray-600'
                      }`}
                    >
                      <span className="block truncate">{isDone ? '✓' : isCurrent ? '▶' : '○'} {e.name}</span>
                      <span className="text-xs opacity-75">{cfg.sets}×{cfg.reps}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

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