import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="flex gap-4 p-4 bg-gray-100">
      <Link to="/" className="hover:text-blue-500">
        Inicio
      </Link>
      <Link to="/exercises" className="hover:text-blue-500">
        Ejercicios
      </Link>
      <Link to="/profile" className="hover:text-blue-500">
        Perfil
      </Link>
    </nav>
  );
}