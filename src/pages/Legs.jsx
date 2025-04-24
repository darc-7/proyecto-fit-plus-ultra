import { Link} from "react-router-dom";

export default function Exercises() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Ejercicios de pierna</h1>
      {/* Aquí irán las categorías más adelante */}
      <button className="bg-blue-300 px-6 py-3 rounded-lg text-center hover:bg-blue-400 transition-colors w-fit">
          <Link to="/exercises" viewTransition>
            Volver atras
          </Link>
      </button>
    </div>
  );
}