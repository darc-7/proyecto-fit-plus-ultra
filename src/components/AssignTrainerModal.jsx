import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Asignar Entrenador</DialogTitle>
        </DialogHeader>

        <p className="text-muted-foreground text-sm -mt-2">
          Cliente: <span className="font-semibold text-foreground">{client.displayName || "Sin nombre"}</span>
        </p>

        {trainers.length === 0 ? (
          <p className="text-muted-foreground italic">No hay entrenadores registrados en el sistema.</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto my-2">
            {trainers.map((trainer) => (
              <label
                key={trainer.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-colors
                  ${selectedTrainerId === trainer.id || selectedTrainerId === trainer.uid
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/50'}`}
              >
                <input
                  type="radio"
                  name="trainer"
                  value={trainer.id}
                  checked={selectedTrainerId === trainer.id || selectedTrainerId === trainer.uid}
                  onChange={() => setSelectedTrainerId(trainer.id)}
                  className="accent-primary"
                />
                <div>
                  <div className="font-medium text-foreground">{trainer.displayName}</div>
                  <div className="text-sm text-muted-foreground">{trainer.email}</div>
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-4">
          {client.trainerId && (
            <Button variant="destructive" onClick={handleUnlink} disabled={loading}>
              Desvincular
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleAssign} disabled={loading || !selectedTrainerId}>
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
