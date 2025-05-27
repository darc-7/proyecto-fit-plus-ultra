import { useState, useEffect } from "react";
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

export default function ExerciseCard({ exercise }) {
  const { user } = useAuth();
  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    const checkIfSelected = async () => {
      if (!user) return;
      
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      const currentRoutine = userDoc.data()?.currentRoutine || [];
      setIsSelected(currentRoutine.includes(exercise.id));
    };

    checkIfSelected();
  }, [user, exercise.id]);

  const toggleSelection = async () => {
    if (!user) {
      console.error("Usuario no autenticado");
      return;
    }

    const userRef = doc(db, "users", user.uid);
    try {
      if (!isSelected) {
        const userDoc = await getDoc(userRef);
        const currentRoutine = userDoc.data()?.currentRoutine || [];
        if (currentRoutine.length >= 8) {
          alert("¡Máximo 8 ejercicios por rutina!");
          return;
        }
      }

      await updateDoc(userRef, {
        currentRoutine: isSelected 
          ? arrayRemove(exercise.id) 
          : arrayUnion(exercise.id)
      });

      setIsSelected(!isSelected);
    } catch (error) {
      console.error("Error al actualizar la rutina:", error);
    }
  };

  return (
    <div 
      onClick={toggleSelection}
      className={`p-4 rounded-lg shadow-md cursor-pointer transition-all duration-300 border-2 ${
        isSelected 
          ? "border-blue-500 bg-blue-50" // Estilo cuando está seleccionado
          : "border-transparent bg-white hover:bg-gray-50" // Estilo normal
      }`}
    >
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
          exercise.level == 1 ? 'text-yellow-400' :
          exercise.level == 2 ? 'text-orange-500' :
          'text-red-600'
        } font-semibold`}>
          Nivel {exercise.level}
        </span>
      </div>
      <p className="mt-3 text-gray-600">{exercise.description || 'Sin descripción'}</p>
      {/* Indicador visual adicional */}
      <div className={`mt-2 h-1 rounded-full ${
        isSelected ? 'bg-blue-500' : 'bg-transparent'
      }`}></div>
    </div>
  );
}