import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useState } from "react";
import { useAllUsers } from "../hooks/useAllUsers";
import { flushSync } from "react-dom";
import { toast } from "react-hot-toast";
import AdminUserForm from "../components/AdminUserForm";
import AssignTrainerModal from "../components/AssignTrainerModal";

export default function AdminDashboard() {
  const { users, loading } = useAllUsers();
  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [clientToAssign, setClientToAssign] = useState(null);

  const trainers = users.filter((u) => u.role === "entrenador");

  const getTrainerName = (trainerId) => {
    if (!trainerId) return null;
    const trainer = users.find((u) => u.id === trainerId || u.uid === trainerId);
    return trainer?.displayName || trainerId;
  };

  const handleOpenModal = (user = null) => {
    setEditingUser(user);
    if (!document.startViewTransition) {
      setShowModal(true);
      return;
    }
    document.startViewTransition(() => {
      flushSync(() => {
        setShowModal(true);
      });
    });
  };

  const handleCloseModal = () => {
    if (!document.startViewTransition) {
      setShowModal(false);
      setEditingUser(null);
      return;
    }
    document.startViewTransition(() => {
      flushSync(() => {
        setShowModal(false);
        setEditingUser(null);
      });
    });
  };

  const handleOpenAssign = (client) => {
    setClientToAssign(client);
    if (!document.startViewTransition) {
      setShowAssignModal(true);
      return;
    }
    document.startViewTransition(() => {
      flushSync(() => {
        setShowAssignModal(true);
      });
    });
  };

  const handleCloseAssign = () => {
    if (!document.startViewTransition) {
      setShowAssignModal(false);
      setClientToAssign(null);
      return;
    }
    document.startViewTransition(() => {
      flushSync(() => {
        setShowAssignModal(false);
        setClientToAssign(null);
      });
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 animate-pulse font-medium">Cargando base de datos del sistema...</p>
      </div>
    );
  }

  const handleDelete = async (user) => {
    if (!window.confirm(
      `¿Estás seguro de eliminar a ${user.displayName}?\n\nSe borrará su perfil de la base de datos y su cuenta de acceso.`
    )) return;

    try {
      // 1. Borrar el documento de Firestore
      //    → Esto dispara automáticamente la Cloud Function
      //      que elimina la cuenta de Firebase Auth
      await deleteDoc(doc(db, "users", user.id));
      toast.success(
        `${user.displayName || "Usuario"} eliminado. La cuenta de acceso se ha dado de baja automáticamente.`,
        { duration: 5000 }
      );
    } catch (error) {
      toast.error("Error al eliminar: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Panel de Control</h1>
            <p className="text-gray-600">Gestión global de Entrenadores y Clientes</p>
          </div>
          <button
            onClick={() => handleOpenModal(null)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-xl transition-colors shadow-sm"
          >
            + Nuevo Usuario
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Nombre / Correo</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4">Entrenador Asignado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{user.displayName || "Sin nombre asignado"}</div>
                      <div className="text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                        ${user.role === 'administrador' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'entrenador' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'cliente' ? (
                        user.trainerId ? getTrainerName(user.trainerId) : <span className="text-gray-400 italic">No asignado</span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleOpenModal(user)} className="text-blue-600 hover:text-blue-800 font-medium mr-4 transition-colors">
                        Editar
                      </button>
                      {user.role === 'cliente' && (
                        <button onClick={() => handleOpenAssign(user)} className="text-emerald-600 hover:text-emerald-800 font-medium mr-4 transition-colors">
                          {user.trainerId ? "Gestionar" : "Asignar"}
                        </button>
                      )}
                      <button onClick={() => handleDelete(user)} className="text-red-500 hover:text-red-700 font-medium transition-colors">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && <AdminUserForm onClose={handleCloseModal} userToEdit={editingUser} />}
        {showAssignModal && (
          <AssignTrainerModal
            client={clientToAssign}
            trainers={trainers}
            onClose={handleCloseAssign}
          />
        )}
      </div>
    </div>
  );
}