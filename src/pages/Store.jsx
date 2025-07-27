import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Store() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Obtener recompensas desde Firestore
      const rewardSnap = await getDocs(collection(db, "rewards"));
      const rewardsData = rewardSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRewards(rewardsData);

      // Obtener datos del usuario
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      // Si no existe la propiedad claimedPhysicalRewards, inicializarla
      if (!userDoc.data().claimedPhysicalRewards) {
        await updateDoc(userRef, { claimedPhysicalRewards: {} });
      }

      setUserData(userDoc.data());
    };

    fetchData();
  }, [user]);

  const canjearRecompensaVisual = async (reward) => {
    if (!userData || !user) return;

    if (userData.unlockedRewards?.includes(reward.id)) {
      return toast("Ya tienes esta recompensa.");
    }

    if (userData.totalPoints < reward.cost) {
      return toast("No tienes puntos suficientes.");
    }

    const userRef = doc(db, "users", user.uid);

    await updateDoc(userRef, {
      totalPoints: userData.totalPoints - reward.cost,
      unlockedRewards: [...(userData.unlockedRewards || []), reward.id],
    });

    toast.success("¡Recompensa visual canjeada!");

    setUserData((prev) => ({
      ...prev,
      totalPoints: prev.totalPoints - reward.cost,
      unlockedRewards: [...(prev.unlockedRewards || []), reward.id],
    }));
  };

  const canjearRecompensaFisica = async (reward) => {
    if (!userData || !user) return;

    const today = new Date().toLocaleDateString("sv-SE");
    const claimed = userData.claimedPhysicalRewards || {};

    if (claimed[reward.id] === today) {
      return toast.error("Ya has canjeado esta recompensa hoy.");
    }

    if (userData.totalPoints < reward.cost) {
      return toast.error("No tienes puntos suficientes.");
    }

    const userRef = doc(db, "users", user.uid);

    await updateDoc(userRef, {
      totalPoints: userData.totalPoints - reward.cost,
      [`claimedPhysicalRewards.${reward.id}`]: today
    });

    toast.success("¡Recompensa física canjeada!");

    setUserData((prev) => ({
      ...prev,
      totalPoints: prev.totalPoints - reward.cost,
      claimedPhysicalRewards: {
        ...(prev.claimedPhysicalRewards || {}),
        [reward.id]: today
      }
    }));
  };

  if (!userData) return <p className="p-4">Cargando tienda...</p>;

  const visuales = rewards.filter((r) => r.type === "visual");
  const fisicas = rewards.filter((r) => r.type === "fisico");
  const today = new Date().toLocaleDateString("sv-SE");

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">🎁 Tienda de Recompensas</h1>
      <p className="text-center text-gray-600 mb-4">
        Tienes <span className="font-bold text-yellow-600">{userData.totalPoints}</span> puntos disponibles
      </p>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">🖼️ Recompensas Visuales</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visuales.map((reward) => (
            <div key={reward.id} className="border p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-bold">{reward.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{reward.description}</p>
              <p className="text-yellow-600 font-bold">Costo: {reward.cost} puntos</p>
              <button
                onClick={() => canjearRecompensaVisual(reward)}
                disabled={userData.unlockedRewards?.includes(reward.id)}
                className="mt-2 px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-400"
              >
                {userData.unlockedRewards?.includes(reward.id) ? "Canjeado" : "Canjear"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">🎒 Recompensas Físicas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {fisicas.map((reward) => (
            <div key={reward.id} className="border p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-bold">{reward.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{reward.description}</p>
              <p className="text-yellow-600 font-bold">Costo: {reward.cost} puntos</p>
              <button
                onClick={() => canjearRecompensaFisica(reward)}
                disabled={userData.claimedPhysicalRewards?.[reward.id] === today}
                className="mt-2 px-3 py-1 bg-green-500 text-white rounded disabled:bg-gray-400"
              >
                {userData.claimedPhysicalRewards?.[reward.id] === today
                  ? "Ya canjeada hoy"
                  : "Canjear"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}