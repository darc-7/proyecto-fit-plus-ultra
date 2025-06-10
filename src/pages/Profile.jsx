import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../services/firebase";

export default function Profile() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [newName, setNewName] = useState("");
  const [uploading, setUploading] = useState(false);

  // Obtener datos del usuario desde Firestore
  useEffect(() => {
    if (!user) return;

    const fetchUser = async () => {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      const data = userDoc.data();
      setUserData(data);
      setNewName(data.displayName || "");
    };

    fetchUser();
  }, [user]);

  // Subir nueva foto de perfil
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    setUploading(true);
    const storageRef = ref(storage, `profilePictures/${user.uid}`);
    await uploadBytes(storageRef, file);
    const photoURL = await getDownloadURL(storageRef);

    await updateDoc(doc(db, "users", user.uid), { photoURL });
    setUserData((prev) => ({ ...prev, photoURL }));
    setUploading(false);
  };

  // Actualizar nombre de usuario
  const handleNameUpdate = async () => {
    if (!newName.trim() || !user) return;
    await updateDoc(doc(db, "users", user.uid), { displayName: newName.trim() });
    setUserData((prev) => ({ ...prev, displayName: newName.trim() }));
  };

  if (!userData) return <p className="p-4">Cargando perfil...</p>;

  const formattedDate = new Date(userData.createdAt).toLocaleDateString("es-VE");

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Perfil de Usuario</h1>

      <div className="flex flex-col items-center mb-4">
        <img
          src={userData.photoURL || "https://via.placeholder.com/100"}
          alt="Foto de perfil"
          className="w-24 h-24 rounded-full object-cover mb-2"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          disabled={uploading}
          className="text-sm"
        />
        {uploading && <p className="text-blue-600 text-sm mt-1">Subiendo imagen...</p>}
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Nombre:</label>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full p-2 border rounded-md mb-2"
        />
        <button
          onClick={handleNameUpdate}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Guardar nombre
        </button>
      </div>

      <div className="mb-2">
        <strong>Correo:</strong> {userData.email}
      </div>
      <div className="mb-2">
        <strong>Racha actual:</strong> 🔥 {userData.streak || 0} días
      </div>
      <div className="mb-2">
        <strong>Fecha de registro:</strong> {formattedDate}
      </div>
    </div>
  );
}
