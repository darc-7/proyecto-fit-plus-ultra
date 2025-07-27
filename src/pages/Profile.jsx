import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, updateDoc, onSnapshot, getDocs, collection } from "firebase/firestore";
import { db } from "../services/firebase";
import { verifyStreak } from "../utils/streakUtils";
import toast from "react-hot-toast";

export default function Profile() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [visualRewards, setVisualRewards] = useState([]);

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

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

  useEffect(() => {
    const fetchRewards = async () => {
      const snap = await getDocs(collection(db, "rewards"));
      const allRewards = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const visuales = allRewards.filter((r) =>
        r.type === "visual" && userData?.unlockedRewards?.includes(r.id)
      );
      setVisualRewards(visuales);
    };

    if (userData?.unlockedRewards) fetchRewards();
  }, [userData]);

  const handleToggleVisual = async (rewardId) => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const current = userData.activeVisuals || [];
    const updated = current.includes(rewardId)
      ? current.filter((r) => r !== rewardId)
      : [...current, rewardId];

    await updateDoc(userRef, { activeVisuals: updated });
    setUserData(prev => ({ ...prev, activeVisuals: updated }));
  };

  const handleNameSave = async () => {
    if (!user || !newName.trim()) return;
    await updateDoc(doc(db, "users", user.uid), { displayName: newName.trim() });
    setEditingName(false);
  };

  if (!userData) return <p className="p-4">Cargando perfil...</p>;

  const marcoDoradoActivo = userData.activeVisuals?.includes("reward1");

  const creationDate = userData.createdAt?.toDate?.()
    ? userData.createdAt.toDate().toLocaleDateString("es-VE")
    : new Date(userData.createdAt).toLocaleDateString("es-VE");

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Perfil de Usuario</h1>

      <div className="flex flex-col items-center mb-4">
        <img
          src={userData.photoURL || user.photoURL || "/default-avatar.png"}
          alt="Foto de perfil"
          className={`w-24 h-24 rounded-full object-cover mb-2 border-4 ${
            marcoDoradoActivo ? "border-yellow-400 border-4 shadow-yellow-500 shadow-md ring-2 ring-yellow-300" : "border-transparent"
          }`}
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

      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-bold">Logros Desbloqueados 🏅</h2>
          {userData.badges?.length > 0 ? (
            <ul className="mt-2 list-disc list-inside text-sm text-gray-700">
              {userData.badges.map((badge, index) => (
                <li key={index}>🎖 {badge}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm mt-2">Aún no has desbloqueado logros.</p>
          )}
        </div>

        <div>
          <h2 className="text-lg font-bold">Personalización Visual 🎨</h2>
          {visualRewards.length > 0 ? (
            <ul className="mt-2 text-sm text-gray-700 space-y-2">
              {visualRewards.map((reward) => (
                <li key={reward.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={userData.activeVisuals?.includes(reward.id)}
                    onChange={() => handleToggleVisual(reward.id)}
                  />
                  <label>{reward.name}</label>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm mt-2">No has desbloqueado recompensas visuales aún.</p>
          )}
        </div>
      </div>
    </div>
  );
}