import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../services/firebase";

export function GoogleSignIn() {
  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      console.log("Usuario autenticado con Google");
    } catch (error) {
      console.error("Error al autenticar con Google:", error.message);
    }
  };

  return (
    <div >
      <button className="bg-[#DB4437] hover:bg-[#C1351A] text-white px-4 py-2 rounded-lg flex items-center gap-2" 
        onClick={handleSignIn}  
      >
        <img 
          src="https://www.google.com/favicon.ico" 
          alt="Google Logo" 
          className="w-5 h-5"
        />
        Continuar con Google
      </button>
    </div>
  );
}