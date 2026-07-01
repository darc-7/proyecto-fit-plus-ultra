import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ExerciseCard from '../components/ExerciseCard';
import { useExercises } from '../hooks/useExercises';

export default function ExercisesPage() {
  const { userData } = useAuth();
  const { exercises, loading, error } = useExercises();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

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

  if (loading) return <div className="text-center py-8">Cargando ejercicios...</div>;
  if (error) return <div className="text-red-500 text-center py-8">Error: {error.message}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-4">Catálogo de Ejercicios</h1>

      <div className="flex flex-wrap items-center gap-3 mb-6">
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
            />
          ))}
        </div>
      )}
    </div>
  );
}