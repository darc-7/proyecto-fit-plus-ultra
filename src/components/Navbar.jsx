import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useContext } from 'react';

export default function Navbar() {
  const { user, logout} = useContext(AuthContext);
  return (
    <nav className="flex gap-4 p-4 bg-gray-100">
      <Link to="/" className="hover:text-blue-500" viewTransition>
        Inicio
      </Link>
      <Link to="/exercises" className="hover:text-blue-500" viewTransition>
        Ejercicios
      </Link>
      <Link to="/profile" className="hover:text-blue-500" viewTransition>
        Perfil
      </Link>
      {user && ( // Solo muestra el botón si hay usuario logueado
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Cerrar Sesión
        </button>
      )}
    </nav>
  );
}