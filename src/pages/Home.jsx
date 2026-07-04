import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleSignIn } from "../components/GoogleSignIn";

export default function Home() {
  const { user, userData, role } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ============================================================ */}
      {/* VISTA INVITADO — Sin sesión iniciada                         */}
      {/* ============================================================ */}
      {!user && (
        <>
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-16 px-6 text-center">
            <h1 className="text-4xl font-bold mb-4">Fit Plus Ultra</h1>
            <p className="text-lg max-w-2xl mx-auto">
              Convierte tu entrenamiento en una experiencia divertida y motivadora.
              Gana puntos, desbloquea recompensas y mantén tu racha activa 🔥
            </p>
            <div className="mt-6 flex justify-center">
              <GoogleSignIn />
            </div>
            <p className="mt-4 text-sm text-white/80">
              ¿Ya tienes cuenta?{" "}
              <Link to="/auth" className="text-white font-semibold underline">
                Inicia sesión aquí
              </Link>
            </p>
          </div>

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
        </>
      )}

      {/* ============================================================ */}
      {/* VISTA CLIENTE — Sesión iniciada + role === "cliente"         */}
      {/* ============================================================ */}
      {user && role === "cliente" && userData && (
        <>
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-10 px-6 text-center">
            <h1 className="text-3xl font-bold mb-1">
              👋 ¡Bienvenido, {userData.displayName || "Usuario"}!
            </h1>
            <p className="text-lg opacity-90">
              Sigue entrenando para alcanzar tus metas 💪
            </p>
          </div>

          <div className="py-10 px-6 max-w-3xl mx-auto w-full">
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
                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Ir a mi rutina 💪
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Cliente — spinner mientras carga userData */}
      {user && role === "cliente" && !userData && (
        <div className="py-12 text-center">
          <p className="text-gray-500 animate-pulse font-medium">
            Cargando tu información...
          </p>
        </div>
      )}

      {/* ============================================================ */}
      {/* VISTA ENTRENADOR — Sesión iniciada + role === "entrenador"   */}
      {/* ============================================================ */}
      {user && role === "entrenador" && (
        <>
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-16 px-6 text-center">
            <h1 className="text-4xl font-bold mb-4">
              👋 Panel de Entrenador
            </h1>
            <p className="text-lg max-w-2xl mx-auto">
              Bienvenido al panel de entrenamiento de Fit Plus Ultra.
              Gestiona a tus clientes, monitorea su progreso y ayúdalos a alcanzar sus metas.
            </p>
          </div>

          <div className="py-12 px-6 max-w-4xl mx-auto w-full">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 bg-white rounded-xl shadow-md text-center">
                <h3 className="text-2xl font-bold mb-2">📋 Mis Clientes</h3>
                <p className="text-gray-600 mb-4">
                  Visualiza y administra la cartera de clientes asignados a tu cuenta.
                  Revisa sus rutinas, rachas y progreso general.
                </p>
                <Link
                  to="/clients"
                  className="inline-block px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Ir a Mis Alumnos
                </Link>
              </div>
              <div className="p-6 bg-white rounded-xl shadow-md text-center">
                <h3 className="text-2xl font-bold mb-2">📊 Progreso</h3>
                <p className="text-gray-600 mb-4">
                  Monitorea el rendimiento de tus alumnos en tiempo real.
                  Revisa estadísticas de rutinas completadas, puntos acumulados y rachas activas.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ============================================================ */}
      {/* VISTA ADMINISTRADOR — Sesión iniciada + role === "admin"     */}
      {/* ============================================================ */}
      {user && role === "administrador" && (
        <>
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-16 px-6 text-center">
            <h1 className="text-4xl font-bold mb-4">
              👋 Panel de Administración
            </h1>
            <p className="text-lg max-w-2xl mx-auto">
              Bienvenido al panel de control de Fit Plus Ultra.
              Administra usuarios, asigna entrenadores y supervisa el funcionamiento general de la plataforma.
            </p>
          </div>

          <div className="py-12 px-6 max-w-4xl mx-auto w-full">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 bg-white rounded-xl shadow-md text-center">
                <h3 className="text-2xl font-bold mb-2">👥 Usuarios</h3>
                <p className="text-gray-600 mb-4">
                  Gestiona todos los usuarios de la plataforma: crea, edita y elimina cuentas.
                  Asigna roles, vincula clientes a entrenadores.
                </p>
                <Link
                  to="/admin/usuarios"
                  className="inline-block px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Ir a Usuarios
                </Link>
              </div>
              <div className="p-6 bg-white rounded-xl shadow-md text-center">
                <h3 className="text-2xl font-bold mb-2">⚙️ Configuración</h3>
                <p className="text-gray-600 mb-4">
                  Supervisa la base de datos, los ejercicios disponibles y las recompensas
                  del sistema. Mantén la plataforma actualizada.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Fallback — usuario logueado pero rol aún no determinado */}
      {user && !role && (
        <div className="py-12 text-center">
          <p className="text-gray-500 animate-pulse font-medium">
            Cargando tu perfil...
          </p>
        </div>
      )}

    </div>
  );
}