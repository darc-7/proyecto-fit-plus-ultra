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

  return (
    <div
      onClick={disabled ? undefined : toggleSelection}
      className={`p-4 rounded-lg shadow-md cursor-pointer transition-all duration-300 border-2 ${
        disabled ? "opacity-80 cursor-not-allowed" : ""
      } ${
        isSelected
          ? "border-blue-500 bg-blue-50 scale-[1.02]"
          : "border-transparent bg-white hover:bg-gray-50"
      } ${animating ? "scale-95" : ""}`}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{categoryIcons[exercise.category] || "🏋️"}</span>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800">{exercise.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              exercise.category === 'Pecho' ? 'bg-blue-100 text-blue-800' :
              exercise.category === 'Piernas' ? 'bg-green-100 text-green-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {exercise.category}
            </span>
            <LevelStars level={exercise.level} />
          </div>
        </div>
        {isSelected && (
          <span className="text-2xl text-blue-500 opacity-80 transition-opacity">✔</span>
        )}
      </div>
      <p className="mt-2 text-gray-600 text-sm">{exercise.description || 'Sin descripción'}</p>
      <div className={`mt-2 h-1 rounded-full transition-all duration-300 ${
        isSelected ? 'bg-blue-500' : 'bg-transparent'
      }`}></div>
    </div>
  );
}