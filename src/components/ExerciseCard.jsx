export default function ExerciseCard({ exercise }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 animate-fadeIn">
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-800">{exercise.name}</h3>
        <div className="flex justify-between mt-2">
          <span className={`px-2 py-1 rounded-full text-xs ${
            exercise.category === 'Pecho' ? 'bg-blue-100 text-blue-800' :
            exercise.category === 'Piernas' ? 'bg-green-100 text-green-800' :
            'bg-purple-100 text-purple-800'
          }`}>
            {exercise.category}
          </span>
          <span className={`${
            exercise.level == 1 ? 'text-yellow-400 font-semibold' :
            exercise.level == 2 ? 'text-orange-500 font-semibold' :
            'text-red-600 font-semibold'
          }`}>
            Nivel {exercise.level}
          </span>
        </div>
        <p className="mt-3 text-gray-600">{exercise.description || 'Sin descripción'}</p>
      </div>
    </div>
  );
}