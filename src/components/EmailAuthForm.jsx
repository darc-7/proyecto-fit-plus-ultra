import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { toast } from "react-hot-toast";

export function EmailAuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isRegistering && !fullName) {
      toast.error("Por favor, ingresa tu nombre completo.");
      return;
    }
    if (!email || !password) {
      toast.error("Por favor, rellena todos los campos.");
      return;
    }
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    setVerificationSent(false);

    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: fullName });

        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          displayName: fullName,
          email: email,
          role: "cliente",
          trainerId: null,
          createdAt: new Date().toISOString(),
          streak: 0,
          totalPoints: 0,
          completedRoutines: 0,
          activeVisuals: [],
          badges: [],
          unlockedRewards: []
        });

        await sendEmailVerification(user);
        await signOut(auth);
        setVerificationSent(true);
        toast.success("¡Cuenta creada! Revisa tu correo para verificar tu dirección de email.");
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          const userRole = userSnap.data()?.role;

          if (userRole === "cliente") {
            await signOut(auth);
            toast.error("Debes verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.");
            return;
          }
        }

        toast.success("¡Inicio de sesión exitoso!");
      }
    } catch (error) {
      console.error("Error en autenticación:", error.code);
      switch (error.code) {
        case "auth/invalid-credential":
          toast.error("Credenciales incorrectas. Verifica tu correo o contraseña.");
          break;

        case "auth/email-already-in-use":
          try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            const user = cred.user;

            await setDoc(doc(db, "users", user.uid), {
              uid: user.uid,
              displayName: fullName,
              email: email,
              role: "cliente",
              trainerId: null,
              createdAt: new Date().toISOString(),
              streak: 0,
              totalPoints: 0,
              completedRoutines: 0,
              activeVisuals: [],
              badges: [],
              unlockedRewards: []
            });

            toast.success("¡Cuenta recuperada! Bienvenido de nuevo a Fit Plus Ultra.");
          } catch {
            toast.error("Este correo ya está registrado con otra contraseña. Intenta con otro correo o inicia sesión.");
          }
          break;

        default:
          toast.error("Ocurrió un error inesperado. Inténtalo de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email || !password) {
      toast.error("Ingresa tu correo y contraseña para reenviar la verificación.");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      await signOut(auth);
      toast.success("Correo de verificación reenviado. Revisa tu bandeja de entrada.");
    } catch (error) {
      toast.error("Error al reenviar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl border border-gray-100 transition-all duration-300">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6 transition-all">
        {isRegistering ? "Crear una Cuenta" : "Iniciar Sesión"}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col">
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isRegistering ? "max-h-[100px] opacity-100 mb-4" : "max-h-0 opacity-0 mb-0"
          }`}
        >
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre Completo
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ej. Juan Pérez"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-800"
            disabled={loading}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correo Electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ejemplo@correo.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-800"
            disabled={loading}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-800"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition-colors disabled:opacity-50"
        >
          {loading ? "Procesando..." : isRegistering ? "Registrarse" : "Ingresar"}
        </button>

        {!isRegistering && (
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={loading}
            className="text-xs text-blue-600 hover:underline mt-3 text-center w-full disabled:opacity-50"
          >
            ¿No recibiste el correo? Reenviar verificación
          </button>
        )}
      </form>

      {verificationSent && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 text-center">
          Te enviamos un correo de verificación a <strong>{email}</strong>.
          Haz clic en el enlace y luego inicia sesión.
        </div>
      )}

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => {
            setIsRegistering(!isRegistering);
            if (isRegistering) setFullName("");
            setVerificationSent(false);
          }}
          className="text-sm text-blue-600 hover:underline transition-all"
          disabled={loading}
        >
          {isRegistering
            ? "¿Ya tienes una cuenta? Inicia sesión aquí"
            : "¿No tienes cuenta? Regístrate aquí"}
        </button>
      </div>
    </div>
  );
}