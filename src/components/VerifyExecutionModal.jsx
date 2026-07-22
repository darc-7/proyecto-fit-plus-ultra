import { useState } from "react";
import { doc, getDoc, updateDoc, arrayUnion, addDoc, collection, deleteField } from "firebase/firestore";
import { db } from "../services/firebase";
import { upStreak } from "../utils/streakUtils";
import { checkAchieve } from "../utils/achievements";
import { toast } from "react-hot-toast";

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
      const userRef = doc(db, "users", client.id);
      const userSnap = await getDoc(userRef);
      const data = userSnap.data();

      const updatedStreakData = upStreak(data, today);
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
        lastRoutineCompleted: today,
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
        date: today,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Verificar Ejecución</h2>
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

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 uppercase font-semibold">Tiempo</p>
            <p className="text-lg font-bold text-gray-800">{formatTime(pv.elapsed)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 uppercase font-semibold">Ejercicios</p>
            <p className="text-lg font-bold text-gray-800">{pv.completedSteps || exList.length}/{exList.length}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 uppercase font-semibold">Puntos base</p>
            <p className="text-lg font-bold text-yellow-600">{sumPoints}</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {exList.map((ex, i) => (
            <div key={ex.id || i} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{ex.name}</h3>
                  <p className="text-xs text-gray-500">{ex.category} · {ex.points} pts</p>
                </div>
                <span className="text-sm font-medium text-gray-700">{ex.sets}×{ex.reps}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Suma de ejercicios:</span>
            <span className="font-medium">{sumPoints} pts</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-700">Bono por rutina completa:</span>
            <span className="font-medium text-green-600">+{bonusPoints} pts</span>
          </div>
          <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t border-blue-200">
            <span className="text-gray-900">Total a otorgar:</span>
            <span className="text-yellow-600">{totalPoints} pts</span>
          </div>
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
            {saving ? "..." : "Aprobar ejecución"}
          </button>
        </div>
      </div>
    </div>
  );
}
