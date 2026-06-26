export default function ClientDetailModal({ client, onClose }) {
  if (!client) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Detalles del Cliente
        </h2>

        <div className="space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
              {(client.displayName || "?")[0].toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-gray-900 text-lg">{client.displayName || "Sin nombre"}</div>
              <div className="text-gray-500 text-sm">{client.email}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-1">Estado</p>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                ${client.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
              >
                {client.status || 'offline'}
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-1">Racha Actual</p>
              <p className="text-xl font-bold text-orange-500">{client.streak || 0} días 🔥</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-1">Puntos Totales</p>
              <p className="text-xl font-bold text-yellow-600">⭐ {client.totalPoints || 0}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-1">Rutinas Completadas</p>
              <p className="text-xl font-bold text-green-600">{client.completedRoutines || 0}</p>
            </div>
          </div>

          {client.currentRoutine && client.currentRoutine.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-2">Rutina Actual</p>
              <p className="text-sm text-gray-700">{client.currentRoutine.length} ejercicio(s) asignados</p>
            </div>
          )}

          {client.createdAt && (
            <div className="text-xs text-gray-400">
              Registrado el {new Date(client.createdAt).toLocaleDateString("es-ES", {
                year: "numeric", month: "long", day: "numeric"
              })}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
