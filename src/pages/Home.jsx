import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleSignIn } from "../components/GoogleSignIn";

function HelpSection({ items, defaultOpen = false }) {
  return (
    <div className="max-w-3xl mx-auto w-full space-y-3">
      {items.map((item, i) => (
        <details
          key={i}
          open={defaultOpen && i === 0}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group"
        >
          <summary className="px-5 py-4 cursor-pointer font-semibold text-gray-800 hover:bg-gray-50 transition-colors list-none flex items-center gap-3">
            <span className="text-xl">{item.icon}</span>
            <span className="flex-1">{item.title}</span>
            <span className="text-gray-400 group-open:rotate-180 transition-transform text-sm">▼</span>
          </summary>
          <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
            {typeof item.content === "string" ? (
              <p>{item.content}</p>
            ) : (
              item.content
            )}
          </div>
        </details>
      ))}
    </div>
  );
}

function HelpHeading({ children }) {
  return (
    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
      <span>📖</span> {children}
    </h2>
  );
}

export default function Home() {
  const { user, userData, role } = useAuth();
  const hasTrainer = !!userData?.trainerId;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ============================================================ */}
      {/* VISTA INVITADO                                                */}
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

          <div className="pb-16 px-6">
            <div className="text-center mb-6">
              <HelpHeading>¿Cómo funciona Fit Plus Ultra?</HelpHeading>
            </div>
            <HelpSection
              items={[
                {
                  icon: "📝",
                  title: "Registro y primer acceso",
                  content: "Crea tu cuenta con Google o correo electrónico. Una vez registrado, la dirección del gimnasio te asignará un entrenador personal para comenzar.",
                },
                {
                  icon: "📋",
                  title: "Selección de ejercicios",
                  content: "Accede al catálogo de ejercicios y elige hasta 7 por rutina. Los ejercicios están clasificados por grupo muscular (Pecho, Piernas, Espalda) y por nivel de dificultad (1 a 3).",
                },
                {
                  icon: "🔄",
                  title: "Doble verificación del entrenador",
                  content: "Tu rutina pasa por dos revisiones: primero el entrenador revisa y aprueba los ejercicios seleccionados; luego de ejecutar la rutina, el entrenador verifica la correcta ejecución antes de otorgar los puntos.",
                },
                {
                  icon: "⭐",
                  title: "Puntos y bonificaciones",
                  content: "Cada ejercicio tiene un valor en puntos (1, 5 o 10 según su nivel). Al completar la rutina completa se calcula un bono extra basado en el promedio de puntos de los ejercicios.",
                },
                {
                  icon: "🔥",
                  title: "Racha de entrenamiento",
                  content: "Entrena de lunes a viernes para mantener y aumentar tu racha. Los sábados también suman. Si no entrenas sábado o domingo no pierdes la racha. Si pierdes la racha, puedes comprar un recuperador en la tienda.",
                },
                {
                  icon: "🏅",
                  title: "Logros y recompensas",
                  content: "Desbloquea logros al alcanzar metas como 3, 7 o 14 días de racha, acumular puntos o completar rutinas. Canjea tus puntos por recompensas visuales (marcos, avatares) o físicas (descuentos, bebidas).",
                },
                {
                  icon: "📊",
                  title: "Estadísticas de perfil",
                  content: "En tu perfil puedes ver un gráfico circular con la distribución de grupos musculares que has entrenado, filtrable por semana, mes o total.",
                },
              ]}
            />
          </div>
        </>
      )}

      {/* ============================================================ */}
      {/* VISTA CLIENTE                                                 */}
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
                  {(() => {
                    const raw = userData.createdAt;
                    const date = raw?.toDate ? raw.toDate() : raw ? new Date(raw) : null;
                    return date ? Math.floor((new Date() - date) / (1000 * 60 * 60 * 24)) : 0;
                  })()}
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              {hasTrainer ? (
                <Link
                  to="/routine"
                  className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Ir a mi rutina 💪
                </Link>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-sm mx-auto">
                  <p className="text-yellow-800 font-medium">🔒 Sin entrenador asignado</p>
                  <p className="text-yellow-700 text-sm mt-1">
                    Comunícate con la dirección del gimnasio para que te asignen un entrenador.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pb-16 px-6">
            <div className="max-w-3xl mx-auto mb-6">
              <HelpHeading>Guía de la aplicación</HelpHeading>
            </div>
            <HelpSection
              items={[
                {
                  icon: "📋",
                  title: "Organizar tu rutina",
                  content: (
                    <div className="space-y-2">
                      <p>1. Ve a <strong>Ejercicios</strong> y selecciona hasta 7 ejercicios haciendo clic en las tarjetas. Puedes filtrar por grupo muscular (Pecho, Piernas, Espalda) y por nivel.</p>
                      <p>2. Ve a <strong>Rutina</strong> para configurar las series y repeticiones de cada ejercicio.</p>
                      <p>3. Envía la rutina a tu entrenador para su revisión.</p>
                      <p>4. Una vez aprobada, inicia el cronómetro y completa cada ejercicio uno por uno.</p>
                      <p>5. Al terminar, envía la rutina para verificación final del entrenador y recibe tus puntos.</p>
                    </div>
                  ),
                },
                {
                  icon: "⭐",
                  title: "Sistema de puntos",
                  content: (
                    <div className="space-y-2">
                      <p>Cada ejercicio tiene un valor en puntos según su nivel: <strong>Nivel 1 = 1 pt</strong>, <strong>Nivel 2 = 5 pts</strong>, <strong>Nivel 3 = 10 pts</strong>.</p>
                      <p>Al completar todos los ejercicios de la rutina, recibes un <strong>bono extra</strong> calculado como: (promedio de puntos de los ejercicios × número de ejercicios) × 5.</p>
                      <p>El entrenador verifica la ejecución antes de otorgar los puntos.</p>
                    </div>
                  ),
                },
                {
                  icon: "🔥",
                  title: "Racha diaria",
                  content: (
                    <div className="space-y-2">
                      <p>Tu racha aumenta cada vez que completas una rutina de <strong>lunes a sábado</strong>. Los domingos son de descanso y no afectan tu racha.</p>
                      <p>Si no entrenas un sábado o domingo, <strong>no pierdes la racha</strong>. Si pierdes la racha por faltar un día entre semana, puedes comprar un <strong>recuperador de racha</strong> en la tienda por 200 puntos.</p>
                    </div>
                  ),
                },
                {
                  icon: "🏅",
                  title: "Logros",
                  content: "A medida que avances, desbloquearás logros automáticos como racha de 3, 7 o 14 días, acumular 500, 1000 o 2000 puntos, completar 5 o 10 rutinas, y canjear 1 o 5 recompensas. Los logros aparecen como notificaciones al completar una rutina.",
                },
                {
                  icon: "🏪",
                  title: "Tienda de recompensas",
                  content: (
                    <div className="space-y-2">
                      <p>Canjea tus puntos en la <strong>Tienda</strong> por:</p>
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        <li><strong>Recompensas visuales</strong>: marco dorado para tu perfil (180 pts), frases motivadoras (130 pts), avatar exclusivo (200 pts).</li>
                        <li><strong>Recompensas físicas</strong>: descuento en membresía (300 pts), bebida hidratante (250 pts), proteína (350 pts), pase de invitado (380 pts).</li>
                        <li><strong>Recuperador de racha</strong>: disponible cuando tu racha llega a 0 (200 pts).</li>
                      </ul>
                    </div>
                  ),
                },
                {
                  icon: "👤",
                  title: "Personalizar tu perfil",
                  content: (
                    <div className="space-y-2">
                      <p>En tu <strong>Perfil</strong> puedes:</p>
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        <li>Editar tu nombre de usuario.</li>
                        <li>Ver tus estadísticas (racha, puntos, logros).</li>
                        <li>Activar o desactivar recompensas visuales (marco, avatar).</li>
                        <li>Consultar el gráfico de grupos musculares entrenados (semanal, mensual o total).</li>
                      </ul>
                    </div>
                  ),
                },
                {
                  icon: "📊",
                  title: "Historial de rutinas",
                  content: "La sección <strong>Historial</strong> muestra todas tus rutinas completadas agrupadas por mes. Puedes expandir cada entrada para ver los ejercicios realizados, series, repeticiones, tiempo y puntos obtenidos.",
                },
              ]}
            />
          </div>
        </>
      )}

      {user && role === "cliente" && !userData && (
        <div className="py-12 text-center">
          <p className="text-gray-500 animate-pulse font-medium">
            Cargando tu información...
          </p>
        </div>
      )}

      {/* ============================================================ */}
      {/* VISTA ENTRENADOR                                               */}
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
            <div className="grid md:grid-cols-2 gap-8 mb-12">
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

            <HelpHeading>Guía para entrenadores</HelpHeading>
            <HelpSection
              items={[
                {
                  icon: "📋",
                  title: "Revisión de consistencia (primera verificación)",
                  content: (
                    <div className="space-y-2">
                      <p>Cuando un cliente arma su rutina, aparece en la sección <strong>"Revisiones de Consistencia"</strong> de tu panel.</p>
                      <p>Haz clic en <strong>"Revisar rutina"</strong> para abrir el modal donde puedes:</p>
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        <li>Ver los ejercicios seleccionados con sus series y repeticiones.</li>
                        <li>Editar el número de series (1-5) y repeticiones (1-20) de cada ejercicio.</li>
                        <li>Eliminar ejercicios si es necesario (mínimo 3).</li>
                        <li><strong>Aceptar</strong> la rutina para que el cliente pueda comenzar a entrenar.</li>
                        <li><strong>Rechazar</strong> la rutina si necesita ajustes.</li>
                      </ul>
                    </div>
                  ),
                },
                {
                  icon: "✅",
                  title: "Verificación de ejecución (segunda verificación)",
                  content: (
                    <div className="space-y-2">
                      <p>Cuando el cliente completa la rutina, aparece en la sección <strong>"Verificaciones de Ejecución"</strong>.</p>
                      <p>Haz clic en <strong>"Verificar ejecución"</strong> para abrir el modal donde puedes:</p>
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        <li>Ver el tiempo total de la rutina y los ejercicios completados.</li>
                        <li>Revisar el desglose de puntos (base + bono).</li>
                        <li>Aprobar para otorgar los puntos, actualizar la racha y guardar el historial.</li>
                        <li>Rechazar si la ejecución no fue correcta.</li>
                      </ul>
                    </div>
                  ),
                },
                {
                  icon: "👥",
                  title: "Gestión de clientes",
                  content: (
                    <div className="space-y-2">
                      <p>En la tabla de clientes puedes:</p>
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        <li>Ver el nombre, correo, estado de verificación y racha de cada cliente.</li>
                        <li><strong>"Ver Detalles"</strong>: abre un modal con información completa del cliente.</li>
                        <li><strong>"Desvincular"</strong>: separa al cliente de tu cartera (ya no aparecerá en tu lista).</li>
                      </ul>
                      <p className="mt-2">Tienes un máximo de <strong>5 cupos</strong> para clientes activos.</p>
                    </div>
                  ),
                },
                {
                  icon: "📈",
                  title: "Seguimiento de progreso",
                  content: "Cada cliente muestra su racha actual y estado en tiempo real. Puedes dar seguimiento a sus rutinas completadas, puntos acumulados y consistencia de entrenamiento a través de las dos verificaciones.",
                },
              ]}
            />
          </div>
        </>
      )}

      {/* ============================================================ */}
      {/* VISTA ADMINISTRADOR                                            */}
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
            <div className="grid md:grid-cols-2 gap-8 mb-12">
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

            <HelpHeading>Guía de administración</HelpHeading>
            <HelpSection
              items={[
                {
                  icon: "👤",
                  title: "Crear y gestionar usuarios",
                  content: (
                    <div className="space-y-2">
                      <p>En la sección <strong>Usuarios</strong> puedes:</p>
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        <li><strong>Crear usuarios</strong>: con nombre, correo, contraseña y rol (cliente o entrenador). Los clientes reciben un correo de verificación.</li>
                        <li><strong>Editar usuarios</strong>: cambiar nombre y rol de cuentas existentes.</li>
                        <li><strong>Eliminar usuarios</strong>: remove la cuenta del sistema.</li>
                      </ul>
                    </div>
                  ),
                },
                {
                  icon: "🔗",
                  title: "Asignar entrenadores a clientes",
                  content: (
                    <div className="space-y-2">
                      <p>Cada cliente necesita un entrenador para poder usar la aplicación. Desde el panel de usuarios puedes:</p>
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        <li>Haz clic en <strong>"Asignar/Gestionar"</strong> junto a un cliente.</li>
                        <li>Selecciona un entrenador de la lista disponible.</li>
                        <li>También puedes <strong>desvincular</strong> un cliente de su entrenador actual.</li>
                      </ul>
                      <p className="mt-2">Sin un entrenador asignado, el cliente no podrá acceder a las secciones de Ejercicios ni Rutina.</p>
                    </div>
                  ),
                },
                {
                  icon: "🔄",
                  title: "Roles del sistema",
                  content: (
                    <div className="space-y-2">
                      <p>La plataforma tiene tres roles:</p>
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        <li><strong>Cliente</strong>: entrena, gana puntos, canjea recompensas y mantiene su racha.</li>
                        <li><strong>Entrenador</strong>: revisa y verifica rutinas de sus clientes asignados.</li>
                        <li><strong>Administrador</strong>: gestiona usuarios, asigna entrenadores y supervisa el sistema.</li>
                      </ul>
                    </div>
                  ),
                },
                {
                  icon: "💡",
                  title: "Recomendaciones",
                  content: (
                    <div className="space-y-2">
                      <p>Asegúrate de que todos los clientes tengan un entrenador asignado para poder utilizar la aplicación correctamente.</p>
                      <p>Los entrenadores tienen un límite de <strong>5 clientes</strong> en su cartera. Si un entrenador alcanza el límite, asigna nuevos clientes a otro entrenador disponible.</p>
                      <p>Puedes crear entrenadores adicionales desde el formulario de nuevo usuario si es necesario.</p>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </>
      )}

      {/* Fallback */}
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
