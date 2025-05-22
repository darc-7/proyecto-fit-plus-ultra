import PropTypes from 'prop-types';

export default function ExerciseCard({ exercise }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-800">{exercise.name}</h3>
        <div className="flex justify-between mt-2">
          <span className={`px-2 py-1 rounded-full text-xs ${
            exercise.category === 'chest' ? 'bg-blue-100 text-blue-800' :
            exercise.category === 'legs' ? 'bg-green-100 text-green-800' :
            'bg-purple-100 text-purple-800'
          }`}>
            {exercise.category}
          </span>
          <span className="text-yellow-500 font-semibold">
            Nivel {exercise.level}
          </span>
        </div>
        <p className="mt-3 text-gray-600">{exercise.description || 'Sin descripción'}</p>
      </div>
    </div>
  );
}