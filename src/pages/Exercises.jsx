import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ExerciseCard from '../components/ExerciseCard';
import { useExercises } from '../hooks/useExercises';

const getTodayDate = () => new Date().toLocaleDateString("sv-SE");

export default function ExercisesPage() {
  const { userData } = useAuth();
  const { exercises, loading, error } = useExercises();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  const hasTrainer = !!userData?.trainerId;
  const pv = userData?.pendingVerification;
  const pvStage = pv?.stage;
  const isConsistencyApproved = pvStage === "consistency" && pv?.status === "approved";
  const isExecutionPending = pvStage === "execution";
  const routineCompletedToday = userData?.lastRoutineCompleted === getTodayDate();

  const isSelectionDisabled = routineCompletedToday || isExecutionPending || isConsistencyApproved || pvStage === "consistency";

  const selectedCount = !loading && exercises.length > 0
    ? (userData?.currentRoutine || []).filter(id => exercises.some(e => e.id === id)).length
    : (userData?.currentRoutine || []).length;

  const filteredExercises = exercises.filter((exercise) => {
    const matchesCategory = 
      selectedCategory === 'all' || exercise.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesLevel = 
      selectedLevel === 'all' || String(exercise.level) === selectedLevel;
    return matchesCategory && matchesLevel;
  });

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedLevel('all');
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedLevel !== 'all';

  let bannerText = "💡 Haz clic en las tarjetas para agregar o quitar ejercicios de tu rutina. Selecciona hasta <strong>7 ejercicios</strong> y luego ve a <strong>Rutina</strong> para entrenar.";
  if (isConsistencyApproved) {
    bannerText = "✅ Tu entrenador aprobó la rutina. Dirígete a <strong>Rutina</strong> para comenzar a entrenar.";
  } else if (pvStage === "consistency") {
    bannerText = "⏳ Tu rutina está en revisión. Espera a que tu entrenador la apruebe.";
  }

  if (loading) return <div className="text-center py-8">Cargando ejercicios...</div>;
  if (error) return <div className="text-red-500 text-center py-8">Error: {error.message}</div>;

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <h1 className="text-3xl font-bold text-center mb-2">Catálogo de Ejercicios</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-sm text-blue-800 text-center">
        <span dangerouslySetInnerHTML={{ __html: bannerText }} />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-2 border border-gray-300 rounded-md"
        >
          <option value="all">Todas las categorías</option>
          <option value="Pecho">Pecho</option>
          <option value="Piernas">Piernas</option>
          <option value="Espalda">Espalda</option>
        </select>

        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="p-2 border border-gray-300 rounded-md"
        >
          <option value="all">Todos los niveles</option>
          <option value="1">Nivel 1</option>
          <option value="2">Nivel 2</option>
          <option value="3">Nivel 3</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Limpiar filtros ✕
          </button>
        )}

        <span className="ml-auto text-sm text-gray-500 font-medium">
          {selectedCount}/7 ejercicios seleccionados
        </span>
      </div>

      {filteredExercises.length === 0 && !loading ? (
        <p className="text-center text-gray-500 py-8">
          No hay ejercicios que coincidan con los filtros seleccionados.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              selected={userData?.currentRoutine?.includes(exercise.id)}
              disabled={isSelectionDisabled}
            />
          ))}
        </div>
      )}

      {!hasTrainer && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px] z-10">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 max-w-sm text-center shadow-lg">
            <p className="text-yellow-800 font-bold text-lg mb-2">🔒 Sin entrenador asignado</p>
            <p className="text-yellow-700 text-sm">
              No puedes acceder a esta sección hasta que tengas un entrenador.
              Comunícate con la dirección del gimnasio para que te asignen uno.
            </p>
          </div>
        </div>
      )}

      {hasTrainer && routineCompletedToday && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px] z-10">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 max-w-sm text-center shadow-lg">
            <p className="text-green-800 font-bold text-lg mb-2">✅ Rutina completada</p>
            <p className="text-green-700 text-sm">
              Ya completaste tu rutina de hoy. Vuelve mañana para entrenar de nuevo.
            </p>
          </div>
        </div>
      )}

      {hasTrainer && isExecutionPending && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px] z-10">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 max-w-sm text-center shadow-lg">
            <p className="text-yellow-800 font-bold text-lg mb-2">⏳ Esperando verificación</p>
            <p className="text-yellow-700 text-sm">
              Ya completaste tu rutina de hoy. Espera a que tu entrenador verifique la ejecución.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
