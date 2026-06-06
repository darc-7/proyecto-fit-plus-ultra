import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; 

export default function AuthRedirect() {
  // Consumimos el usuario, el rol y el estado de carga desde el contexto global
  const { user, role, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && role) {
      
      // Enrutamiento dinámico evaluando el rol extraído de Firestore
      switch (role) {
        case "administrador":
          // Redirige al panel de control exclusivo del administrador
          navigate("/admin/usuarios", { replace: true });
          break;
        case "entrenador":
          // Redirige al catálogo para monitorear a los clientes asignados
          navigate("/clientes", { replace: true });
          break;
        case "cliente":
        default:
          // Redirige a la vista principal del usuario regular 
          navigate("/profile", { replace: true });
          break;
      }
    }
  }, [user, role, loading, navigate]);

  return null;
}