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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <p className="text-muted-foreground animate-pulse font-medium">Cargando datos de tus alumnos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground mb-1">Mis Alumnos</h1>
            <p className="text-muted-foreground">Monitorización de rutinas y progreso</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 text-blue-700 font-semibold py-2 px-5 rounded-xl shadow-sm">
            Cupos utilizados: {clients.length} / {MAX_CLIENTS}
          </div>
        </div>

        {/* ── Primera verificación: consistencia ── */}
        {pendingConsistency.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">
              📋 Revisiones de Consistencia ({pendingConsistency.length})
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              Revisa los ejercicios y la configuración de series y repeticiones antes de aprobar.
            </p>
            <div className="space-y-3">
              {pendingConsistency.map(client => {
                const pv = client.pendingVerification;
                return (
                  <Card key={client.id} className="bg-yellow-50 border-yellow-200 shadow-none">
                    <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{client.displayName || "Sin nombre"}</p>
                        <p className="text-sm text-muted-foreground">
                          {pv.exercises?.length || 0} ejercicios · {pv.totalPoints} pts
                          · {new Date(pv.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Button onClick={() => setReviewClient(client)}>
                        Revisar rutina
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Segunda verificación: ejecución ── */}
        {pendingExecution.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">
              ✅ Verificaciones de Ejecución ({pendingExecution.length})
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              El cliente completó la rutina. Verifica los datos y aprueba para otorgar puntos.
            </p>
            <div className="space-y-3">
              {pendingExecution.map(client => {
                const pv = client.pendingVerification;
                const totalPts = (pv.totalPoints || 0) + (pv.bonusPoints || 0);
                return (
                  <Card key={client.id} className="bg-green-50 border-green-200 shadow-none">
                    <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{client.displayName || "Sin nombre"}</p>
                        <p className="text-sm text-muted-foreground">
                          {pv.completedSteps || pv.exercises?.length}/{pv.exercises?.length} ejercicios · {totalPts} pts totales
                          · {new Date(pv.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Button onClick={() => setVerifyClient(client)} className="bg-green-600 hover:bg-green-700">
                        Verificar ejecución
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Tabla de clientes ── */}
        <div className="bg-card rounded-2xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-muted-foreground">
              <thead className="bg-muted/50 text-foreground uppercase font-semibold border-b">
                <tr>
                  <th className="px-6 py-4">Nombre / Correo</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Racha Actual</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-muted-foreground font-medium">
                      Aún no tienes alumnos asignados a tu cartera.
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => {
                    const pvStage = client.pendingVerification?.stage;
                    const pvStatus = client.pendingVerification?.status;
                    let statusLabel = "—";
                    let statusClass = "bg-muted text-muted-foreground";
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
                      <tr key={client.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-foreground">{client.displayName || "Sin nombre asignado"}</div>
                          <div className="text-muted-foreground">{client.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusClass}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-orange-500">
                          {client.streak || 0} días 🔥
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Button variant="link" onClick={() => handleOpenDetail(client)}>
                            Ver Detalles
                          </Button>
                          <Button variant="link" className="text-destructive" onClick={() => handleUnlink(client)}>
                            Desvincular
                          </Button>
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
