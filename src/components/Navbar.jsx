import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import { LoginButton } from "./LoginButton";

export default function Navbar() {
  const { user, role, logout, motivationalQuote } = useContext(AuthContext);

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-100">
      <div className="flex gap-4">
        <Link to="/" className="hover:text-blue-500" viewTransition>Inicio</Link>
        {user && (
          <Link to="/profile" className="text-gray-700 hover:text-blue-600 font-medium transition-colors" viewTransition>Perfil</Link>
        )}
        {user && role === "cliente" && (
          <>
            <Link to="/exercises" className="hover:text-blue-500" viewTransition>Ejercicios</Link>
            <Link to="/routine" className="hover:text-blue-500" viewTransition>Rutina</Link>
            <Link to="/store" className="hover:text-blue-500" viewTransition>Tienda</Link>
          </>
        )}
        {user && role === "administrador" && (
          <Link to="/admin/usuarios" className="text-gray-700 hover:text-blue-600 font-medium transition-colors" viewTransition>Usuarios</Link>
        )}
      </div>

      <div className="flex items-center gap-4">
        {motivationalQuote && (
          <span className="hidden md:inline italic text-gray-600 max-w-md">
            {motivationalQuote}
          </span>
        )}

        {user ? (
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Cerrar Sesión
          </button>
        ): (
          <LoginButton /> // 👈 Aquí inyectamos el botón genérico de login si no hay sesión
        )}
        
      </div>
    </nav>
  );
}