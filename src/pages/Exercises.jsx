import { Link} from "react-router-dom";

export default function Exercises() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Ejercicios</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button className="bg-purple-300 px-6 py-3 rounded-lg text-center hover:bg-purple-400 transition-colors w-36">
          <Link to="/exercises/chest" className="hover:text-blue-500" viewTransition>
            Pecho
          </Link>
        </button>
        <button className="bg-purple-300 px-6 py-3 rounded-lg text-center hover:bg-purple-400 transition-colors w-36">
          <Link to="/exercises/legs" className="hover:text-blue-500" viewTransition>
            Pierna
          </Link>
        </button>
        <button className="bg-purple-300 px-6 py-3 rounded-lg text-center hover:bg-purple-400 transition-colors w-36">Espalda</button>
      </div>
    </div>
  );
}