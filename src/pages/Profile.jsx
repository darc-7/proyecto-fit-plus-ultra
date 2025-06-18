import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import { verifyStreak } from "../utils/streakUtils";

export default function Profile() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    // Escucha en tiempo real
    const unsubscribe = onSnapshot(userRef, async (docSnap) => {
      const data = docSnap.data();
      setUserData(data);
      setNewName(data.displayName || user.displayName || "Usuario");

      // Verificar racha expirada
      const reset = verifyStreak(data);
      if (reset) {
        await updateDoc(userRef, reset);
        console.log("⏱️ Racha reiniciada automáticamente por inactividad.");
        toast.error("¡Has perdido tu racha diaria! 😢");
        setUserData(prev => ({ ...prev, ...reset }));
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleNameSave = async () => {
    if (!user || !newName.trim()) return;
    await updateDoc(doc(db, "users", user.uid), { displayName: newName.trim() });
    setEditingName(false);
  };

  if (!userData) return <p className="p-4">Cargando perfil...</p>;

  const creationDate = userData.createdAt?.toDate?.()
    ? userData.createdAt.toDate().toLocaleDateString("es-VE")
    : new Date(userData.createdAt).toLocaleDateString("es-VE");

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Perfil de Usuario</h1>

      <div className="flex flex-col items-center mb-4">
        <img
          src={userData.photoURL || user.photoURL || "/default-avatar.png"}
          alt="Foto de perfil"
          className="w-24 h-24 rounded-full object-cover mb-2"
          onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
        />
      </div>

      <div className="text-center mb-4">
        {editingName ? (
          <div className="flex flex-col items-center gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="border px-2 py-1 rounded-md"
            />
            <button
              onClick={handleNameSave}
              className="text-sm bg-blue-500 text-white px-3 py-1 rounded-md"
            >
              Guardar
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold">{userData.displayName || "Usuario"}</h2>
            <button
              onClick={() => setEditingName(true)}
              className="text-sm text-blue-600 mt-1"
            >
              Editar nombre
            </button>
          </div>
        )}
      </div>

      <div className="text-sm space-y-2 text-center">
        <p><strong>Correo:</strong> {userData.email}</p>
        <p><strong>Racha actual:</strong> 🔥 {userData.streak || 0} días</p>
        <p><strong>Puntos totales:</strong> ⭐ {userData.totalPoints || 0}</p>
        <p><strong>Protectores:</strong> 🧊 {userData.streakProtectors || 0}</p>
        <p><strong>Fecha de registro:</strong> 📅 {creationDate}</p>
      </div>
    </div>
  );
}