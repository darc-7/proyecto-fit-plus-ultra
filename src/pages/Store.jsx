import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc, updateDoc, deleteField } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Store() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const rewardSnap = await getDocs(collection(db, "rewards"));
        const rewardsData = rewardSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setRewards(rewardsData);

        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({
            ...data,
            claimedPhysicalRewards: data.claimedPhysicalRewards || {}
          });
        } else {
          setLoadError(true);
        }
      } catch (err) {
        console.error("Error al cargar tienda:", err);
        setLoadError(true);
      }
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

    toast.success("Recompensa visual canjeada!");

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
      ["claimedPhysicalRewards." + reward.id]: today
    });

    toast.success("Recompensa fisica canjeada!");

    setUserData((prev) => ({
      ...prev,
      totalPoints: prev.totalPoints - reward.cost,
      claimedPhysicalRewards: {
        ...(prev.claimedPhysicalRewards || {}),
        [reward.id]: today
      }
    }));
  };

  const recuperarRacha = async () => {
    if (!user || !userData) return;
    if (userData.streak > 0) return toast("Ya tienes una racha activa. No hace falta comprar el recuperador.");

    const COSTO = 200;
    if (userData.totalPoints < COSTO) {
      return toast.error("No tienes puntos suficientes.");
    }

    const userRef = doc(db, "users", user.uid);
    const today = new Date().toLocaleDateString("sv-SE");

    const { lastKnownStreak = 0, streakLostAt } = userData;
    let newStreak = 1;

    if (lastKnownStreak > 0 && streakLostAt) {
      const lostDate = new Date(streakLostAt + "T12:00:00");
      const todayDate = new Date(today + "T12:00:00");
      const diffDays = Math.round((todayDate - lostDate) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) {
        newStreak = lastKnownStreak;
      }
    }

    await updateDoc(userRef, {
      totalPoints: userData.totalPoints - COSTO,
      streak: newStreak,
      lastRoutineCompleted: today,
      lastKnownStreak: deleteField(),
      streakLostAt: deleteField(),
    });

    toast.success(`Racha recuperada a ${newStreak} días!`);

    setUserData((prev) => ({
      ...prev,
      totalPoints: prev.totalPoints - COSTO,
      streak: newStreak,
      lastRoutineCompleted: today,
    }));
  };

  if (loadError) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Tienda de Recompensas</h1>
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-destructive font-medium">No se pudieron cargar tus datos.</p>
            <p className="text-muted-foreground text-sm mt-1">
              Verifica tu conexion o intenta mas tarde.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userData) return <p className="p-4">Cargando tienda...</p>;

  const visuales = rewards.filter((r) => r.type === "visual");
  const fisicas = rewards.filter((r) => r.type === "fisico");
  const today = new Date().toLocaleDateString("sv-SE");

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Tienda de Recompensas</h1>
      <p className="text-center text-muted-foreground mb-4">
        Tienes <span className="font-bold text-yellow-600">{userData.totalPoints}</span> puntos disponibles
      </p>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Recompensas Visuales</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visuales.map((reward) => (
            <Card key={reward.id}>
              <CardContent className="p-4">
                <h3 className="text-lg font-bold">{reward.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{reward.description}</p>
                <p className="text-yellow-600 font-bold">Costo: {reward.cost} puntos</p>
                <Button
                  onClick={() => canjearRecompensaVisual(reward)}
                  disabled={userData.unlockedRewards?.includes(reward.id)}
                  className="mt-2"
                >
                  {userData.unlockedRewards?.includes(reward.id) ? "Canjeado" : "Canjear"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">🔄 Recuperación de Racha</h2>
        <Card className="border-destructive/20 bg-destructive/5 max-w-sm">
          <CardContent className="p-4">
            <h3 className="text-lg font-bold text-destructive">Recuperador de Racha</h3>
            <p className="text-sm text-destructive/70 mb-2">Recupera tu racha al valor anterior si la compras dentro del mismo día.</p>
            <p className="text-yellow-600 font-bold">Costo: 200 puntos</p>
            <Button
              onClick={recuperarRacha}
              disabled={userData.streak > 0 || userData.totalPoints < 200}
              variant={userData.streak > 0 || userData.totalPoints < 200 ? "outline" : "destructive"}
              className="mt-2"
            >
              {userData.streak > 0 ? 'Racha activa' : userData.totalPoints < 200 ? 'Puntos insuficientes' : 'Recuperar racha'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recompensas Fisicas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {fisicas.map((reward) => (
            <Card key={reward.id}>
              <CardContent className="p-4">
                <h3 className="text-lg font-bold">{reward.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{reward.description}</p>
                <p className="text-yellow-600 font-bold">Costo: {reward.cost} puntos</p>
                <Button
                  onClick={() => canjearRecompensaFisica(reward)}
                  disabled={userData.claimedPhysicalRewards?.[reward.id] === today}
                  className="mt-2 bg-green-600 hover:bg-green-700"
                >
                  {userData.claimedPhysicalRewards?.[reward.id] === today
                    ? "Ya canjeada hoy"
                    : "Canjear"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
