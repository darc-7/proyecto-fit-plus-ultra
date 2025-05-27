import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useEffect, useState } from "react";

export default function RoutinePage() {
  const { user } = useAuth();
  const [routineExercises, setRoutineExercises] = useState([]);

  useEffect(() => {
    const fetchRoutine = async () => {
      if (!user) return;
      
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      const exerciseIds = userDoc.data()?.currentRoutine || [];
      
      // Obtener detalles de cada ejercicio
      const exercises = await Promise.all(
        exerciseIds.map(async (id) => {
          const exerciseDoc = await getDoc(doc(db, "exercises", id));
          return { id, ...exerciseDoc.data() };
        })
      );
      setRoutineExercises(exercises);
    };

    fetchRoutine();
  }, [user]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Tu Rutina</h1>
      {routineExercises.map((exercise) => (
        <div key={exercise.id} className="p-3 bg-gray-50 rounded-lg mb-2">
          <h3>{exercise.name}</h3>
          <p>Puntos: {exercise.points}</p>
        </div>
      ))}
    </div>
  );
}