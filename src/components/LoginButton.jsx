import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext"; 

export function LoginButton() {
  const navigate = useNavigate();
  
  // Consumimos el usuario directamente desde tu contexto existente
  const { user } = useContext(AuthContext);

  // Si el usuario ya está autenticado, el botón se oculta automáticamente
  if (user) return null;

  return (
    <button
      onClick={() => navigate("/auth", { viewTransition: true })}
      className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-sm transition-all duration-200 active:scale-95 cursor-pointer text-sm"
    >
      <svg
        className="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
        />
      </svg>
      Iniciar Sesión
    </button>
  );
}