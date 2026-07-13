import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, secondaryAuth, db } from "../services/firebase";
import { toast } from "react-hot-toast";

export default function AdminUserForm({ onClose, userToEdit = null }) {
  const [email, setEmail] = useState(userToEdit?.email || "");
  const [displayName, setFullName] = useState(userToEdit?.displayName || "");
  const [role, setRole] = useState(userToEdit?.role || "cliente");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isEditing = !!userToEdit;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        const userRef = doc(db, "users", userToEdit.id);
        await updateDoc(userRef, {
          displayName,
          role,
        });
        toast.success("Usuario actualizado correctamente.");
      } else {
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        const newUser = userCredential.user;
        await updateProfile(newUser, { displayName });

        await setDoc(doc(db, "users", newUser.uid), {
          uid: newUser.uid,
          email: newUser.email,
          displayName,
          role,
          trainerId: null,
          createdAt: new Date().toISOString(),
          streak: 0,
          totalPoints: 0,
          completedRoutines: 0,
        });

        if (role === "cliente") {
          await sendEmailVerification(newUser);
        }

        await signOut(secondaryAuth);
        toast.success("Usuario creado exitosamente.");
      }
      onClose();
    } catch (error) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {isEditing ? "Editar Usuario" : "Nuevo Usuario"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
            <input type="text" required value={displayName} onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input type="email" required disabled={isEditing} value={email} onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 w-full px-4 py-2 border rounded-lg ${isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`} />
          </div>

          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <input type="password" required minLength="6" value={password} onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Rol del Usuario</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="cliente">Cliente</option>
              <option value="entrenador">Entrenador</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-white bg-blue-600 rounded-lg">
              {loading ? "Procesando..." : (isEditing ? "Actualizar" : "Registrar")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}