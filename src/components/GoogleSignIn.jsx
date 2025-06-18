import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, db } from "../services/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export function GoogleSignIn() {
  const handleSignIn = async () => {
    try {
      googleProvider.setCustomParameters({
        prompt: "select_account"
      });
      //Iniciar sesión con Google
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      //Verificar si el usuario ya tiene documento en Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      //Crear documento del usuario en Firestore
      if(!userSnap.exists()){
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
          email: user.email,         // Correo para identificación
          totalPoints: 0,            // Puntos iniciales
          currentRoutine: [],        // Rutina vacía
          createdAt: new Date()      // Fecha de registro
        });
        console.log("Usuario registrado en Firestore:", user.email);
      }
    } catch (error) {
      console.error("Error en inicio de sesión:", error);
    }
  };

  return (
    <button 
      onClick={handleSignIn}
      className="bg-[#DB4437] hover:bg-[#C1351A] text-white px-4 py-2 rounded-lg flex items-center gap-2"
    >
      <img src="https://www.google.com/favicon.ico" alt="Google Logo" className="w-5 h-5" />
      Continuar con Google
    </button>
  );
}