// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext); // Usa el contexto
  const location = useLocation();

  if (loading) return <div>Cargando...</div>; // Opcional: spinner

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}