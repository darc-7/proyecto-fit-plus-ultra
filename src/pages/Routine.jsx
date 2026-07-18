import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import ExerciseCard from "../components/ExerciseCard";
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
  const [sentForExecution, setSentForExecution] = useState(false);
  const { elapsed, active, start, reset } = useTimer();

  const hasTrainer = !!userData?.trainerId;
  const pv = userData?.pendingVerification;
  const pvStage = pv?.stage;
  const pvStatus = pv?.status;

  const isConsistencyPending = pvStage === "consistency" && pvStatus === "pending";
  const isConsistencyApproved = pvStage === "consistency" && pvStatus === "approved";
  const isExecutionPending = pvStage === "execution";

  const routineExercises = exercises.filter(e => routineIds.includes(e.id));

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
    if (lastRoutineCompleted === today && !pv) {
      setRoutineFinished(true);
      localStorage.removeItem(`routine-progress-${user?.uid}`);
      localStorage.removeItem(`routine-config-${user?.uid}`);
      return;
    }

    setRoutineIds(currentRoutine);
    setRoutineFinished(false);
    setConfirmingStop(false);

    if (isExecutionPending) {
      setSentForExecution(true);
    } else {
      setSentForExecution(false);
    }

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
    } else if (!isConsistencyApproved) {
      setRoutineConfig({});
    }
  }, [userData, user?.uid]);

  useEffect(() => {
    if (routineIds.length > 0 || isConsistencyApproved) {
      const ids = isConsistencyApproved ? pv.exercises.map(e => e.id) : routineIds;
      localStorage.setItem(`routine-progress-${user?.uid}`, JSON.stringify({
        date: getTodayDate(),
        routineIds: ids,
        currentStep,
        completedSteps,
        resting,
      }));
    }
  }, [currentStep, completedSteps, resting, routineIds, user?.uid, isConsistencyApproved]);

  useEffect(() => {
    if (routineIds.length > 0 && !isConsistencyApproved) {
      localStorage.setItem(`routine-config-${user?.uid}`, JSON.stringify({
        date: getTodayDate(),
        routineIds,
        config: routineConfig,
      }));
    }
  }, [routineConfig, routineIds, user?.uid, isConsistencyApproved]);

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

  const handleConfirmConfig = async () => {
    if (routineExercises.length < 3) {
      toast.error("Selecciona al menos 3 ejercicios para comenzar la rutina.");
      return;
    }
    if (!window.confirm("¿Estás seguro con la configuración de series y repeticiones?")) return;

    const userRef = doc(db, "users", user.uid);
    const pts = routineExercises.reduce((sum, e) => sum + (e.points || 0), 0);

    await updateDoc(userRef, {
      pendingVerification: {
        exercises: routineExercises.map(e => ({
          id: e.id,
          name: e.name,
          category: e.category,
          level: e.level,
          points: e.points || 0,
          description: e.description,
          sets: routineConfig[e.id]?.sets || 3,
          reps: routineConfig[e.id]?.reps || 10,
        })),
        totalPoints: pts,
        timestamp: new Date().toISOString(),
        stage: "consistency",
        status: "pending",
      },
    });

    toast.success("Rutina enviada para revisión del entrenador.");
  };

  const handleStart = () => {
    if (!pv?.exercises || pv.exercises.length < 3) {
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

    if (currentStep + 1 >= pv.exercises.length) {
      setCurrentStep(pv.exercises.length);
      return;
    }

    setCurrentStep(currentStep + 1);
    setResting(true);
  };

  const handleStop = async () => {
    if (!user || !pv?.exercises || pv.exercises.length === 0) return;

    if (!confirmingStop) {
      setConfirmingStop(true);
      return;
    }

    reset();
    setConfirmingStop(false);
    setCurrentStep(0);
    setCompletedSteps([]);
    setResting(false);
    localStorage.removeItem(`routine-progress-${user?.uid}`);

    toast("Rutina detenida. No se perdieron puntos.", { icon: "⏹️" });
  };

  const completeRoutine = async () => {
    if (!user || !pv?.exercises || pv.exercises.length === 0 || !active) return;
    if (isExecutionPending) return;

    const exList = pv.exercises;
    const sumPoints = exList.reduce((s, e) => s + (e.points || 0), 0);
    const count = exList.length;
    const avg = Math.floor(sumPoints / count);
    const bonusPoints = avg * count * 5;

    const userRef = doc(db, "users", user.uid);

    await updateDoc(userRef, {
      pendingVerification: {
        exercises: exList,
        totalPoints: sumPoints,
        bonusPoints,
        elapsed,
        completedSteps: completedSteps.length,
        timestamp: new Date().toISOString(),
        stage: "execution",
        status: "pending",
      },
    });

    reset();
    setCurrentStep(0);
    setCompletedSteps([]);
    setResting(false);
    setSentForExecution(true);
    localStorage.removeItem(`routine-progress-${user?.uid}`);

    toast.success("Rutina enviada para verificación del entrenador.");
  };

  const formattedTime = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`;

  const approvedExercises = isConsistencyApproved ? pv.exercises : [];

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-2">Tu rutina</h1>

      {!hasTrainer && (
        <div className="mt-10 flex flex-col items-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 max-w-sm text-center shadow-lg">
            <p className="text-yellow-800 font-bold text-lg mb-2">🔒 Sin entrenador asignado</p>
            <p className="text-yellow-700 text-sm">
              No puedes acceder a esta sección hasta que tengas un entrenador.
              Comunícate con la dirección del gimnasio para que te asignen uno.
            </p>
          </div>
        </div>
      )}

      {hasTrainer && routineIds.length === 0 && !routineFinished && !isConsistencyPending && !isConsistencyApproved && !isExecutionPending && (
        <div className="text-center mt-10 space-y-4">
          <p className="text-gray-600">
            Parece que no has armado tu rutina. Comienza a agregar ejercicios desde la sección de Ejercicios.
          </p>
        </div>
      )}

      {hasTrainer && routineFinished && (
        <div className="text-center mt-10 space-y-4">
          <p className="text-green-600 font-semibold text-lg">
            ✅ ¡Felicidades! Has completado tu rutina del día.
          </p>
        </div>
      )}

      {hasTrainer && isConsistencyPending && (
        <div className="text-center py-10 space-y-4">
          <p className="text-lg font-semibold text-yellow-600">⏳ En espera de revisión</p>
          <p className="text-gray-600">
            Tu entrenador está revisando la rutina. Una vez aprobada podrás comenzar a entrenar.
          </p>
        </div>
      )}

      {hasTrainer && isExecutionPending && (
        <div className="text-center py-10 space-y-4">
          <p className="text-lg font-semibold text-yellow-600">⏳ En espera de verificación final</p>
          <p className="text-gray-600">
            Tu entrenador está verificando la ejecución de tu rutina. Recibirás los puntos una vez que sea aprobada.
          </p>
        </div>
      )}

      {routineIds.length > 0 && !routineFinished && !isConsistencyPending && !isConsistencyApproved && !isExecutionPending && (
        <div className="transition-all duration-500">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-800">
            💡 Configura las series y repeticiones de cada ejercicio. Al continuar se enviará a tu entrenador para revisión.
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
            Enviar para revisión
          </button>
        </div>
      )}

      {hasTrainer && isConsistencyApproved && !routineFinished && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-800">
            💡 Completa cada ejercicio uno por uno. Al completar todos, la rutina se enviará a tu entrenador para verificación final.
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">
              Ejercicio {Math.min(currentStep + 1, approvedExercises.length)} de {approvedExercises.length}
            </span>
            <span className="text-sm font-semibold text-blue-600">
              {completedSteps.length}/{approvedExercises.length} completados
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedSteps.length / approvedExercises.length) * 100}%` }}
            />
          </div>

          <div>
            {currentStep < approvedExercises.length && (
              <div className="mb-4">
                <ExerciseCard
                  key={approvedExercises[currentStep].id}
                  exercise={approvedExercises[currentStep]}
                  selected
                  disabled
                />

                <div className="mt-2 text-center text-sm font-medium text-gray-600">
                  {approvedExercises[currentStep].sets} × {approvedExercises[currentStep].reps} repeticiones
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

          <div className="hidden md:block fixed right-4 top-24 w-52 z-10">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 shadow-md">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tu rutina</p>
              <ul className="space-y-1 max-h-[calc(100vh-12rem)] overflow-y-auto">
                {approvedExercises.map((e, i) => {
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
                      <span className="text-xs opacity-75">{e.sets}×{e.reps}</span>
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

          {currentStep >= approvedExercises.length && (
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
                📤 Enviar para verificación final
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
                  <span className="text-sm text-red-600 font-medium">
                    ¿Detener? No se otorgarán puntos.
                  </span>
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
