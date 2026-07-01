import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase.js";

export function useExercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "exercises"));
        const exercisesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setExercises(exercisesData);
      } catch (err) {
        console.error("Error fetching exercises:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  return { exercises, loading, error };
}