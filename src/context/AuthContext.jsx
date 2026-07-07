import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import quotes from "../data/quotes.json";
import { usePresence } from "../hooks/usePresence";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [motivationalQuote, setMotivationalQuote] = useState("");
  const [userData, setUserData] = useState(null);
  const [transientAuth, setTransientAuth] = useState(false);
  const [suppressAuth, setSuppressAuth] = useState(false);

  usePresence(user?.uid);

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
      console.error("Error al cerrar sesión:", error);
    }
  };

  // ── Efecto 1: escuchar cambios de autenticación ──
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

  // ── Efecto 2: escuchar documento del usuario en Firestore ──
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
        setRole("cliente");
      }

      setLoading(false);
    });

    return () => unsubscribeUser();
  }, [user, suppressAuth]);

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