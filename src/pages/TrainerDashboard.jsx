import { useState } from "react";
import { flushSync } from "react-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useTrainerClients } from "../hooks/useTrainerClients";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import ClientDetailModal from "../components/ClientDetailModal";

export default function TrainerDashboard() {
  const { user } = useAuth();
  const { clients, loading } = useTrainerClients(user?.uid);

  const [selectedClient, setSelectedClient] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const MAX_CLIENTS = 5;

  const handleOpenDetail = (client) => {
    setSelectedClient(client);
    if (!document.startViewTransition) {
      setShowDetailModal(true);
      return;
    }
    document.startViewTransition(() => {
      flushSync(() => {
        setShowDetailModal(true);
      });
    });
  };

  const handleCloseDetail = () => {
    if (!document.startViewTransition) {
      setShowDetailModal(false);
      setSelectedClient(null);
      return;
    }
    document.startViewTransition(() => {
      flushSync(() => {
        setShowDetailModal(false);
        setSelectedClient(null);
      });
    });
  };

  const handleUnlink = async (client) => {
    if (!window.confirm(`¿Desvincular a ${client.displayName || "este cliente"} de tu cartera?`)) return;
    try {
      await updateDoc(doc(db, "users", client.id), { trainerId: null });
      toast.success(`${client.displayName || "Cliente"} desvinculado de tu cartera.`);
    } catch (error) {
      toast.error("Error al desvincular: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 animate-pulse font-medium">Cargando datos de tus alumnos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Mis Alumnos</h1>
            <p className="text-gray-600">Monitorización de rutinas y progreso</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 text-blue-700 font-semibold py-2 px-5 rounded-xl shadow-sm">
            Cupos utilizados: {clients.length} / {MAX_CLIENTS}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Nombre / Correo</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Racha Actual</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-gray-500 font-medium">
                      Aún no tienes alumnos asignados a tu cartera.
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{client.displayName || "Sin nombre asignado"}</div>
                        <div className="text-gray-500">{client.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                          ${client.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                        >
                          {client.status || 'offline'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-orange-500">
                        {client.streak || 0} días 🔥
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenDetail(client)}
                          className="text-blue-600 hover:text-blue-800 font-medium mr-4 transition-colors"
                        >
                          Ver Detalles
                        </button>
                        <button
                          onClick={() => handleUnlink(client)}
                          className="text-red-500 hover:text-red-700 font-medium transition-colors"
                        >
                          Desvincular
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showDetailModal && (
          <ClientDetailModal
            client={selectedClient}
            onClose={handleCloseDetail}
          />
        )}
      </div>
    </div>
  );
}