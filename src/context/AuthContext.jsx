import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../services/firebase"; // Asegúrate de que las rutas sean correctas [cite: 361]
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import quotes from "../data/quotes.json";
import { usePresence } from "../hooks/usePresence"

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 👈 Nuevo estado para manejar el RBAC
  const [loading, setLoading] = useState(true);
  const [motivationalQuote, setMotivationalQuote] = useState("");
  const [userData, setUserData] = useState(null);
  
  usePresence(user?.uid);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setRole(null); // Limpiamos el rol al salir
      setUserData(null);
      if (window.location.pathname !== "/auth") {
        window.location.href = "/auth";
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userRef = doc(db, "users", firebaseUser.uid);

        // Escuchar cambios en los datos del usuario en tiempo real
        const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            
            // 👈 Extraemos el rol de Firestore y lo guardamos en el estado
            setRole(data.role || "cliente"); // "cliente" como fallback de seguridad

            // Lógica de gamificación: Si tiene reward2 activa, mostrar frase aleatoria
            if (data.activeVisuals?.includes("reward2")) {
              // Validamos que no haya ya una frase para que no cambie en cada pequeña actualización
              setMotivationalQuote(prev => prev || quotes.quotes[Math.floor(Math.random() * quotes.quotes.length)]);
            } else {
              setMotivationalQuote("");
            }
          } else {
            // Si el doc no existe (ej. milisegundos durante el registro inicial)
            setRole("cliente");
          }
          
          // 👈 CRÍTICO: Indicamos que terminó de cargar SOLO cuando ya tenemos la data y el rol
          setLoading(false); 
        });

        return () => unsubscribeUser();
      } else {
        // No hay sesión en Firebase Auth
        setUser(null);
        setUserData(null);
        setRole(null);
        setMotivationalQuote("");
        setLoading(false); // Terminamos de cargar aunque no haya usuario
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    // 👈 Exponemos 'role' en el Provider para que AuthRedirect pueda consumirlo
    <AuthContext.Provider value={{ user, userData, role, loading, logout, motivationalQuote }}>
      {/* 👈 Evitamos renderizar las vistas hijas si todavía estamos cargando el perfil */}
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}