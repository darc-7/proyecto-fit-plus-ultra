import { useState } from "react";
import { doc, updateDoc, deleteField } from "firebase/firestore";
import { db } from "../services/firebase";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Revisar Rutina</DialogTitle>
        </DialogHeader>

        <div className="mb-4 pb-4 border-b">
          <p className="font-semibold text-foreground">{client.displayName || "Sin nombre"}</p>
          <p className="text-sm text-muted-foreground">{client.email}</p>
        </div>

        <div className="space-y-4 mb-6">
          {exercises.map((ex, i) => (
            <div key={ex.id || i} className="bg-muted/50 rounded-lg p-4 border">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-foreground">{ex.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {ex.category} · Nivel {ex.level} · {ex.points} pts
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(i)}
                  className="text-destructive/60 hover:text-destructive text-lg leading-none transition-colors"
                  title="Eliminar ejercicio"
                >
                  &times;
                </button>
              </div>
              <div className="flex gap-4 items-center mt-2">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-foreground">Series:</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={ex.sets}
                    onChange={(e) => handleSet(i, "sets", Math.min(5, Math.max(1, Number(e.target.value))))}
                    className="w-16 px-2 py-1 border border-input rounded-md text-center text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-foreground">Reps:</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={ex.reps}
                    onChange={(e) => handleSet(i, "reps", Math.min(20, Math.max(1, Number(e.target.value))))}
                    className="w-16 px-2 py-1 border border-input rounded-md text-center text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-sm text-muted-foreground mb-4">
          Total estimado: <span className="font-bold text-yellow-600">{totalPoints} pts</span>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="destructive" onClick={handleReject} disabled={saving}>
            Rechazar
          </Button>
          <Button onClick={handleApprove} disabled={saving}>
            {saving ? "..." : "Aceptar rutina"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
