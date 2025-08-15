import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import quotes from "../data/quotes.json";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [motivationalQuote, setMotivationalQuote] = useState("");
  const [userData, setUserData] = useState(null);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      if (window.location.pathname !== "/auth") {
        window.location.href = "/auth";
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);

        // Escuchar cambios en los datos del usuario
        const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);

            // Si tiene reward2 activa, mostrar frase aleatoria
            if (data.activeVisuals?.includes("reward2")) {
              if (!motivationalQuote) {
                const randomIndex = Math.floor(Math.random() * quotes.quotes.length);
                setMotivationalQuote(quotes.quotes[randomIndex]);
              }
            } else {
              setMotivationalQuote("");
            }
          }
        });

        return () => unsubscribeUser();
      } else {
        setUserData(null);
        setMotivationalQuote("");
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading, logout, motivationalQuote }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}