import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, updateDoc, onSnapshot, getDocs, collection } from "firebase/firestore";
import { db } from "../services/firebase";
import MuscleChart from "../components/MuscleChart";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [visualRewards, setVisualRewards] = useState([]);
  const [allRewards, setAllRewards] = useState([]);
  const [loadError, setLoadError] = useState(false);
  const [muscleData, setMuscleData] = useState({ Brazos: 0, Espalda: 0, Pecho: 0, Hombros: 0, Piernas: 0, Cardio: 0 });
  const [range, setRange] = useState("total");

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        setNewName(data?.displayName || user.displayName || "Usuario");
      }
      setLoadError(false);
    }, (error) => {
      console.error("Error al cargar perfil:", error);
      setLoadError(true);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const fetchAllRewards = async () => {
      try {
        const snap = await getDocs(collection(db, "rewards"));
        setAllRewards(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error al cargar recompensas:", err);
      }
    };
    fetchAllRewards();
  }, []);

  useEffect(() => {
    const vis = allRewards.filter(
      (r) => r.type === "visual" && userData?.unlockedRewards?.includes(r.id)
    );
    setVisualRewards(vis);
  }, [allRewards, userData?.unlockedRewards]);

  const fetchMuscleStats = useCallback(async () => {
    if (!user) return;
    try {
      const snap = await getDocs(collection(db, "users", user.uid, "workoutHistory"));
      const now = new Date();
      const validCats = ["Brazos", "Espalda", "Pecho", "Hombros", "Piernas", "Cardio"];
      const counts = {};
      validCats.forEach(c => counts[c] = 0);

      snap.docs.forEach((d) => {
        const w = d.data();
        const workoutDate = new Date(w.date + "T12:00:00");

        if (range === "weekly") {
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          if (workoutDate < weekAgo) return;
        } else if (range === "monthly") {
          const monthAgo = new Date(now);
          monthAgo.setDate(monthAgo.getDate() - 30);
          if (workoutDate < monthAgo) return;
        }

        (w.exercises || []).forEach((ex) => {
          const cat = ex.category;
          if (validCats.includes(cat)) {
            counts[cat] = (counts[cat] || 0) + 1;
          }
        });
      });

      setMuscleData(counts);
    } catch (err) {
      console.error("Error al cargar estadisticas:", err);
    }
  }, [user, range]);

  useEffect(() => {
    fetchMuscleStats();
  }, [fetchMuscleStats]);

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

  if (loadError) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Perfil de Usuario</h1>
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

  if (!userData) return <p className="p-4">Cargando perfil...</p>;

  const marcoActivo = userData.activeVisuals?.includes("reward1");
  const avatarExclusivo = userData.activeVisuals?.includes("reward3");

  const creationDate = userData.createdAt?.toDate
    ? userData.createdAt.toDate().toLocaleDateString("es-VE")
    : userData.createdAt
      ? new Date(userData.createdAt).toLocaleDateString("es-VE")
      : "--";

  const imgSrc = avatarExclusivo
    ? "/guerrero_fit.png"
    : userData.photoURL || user.photoURL || "/default-avatar.png";

  const RANGE_LABELS = { weekly: "Semanal", monthly: "Mensual", total: "Total" };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Perfil de Usuario</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* ── Columna izquierda: info actual ── */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center mb-4 relative">
              {avatarExclusivo && (
                <div className="absolute w-28 h-28 rounded-full bg-blue-400 opacity-40 blur-lg -z-10" />
              )}
              <img
                src={imgSrc}
                alt="Avatar"
                className={"w-24 h-24 rounded-full object-cover mb-2 border-4 " + (marcoActivo ? "border-yellow-400 shadow-md" : "border-transparent")}
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
                  <Button onClick={handleNameSave} size="sm">Guardar</Button>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-semibold">{userData.displayName || "Usuario"}</h2>
                  <Button variant="link" onClick={() => setEditingName(true)}>Editar nombre</Button>
                </div>
              )}
            </div>

            <div className="text-sm space-y-2 text-center">
              <p><strong>Correo:</strong> {userData.email}</p>
              <p><strong>Racha actual:</strong> {userData.streak || 0} dias</p>
              <p><strong>Puntos totales:</strong> {userData.totalPoints || 0}</p>
              <p><strong>Fecha de registro:</strong> {creationDate}</p>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-bold mb-2">Logros Desbloqueados</h2>
              {userData.badges?.length ? (
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {userData.badges.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">Aun no has desbloqueado logros.</p>
              )}
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-bold mb-2">Personalizacion Visual</h2>
              {visualRewards.length > 0 ? (
                <ul className="text-sm text-muted-foreground space-y-2">
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
                <p className="text-muted-foreground text-sm">No has desbloqueado recompensas visuales aun.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Columna derecha: estadisticas ── */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-bold mb-4">Estadisticas por Grupo Muscular</h2>

            <div className="flex gap-2 mb-6">
              {Object.entries(RANGE_LABELS).map(([key, label]) => (
                <Button
                  key={key}
                  onClick={() => setRange(key)}
                  variant={range === key ? "default" : "outline"}
                  size="sm"
                >
                  {label}
                </Button>
              ))}
            </div>

            <MuscleChart data={muscleData} />

            <div className="mt-6 text-xs text-muted-foreground text-center">
              Basado en los ejercicios registrados en tu historial de rutinas.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
