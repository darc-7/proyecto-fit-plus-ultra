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
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          role: "cliente",          // <--- Asignación estricta y automática
          trainerId: null,          // <--- Queda en null hasta que un admin/entrenador lo asigne
          createdAt: new Date().toISOString(),
          streak: 0,
          totalPoints: 0,
          completedRoutines: 0,
          activeVisuals: [],
          badges: [],
          unlockedRewards: []
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