import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import quotes from "../data/quotes.json";
import { verifyStreak } from "../utils/streakUtils";
import toast from "react-hot-toast";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [motivationalQuote, setMotivationalQuote] = useState("");
  const [userData, setUserData] = useState(null);
  const [transientAuth, setTransientAuth] = useState(false);
  const [suppressAuth, setSuppressAuth] = useState(false);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setRole(null);
      setUserData(null);
      if (window.location.pathname !== "/auth") {
        window.location.href = "/auth";
      }
    } catch (error) {
      console.error("Error al cerrar sesion:", error);
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setUserData(null);
        setRole(null);
        setMotivationalQuote("");
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    if (suppressAuth) return;

    setLoading(true);
    const userRef = doc(db, "users", user.uid);

    const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        setRole(data.role || "cliente");

        if (data.activeVisuals?.includes("reward2")) {
          setMotivationalQuote(prev => prev || quotes.quotes[Math.floor(Math.random() * quotes.quotes.length)]);
        } else {
          setMotivationalQuote("");
        }
      } else {
        setUserData(null);
        setRole("cliente");
      }
      setLoading(false);
    }, (error) => {
      console.error("Error al cargar datos del usuario:", error);
      setRole("cliente");
      setLoading(false);
    });

    return () => unsubscribeUser();
  }, [user, suppressAuth]);

  useEffect(() => {
    if (!user || !userData) return;
    if (!userData.lastRoutineCompleted) return;
    if (userData.streak === 0) return;

    const today = new Date().toLocaleDateString("sv-SE");
    const key = "streakToastShown_" + user.uid;
    if (localStorage.getItem(key) === today) return;

    localStorage.setItem(key, today);

    const reset = verifyStreak(userData);
    if (reset) {
      updateDoc(doc(db, "users", user.uid), reset).catch(() => {});
      toast.error("Has perdido tu racha diaria!", { duration: 8000 });
    }
  }, [user, userData]);

  return (
    <AuthContext.Provider value={{ user, userData, role, loading, logout, motivationalQuote, setTransientAuth, setSuppressAuth }}>
      {children}
      {(transientAuth || loading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-700 font-medium">Cargando...</p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
