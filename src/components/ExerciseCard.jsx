import { useState, useEffect } from "react";
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

const MAX_EXERCISES = 7;

const categoryIcons = {
  Pecho: "💪",
  Piernas: "🦵",
  Espalda: "🏋️",
  Brazos: "💪",
  Hombros: "🏋️",
  Cardio: "🏃",
};

function LevelStars({ level }) {
  return (
    <span className="text-yellow-400">
      {Array.from({ length: 3 }, (_, i) => (
        <span key={i}>{i < level ? "⭐" : "☆"}</span>
      ))}
    </span>
  );
}

export default function ExerciseCard({ exercise, selected: controlledSelected, disabled = false }) {
  const { user } = useAuth();
  const isControlled = controlledSelected !== undefined;
  const [internalSelected, setInternalSelected] = useState(false);
  const [animating, setAnimating] = useState(false);
  const isSelected = isControlled ? controlledSelected : internalSelected;

  useEffect(() => {
    if (isControlled || !user) return;
    const checkIfSelected = async () => {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      const currentRoutine = userDoc.data()?.currentRoutine || [];
      setInternalSelected(currentRoutine.includes(exercise.id));
    };
    checkIfSelected();
  }, [user, exercise.id, isControlled]);

  const toggleSelection = async () => {
    if (!user || disabled) return;

    const userRef = doc(db, "users", user.uid);
    try {
      if (!isSelected) {
        const userDoc = await getDoc(userRef);
        const currentRoutine = userDoc.data()?.currentRoutine || [];
        if (currentRoutine.length >= MAX_EXERCISES) {
          toast.error(`¡Máximo ${MAX_EXERCISES} ejercicios por rutina!`);
          return;
        }
      }

      await updateDoc(userRef, {
        currentRoutine: isSelected
          ? arrayRemove(exercise.id)
          : arrayUnion(exercise.id)
      });

      if (!isControlled) setInternalSelected(!isSelected);
      setAnimating(true);
      setTimeout(() => setAnimating(false), 300);
    } catch (error) {
      console.error("Error al actualizar la rutina:", error);
    }
  };

  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const catColor = {
    Pecho: 'bg-blue-100 text-blue-800',
    Piernas: 'bg-green-100 text-green-800',
    Espalda: 'bg-purple-100 text-purple-800',
    Brazos: 'bg-red-100 text-red-800',
    Hombros: 'bg-orange-100 text-orange-800',
    Cardio: 'bg-pink-100 text-pink-800',
  };

  return (
    <div
      onClick={disabled ? undefined : toggleSelection}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex gap-4 p-3 rounded-lg shadow-md cursor-pointer transition-all duration-300 border-2 ${
        disabled ? "opacity-80 cursor-not-allowed" : ""
      } ${
        isSelected
          ? "border-blue-500 bg-blue-50 scale-[1.02]"
          : "border-transparent bg-white hover:bg-gray-50"
      } ${animating ? "scale-95" : ""}`}
    >
      <div className="w-[120px] h-[120px] shrink-0 rounded-lg overflow-hidden bg-gray-100">
        {(exercise.gif_url && isHovered && !imgError) ? (
          <img
            src={exercise.gif_url}
            alt={exercise.name}
            className="w-full h-full object-contain"
            onError={() => setImgError(true)}
          />
        ) : exercise.image && !imgError ? (
          <img
            src={exercise.image}
            alt={exercise.name}
            className="w-full h-full object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            {categoryIcons[exercise.category] || "🏋️"}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-gray-800 leading-tight">{exercise.name}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${catColor[exercise.category] || 'bg-gray-100 text-gray-800'}`}>
                {exercise.category}
              </span>
              <LevelStars level={exercise.level} />
            </div>
          </div>
          {isSelected && (
            <span className="text-xl text-blue-500 shrink-0">✔</span>
          )}
        </div>

        <p className="mt-2 text-gray-600 text-xs leading-relaxed line-clamp-3">
          {exercise.instructions || 'Sin instrucciones'}
        </p>

        <div className={`mt-2 h-1 rounded-full transition-all duration-300 ${
          isSelected ? 'bg-blue-500' : 'bg-transparent'
        }`}></div>
      </div>
    </div>
  );
}