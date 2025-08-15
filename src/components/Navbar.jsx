import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

export default function Navbar() {
  const { user, logout, motivationalQuote } = useContext(AuthContext);

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-100">
      <div className="flex gap-4">
        <Link to="/" className="hover:text-blue-500" viewTransition>Inicio</Link>
        <Link to="/exercises" className="hover:text-blue-500" viewTransition>Ejercicios</Link>
        <Link to="/routine" className="hover:text-blue-500" viewTransition>Rutina</Link>
        <Link to="/store" className="hover:text-blue-500" viewTransition>Tienda</Link>
        <Link to="/profile" className="hover:text-blue-500" viewTransition>Perfil</Link>
      </div>

      <div className="flex items-center gap-4">
        {motivationalQuote && (
          <span className="hidden md:inline italic text-gray-600 max-w-md">
            {motivationalQuote}
          </span>
        )}

        {user && (
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Cerrar Sesión
          </button>
        )}
      </div>
    </nav>
  );
}