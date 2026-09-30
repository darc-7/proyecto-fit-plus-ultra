import { useState } from "react";
import { doc, getDoc, updateDoc, arrayUnion, addDoc, collection, deleteField } from "firebase/firestore";
import { db } from "../services/firebase";
import { upStreak } from "../utils/streakUtils";
import { checkAchieve } from "../utils/achievements";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function VerifyExecutionModal({ client, onClose }) {
  const [saving, setSaving] = useState(false);

  const pv = client?.pendingVerification;
  const exList = pv?.exercises || [];
  const sumPoints = exList.reduce((s, e) => s + (e.points || 0), 0);
  const bonusPoints = pv?.bonusPoints || 0;
  const totalPoints = sumPoints + bonusPoints;

  const formatTime = (s) => {
    if (!s && s !== 0) return "-";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const handleApprove = async () => {
    if (!client) return;
    setSaving(true);
    try {
      const today = new Date().toLocaleDateString("sv-SE");
      const routineDate = pv.routineDate || today;
      const userRef = doc(db, "users", client.id);
      const userSnap = await getDoc(userRef);
      const data = userSnap.data();

      const updatedStreakData = upStreak(data, routineDate);
      const updatedTotalPoints = (data.totalPoints || 0) + totalPoints;
      const updatedCompleted = (data.completedRoutines || 0) + 1;

      const newBadges = checkAchieve({
        ...data,
        totalPoints: updatedTotalPoints,
        streak: updatedStreakData.streak,
        completedRoutines: updatedCompleted,
        unlockedRewards: data.unlockedRewards || [],
        badges: data.badges || [],
      });

      await updateDoc(userRef, {
        lastRoutineCompleted: updatedStreakData.lastRoutineCompleted || routineDate,
        pendingVerification: deleteField(),
        currentRoutine: [],
        ...(updatedStreakData.streak !== undefined && { streak: updatedStreakData.streak }),
        ...(updatedStreakData.lastKnownStreak !== undefined && { lastKnownStreak: updatedStreakData.lastKnownStreak }),
        ...(updatedStreakData.streakLostAt !== undefined && { streakLostAt: updatedStreakData.streakLostAt }),
        totalPoints: updatedTotalPoints,
        completedRoutines: updatedCompleted,
        ...(newBadges.length > 0 && { badges: arrayUnion(...newBadges) }),
      });

      const historyExercises = exList.map((e) => ({
        id: e.id,
        name: e.name,
        category: e.category,
        level: e.level,
        points: e.points || 0,
        sets: e.sets,
        reps: e.reps,
      }));

      await addDoc(collection(db, "users", client.id, "workoutHistory"), {
        date: routineDate,
        exercises: historyExercises,
        totalPoints,
        elapsed: pv.elapsed || 0,
        completedSteps: pv.completedSteps || exList.length,
        approvedByTrainer: true,
        createdAt: new Date().toISOString(),
      });

      toast.success(
        `Rutina de ${client.displayName || "cliente"} verificada. ${totalPoints} pts otorgados.`
      );
      onClose();
    } catch (err) {
      toast.error("Error al verificar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!client) return;
    if (
      !window.confirm(
        `¿Rechazar la ejecución de ${client.displayName || "este cliente"}? No recibirá puntos.`
      )
    )
      return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", client.id), {
        pendingVerification: deleteField(),
      });
      toast(`Ejecución de ${client.displayName || "cliente"} rechazada.`, { icon: "ℹ️" });
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
          <DialogTitle>Verificar Ejecución</DialogTitle>
        </DialogHeader>

        <div className="mb-4 pb-4 border-b">
          <p className="font-semibold text-foreground">{client.displayName || "Sin nombre"}</p>
          <p className="text-sm text-muted-foreground">{client.email}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Tiempo</p>
            <p className="text-lg font-bold text-foreground">{formatTime(pv.elapsed)}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Ejercicios</p>
            <p className="text-lg font-bold text-foreground">{pv.completedSteps || exList.length}/{exList.length}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Puntos base</p>
            <p className="text-lg font-bold text-yellow-600">{sumPoints}</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {exList.map((ex, i) => (
            <div key={ex.id || i} className="bg-muted/50 rounded-lg p-3 border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{ex.name}</h3>
                  <p className="text-xs text-muted-foreground">{ex.category} · {ex.points} pts</p>
                </div>
                <span className="text-sm font-medium text-muted-foreground">{ex.sets}×{ex.reps}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-foreground">Suma de ejercicios:</span>
            <span className="font-medium">{sumPoints} pts</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-foreground">Bono por rutina completa:</span>
            <span className="font-medium text-green-600">+{bonusPoints} pts</span>
          </div>
          <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t border-blue-200">
            <span className="text-foreground">Total a otorgar:</span>
            <span className="text-yellow-600">{totalPoints} pts</span>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="destructive" onClick={handleReject} disabled={saving}>
            Rechazar
          </Button>
          <Button onClick={handleApprove} disabled={saving} className="bg-green-600 hover:bg-green-700">
            {saving ? "..." : "Aprobar ejecución"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
