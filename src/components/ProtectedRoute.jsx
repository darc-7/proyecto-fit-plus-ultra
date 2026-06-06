import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// 1. Agregamos "allowedRoles" como prop, manteniendo "children"
export default function ProtectedRoute({ children, allowedRoles }) {
  // 2. Extraemos también el "role" desde tu contexto
  const { user, role, loading } = useContext(AuthContext); 
  const location = useLocation();

  if (loading) {
    // Spinner mejorado visualmente con Tailwind
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 animate-pulse font-medium">Verificando permisos...</p>
      </div>
    );
  }

  // 3. Si no hay usuario, lo mandamos al login guardando su ruta de origen
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // 4. Lógica RBAC: Si se enviaron roles requeridos y el rol del usuario NO está en esa lista
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Lo redirigimos a la raíz (o puedes cambiar "/"" por "/tienda" o un componente de "No Autorizado")
    return <Navigate to="/" replace />;
  }

  // 5. Si pasa todas las validaciones, renderiza el componente hijo
  return children;
}