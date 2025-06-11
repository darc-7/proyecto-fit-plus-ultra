import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export default function Profile() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      const data = docSnap.data();
      setUserData(data);
      setNewName(data.displayName || user.displayName || "Usuario");
    });

    return () => unsubscribe(); // Limpiar escucha en desmontaje
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
          src={userData.photoURL || user.photoURL || "https://via.placeholder.com/100"}
          alt="Foto de perfil"
          className="w-24 h-24 rounded-full object-cover mb-2"
          onError={(e) => e.currentTarget.src = "https://via.placeholder.com/100"}
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
        <p><strong>Fecha de registro:</strong> 📅 {creationDate}</p>
      </div>
    </div>
  );
}