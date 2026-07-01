import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, updateDoc, onSnapshot, getDoc, getDocs, collection } from "firebase/firestore";
import { db } from "../services/firebase";
import { verifyStreak } from "../utils/streakUtils";
import toast from "react-hot-toast";

export default function Profile() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [visualRewards, setVisualRewards] = useState([]);
  const [allRewards, setAllRewards] = useState([]);

  // Efecto 1: verificar racha UNA SOLA VEZ al montar
  useEffect(() => {
    if (!user) return;

    const checkStreakOnce = async () => {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      const data = snap.data();
      if (!data) return;

      const today = new Date().toLocaleDateString("sv-SE");
      const key = `streakToastShown_${user.uid}`;
      if (localStorage.getItem(key) === today) return;

      const reset = verifyStreak(data);
      if (reset) {
        await updateDoc(userRef, reset).catch(() => {});
        toast.error("¡Has perdido tu racha diaria! 😢", { duration: 8000 });
        localStorage.setItem(key, today);
      }
    };

    checkStreakOnce();
  }, [user]);

// Efecto 2: listener en tiempo real (SIN verifyStreak)
  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      const data = docSnap.data();
      setUserData(data);
      setNewName(data?.displayName || user.displayName || "Usuario");
    });

    return () => unsubscribe();
  }, [user]);

  // Efecto 3: fetch de rewards UNA SOLA VEZ al montar
  useEffect(() => {
    const fetchAllRewards = async () => {
      const snap = await getDocs(collection(db, "rewards"));
      setAllRewards(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchAllRewards();
  }, []);

  // Efecto 4: filtro local cuando cambian unlockedRewards (SIN lecturas Firestore)
  useEffect(() => {
    const vis = allRewards.filter(
      (r) => r.type === "visual" && userData?.unlockedRewards?.includes(r.id)
    );
    setVisualRewards(vis);
  }, [allRewards, userData?.unlockedRewards]);

  const toggleVisual = async (rewardId) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const current = userData.activeVisuals || [];
    const newList = current.includes(rewardId)
      ? current.filter((id) => id !== rewardId)
      : [...current, rewardId];
    await updateDoc(userRef, { activeVisuals: newList });
    setUserData((prev) => ({ ...prev, activeVisuals: newList }));
  };

  const handleNameSave = async () => {
    if (!user || !newName.trim()) return;
    await updateDoc(doc(db, "users", user.uid), { displayName: newName.trim() });
    setEditingName(false);
  };

  if (!userData) return <p className="p-4">Cargando perfil...</p>;

  const marcoActivo = userData.activeVisuals?.includes("reward1");
  const avatarExclusivo = userData.activeVisuals?.includes("reward3");

  const creationDate = userData.createdAt?.toDate?.()
    ? userData.createdAt.toDate().toLocaleDateString("es-VE")
    : new Date(userData.createdAt).toLocaleDateString("es-VE");

  const imgSrc = avatarExclusivo
    ? "/guerrero_fit.png"
    : userData.photoURL || user.photoURL || "/default-avatar.png";

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Perfil de Usuario</h1>

      <div className="flex flex-col items-center mb-4 relative">
        {avatarExclusivo && (
          <div className="absolute w-28 h-28 rounded-full bg-blue-400 opacity-40 blur-lg -z-10" />
        )}
        <img
          src={imgSrc}
          alt="Avatar"
          className={`w-24 h-24 rounded-full object-cover mb-2 border-4 ${
            marcoActivo ? "border-yellow-400 shadow-md" : "border-transparent"
          }`}
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
          {userData.badges?.length ? (
            <ul className="mt-2 list-disc list-inside text-sm text-gray-700">
              {userData.badges.map((b, i) => (
                <li key={i}>🎖 {b}</li>
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
              {visualRewards.map((r) => (
                <li key={r.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={userData.activeVisuals?.includes(r.id)}
                    onChange={() => toggleVisual(r.id)}
                  />
                  <label>{r.name}</label>
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