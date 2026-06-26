import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../services/firebase";

export function useTrainerClients(trainerId) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si no hay trainerId (aún no carga el contexto), detenemos la consulta
    if (!trainerId) {
      setLoading(false);
      return;
    }

    // Consulta: Solo usuarios que sean "cliente" y cuyo "trainerId" coincida
    const q = query(
      collection(db, "users"),
      where("trainerId", "==", trainerId),
      where("role", "==", "cliente")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClients(clientsData);
      setLoading(false);
    }, (error) => {
      console.error("Error al cargar clientes del entrenador:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [trainerId]);

  return { clients, loading };
}