import { Navigate } from "react-router-dom";
import { auth } from "../services/firebase";

export default function ProtectedRoute({ children }) {
  const user = auth.currentUser; // O usa un contexto de autenticación
  return user ? children : <Navigate to="/auth" replace />;
}