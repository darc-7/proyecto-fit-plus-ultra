import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { toast } from "react-hot-toast";

export default function AssignTrainerModal({ client, trainers, onClose }) {
  const [selectedTrainerId, setSelectedTrainerId] = useState(client.trainerId || "");
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!selectedTrainerId) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", client.id), { trainerId: selectedTrainerId });
      toast.success(`${client.displayName || "Cliente"} asignado correctamente.`);
      onClose();
    } catch (error) {
      toast.error("Error al asignar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async () => {
    if (!window.confirm(`¿Desvincular a ${client.displayName || "este cliente"} de su entrenador actual?`)) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", client.id), { trainerId: null });
      toast.success("Cliente desvinculado correctamente.");
      onClose();
    } catch (error) {
      toast.error("Error al desvincular: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Asignar Entrenador</h2>
        <p className="text-gray-500 text-sm mb-5">
          Cliente: <span className="font-semibold text-gray-700">{client.displayName || "Sin nombre"}</span>
        </p>

        {trainers.length === 0 ? (
          <p className="text-gray-500 italic">No hay entrenadores registrados en el sistema.</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {trainers.map((trainer) => (
              <label
                key={trainer.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-colors
                  ${selectedTrainerId === trainer.id || selectedTrainerId === trainer.uid
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'}`}
              >
                <input
                  type="radio"
                  name="trainer"
                  value={trainer.id}
                  checked={selectedTrainerId === trainer.id || selectedTrainerId === trainer.uid}
                  onChange={() => setSelectedTrainerId(trainer.id)}
                  className="accent-blue-600"
                />
                <div>
                  <div className="font-medium text-gray-900">{trainer.displayName}</div>
                  <div className="text-sm text-gray-500">{trainer.email}</div>
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          {client.trainerId && (
            <button
              onClick={handleUnlink}
              disabled={loading}
              className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors"
            >
              Desvincular
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleAssign}
            disabled={loading || !selectedTrainerId}
            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50 transition-colors"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}