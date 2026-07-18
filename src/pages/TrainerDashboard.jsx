import { useState } from "react";
import { flushSync } from "react-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useTrainerClients } from "../hooks/useTrainerClients";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import ClientDetailModal from "../components/ClientDetailModal";
import ReviewRoutineModal from "../components/ReviewRoutineModal";
import VerifyExecutionModal from "../components/VerifyExecutionModal";

export default function TrainerDashboard() {
  const { user } = useAuth();
  const { clients, loading } = useTrainerClients(user?.uid);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [reviewClient, setReviewClient] = useState(null);
  const [verifyClient, setVerifyClient] = useState(null);

  const MAX_CLIENTS = 5;

  const pendingConsistency = clients.filter(
    (c) => c.pendingVerification?.stage === "consistency" && c.pendingVerification?.status === "pending"
  );
  const pendingExecution = clients.filter(
    (c) => c.pendingVerification?.stage === "execution"
  );

  const handleOpenDetail = (client) => {
    setSelectedClient(client);
    if (!document.startViewTransition) {
      setShowDetailModal(true);
      return;
    }
    document.startViewTransition(() => {
      flushSync(() => { setShowDetailModal(true); });
    });
  };

  const handleCloseDetail = () => {
    if (!document.startViewTransition) {
      setShowDetailModal(false);
      setSelectedClient(null);
      return;
    }
    document.startViewTransition(() => {
      flushSync(() => { setShowDetailModal(false); setSelectedClient(null); });
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

        {/* ── Primera verificación: consistencia ── */}
        {pendingConsistency.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              📋 Revisiones de Consistencia ({pendingConsistency.length})
            </h2>
            <p className="text-sm text-gray-500 mb-3">
              Revisa los ejercicios y la configuración de series y repeticiones antes de aprobar.
            </p>
            <div className="space-y-3">
              {pendingConsistency.map(client => {
                const pv = client.pendingVerification;
                return (
                  <div key={client.id} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{client.displayName || "Sin nombre"}</p>
                      <p className="text-sm text-gray-600">
                        {pv.exercises?.length || 0} ejercicios · {pv.totalPoints} pts
                        · {new Date(pv.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => setReviewClient(client)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shrink-0"
                    >
                      Revisar rutina
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Segunda verificación: ejecución ── */}
        {pendingExecution.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              ✅ Verificaciones de Ejecución ({pendingExecution.length})
            </h2>
            <p className="text-sm text-gray-500 mb-3">
              El cliente completó la rutina. Verifica los datos y aprueba para otorgar puntos.
            </p>
            <div className="space-y-3">
              {pendingExecution.map(client => {
                const pv = client.pendingVerification;
                const totalPts = (pv.totalPoints || 0) + (pv.bonusPoints || 0);
                return (
                  <div key={client.id} className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{client.displayName || "Sin nombre"}</p>
                      <p className="text-sm text-gray-600">
                        {pv.completedSteps || pv.exercises?.length}/{pv.exercises?.length} ejercicios · {totalPts} pts totales
                        · {new Date(pv.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => setVerifyClient(client)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium shrink-0"
                    >
                      Verificar ejecución
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Tabla de clientes ── */}
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
                  clients.map((client) => {
                    const pvStage = client.pendingVerification?.stage;
                    const pvStatus = client.pendingVerification?.status;
                    let statusLabel = "—";
                    let statusClass = "bg-gray-100 text-gray-500";
                    if (pvStage === "consistency" && pvStatus === "pending") {
                      statusLabel = "consistencia pendiente";
                      statusClass = "bg-yellow-100 text-yellow-700";
                    } else if (pvStage === "consistency" && pvStatus === "approved") {
                      statusLabel = "aprobado para entrenar";
                      statusClass = "bg-blue-100 text-blue-700";
                    } else if (pvStage === "execution") {
                      statusLabel = "ejecución pendiente";
                      statusClass = "bg-green-100 text-green-700";
                    }

                    return (
                      <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{client.displayName || "Sin nombre asignado"}</div>
                          <div className="text-gray-500">{client.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusClass}`}>
                            {statusLabel}
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
                    );
                  })
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

        {reviewClient && (
          <ReviewRoutineModal
            client={reviewClient}
            onClose={() => setReviewClient(null)}
          />
        )}

        {verifyClient && (
          <VerifyExecutionModal
            client={verifyClient}
            onClose={() => setVerifyClient(null)}
          />
        )}
      </div>
    </div>
  );
}
