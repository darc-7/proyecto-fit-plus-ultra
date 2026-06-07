import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useState } from "react";
import { useAllUsers } from "../hooks/useAllUsers";
import { flushSync } from "react-dom"
import { toast } from "react-hot-toast";
import AdminUserForm from "../components/AdminUserForm"; 

export default function AdminDashboard() {
  const { users, loading } = useAllUsers();
  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Función para abrir el modal con transición
  const handleOpenModal = (user = null) => {
    // Siempre limpiamos o establecemos el usuario que vamos a editar
    setEditingUser(user);

    // Fallback por si el navegador no soporta la API
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

  // Función para cerrar el modal con transición
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 animate-pulse font-medium">Cargando base de datos del sistema...</p>
      </div>
    );
  }

  const handleDelete = async (user) => {
  if (!window.confirm(`¿Estás seguro de eliminar a ${user.displayName}?`)) return;

  try {
    // 1. Borramos el documento de Firestore
    await deleteDoc(doc(db, "users", user.id));
    toast.success("Usuario eliminado de la base de datos");
  } catch (error) {
    toast.error("Error al eliminar: " + error.message);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Cabecera del Dashboard */}
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

        {/* Tabla de Usuarios */}
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
                {users.map((user ) => (
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
                      {user.role === 'cliente' ? (user.trainerId || <span className="text-gray-400 italic">No asignado</span>) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleOpenModal(user)} className="text-blue-600 hover:text-blue-800 font-medium mr-4 transition-colors">Editar</button>
                      <button onClick={() => handleDelete(user)} className="text-red-500 hover:text-red-700 font-medium transition-colors">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {showModal && <AdminUserForm onClose={handleCloseModal} userToEdit={editingUser}/>}
      </div>
    </div>
  );
}