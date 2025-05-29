import { useState } from 'react';
import ExerciseCard from '../components/ExerciseCard';
import { useExercises } from '../hooks/useExercises';

export default function ExercisesPage() {
  const { exercises, loading, error } = useExercises();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  // Filtrar ejercicios por categoría
  const filteredExercises = exercises.filter((exercise) => {
    const matchesCategory = 
      selectedCategory === 'all' || exercise.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesLevel = 
      selectedLevel === 'all' || exercise.level == selectedLevel;
    return matchesCategory && matchesLevel;
  });

  if (loading) return <div className="text-center py-8">Cargando ejercicios...</div>;
  if (error) return <div className="text-red-500 text-center py-8">Error: {error.message}</div>;

  return (
    <div className="container mx-auto px-4 py-8 space-x-2">
      <h1 className="text-3xl font-bold text-center mb-4">Catálogo de Ejercicios</h1>
      
      {/* Filtro por categoría */}
      <select
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="mb-6 p-2 border border-gray-300 rounded-md"
      >
        <option value="all">Todas las categorías</option>
        <option value="Pecho">Pecho</option>
        <option value="Piernas">Piernas</option>
        <option value="Espalda">Espalda</option>
      </select>

      <select
        onChange={(e) => setSelectedLevel(e.target.value)}
        className="mb-6 p-2 border border-gray-300 rounded-md"
      >
        <option value="all">Todos los niveles</option>
        <option value="1">Nivel 1</option>
        <option value="2">Nivel 2</option>
        <option value="3">Nivel 3</option>
      </select>

      {/* Grid de ejercicios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} viewTransition/>
        ))}
      </div>

    </div>
  );
}