import { useState } from "react";
import { doc, updateDoc, deleteField } from "firebase/firestore";
import { db } from "../services/firebase";
import { toast } from "react-hot-toast";

export default function ReviewRoutineModal({ client, onClose }) {
  const [exercises, setExercises] = useState(
    client?.pendingVerification?.exercises?.map((ex) => ({ ...ex })) || []
  );
  const [saving, setSaving] = useState(false);

  const totalPoints = exercises.reduce((s, e) => s + (e.points || 0), 0);

  const handleSet = (index, field, value) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const handleRemove = (index) => {
    if (exercises.length <= 3) {
      toast.error("La rutina debe tener al menos 3 ejercicios.");
      return;
    }
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleApprove = async () => {
    if (!client) return;
    setSaving(true);
    try {
      const userRef = doc(db, "users", client.id);
      await updateDoc(userRef, {
        pendingVerification: {
          exercises,
          totalPoints,
          timestamp: client.pendingVerification.timestamp,
          stage: "consistency",
          status: "approved",
        },
      });
      toast.success(`Rutina de ${client.displayName || "cliente"} aprobada.`);
      onClose();
    } catch (err) {
      toast.error("Error al aprobar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!client) return;
    if (!window.confirm(`¿Rechazar la rutina de ${client.displayName || "este cliente"}?`)) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", client.id), {
        pendingVerification: deleteField(),
      });
      toast(`Rutina de ${client.displayName || "cliente"} rechazada.`, { icon: "ℹ️" });
      onClose();
    } catch (err) {
      toast.error("Error al rechazar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!client) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Revisar Rutina</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="mb-4 pb-4 border-b border-gray-100">
          <p className="font-semibold text-gray-900">{client.displayName || "Sin nombre"}</p>
          <p className="text-sm text-gray-500">{client.email}</p>
        </div>

        <div className="space-y-4 mb-6">
          {exercises.map((ex, i) => (
            <div key={ex.id || i} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-gray-800">{ex.name}</h3>
                  <p className="text-xs text-gray-500">
                    {ex.category} · Nivel {ex.level} · {ex.points} pts
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(i)}
                  className="text-red-400 hover:text-red-600 text-lg leading-none transition-colors"
                  title="Eliminar ejercicio"
                >
                  &times;
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-3">{ex.description || ""}</p>
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Series:</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={ex.sets}
                    onChange={(e) => handleSet(i, "sets", Math.min(5, Math.max(1, Number(e.target.value))))}
                    className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Reps:</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={ex.reps}
                    onChange={(e) => handleSet(i, "reps", Math.min(20, Math.max(1, Number(e.target.value))))}
                    className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-sm text-gray-600 mb-4">
          Total estimado: <span className="font-bold text-yellow-600">{totalPoints} pts</span>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={handleReject}
            disabled={saving}
            className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Rechazar
          </button>
          <button
            onClick={handleApprove}
            disabled={saving}
            className="px-5 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {saving ? "..." : "Aceptar rutina"}
          </button>
        </div>
      </div>
    </div>
  );
}
