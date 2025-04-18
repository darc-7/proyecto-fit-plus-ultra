import { Link } from "react-router-dom";

export default function ErrorPage() {
  return (
    <div>
      <h1>¡Oops! Página no encontrada</h1>
      <Link to="/" className="text-blue-500">
        Volver al inicio
      </Link>
    </div>
  );
}