import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { GoogleSignIn } from "../components/GoogleSignIn";

export default function Home() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (!user) return;
    const fetchUser = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setUserData(snap.data());
    };
    fetchUser();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-16 px-6 text-center">
        <h1 className="text-4xl font-bold mb-4">Fit Plus Ultra</h1>
        <p className="text-lg max-w-2xl mx-auto">
          Convierte tu entrenamiento en una experiencia divertida y motivadora. 
          Gana puntos, desbloquea recompensas y mantén tu racha activa 🔥
        </p>
        <p className="text-lg max-w-2xl mx-auto mt-6">
          Puedes unirte utilizando el siguiente boton.
          Si ya tienes una cuenta inicia sesion
        </p>
        {!user && (
          <div className="mt-6 flex gap-4 justify-center">
            <GoogleSignIn />
          </div>
        )}
      </div>

      {/* Sección de explicación si NO hay usuario */}
      {!user && (
        <div className="py-12 px-6 max-w-5xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-white rounded-xl shadow-md">
            <h3 className="text-2xl font-bold mb-2">🎯 Gamificación</h3>
            <p className="text-gray-600">
              Gana puntos y logros cada vez que completas tu rutina.
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-md">
            <h3 className="text-2xl font-bold mb-2">🔥 Rachas</h3>
            <p className="text-gray-600">
              Mantén tu constancia diaria y supera tus límites.
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-md">
            <h3 className="text-2xl font-bold mb-2">🏆 Recompensas</h3>
            <p className="text-gray-600">
              Canjea premios físicos y personaliza tu experiencia visual.
            </p>
          </div>
        </div>
      )}

      {/* Spinner mientras carga userData */}
      {user && !userData && (
        <div className="py-12 text-center">
          <p className="text-gray-500 animate-pulse font-medium">
            Cargando tu información...
          </p>
        </div>
      )}

      {/* Dashboard si el usuario ha iniciado sesión */}
      {user && userData && (
        <div className="py-12 px-6 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6">
            👋 Bienvenido, {userData.displayName || "Usuario"}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-xl shadow-md text-center">
              <h3 className="text-xl font-semibold">Rutinas completadas</h3>
              <p className="text-3xl font-bold text-blue-600">
                {userData.completedRoutines || 0}
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-md text-center">
              <h3 className="text-xl font-semibold">Puntos totales</h3>
              <p className="text-3xl font-bold text-yellow-500">
                {userData.totalPoints || 0}
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-md text-center">
              <h3 className="text-xl font-semibold">Racha actual</h3>
              <p className="text-3xl font-bold text-red-500">
                {userData.streak || 0} 🔥
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-md text-center">
              <h3 className="text-xl font-semibold">Días registrado</h3>
              <p className="text-3xl font-bold text-green-600">
                {userData.createdAt?.toDate
                  ? Math.floor(
                      (new Date() - userData.createdAt.toDate()) /
                        (1000 * 60 * 60 * 24)
                    )
                  : 0}
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/routine"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
            >
              Ir a mi rutina 💪
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}